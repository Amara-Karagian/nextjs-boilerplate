// Tiny procedural sound engine built on the Web Audio API.
// No audio files: every effect is synthesized at runtime. The AudioContext is
// created lazily on the first user gesture to satisfy browser autoplay rules.

type Wave = OscillatorType;

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padGain: GainNode | null = null;
  private padNodes: OscillatorNode[] = [];
  muted = false;

  /** Create/resume the context. Must be called from a user gesture. */
  unlock(): void {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(
        muted ? 0 : 0.9,
        this.ctx.currentTime,
        0.02,
      );
    }
  }

  private tone(
    freq: number,
    dur: number,
    opts: {
      type?: Wave;
      vol?: number;
      delay?: number;
      glideTo?: number;
      attack?: number;
    } = {},
  ): void {
    if (!this.ctx || !this.master) return;
    const { type = "sine", vol = 0.3, delay = 0, glideTo, attack = 0.005 } =
      opts;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(1, glideTo),
        t0 + dur,
      );
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // ---- Sound effects -------------------------------------------------------

  step(): void {
    // Soft footstep blip with a tiny random pitch variation.
    this.tone(180 + Math.random() * 40, 0.07, {
      type: "triangle",
      vol: 0.08,
    });
  }

  bump(): void {
    this.tone(90, 0.1, { type: "sawtooth", vol: 0.07, glideTo: 60 });
  }

  collect(): void {
    // Bright rising arpeggio.
    [0, 1, 2].forEach((i) =>
      this.tone(660 * Math.pow(2, i / 12) * (1 + i * 0.18), 0.14, {
        type: "triangle",
        vol: 0.22,
        delay: i * 0.05,
      }),
    );
  }

  hurt(): void {
    this.tone(320, 0.35, { type: "sawtooth", vol: 0.28, glideTo: 70 });
    this.tone(160, 0.35, { type: "square", vol: 0.14, glideTo: 50 });
  }

  levelUp(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    notes.forEach((f, i) =>
      this.tone(f, 0.5, { type: "triangle", vol: 0.24, delay: i * 0.09 }),
    );
  }

  gameOver(): void {
    const notes = [440, 392, 349.23, 261.63];
    notes.forEach((f, i) =>
      this.tone(f, 0.6, {
        type: "sawtooth",
        vol: 0.2,
        delay: i * 0.16,
        glideTo: f * 0.96,
      }),
    );
  }

  start(): void {
    const notes = [392, 523.25, 659.25];
    notes.forEach((f, i) =>
      this.tone(f, 0.3, { type: "triangle", vol: 0.22, delay: i * 0.07 }),
    );
  }

  // ---- Ambient pad ---------------------------------------------------------

  startAmbient(): void {
    if (!this.ctx || !this.master || this.padNodes.length > 0) return;
    this.padGain = this.ctx.createGain();
    this.padGain.gain.value = 0.0001;
    this.padGain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 1.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    filter.Q.value = 6;

    // Slow filter sweep for movement.
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    const freqs = [55, 82.41, 110];
    for (const f of freqs) {
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = f;
      osc.detune.value = (Math.random() - 0.5) * 14;
      osc.connect(filter);
      osc.start();
      this.padNodes.push(osc);
    }
    this.padNodes.push(lfo);
    filter.connect(this.padGain).connect(this.master);
  }

  stopAmbient(): void {
    if (!this.ctx || !this.padGain) return;
    this.padGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.3);
    const nodes = this.padNodes;
    const gain = this.padGain;
    this.padNodes = [];
    this.padGain = null;
    window.setTimeout(() => {
      nodes.forEach((n) => {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      });
      try {
        gain.disconnect();
      } catch {
        /* noop */
      }
    }, 600);
  }
}
