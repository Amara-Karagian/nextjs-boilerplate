"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CREATURES, WORLD_HEIGHT, WORLD_WIDTH } from "./world";
import {
  ambientAtDepth,
  clamp,
  colorAtDepth,
  depthAt,
  dist,
  generateWorld,
  lerp,
  rgb,
  type WorldState,
} from "./engine";
import { zoneAtDepth } from "./world";
import type { Creature, LogEntry, Vec } from "./types";
import { drawCoral, drawCreature, drawDoor, drawLog, drawSub } from "./creatures";

type Phase = "title" | "playing" | "paused" | "log" | "epilogue";

interface Hud {
  depth: number;
  zone: string;
  oxygen: number;
  power: number;
  scanned: number;
  message: string;
}

const TOTAL_CREATURES = CREATURES.length;

export default function DeepSeaExplorer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shadowRef = useRef<HTMLCanvasElement | null>(null);

  const [phase, setPhase] = useState<Phase>("title");
  const [hud, setHud] = useState<Hud>({
    depth: 0,
    zone: "Sunlight Zone",
    oxygen: 100,
    power: 100,
    scanned: 0,
    message: "",
  });
  const [codex, setCodex] = useState<Set<string>>(new Set());
  const [codexOpen, setCodexOpen] = useState(false);
  const [activeLog, setActiveLog] = useState<LogEntry | null>(null);

  // --- Mutable game state (never triggers React re-render) -----------------
  const phaseRef = useRef<Phase>("title");
  const worldRef = useRef<WorldState | null>(null);
  const playerRef = useRef({
    pos: { x: WORLD_WIDTH / 2, y: 30 } as Vec,
    vel: { x: 0, y: 0 } as Vec,
    facing: { x: 0, y: 1 } as Vec,
  });
  const resRef = useRef({ oxygen: 100, power: 100 });
  const camRef = useRef({ x: WORLD_WIDTH / 2, y: 0 });
  const keysRef = useRef<Set<string>>(new Set());
  const particlesRef = useRef<
    { x: number; y: number; z: number; r: number; drift: number }[]
  >([]);
  const scanTargetRef = useRef<Creature | null>(null);
  const fadeRef = useRef(0); // resurface fade 0..1
  const messageTimerRef = useRef(0);
  const hudMessageRef = useRef("");

  const setMessage = useCallback((m: string) => {
    hudMessageRef.current = m;
    messageTimerRef.current = 4.5;
  }, []);

  const startGame = useCallback(() => {
    worldRef.current = generateWorld();
    playerRef.current = {
      pos: { x: WORLD_WIDTH / 2, y: 30 },
      vel: { x: 0, y: 0 },
      facing: { x: 0, y: 1 },
    };
    resRef.current = { oxygen: 100, power: 100 };
    camRef.current = { x: WORLD_WIDTH / 2, y: 0 };
    particlesRef.current = Array.from({ length: 260 }, () => ({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      z: 0.3 + Math.random() * 0.7,
      r: 0.6 + Math.random() * 1.8,
      drift: (Math.random() - 0.5) * 6,
    }));
    setCodex(new Set());
    setActiveLog(null);
    setCodexOpen(false);
    phaseRef.current = "playing";
    setPhase("playing");
  }, []);

  // Keep phaseRef in sync so the loop can read it cheaply.
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // --- Input ---------------------------------------------------------------
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (
        [
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          " ",
          "w",
          "a",
          "s",
          "d",
        ].includes(k)
      )
        e.preventDefault();
      keysRef.current.add(k);
      if (k === "c") setCodexOpen((o) => !o);
      if (k === "escape" || k === "p") {
        setPhase((p) => {
          if (p === "playing") {
            phaseRef.current = "paused";
            return "paused";
          }
          if (p === "paused") {
            phaseRef.current = "playing";
            return "playing";
          }
          return p;
        });
      }
      if (k === "e" || k === " " || k === "enter") {
        // Dismiss an open log.
        setActiveLog((cur) => {
          if (cur) {
            phaseRef.current = "playing";
            setPhase("playing");
            return null;
          }
          return cur;
        });
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // --- Main loop -----------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!shadowRef.current) shadowRef.current = document.createElement("canvas");
    const shadow = shadowRef.current;
    const sctx = shadow.getContext("2d")!;

    let raf = 0;
    let last = performance.now();
    let hudAccum = 0;

    const resize = () => {
      const parent = canvas.parentElement!;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      shadow.width = w * dpr;
      shadow.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const vw = canvas.clientWidth;
      const vh = canvas.clientHeight;

      if (phaseRef.current === "playing") {
        update(dt, vw, vh);
      }
      render(ctx, sctx, vw, vh);

      hudAccum += dt;
      if (hudAccum > 0.12) {
        hudAccum = 0;
        const p = playerRef.current;
        const d = depthAt(p.pos.y);
        setHud({
          depth: d,
          zone: zoneAtDepth(d).name,
          oxygen: resRef.current.oxygen,
          power: resRef.current.power,
          scanned: worldRef.current
            ? worldRef.current.creatures.filter((c) => c.scanned).length
            : 0,
          message: messageTimerRef.current > 0 ? hudMessageRef.current : "",
        });
      }
      raf = requestAnimationFrame(frame);
    };

    function update(dt: number, vw: number, vh: number) {
      const world = worldRef.current;
      if (!world) return;
      const p = playerRef.current;
      const keys = keysRef.current;
      const res = resRef.current;

      // --- Movement ---
      const accel = 620;
      const boosting =
        (keys.has("shift") || keys.has("shiftleft")) && res.power > 1;
      const boost = boosting ? 1.7 : 1;
      let ax = 0;
      let ay = 0;
      if (keys.has("a") || keys.has("arrowleft")) ax -= 1;
      if (keys.has("d") || keys.has("arrowright")) ax += 1;
      if (keys.has("w") || keys.has("arrowup")) ay -= 1;
      if (keys.has("s") || keys.has("arrowdown")) ay += 1;
      const mag = Math.hypot(ax, ay) || 1;
      p.vel.x += (ax / mag) * accel * boost * dt;
      p.vel.y += (ay / mag) * accel * boost * dt;
      if (ax || ay) p.facing = { x: ax / mag, y: ay / mag };
      // Gentle sinking + drag.
      p.vel.y += 30 * dt;
      const drag = Math.pow(0.0016, dt);
      p.vel.x *= drag;
      p.vel.y *= drag;
      const maxV = boosting ? 300 : 200;
      const v = Math.hypot(p.vel.x, p.vel.y);
      if (v > maxV) {
        p.vel.x = (p.vel.x / v) * maxV;
        p.vel.y = (p.vel.y / v) * maxV;
      }
      p.pos.x = clamp(p.pos.x + p.vel.x * dt, 24, WORLD_WIDTH - 24);
      p.pos.y = clamp(p.pos.y + p.vel.y * dt, 12, WORLD_HEIGHT - 12);
      if (p.pos.x <= 24 || p.pos.x >= WORLD_WIDTH - 24) p.vel.x *= -0.4;

      const depth = depthAt(p.pos.y);

      // --- Resources ---
      if (depth < 25) {
        res.oxygen = clamp(res.oxygen + 40 * dt, 0, 100);
        res.power = clamp(res.power + 30 * dt, 0, 100);
      } else {
        const drain = 0.9 + depth / 1400; // deeper = thirstier
        res.oxygen = clamp(res.oxygen - drain * dt, 0, 100);
        res.power = clamp(
          res.power - (0.6 + (boosting ? 9 : 0)) * dt,
          0,
          100,
        );
      }
      if (res.oxygen <= 0 && fadeRef.current === 0) {
        fadeRef.current = 0.001;
      }
      if (fadeRef.current > 0) {
        fadeRef.current += dt * 0.8;
        if (fadeRef.current >= 1.6) {
          // Resurface, keep codex.
          p.pos = { x: WORLD_WIDTH / 2, y: 30 };
          p.vel = { x: 0, y: 0 };
          res.oxygen = 100;
          res.power = 100;
          fadeRef.current = 0;
          setMessage("Reserves ran dry — you surfaced to resupply. Codex kept.");
        }
      }

      // --- Camera ---
      const cam = camRef.current;
      cam.x = lerp(cam.x, clamp(p.pos.x, vw / 2, WORLD_WIDTH - vw / 2), 0.08);
      cam.y = lerp(cam.y, clamp(p.pos.y, vh / 2, WORLD_HEIGHT - vh / 2), 0.08);

      // --- Creatures ---
      const lampR = 150 + res.power * 1.1;
      let nearest: Creature | null = null;
      let nearestD = Infinity;
      for (const c of world.creatures) {
        c.phase += dt * (c.def.behavior === "pulse" ? 1.6 : 1);
        switch (c.def.behavior) {
          case "drift":
            c.pos.x += c.vel.x * dt;
            c.pos.y += Math.sin(c.phase) * 4 * dt;
            break;
          case "bob":
            c.pos.x += Math.sin(c.phase * 0.6) * c.def.speed * dt;
            c.pos.y += Math.cos(c.phase * 0.4) * 8 * dt;
            break;
          case "dart":
            c.pos.x += c.vel.x * dt;
            if (Math.random() < 0.01) c.vel.x = -c.vel.x;
            c.pos.y += Math.sin(c.phase * 2) * 6 * dt;
            break;
          case "pulse":
            c.pos.y += Math.sin(c.phase) * c.def.speed * dt;
            c.pos.x += Math.cos(c.phase * 0.3) * 4 * dt;
            break;
        }
        if (c.pos.x < 30 || c.pos.x > WORLD_WIDTH - 30) c.vel.x = -c.vel.x;
        c.pos.x = clamp(c.pos.x, 30, WORLD_WIDTH - 30);

        const d = dist(c.pos, p.pos);
        if (!c.scanned && d < nearestD && d < lampR + c.def.size) {
          nearestD = d;
          nearest = c;
        }
      }

      // --- Scanning ---
      scanTargetRef.current = nearest;
      const scanning = keys.has(" ") || keys.has("j");
      if (nearest && scanning && res.power > 0) {
        nearest.scanProgress = clamp(nearest.scanProgress + dt * 0.6, 0, 1);
        res.power = clamp(res.power - 2 * dt, 0, 100);
        if (nearest.scanProgress >= 1) {
          nearest.scanned = true;
          setCodex((prev) => {
            const next = new Set(prev);
            next.add(nearest!.def.id);
            return next;
          });
          setMessage(`Documented: ${nearest.def.name} (${nearest.def.rarity})`);
        }
      } else if (nearest) {
        nearest.scanProgress = Math.max(0, nearest.scanProgress - dt * 0.4);
      }

      // --- Logs (auto-open on proximity) ---
      for (const log of world.logs) {
        if (log.found) continue;
        if (log.id === "final" && !world.door.opened) continue;
        if (dist(log.pos, p.pos) < 46) {
          log.found = true;
          phaseRef.current = "log";
          setActiveLog(log);
          setPhase("log");
          if (log.id === "final") {
            setTimeout(() => {
              phaseRef.current = "epilogue";
            }, 0);
          }
        }
      }

      // --- Coral / door puzzle ---
      const interacting = keys.has("e");
      if (!world.door.opened) {
        for (const cr of world.coral) {
          if (cr.cleared) continue;
          if (interacting && dist(cr.pos, p.pos) < 60) {
            cr.progress = clamp(cr.progress + dt * 0.5, 0, 1);
            if (cr.progress >= 1) {
              cr.cleared = true;
              world.door.cleared++;
              setMessage(
                world.door.cleared >= world.door.needed
                  ? "The coral gives way. The ancient door grinds open…"
                  : `Coral cleared (${world.door.cleared}/${world.door.needed}). The door still holds.`,
              );
              if (world.door.cleared >= world.door.needed)
                world.door.opened = true;
            }
          }
        }
      }

      // --- Particles ---
      for (const pt of particlesRef.current) {
        pt.x += pt.drift * dt * 0.3;
        pt.y += (8 + pt.z * 10) * dt * 0.2;
        if (pt.y > cam.y + vh) pt.y = cam.y - vh * 0.5;
        if (pt.y < cam.y - vh) pt.y = cam.y + vh * 0.5;
      }

      if (messageTimerRef.current > 0) messageTimerRef.current -= dt;
    }

    function render(
      ctx: CanvasRenderingContext2D,
      sctx: CanvasRenderingContext2D,
      vw: number,
      vh: number,
    ) {
      const cam = camRef.current;
      const p = playerRef.current;
      const camTop = cam.y - vh / 2;
      const camLeft = cam.x - vw / 2;

      // World -> screen helpers.
      const sx = (wx: number) => wx - camLeft;
      const sy = (wy: number) => wy - camTop;

      // --- Water gradient ---
      const topCol = colorAtDepth(depthAt(camTop));
      const botCol = colorAtDepth(depthAt(camTop + vh));
      const grad = ctx.createLinearGradient(0, 0, 0, vh);
      grad.addColorStop(0, rgb(topCol));
      grad.addColorStop(1, rgb(botCol));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, vw, vh);

      // God rays near the surface.
      const surfaceY = sy(0);
      if (surfaceY > -200 && surfaceY < vh) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < 7; i++) {
          const rx = ((i * 320 + 80 - camLeft * 0.5) % (vw + 400)) - 200;
          const g = ctx.createLinearGradient(rx, surfaceY, rx + 90, surfaceY + 520);
          g.addColorStop(0, "rgba(180,230,255,0.16)");
          g.addColorStop(1, "rgba(180,230,255,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(rx, surfaceY);
          ctx.lineTo(rx + 60, surfaceY);
          ctx.lineTo(rx + 150, surfaceY + 520);
          ctx.lineTo(rx - 40, surfaceY + 520);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Title screen has no world yet — just show the water and bail.
      const world = worldRef.current;
      if (!world) return;

      // --- Particles (dim base pass) ---
      ctx.save();
      for (const pt of particlesRef.current) {
        const x = sx(pt.x);
        const y = sy(pt.y);
        if (x < -20 || x > vw + 20 || y < -20 || y > vh + 20) continue;
        ctx.fillStyle = `rgba(200,230,255,${0.05 + pt.z * 0.08})`;
        ctx.beginPath();
        ctx.arc(x, y, pt.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // --- Structures: door + coral ---
      const door = world.door;
      const dScreen = { x: sx(door.pos.x), y: sy(door.pos.y) };
      if (dScreen.x > -300 && dScreen.x < vw + 300 && dScreen.y > -300) {
        drawDoor(ctx, dScreen.x, dScreen.y, door.opened);
      }
      for (const cr of world.coral) {
        if (cr.cleared) continue;
        drawCoral(ctx, sx(cr.pos.x), sy(cr.pos.y), cr.progress);
      }

      // --- Creatures (bodies) ---
      for (const c of world.creatures) {
        const x = sx(c.pos.x);
        const y = sy(c.pos.y);
        if (x < -80 || x > vw + 80 || y < -80 || y > vh + 80) continue;
        drawCreature(ctx, c, x, y);
      }

      // --- Logs ---
      for (const log of world.logs) {
        if (log.found) continue;
        if (log.id === "final" && !door.opened) continue;
        const x = sx(log.pos.x);
        const y = sy(log.pos.y);
        if (x < -40 || x > vw + 40 || y < -40 || y > vh + 40) continue;
        drawLog(ctx, x, y, performance.now() / 1000);
      }

      // --- Player submarine ---
      drawSub(ctx, sx(p.pos.x), sy(p.pos.y), p.facing);

      // --- Darkness / lamp shadow layer ---
      const depth = depthAt(p.pos.y);
      const ambient = ambientAtDepth(depth);
      const darkness = clamp(1 - ambient, 0, 0.96);
      const lampR = 150 + resRef.current.power * 1.1;
      if (darkness > 0.02) {
        sctx.clearRect(0, 0, vw, vh);
        sctx.fillStyle = `rgba(1,3,10,${darkness})`;
        sctx.fillRect(0, 0, vw, vh);
        sctx.globalCompositeOperation = "destination-out";
        // Lamp hole (directional).
        const lx = sx(p.pos.x) + p.facing.x * lampR * 0.35;
        const ly = sy(p.pos.y) + p.facing.y * lampR * 0.35;
        const lg = sctx.createRadialGradient(lx, ly, 10, lx, ly, lampR);
        lg.addColorStop(0, "rgba(0,0,0,1)");
        lg.addColorStop(0.55, "rgba(0,0,0,0.85)");
        lg.addColorStop(1, "rgba(0,0,0,0)");
        sctx.fillStyle = lg;
        sctx.beginPath();
        sctx.arc(lx, ly, lampR, 0, Math.PI * 2);
        sctx.fill();
        // Creature glow holes.
        for (const c of world.creatures) {
          const x = sx(c.pos.x);
          const y = sy(c.pos.y);
          if (x < -80 || x > vw + 80 || y < -80 || y > vh + 80) continue;
          const r = c.def.size * 2.4;
          const cg = sctx.createRadialGradient(x, y, 2, x, y, r);
          cg.addColorStop(0, "rgba(0,0,0,0.9)");
          cg.addColorStop(1, "rgba(0,0,0,0)");
          sctx.fillStyle = cg;
          sctx.beginPath();
          sctx.arc(x, y, r, 0, Math.PI * 2);
          sctx.fill();
        }
        sctx.globalCompositeOperation = "source-over";
        ctx.drawImage(shadow, 0, 0, vw, vh);
      }

      // --- Additive bloom pass (glows read through the dark) ---
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      // Lamp bloom.
      const lx = sx(p.pos.x) + p.facing.x * lampR * 0.3;
      const ly = sy(p.pos.y) + p.facing.y * lampR * 0.3;
      const lb = ctx.createRadialGradient(lx, ly, 8, lx, ly, lampR * 0.9);
      lb.addColorStop(0, `rgba(190,240,255,${0.22 * (resRef.current.power / 100)})`);
      lb.addColorStop(1, "rgba(190,240,255,0)");
      ctx.fillStyle = lb;
      ctx.beginPath();
      ctx.arc(lx, ly, lampR * 0.9, 0, Math.PI * 2);
      ctx.fill();
      // Creature glows.
      for (const c of world.creatures) {
        const x = sx(c.pos.x);
        const y = sy(c.pos.y);
        if (x < -80 || x > vw + 80 || y < -80 || y > vh + 80) continue;
        const pulse = 0.6 + Math.sin(c.phase) * 0.25;
        const r = c.def.size * 2.2;
        const g = ctx.createRadialGradient(x, y, 1, x, y, r);
        g.addColorStop(0, c.def.glow);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = 0.5 * pulse;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // Bioluminescent plankton twinkle in the dark.
      if (darkness > 0.3) {
        for (const pt of particlesRef.current) {
          const x = sx(pt.x);
          const y = sy(pt.y);
          if (x < -10 || x > vw + 10 || y < -10 || y > vh + 10) continue;
          const near = Math.hypot(x - sx(p.pos.x), y - sy(p.pos.y)) < lampR;
          const tw = 0.4 + Math.sin(performance.now() / 400 + pt.x) * 0.4;
          ctx.fillStyle = `rgba(140,220,255,${(near ? 0.5 : 0.18) * tw})`;
          ctx.beginPath();
          ctx.arc(x, y, pt.r * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // --- Scan reticle ---
      const target = scanTargetRef.current;
      if (target && !target.scanned) {
        const x = sx(target.pos.x);
        const y = sy(target.pos.y);
        const r = target.def.size + 14;
        ctx.save();
        ctx.strokeStyle = "rgba(150,240,255,0.8)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        // Progress arc.
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(150,255,200,0.95)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + target.scanProgress * Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(200,255,255,0.9)";
        ctx.font = "11px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          target.scanProgress > 0 ? "SCANNING" : "HOLD SPACE TO SCAN",
          x,
          y - r - 8,
        );
        ctx.restore();
      }

      // --- Resurface fade ---
      if (fadeRef.current > 0) {
        const a = Math.sin(clamp(fadeRef.current / 1.6, 0, 1) * Math.PI);
        ctx.fillStyle = `rgba(2,6,16,${a})`;
        ctx.fillRect(0, 0, vw, vh);
      }
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [setMessage]);

  // Pause the loop's phase gate when a log/epilogue is showing.
  useEffect(() => {
    if (activeLog) {
      phaseRef.current = "log";
    }
  }, [activeLog]);

  const completion = Math.round((codex.size / TOTAL_CREATURES) * 100);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#02040c] text-white select-none">
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* HUD */}
      {phase !== "title" && (
        <div className="pointer-events-none absolute inset-0 p-4 font-mono text-sm">
          {/* Top-left: depth + zone */}
          <div className="inline-block rounded-lg bg-black/40 px-3 py-2 backdrop-blur-sm">
            <div className="text-cyan-300 text-lg font-semibold tabular-nums">
              {Math.round(hud.depth)} m
            </div>
            <div className="text-cyan-100/70 text-xs uppercase tracking-widest">
              {hud.zone}
            </div>
          </div>

          {/* Top-right: codex progress */}
          <div className="absolute right-4 top-4 rounded-lg bg-black/40 px-3 py-2 text-right backdrop-blur-sm">
            <div className="text-xs text-cyan-100/60 uppercase tracking-widest">
              Codex
            </div>
            <div className="tabular-nums text-cyan-200">
              {hud.scanned}/{TOTAL_CREATURES}{" "}
              <span className="text-cyan-100/50">({completion}%)</span>
            </div>
            <div className="mt-1 text-[10px] text-cyan-100/40">press C</div>
          </div>

          {/* Bottom bars */}
          <div className="absolute bottom-4 left-4 w-56 space-y-2">
            <Bar label="O₂" value={hud.oxygen} color="#6be3ff" warn={25} />
            <Bar label="PWR" value={hud.power} color="#ffd86b" warn={15} />
          </div>

          {/* Message toast */}
          {hud.message && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-5 py-2 text-center text-cyan-100 backdrop-blur-sm">
              {hud.message}
            </div>
          )}

          {/* Controls hint */}
          <div className="absolute bottom-4 right-4 text-right text-[11px] leading-relaxed text-cyan-100/40">
            <div>WASD / arrows — move</div>
            <div>hold Shift — boost</div>
            <div>hold Space — scan · E — interact</div>
            <div>C — codex · Esc — pause</div>
          </div>
        </div>
      )}

      {/* Title screen */}
      {phase === "title" && (
        <Overlay>
          <h1 className="mb-3 text-4xl font-light tracking-[0.2em] text-cyan-100 sm:text-6xl">
            DEEP&nbsp;SEA
            <br />
            <span className="font-semibold text-cyan-300">EXPLORER</span>
          </h1>
          <p className="mb-8 max-w-md text-center text-sm leading-relaxed text-cyan-100/60">
            A signal has been rising from beneath the shelf for eleven days.
            Descend, document what you find, and follow it all the way down.
          </p>
          <button
            onClick={startGame}
            className="pointer-events-auto rounded-full border border-cyan-300/50 bg-cyan-400/10 px-8 py-3 text-lg tracking-widest text-cyan-100 transition hover:bg-cyan-400/25"
          >
            BEGIN DESCENT
          </button>
          <div className="mt-8 text-center text-[11px] leading-relaxed text-cyan-100/35">
            WASD / arrows to move · Shift to boost · hold Space to scan
            creatures · E to interact · C for codex
          </div>
        </Overlay>
      )}

      {/* Pause */}
      {phase === "paused" && (
        <Overlay>
          <h2 className="mb-6 text-3xl tracking-widest text-cyan-100">PAUSED</h2>
          <button
            onClick={() => setPhase("playing")}
            className="pointer-events-auto rounded-full border border-cyan-300/50 bg-cyan-400/10 px-6 py-2 tracking-widest text-cyan-100 hover:bg-cyan-400/25"
          >
            RESUME
          </button>
        </Overlay>
      )}

      {/* Log / discovery modal */}
      {activeLog && (
        <Overlay>
          <div className="pointer-events-auto max-w-lg rounded-xl border border-cyan-300/30 bg-[#04101c]/90 p-7 backdrop-blur-md">
            <div className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-400/70">
              {activeLog.id === "final" ? "Discovery" : "Recovered Signal"}
            </div>
            <h3 className="mb-4 text-2xl font-light text-cyan-100">
              {activeLog.title}
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-cyan-100/80">
              {activeLog.body}
            </p>
            <button
              onClick={() => {
                const wasFinal = activeLog.id === "final";
                setActiveLog(null);
                phaseRef.current = wasFinal ? "epilogue" : "playing";
                setPhase(wasFinal ? "epilogue" : "playing");
              }}
              className="rounded-full border border-cyan-300/50 bg-cyan-400/10 px-6 py-2 text-sm tracking-widest text-cyan-100 hover:bg-cyan-400/25"
            >
              {activeLog.id === "final" ? "…" : "CONTINUE"}
            </button>
          </div>
        </Overlay>
      )}

      {/* Epilogue */}
      {phase === "epilogue" && (
        <Overlay>
          <h2 className="mb-4 text-3xl font-light tracking-widest text-cyan-200">
            THE END OF THE DESCENT
          </h2>
          <p className="mb-6 max-w-md text-center text-sm leading-relaxed text-cyan-100/70">
            You followed the light to its source and were welcomed. This is one
            ending of many the deep still holds.
          </p>
          <p className="mb-8 text-cyan-300">
            Codex completed: {completion}% ({codex.size}/{TOTAL_CREATURES}{" "}
            creatures)
          </p>
          <button
            onClick={startGame}
            className="pointer-events-auto rounded-full border border-cyan-300/50 bg-cyan-400/10 px-8 py-3 tracking-widest text-cyan-100 hover:bg-cyan-400/25"
          >
            DIVE AGAIN
          </button>
        </Overlay>
      )}

      {/* Codex panel */}
      {codexOpen && phase !== "title" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="max-h-[85vh] w-[min(680px,92vw)] overflow-y-auto rounded-2xl border border-cyan-300/25 bg-[#04101c]/95 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl tracking-widest text-cyan-100">
                CREATURE CODEX
              </h3>
              <button
                onClick={() => setCodexOpen(false)}
                className="rounded-full border border-cyan-300/40 px-4 py-1 text-sm text-cyan-100 hover:bg-cyan-400/20"
              >
                Close (C)
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {CREATURES.map((def) => {
                const found = codex.has(def.id);
                return (
                  <div
                    key={def.id}
                    className={`rounded-xl border p-4 transition ${
                      found
                        ? "border-cyan-300/30 bg-cyan-400/5"
                        : "border-white/5 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block h-4 w-4 rounded-full"
                        style={{
                          background: found ? def.glow : "#1b2a3a",
                          boxShadow: found ? `0 0 12px ${def.glow}` : "none",
                        }}
                      />
                      <div className="font-semibold text-cyan-100">
                        {found ? def.name : "— Undocumented —"}
                      </div>
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-widest text-cyan-100/40">
                      {found ? `${def.rarity} · ${zoneName(def.zone)}` : "???"}
                    </div>
                    {found && (
                      <p className="mt-2 text-xs leading-relaxed text-cyan-100/70">
                        {def.codexEntry}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function zoneName(id: string) {
  return (
    { sunlight: "Sunlight", twilight: "Twilight", midnight: "Midnight", abyss: "Abyss" }[
      id
    ] ?? id
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-black/40 via-black/30 to-black/60 px-6">
      {children}
    </div>
  );
}

function Bar({
  label,
  value,
  color,
  warn,
}: {
  label: string;
  value: number;
  color: string;
  warn: number;
}) {
  const low = value <= warn;
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-widest text-cyan-100/60">
        <span>{label}</span>
        <span className={low ? "text-red-400" : ""}>{Math.round(value)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-[width] duration-150"
          style={{
            width: `${value}%`,
            background: low ? "#ff5a5a" : color,
            boxShadow: `0 0 8px ${low ? "#ff5a5a" : color}`,
          }}
        />
      </div>
    </div>
  );
}
