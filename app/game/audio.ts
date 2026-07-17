// Procedural sound for Deep Sea Explorer. Everything is synthesised with the
// Web Audio API so the game still ships with zero binary assets. A single
// AudioContext is created lazily on the first user gesture (browsers block
// audio until then), and a persistent ambient "underwater" bed runs while
// playing, modulated by depth.

type Win = Window & {
  webkitAudioContext?: typeof AudioContext;
};

class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  private started = false;

  // Ambient bed nodes.
  private ambientGain: GainNode | null = null;
  private droneA: OscillatorNode | null = null;
  private droneB: OscillatorNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private lastPing = 0;

  /** Create/resume the context. Must be called from a user gesture. */
  init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext || (window as Win).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(
        m ? 0 : 0.9,
        this.ctx.currentTime,
        0.05,
      );
    }
  }

  isMuted() {
    return this.muted;
  }

  private now() {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  /** Short synth voice helper. */
  private blip(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    slideTo?: number,
    when = 0,
  ) {
    if (!this.ctx || !this.master) return;
    const t = this.now() + when;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** Begin the depth-aware ambient bed. Safe to call repeatedly. */
  startAmbient() {
    if (!this.ctx || !this.master || this.started) return;
    this.started = true;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.18;
    this.ambientGain.connect(this.master);

    // Two slowly detuned low oscillators = a warm drone.
    this.droneA = this.ctx.createOscillator();
    this.droneB = this.ctx.createOscillator();
    this.droneA.type = "sine";
    this.droneB.type = "sine";
    this.droneA.frequency.value = 58;
    this.droneB.frequency.value = 58.6;
    const droneGain = this.ctx.createGain();
    droneGain.gain.value = 0.5;
    this.droneA.connect(droneGain);
    this.droneB.connect(droneGain);
    droneGain.connect(this.ambientGain);

    // A slow LFO breathes the drone volume.
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.25;
    lfo.connect(lfoGain).connect(droneGain.gain);

    // Filtered white noise = distant current / water hiss.
    const buffer = this.ctx.createBuffer(
      1,
      this.ctx.sampleRate * 2,
      this.ctx.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = "lowpass";
    this.noiseFilter.frequency.value = 420;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.12;
    noise.connect(this.noiseFilter).connect(noiseGain).connect(this.ambientGain);

    this.droneA.start();
    this.droneB.start();
    lfo.start();
    noise.start();
  }

  /** Deeper water = lower, darker ambience. depth in metres. */
  setDepth(depth: number) {
    if (!this.ctx || !this.droneA || !this.droneB || !this.noiseFilter) return;
    const t = this.now();
    const k = Math.min(depth / 2200, 1);
    const base = 58 - k * 22; // sinks from 58Hz to ~36Hz
    this.droneA.frequency.setTargetAtTime(base, t, 1.5);
    this.droneB.frequency.setTargetAtTime(base + 0.6, t, 1.5);
    this.noiseFilter.frequency.setTargetAtTime(420 - k * 300, t, 1.5);
  }

  // --- One-shot effects ---------------------------------------------------

  /** Sonar tick while a scan is charging (rate-limited internally). */
  scanTick(progress: number) {
    const t = this.now();
    if (t - this.lastPing < 0.14) return;
    this.lastPing = t;
    this.blip(880 + progress * 520, 0.12, "sine", 0.06);
  }

  /** A creature is documented — a bright rising two-note chime. */
  discover() {
    this.blip(660, 0.18, "triangle", 0.09);
    this.blip(990, 0.32, "sine", 0.08, undefined, 0.1);
  }

  /** A story signal is recovered — a mysterious shimmer. */
  logFound() {
    this.blip(392, 0.5, "sine", 0.07);
    this.blip(587, 0.6, "sine", 0.06, undefined, 0.08);
    this.blip(784, 0.7, "sine", 0.05, undefined, 0.18);
  }

  /** Coral cleared — a soft muffled crack. */
  coral() {
    this.blip(180, 0.22, "sawtooth", 0.05, 90);
  }

  /** The ancient door grinds open — a long low rumble. */
  door() {
    this.blip(70, 1.6, "sawtooth", 0.12, 45);
    this.blip(110, 1.4, "sine", 0.06, 70, 0.05);
  }

  /** Soft UI click. */
  ui() {
    this.blip(520, 0.08, "square", 0.03, 380);
  }

  /** Low-oxygen warning pulse. */
  warn() {
    this.blip(300, 0.18, "sine", 0.08, 220);
  }
}

export const audio = new GameAudio();
