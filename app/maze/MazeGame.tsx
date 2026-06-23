"use client";

import { useEffect, useRef, useState } from "react";
import {
  canMove,
  cellAt,
  deadEnds,
  distanceMap,
  generateMaze,
  openDirs,
  type Dir,
  type Maze,
  type Point,
} from "./lib/maze";
import { SoundEngine } from "./lib/audio";

// ---------------------------------------------------------------------------
// Tunables
// ---------------------------------------------------------------------------

const CELL = 46; // world pixels per maze cell
const PLAYER_MS = 115; // ms to glide across one cell
const BRAID = 0.16;
const MIN_SIZE = 9;
const MAX_SIZE = 27;
const MAX_PARTICLES = 340;
const LEVEL_COMPLETE_MS = 2300;
const INVULN_MS = 1700;
const DIR_BUFFER_MS = 160;

const OPP: Record<Dir, Dir> = { n: "s", s: "n", e: "w", w: "e" };
const DXY: Record<Dir, { dx: number; dy: number }> = {
  n: { dx: 0, dy: -1 },
  e: { dx: 1, dy: 0 },
  s: { dx: 0, dy: 1 },
  w: { dx: -1, dy: 0 },
};

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------

const clamp = (v: number, a: number, b: number) =>
  v < a ? a : v > b ? b : v;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Mode = "title" | "playing" | "paused" | "levelComplete" | "gameOver";

interface Mover {
  cx: number;
  cy: number;
  px: number; // render position, in cell units
  py: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  moving: boolean;
  t: number;
  moveMs: number;
  lastDir: Dir | null;
}

interface Enemy extends Mover {
  hue: number;
  phase: number;
}

interface Gem {
  x: number;
  y: number;
  phase: number;
  hue: number;
  got: boolean;
}

interface Particle {
  x: number; // world pixels
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  hue: number;
  size: number;
}

interface Mote {
  x: number;
  y: number;
  r: number;
  vy: number;
  a: number;
}

interface LevelData {
  maze: Maze;
  bg: HTMLCanvasElement;
  worldW: number;
  worldH: number;
  gems: Gem[];
  enemies: Enemy[];
  portal: Point;
  gemsTotal: number;
  detect: number;
  enemyMs: number;
  par: number;
  hue: number;
}

interface World extends LevelData {
  mode: Mode;
  level: number;
  score: number;
  best: number;
  lives: number;
  gemsGot: number;
  time: number;
  player: Mover;
  particles: Particle[];
  motes: Mote[];
  playerDist: Int32Array;
  cam: { x: number; y: number };
  viewW: number;
  viewH: number;
  dpr: number;
  held: Dir[];
  buffer: { dir: Dir; time: number } | null;
  clock: number;
  lastTime: number;
  modeTimer: number;
  shake: number;
  flash: number;
}

interface Hud {
  score: number;
  best: number;
  lives: number;
  level: number;
  gemsGot: number;
  gemsTotal: number;
  time: number;
  par: number;
}

interface Api {
  start: () => void;
  restart: () => void;
  continueLevel: () => void;
  togglePause: () => void;
  toggleMute: () => void;
  press: (d: Dir) => void;
  release: (d: Dir) => void;
}

// ---------------------------------------------------------------------------
// Mover helpers
// ---------------------------------------------------------------------------

function makeMover(x: number, y: number, moveMs: number): Mover {
  return {
    cx: x,
    cy: y,
    px: x,
    py: y,
    fromX: x,
    fromY: y,
    toX: x,
    toY: y,
    moving: false,
    t: 0,
    moveMs,
    lastDir: null,
  };
}

function startMove(m: Mover, d: Dir, maze: Maze): boolean {
  if (m.moving) return false;
  if (!canMove(maze, m.cx, m.cy, d)) return false;
  const { dx, dy } = DXY[d];
  m.fromX = m.cx;
  m.fromY = m.cy;
  m.toX = m.cx + dx;
  m.toY = m.cy + dy;
  m.moving = true;
  m.t = 0;
  m.lastDir = d;
  return true;
}

// ---------------------------------------------------------------------------
// Level generation + maze pre-render
// ---------------------------------------------------------------------------

function roundRectPath(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function renderMazeBg(
  maze: Maze,
  hue: number,
  dpr: number,
): HTMLCanvasElement {
  const w = maze.cols * CELL;
  const h = maze.rows * CELL;
  const cv = document.createElement("canvas");
  cv.width = Math.ceil(w * dpr);
  cv.height = Math.ceil(h * dpr);
  const c = cv.getContext("2d");
  if (!c) return cv;
  c.scale(dpr, dpr);

  // Floor tiles
  for (const cell of maze.cells) {
    const x = cell.x * CELL;
    const y = cell.y * CELL;
    roundRectPath(c, x + 2.5, y + 2.5, CELL - 5, CELL - 5, 7);
    c.fillStyle = `hsla(${hue}, 38%, 7.5%, 1)`;
    c.fill();
    c.lineWidth = 1;
    c.strokeStyle = `hsla(${hue}, 45%, 16%, 0.35)`;
    c.stroke();
  }

  // Build a single path of every wall segment, drawn once.
  const path = new Path2D();
  for (const cell of maze.cells) {
    const x = cell.x * CELL;
    const y = cell.y * CELL;
    if (cell.walls.e) {
      path.moveTo(x + CELL, y);
      path.lineTo(x + CELL, y + CELL);
    }
    if (cell.walls.s) {
      path.moveTo(x, y + CELL);
      path.lineTo(x + CELL, y + CELL);
    }
  }
  // Top + left outer borders (the rest are covered above).
  path.moveTo(0, 0);
  path.lineTo(w, 0);
  path.moveTo(0, 0);
  path.lineTo(0, h);

  c.lineCap = "round";
  c.lineJoin = "round";
  // Bloom pass
  c.shadowColor = `hsla(${hue}, 100%, 60%, 0.9)`;
  c.shadowBlur = 16;
  c.strokeStyle = `hsla(${hue}, 90%, 55%, 0.45)`;
  c.lineWidth = 6;
  c.stroke(path);
  // Crisp core
  c.shadowBlur = 0;
  c.strokeStyle = `hsla(${hue}, 100%, 82%, 0.95)`;
  c.lineWidth = 2.2;
  c.stroke(path);

  return cv;
}

function generateLevel(n: number, dpr: number): LevelData {
  const size = clamp(MIN_SIZE + (n - 1) * 2, MIN_SIZE, MAX_SIZE);
  const cols = size;
  const rows = size;
  const hue = (202 + n * 24) % 360;
  const maze = generateMaze(cols, rows, BRAID);
  const start: Point = { x: 0, y: 0 };
  const portal: Point = { x: cols - 1, y: rows - 1 };
  const enemyMs = clamp(270 - n * 9, 150, 270);

  // Gems: prefer dead-ends, then fill from random open cells.
  const ends = shuffle(deadEnds(maze, [start, portal]));
  const gemCount = clamp(4 + n, 4, 12);
  const used = new Set<string>([`0,0`, `${portal.x},${portal.y}`]);
  const gems: Gem[] = [];
  for (const cell of ends) {
    if (gems.length >= gemCount) break;
    used.add(`${cell.x},${cell.y}`);
    gems.push({
      x: cell.x,
      y: cell.y,
      phase: Math.random() * Math.PI * 2,
      hue: 45 + (Math.random() * 18 - 9),
      got: false,
    });
  }
  let guard = 0;
  while (gems.length < gemCount && guard++ < 500) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const key = `${x},${y}`;
    if (used.has(key)) continue;
    used.add(key);
    gems.push({
      x,
      y,
      phase: Math.random() * Math.PI * 2,
      hue: 45 + (Math.random() * 18 - 9),
      got: false,
    });
  }

  // Enemies spawn far from the start.
  const distStart = distanceMap(maze, start);
  const minDist = Math.floor((cols + rows) / 2);
  const far = shuffle(
    maze.cells.filter((cell) => {
      const d = distStart[cell.y * cols + cell.x];
      return d >= minDist && !used.has(`${cell.x},${cell.y}`);
    }),
  );
  const enemyCount = n <= 1 ? 0 : clamp(Math.floor(n / 2), 0, 6);
  const enemies: Enemy[] = [];
  for (let i = 0; i < enemyCount && i < far.length; i++) {
    const cell = far[i];
    enemies.push({
      ...makeMover(cell.x, cell.y, enemyMs),
      hue: 354,
      phase: Math.random() * Math.PI * 2,
    });
  }

  return {
    maze,
    bg: renderMazeBg(maze, hue, dpr),
    worldW: cols * CELL,
    worldH: rows * CELL,
    gems,
    enemies,
    portal,
    gemsTotal: gems.length,
    detect: 4 + Math.floor(n / 2),
    enemyMs,
    par: Math.round(cols * rows * 0.22),
    hue,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MazeGame() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<Api | null>(null);

  const [mode, setMode] = useState<Mode>("title");
  const [muted, setMuted] = useState(false);
  const [hud, setHud] = useState<Hud>({
    score: 0,
    best: 0,
    lives: 3,
    level: 1,
    gemsGot: 0,
    gemsTotal: 0,
    time: 0,
    par: 0,
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctxOrNull = canvas.getContext("2d");
    if (!ctxOrNull) return;
    const ctx: CanvasRenderingContext2D = ctxOrNull;
    // Narrowed non-null aliases for use inside closures.
    const wrapEl = wrap;
    const canvasEl = canvas;

    const sound = new SoundEngine();
    const storedBest =
      Number(window.localStorage.getItem("neon-maze-best")) || 0;
    const dpr0 = Math.min(window.devicePixelRatio || 1, 2);

    // ---- World ------------------------------------------------------------
    const data = generateLevel(1, dpr0);
    const world: World = {
      ...data,
      mode: "title",
      level: 1,
      score: 0,
      best: storedBest,
      lives: 3,
      gemsGot: 0,
      time: 0,
      player: makeMover(0, 0, PLAYER_MS),
      particles: [],
      motes: [],
      playerDist: distanceMap(data.maze, { x: 0, y: 0 }),
      cam: { x: 0, y: 0 },
      viewW: wrap.clientWidth || 800,
      viewH: wrap.clientHeight || 600,
      dpr: dpr0,
      held: [],
      buffer: null,
      clock: 0,
      lastTime: performance.now(),
      modeTimer: 0,
      shake: 0,
      flash: 0,
    };
    let invuln = 0;

    // ---- Camera -----------------------------------------------------------
    function clampCam(tx: number, ty: number) {
      const x =
        world.worldW <= world.viewW
          ? -(world.viewW - world.worldW) / 2
          : clamp(tx, 0, world.worldW - world.viewW);
      const y =
        world.worldH <= world.viewH
          ? -(world.viewH - world.worldH) / 2
          : clamp(ty, 0, world.worldH - world.viewH);
      return { x, y };
    }
    function playerTarget() {
      return clampCam(
        (world.player.px + 0.5) * CELL - world.viewW / 2,
        (world.player.py + 0.5) * CELL - world.viewH / 2,
      );
    }
    function centerCam() {
      const t = playerTarget();
      world.cam.x = t.x;
      world.cam.y = t.y;
    }

    // ---- Motes (background dust) -----------------------------------------
    function initMotes() {
      const count = Math.round((world.viewW * world.viewH) / 26000);
      world.motes = [];
      for (let i = 0; i < count; i++) {
        world.motes.push({
          x: Math.random() * world.viewW,
          y: Math.random() * world.viewH,
          r: Math.random() * 1.6 + 0.4,
          vy: Math.random() * 10 + 4,
          a: Math.random() * 0.4 + 0.1,
        });
      }
    }

    // ---- Level lifecycle --------------------------------------------------
    function applyLevel(n: number, newMode: Mode) {
      const d = generateLevel(n, world.dpr);
      world.maze = d.maze;
      world.bg = d.bg;
      world.worldW = d.worldW;
      world.worldH = d.worldH;
      world.gems = d.gems;
      world.enemies = d.enemies;
      world.portal = d.portal;
      world.gemsTotal = d.gemsTotal;
      world.detect = d.detect;
      world.enemyMs = d.enemyMs;
      world.par = d.par;
      world.hue = d.hue;
      world.level = n;
      world.gemsGot = 0;
      world.time = 0;
      world.player = makeMover(0, 0, PLAYER_MS);
      world.playerDist = distanceMap(d.maze, { x: 0, y: 0 });
      world.held = [];
      world.buffer = null;
      world.modeTimer = 0;
      invuln = 0;
      world.mode = newMode;
      centerCam();
    }

    function saveBest() {
      if (world.score > world.best) {
        world.best = world.score;
        try {
          window.localStorage.setItem("neon-maze-best", String(world.best));
        } catch {
          /* ignore */
        }
      }
    }

    function startGame() {
      sound.unlock();
      world.score = 0;
      world.lives = 3;
      applyLevel(1, "playing");
      sound.start();
      sound.startAmbient();
    }

    function nextLevel() {
      applyLevel(world.level + 1, "playing");
    }

    function completeLevel() {
      const timeBonus = Math.max(0, Math.round(world.par - world.time)) * 10;
      const gemBonus = world.gemsGot === world.gemsTotal ? 300 : 0;
      world.score += 500 + timeBonus + gemBonus;
      world.mode = "levelComplete";
      world.modeTimer = LEVEL_COMPLETE_MS;
      saveBest();
      sound.levelUp();
      const cx = (world.portal.x + 0.5) * CELL;
      const cy = (world.portal.y + 0.5) * CELL;
      burst(cx, cy, 46, 150, 320, 900);
    }

    function gameOver() {
      world.mode = "gameOver";
      saveBest();
      sound.gameOver();
      sound.stopAmbient();
    }

    function loseLife() {
      world.lives -= 1;
      world.shake = 16;
      world.flash = 0.65;
      sound.hurt();
      burst(
        (world.player.px + 0.5) * CELL,
        (world.player.py + 0.5) * CELL,
        28,
        354,
        360,
        700,
      );
      if (world.lives <= 0) {
        gameOver();
      } else {
        world.player = makeMover(0, 0, PLAYER_MS);
        world.held = [];
        world.buffer = null;
        invuln = INVULN_MS;
      }
    }

    // ---- Particles --------------------------------------------------------
    function burst(
      x: number,
      y: number,
      n: number,
      hue: number,
      speed: number,
      life: number,
    ) {
      for (let i = 0; i < n; i++) {
        if (world.particles.length >= MAX_PARTICLES) break;
        const a = Math.random() * Math.PI * 2;
        const s = Math.random() * speed;
        world.particles.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life,
          max: life,
          hue: hue + (Math.random() * 30 - 15),
          size: Math.random() * 3 + 1.5,
        });
      }
    }
    function trail() {
      if (world.particles.length >= MAX_PARTICLES) return;
      const a = Math.random() * Math.PI * 2;
      world.particles.push({
        x: (world.player.px + 0.5) * CELL + (Math.random() * 6 - 3),
        y: (world.player.py + 0.5) * CELL + (Math.random() * 6 - 3),
        vx: Math.cos(a) * 18,
        vy: Math.sin(a) * 18,
        life: 360,
        max: 360,
        hue: 188,
        size: Math.random() * 2.4 + 1,
      });
    }

    // ---- Movement input ---------------------------------------------------
    function desiredDir(now: number): Dir | null {
      const p = world.player;
      if (
        world.buffer &&
        now - world.buffer.time < DIR_BUFFER_MS &&
        canMove(world.maze, p.cx, p.cy, world.buffer.dir)
      ) {
        const d = world.buffer.dir;
        world.buffer = null;
        return d;
      }
      for (let i = world.held.length - 1; i >= 0; i--) {
        if (canMove(world.maze, p.cx, p.cy, world.held[i])) return world.held[i];
      }
      return null;
    }

    function onPlayerArrive() {
      const p = world.player;
      // Gem pickup
      for (const g of world.gems) {
        if (!g.got && g.x === p.cx && g.y === p.cy) {
          g.got = true;
          world.gemsGot += 1;
          world.score += 100;
          sound.collect();
          burst((g.x + 0.5) * CELL, (g.y + 0.5) * CELL, 18, g.hue, 220, 650);
        }
      }
      // Exit
      if (p.cx === world.portal.x && p.cy === world.portal.y) {
        completeLevel();
      }
    }

    // ---- Update -----------------------------------------------------------
    function updateMover(m: Mover, dtMs: number, onArrive?: () => void) {
      if (!m.moving) return;
      m.t += dtMs / m.moveMs;
      if (m.t >= 1) {
        m.cx = m.toX;
        m.cy = m.toY;
        m.px = m.cx;
        m.py = m.cy;
        m.moving = false;
        onArrive?.();
      } else {
        const e = easeInOut(m.t);
        m.px = lerp(m.fromX, m.toX, e);
        m.py = lerp(m.fromY, m.toY, e);
      }
    }

    function updatePlayer(dtMs: number, now: number) {
      const p = world.player;
      if (p.moving) {
        updateMover(p, dtMs, onPlayerArrive);
        if (p.moving) trail();
      }
      if (!p.moving && world.mode === "playing") {
        const d = desiredDir(now);
        if (d) {
          startMove(p, d, world.maze);
          sound.step();
        }
      }
    }

    function enemyChooseDir(e: Enemy): Dir | null {
      const opts = openDirs(world.maze, e.cx, e.cy);
      if (opts.length === 0) return null;
      const here = world.playerDist[e.cy * world.maze.cols + e.cx];
      if (here >= 0 && here <= world.detect) {
        let best: Dir | null = null;
        let bd = Infinity;
        for (const d of opts) {
          const { dx, dy } = DXY[d];
          const v = world.playerDist[(e.cy + dy) * world.maze.cols + e.cx + dx];
          if (v >= 0 && v < bd) {
            bd = v;
            best = d;
          }
        }
        if (best && bd < here) return best;
      }
      // Wander, avoiding an immediate U-turn when possible.
      const noBack = e.lastDir
        ? opts.filter((d) => d !== OPP[e.lastDir as Dir])
        : opts;
      const pool = noBack.length ? noBack : opts;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function updateEnemies(dtMs: number) {
      for (const e of world.enemies) {
        if (e.moving) {
          updateMover(e, dtMs);
        } else {
          const d = enemyChooseDir(e);
          if (d) startMove(e, d, world.maze);
        }
      }
    }

    function checkCollision() {
      if (invuln > 0) return;
      const p = world.player;
      for (const e of world.enemies) {
        const dx = p.px - e.px;
        const dy = p.py - e.py;
        if (dx * dx + dy * dy < 0.45 * 0.45) {
          loseLife();
          return;
        }
      }
    }

    function updateCamera(dtMs: number) {
      if (world.mode === "title") {
        const cxw =
          world.worldW / 2 + Math.sin(world.clock * 0.0003) * world.worldW * 0.32;
        const cyw =
          world.worldH / 2 +
          Math.cos(world.clock * 0.00022) * world.worldH * 0.32;
        const t = clampCam(cxw - world.viewW / 2, cyw - world.viewH / 2);
        world.cam.x = lerp(world.cam.x, t.x, 0.04);
        world.cam.y = lerp(world.cam.y, t.y, 0.04);
      } else {
        const t = playerTarget();
        world.cam.x = lerp(world.cam.x, t.x, 0.12);
        world.cam.y = lerp(world.cam.y, t.y, 0.12);
      }
    }

    function updateParticles(dtMs: number) {
      const dt = dtMs / 1000;
      for (let i = world.particles.length - 1; i >= 0; i--) {
        const p = world.particles[i];
        p.life -= dtMs;
        if (p.life <= 0) {
          world.particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.92;
        p.vy *= 0.92;
      }
    }

    function updateMotes(dtMs: number) {
      const dt = dtMs / 1000;
      for (const m of world.motes) {
        m.y -= m.vy * dt;
        if (m.y < -4) {
          m.y = world.viewH + 4;
          m.x = Math.random() * world.viewW;
        }
      }
    }

    function update(dtMs: number, now: number) {
      world.clock += dtMs;
      world.shake = Math.max(0, world.shake - dtMs * 0.05);
      world.flash = Math.max(0, world.flash - dtMs * 0.0022);
      updateMotes(dtMs);
      updateParticles(dtMs);

      if (world.mode === "playing") {
        world.time += dtMs / 1000;
        world.playerDist = distanceMap(world.maze, {
          x: world.player.cx,
          y: world.player.cy,
        });
        updatePlayer(dtMs, now);
        updateEnemies(dtMs);
        invuln = Math.max(0, invuln - dtMs);
        checkCollision();
      } else if (world.mode === "levelComplete") {
        world.modeTimer -= dtMs;
        if (world.modeTimer <= 0) nextLevel();
      }
      updateCamera(dtMs);
    }

    // ---- Render -----------------------------------------------------------
    function drawGem(g: Gem) {
      const cx = (g.x + 0.5) * CELL;
      const bob = Math.sin(world.clock * 0.004 + g.phase) * 3;
      const cy = (g.y + 0.5) * CELL + bob;
      const rot = world.clock * 0.002 + g.phase;
      const r = CELL * 0.2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.shadowColor = `hsla(${g.hue}, 100%, 60%, 0.9)`;
      ctx.shadowBlur = 18;
      const grd = ctx.createLinearGradient(-r, -r, r, r);
      grd.addColorStop(0, `hsla(${g.hue}, 100%, 85%, 1)`);
      grd.addColorStop(1, `hsla(${g.hue + 24}, 100%, 55%, 1)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.72, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.72, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      // sparkle
      const sp = (Math.sin(world.clock * 0.006 + g.phase) + 1) * 0.5;
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `hsla(${g.hue}, 100%, 90%, ${0.25 + sp * 0.5})`;
      ctx.lineWidth = 1.4;
      const s = r * (0.9 + sp * 0.5);
      ctx.beginPath();
      ctx.moveTo(cx - s, cy);
      ctx.lineTo(cx + s, cy);
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx, cy + s);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    }

    function drawPortal() {
      const cx = (world.portal.x + 0.5) * CELL;
      const cy = (world.portal.y + 0.5) * CELL;
      const pulse = (Math.sin(world.clock * 0.005) + 1) * 0.5;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = "lighter";
      // core
      const core = ctx.createRadialGradient(0, 0, 1, 0, 0, CELL * 0.42);
      core.addColorStop(0, "hsla(150, 100%, 88%, 0.95)");
      core.addColorStop(0.4, "hsla(150, 100%, 55%, 0.55)");
      core.addColorStop(1, "hsla(165, 100%, 45%, 0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, 0, CELL * 0.42 * (0.85 + pulse * 0.15), 0, Math.PI * 2);
      ctx.fill();
      // rotating rings
      ctx.strokeStyle = "hsla(150, 100%, 75%, 0.9)";
      ctx.lineWidth = 2.4;
      for (let i = 0; i < 3; i++) {
        const rr = CELL * (0.16 + i * 0.1);
        const a0 = world.clock * 0.004 * (i % 2 ? -1 : 1) + i;
        ctx.beginPath();
        ctx.arc(0, 0, rr, a0, a0 + Math.PI * 1.4);
        ctx.stroke();
      }
      // orbiting sparks
      for (let i = 0; i < 6; i++) {
        const a = world.clock * 0.006 + (i * Math.PI) / 3;
        const rr = CELL * 0.34;
        ctx.fillStyle = "hsla(150, 100%, 85%, 0.9)";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalCompositeOperation = "source-over";
    }

    function drawOrb(
      px: number,
      py: number,
      hue: number,
      radius: number,
      coreLight: number,
    ) {
      const cx = (px + 0.5) * CELL;
      const cy = (py + 0.5) * CELL;
      ctx.globalCompositeOperation = "lighter";
      const aura = ctx.createRadialGradient(cx, cy, 1, cx, cy, radius * 2.1);
      aura.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.85)`);
      aura.addColorStop(0.5, `hsla(${hue}, 100%, 55%, 0.28)`);
      aura.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `hsla(${hue}, 100%, ${coreLight}%, 1)`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawPlayer() {
      const p = world.player;
      if (invuln > 0 && Math.floor(world.clock / 90) % 2 === 0) return;
      const pulse = (Math.sin(world.clock * 0.008) + 1) * 0.5;
      drawOrb(p.px, p.py, 188, CELL * 0.22 + pulse * 2, 92);
      // ring
      const cx = (p.px + 0.5) * CELL;
      const cy = (p.py + 0.5) * CELL;
      ctx.strokeStyle = `hsla(188, 100%, 80%, ${0.5 + pulse * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, CELL * 0.3 + pulse * 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    function drawEnemy(e: Enemy) {
      const pulse = (Math.sin(world.clock * 0.01 + e.phase) + 1) * 0.5;
      drawOrb(e.px, e.py, e.hue, CELL * 0.2 + pulse * 1.5, 60);
      const cx = (e.px + 0.5) * CELL;
      const cy = (e.py + 0.5) * CELL;
      // spikes
      ctx.strokeStyle = `hsla(${e.hue}, 100%, 65%, 0.85)`;
      ctx.lineWidth = 2;
      const spin = world.clock * 0.004 + e.phase;
      for (let i = 0; i < 6; i++) {
        const a = spin + (i * Math.PI) / 3;
        const r0 = CELL * 0.22;
        const r1 = CELL * (0.3 + pulse * 0.06);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.stroke();
      }
      // angry core
      ctx.fillStyle = "hsla(0, 100%, 88%, 0.95)";
      ctx.beginPath();
      ctx.arc(cx, cy, CELL * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawParticles() {
      ctx.globalCompositeOperation = "lighter";
      for (const p of world.particles) {
        const a = clamp(p.life / p.max, 0, 1);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * a + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }

    function render() {
      const { viewW, viewH, dpr } = world;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, viewH);
      bg.addColorStop(0, `hsl(${world.hue}, 45%, 5%)`);
      bg.addColorStop(1, `hsl(${(world.hue + 40) % 360}, 55%, 3%)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, viewW, viewH);

      // Background motes
      ctx.globalCompositeOperation = "lighter";
      for (const m of world.motes) {
        ctx.fillStyle = `hsla(${world.hue}, 80%, 70%, ${m.a})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // World
      const shx = (Math.random() - 0.5) * world.shake;
      const shy = (Math.random() - 0.5) * world.shake;
      ctx.save();
      ctx.translate(-world.cam.x + shx, -world.cam.y + shy);
      ctx.drawImage(world.bg, 0, 0, world.worldW, world.worldH);
      drawPortal();
      for (const g of world.gems) if (!g.got) drawGem(g);
      drawParticles();
      for (const e of world.enemies) drawEnemy(e);
      if (world.mode !== "title") drawPlayer();
      ctx.restore();

      // Fog of war
      const playing =
        world.mode === "playing" ||
        world.mode === "paused" ||
        world.mode === "levelComplete";
      const fx = playing
        ? (world.player.px + 0.5) * CELL - world.cam.x
        : viewW / 2;
      const fy = playing
        ? (world.player.py + 0.5) * CELL - world.cam.y
        : viewH / 2;
      const R = playing ? CELL * 3.4 : Math.max(viewW, viewH) * 0.6;
      const edge = playing ? 0.93 : 0.5;
      const fog = ctx.createRadialGradient(fx, fy, R * 0.18, fx, fy, R);
      fog.addColorStop(0, "rgba(2,2,8,0)");
      fog.addColorStop(0.72, `rgba(2,2,10,${edge * 0.4})`);
      fog.addColorStop(1, `rgba(1,1,6,${edge})`);
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, viewW, viewH);

      // Vignette
      const vig = ctx.createRadialGradient(
        viewW / 2,
        viewH / 2,
        Math.min(viewW, viewH) * 0.3,
        viewW / 2,
        viewH / 2,
        Math.max(viewW, viewH) * 0.75,
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, viewW, viewH);

      // Hurt flash
      if (world.flash > 0) {
        ctx.fillStyle = `rgba(255,40,60,${world.flash * 0.4})`;
        ctx.fillRect(0, 0, viewW, viewH);
      }
    }

    // ---- HUD sync ---------------------------------------------------------
    let lastHudKey = "";
    let lastMode: Mode | "" = "";
    function sync() {
      const snap: Hud = {
        score: world.score,
        best: Math.max(world.best, world.score),
        lives: world.lives,
        level: world.level,
        gemsGot: world.gemsGot,
        gemsTotal: world.gemsTotal,
        time: Math.ceil(world.time),
        par: world.par,
      };
      const key = `${snap.score}|${snap.best}|${snap.lives}|${snap.level}|${snap.gemsGot}|${snap.gemsTotal}|${snap.time}|${snap.par}`;
      if (key !== lastHudKey) {
        lastHudKey = key;
        setHud(snap);
      }
      if (world.mode !== lastMode) {
        lastMode = world.mode;
        setMode(world.mode);
      }
    }

    // ---- Main loop --------------------------------------------------------
    let raf = 0;
    function frame(ts: number) {
      raf = requestAnimationFrame(frame);
      const dtMs = clamp(ts - world.lastTime, 0, 50);
      world.lastTime = ts;
      update(dtMs, ts);
      render();
      sync();
    }

    // ---- Input ------------------------------------------------------------
    const keyToDir: Record<string, Dir> = {
      ArrowUp: "n",
      KeyW: "n",
      ArrowDown: "s",
      KeyS: "s",
      ArrowLeft: "w",
      KeyA: "w",
      ArrowRight: "e",
      KeyD: "e",
    };

    function press(d: Dir) {
      sound.unlock();
      if (!world.held.includes(d)) world.held.push(d);
      world.buffer = { dir: d, time: performance.now() };
    }
    function release(d: Dir) {
      world.held = world.held.filter((x) => x !== d);
    }
    function primaryAction() {
      sound.unlock();
      if (world.mode === "title") startGame();
      else if (world.mode === "gameOver") startGame();
      else if (world.mode === "levelComplete") nextLevel();
    }
    function togglePause() {
      if (world.mode === "playing") {
        world.mode = "paused";
        sound.stopAmbient();
      } else if (world.mode === "paused") {
        world.mode = "playing";
        world.lastTime = performance.now();
        sound.startAmbient();
      }
    }
    function toggleMute() {
      const next = !sound.muted;
      sound.setMuted(next);
      setMuted(next);
    }

    function onKeyDown(ev: KeyboardEvent) {
      const d = keyToDir[ev.code];
      if (d) {
        ev.preventDefault();
        press(d);
        return;
      }
      if (ev.code === "Space" || ev.code === "Enter") {
        ev.preventDefault();
        primaryAction();
      } else if (ev.code === "KeyP" || ev.code === "Escape") {
        ev.preventDefault();
        togglePause();
      } else if (ev.code === "KeyM") {
        toggleMute();
      }
    }
    function onKeyUp(ev: KeyboardEvent) {
      const d = keyToDir[ev.code];
      if (d) release(d);
    }

    // Swipe on the canvas
    let swipeX = 0;
    let swipeY = 0;
    let swipeId = -1;
    function onPointerDown(ev: PointerEvent) {
      sound.unlock();
      swipeX = ev.clientX;
      swipeY = ev.clientY;
      swipeId = ev.pointerId;
    }
    function onPointerUp(ev: PointerEvent) {
      if (ev.pointerId !== swipeId) return;
      const dx = ev.clientX - swipeX;
      const dy = ev.clientY - swipeY;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      if (Math.max(adx, ady) < 24) return;
      const d: Dir = adx > ady ? (dx > 0 ? "e" : "w") : dy > 0 ? "s" : "n";
      world.buffer = { dir: d, time: performance.now() };
    }

    function onResize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrapEl.clientWidth;
      const h = wrapEl.clientHeight;
      world.viewW = w;
      world.viewH = h;
      world.dpr = dpr;
      canvasEl.width = Math.round(w * dpr);
      canvasEl.height = Math.round(h * dpr);
      canvasEl.style.width = `${w}px`;
      canvasEl.style.height = `${h}px`;
      initMotes();
    }
    function onVisibility() {
      if (document.hidden && world.mode === "playing") togglePause();
    }

    apiRef.current = {
      start: startGame,
      restart: startGame,
      continueLevel: nextLevel,
      togglePause,
      toggleMute,
      press,
      release,
    };

    onResize();
    centerCam();
    initMotes();
    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("visibilitychange", onVisibility);
      sound.stopAmbient();
    };
  }, []);

  // ---- UI -----------------------------------------------------------------
  const api = () => apiRef.current;
  const fmtTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div
      ref={wrapRef}
      className="relative h-[100dvh] w-screen overflow-hidden bg-black touch-none select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* HUD */}
      {(mode === "playing" ||
        mode === "paused" ||
        mode === "levelComplete") && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 sm:p-5 font-mono text-cyan-100">
          <div className="flex flex-col gap-1">
            <Stat label="LEVEL" value={String(hud.level)} glow="#22d3ee" />
            <Stat
              label="GEMS"
              value={`${hud.gemsGot}/${hud.gemsTotal}`}
              glow="#fcd34d"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div
              className="text-2xl sm:text-4xl font-bold tabular-nums [text-shadow:0_0_18px_rgba(34,211,238,0.8)]"
            >
              {hud.score.toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-xs opacity-70 tabular-nums">
              BEST {hud.best.toLocaleString()}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-lg sm:text-2xl tracking-widest text-rose-400 [text-shadow:0_0_14px_rgba(244,63,94,0.8)]">
              {"♥".repeat(Math.max(0, hud.lives))}
              <span className="opacity-25">
                {"♥".repeat(Math.max(0, 3 - hud.lives))}
              </span>
            </div>
            <div className="text-xs sm:text-sm opacity-80 tabular-nums">
              ⏱ {fmtTime(hud.time)}
            </div>
          </div>
        </div>
      )}

      {/* Top-right controls */}
      <div className="absolute right-3 bottom-3 sm:right-5 sm:bottom-5 flex gap-2">
        {mode === "playing" || mode === "paused" ? (
          <IconBtn onClick={() => api()?.togglePause()} label="Pause">
            {mode === "paused" ? "▶" : "❚❚"}
          </IconBtn>
        ) : null}
        <IconBtn onClick={() => api()?.toggleMute()} label="Mute">
          {muted ? "🔇" : "🔊"}
        </IconBtn>
      </div>

      {/* Mobile D-pad */}
      {(mode === "playing" || mode === "paused") && (
        <div className="absolute left-4 bottom-4 md:hidden">
          <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-40 h-40 opacity-80">
            <span />
            <DPad dir="n" api={api}>
              ▲
            </DPad>
            <span />
            <DPad dir="w" api={api}>
              ◀
            </DPad>
            <span />
            <DPad dir="e" api={api}>
              ▶
            </DPad>
            <span />
            <DPad dir="s" api={api}>
              ▼
            </DPad>
            <span />
          </div>
        </div>
      )}

      {/* Title */}
      {mode === "title" && (
        <Overlay>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-emerald-300 bg-clip-text text-transparent [text-shadow:0_0_40px_rgba(34,211,238,0.35)]">
            NEON MAZE
          </h1>
          <p className="mt-3 max-w-md text-center text-sm sm:text-base text-cyan-100/80">
            Glide through the labyrinth, grab the gems, and reach the glowing
            portal. Watch out — hunters wake on deeper floors.
          </p>
          <NeonButton onClick={() => api()?.start()}>PLAY</NeonButton>
          <div className="mt-6 text-xs sm:text-sm text-cyan-100/60 font-mono space-y-1 text-center">
            <p>
              <Key>WASD</Key> / <Key>↑ ↓ ← →</Key> move · swipe on mobile
            </p>
            <p>
              <Key>P</Key> pause · <Key>M</Key> mute ·{" "}
              <Key>Space</Key> start
            </p>
          </div>
        </Overlay>
      )}

      {/* Paused */}
      {mode === "paused" && (
        <Overlay>
          <h2 className="text-4xl sm:text-6xl font-black text-cyan-200 [text-shadow:0_0_30px_rgba(34,211,238,0.5)]">
            PAUSED
          </h2>
          <NeonButton onClick={() => api()?.togglePause()}>RESUME</NeonButton>
        </Overlay>
      )}

      {/* Level complete */}
      {mode === "levelComplete" && (
        <Overlay>
          <h2 className="text-4xl sm:text-6xl font-black text-emerald-300 [text-shadow:0_0_30px_rgba(52,211,153,0.6)]">
            LEVEL {hud.level} CLEAR
          </h2>
          <p className="mt-3 text-lg text-cyan-100/90 font-mono">
            Score {hud.score.toLocaleString()}
            {hud.gemsGot === hud.gemsTotal && hud.gemsTotal > 0 && (
              <span className="text-amber-300"> · ALL GEMS +300</span>
            )}
          </p>
          <NeonButton onClick={() => api()?.continueLevel()}>
            NEXT LEVEL
          </NeonButton>
        </Overlay>
      )}

      {/* Game over */}
      {mode === "gameOver" && (
        <Overlay>
          <h2 className="text-4xl sm:text-6xl font-black text-rose-400 [text-shadow:0_0_30px_rgba(244,63,94,0.6)]">
            GAME OVER
          </h2>
          <p className="mt-3 text-lg text-cyan-100/90 font-mono">
            You reached level {hud.level} · Score {hud.score.toLocaleString()}
          </p>
          {hud.score >= hud.best && hud.score > 0 && (
            <p className="mt-1 text-amber-300 font-mono animate-pulse">
              ★ NEW BEST ★
            </p>
          )}
          <NeonButton onClick={() => api()?.restart()}>PLAY AGAIN</NeonButton>
        </Overlay>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small UI pieces
// ---------------------------------------------------------------------------

function Stat({
  label,
  value,
  glow,
}: {
  label: string;
  value: string;
  glow: string;
}) {
  return (
    <div className="font-mono">
      <span className="text-[10px] sm:text-xs opacity-60 mr-2">{label}</span>
      <span
        className="text-sm sm:text-lg font-bold tabular-nums"
        style={{ textShadow: `0 0 14px ${glow}` }}
      >
        {value}
      </span>
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/55 backdrop-blur-sm px-6">
      {children}
    </div>
  );
}

function NeonButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="mt-8 rounded-full border border-cyan-400/60 bg-cyan-400/10 px-10 py-3 text-lg font-bold tracking-widest text-cyan-100 transition hover:scale-105 hover:bg-cyan-400/20 active:scale-95 [box-shadow:0_0_30px_rgba(34,211,238,0.4)]"
    >
      {children}
    </button>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/40 bg-black/40 text-cyan-100 backdrop-blur transition hover:bg-cyan-400/20 active:scale-90"
    >
      {children}
    </button>
  );
}

function DPad({
  dir,
  api,
  children,
}: {
  dir: Dir;
  api: () => Api | null;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={dir}
      onPointerDown={(e) => {
        e.preventDefault();
        api()?.press(dir);
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        api()?.release(dir);
      }}
      onPointerLeave={() => api()?.release(dir)}
      onPointerCancel={() => api()?.release(dir)}
      className="flex items-center justify-center rounded-xl border border-cyan-400/40 bg-black/40 text-xl text-cyan-100 backdrop-blur active:bg-cyan-400/30"
    >
      {children}
    </button>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-cyan-400/40 bg-cyan-400/10 px-1.5 py-0.5 text-cyan-200">
      {children}
    </kbd>
  );
}
