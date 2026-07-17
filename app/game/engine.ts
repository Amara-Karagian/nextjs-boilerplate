// Pure-ish helpers for the Deep Sea Explorer engine: world generation,
// colour maths, and small utilities. Kept out of the React component so the
// render loop stays readable.
import {
  CREATURES,
  MAX_DEPTH,
  PX_PER_M,
  WORLD_WIDTH,
  ZONES,
  zoneAtDepth,
} from "./world";
import type {
  Creature,
  DoorPuzzle,
  LogEntry,
  Vec,
  Zone,
} from "./types";

export const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const rand = (a: number, b: number) => a + Math.random() * (b - a);

export const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);

/** Depth in metres for a given world Y. */
export const depthAt = (worldY: number) => worldY / PX_PER_M;

/** Vertical extent (metres) covered by a zone. */
function zoneRange(zone: Zone): [number, number] {
  const idx = ZONES.indexOf(zone);
  const next = ZONES[idx + 1];
  return [zone.startDepth, next ? next.startDepth : MAX_DEPTH];
}

/** Smoothly interpolated water colour at a depth. */
export function colorAtDepth(depth: number): [number, number, number] {
  const zone = zoneAtDepth(depth);
  const [lo, hi] = zoneRange(zone);
  const t = clamp((depth - lo) / (hi - lo), 0, 1);
  return [
    lerp(zone.topColor[0], zone.bottomColor[0], t),
    lerp(zone.topColor[1], zone.bottomColor[1], t),
    lerp(zone.topColor[2], zone.bottomColor[2], t),
  ];
}

/** Ambient light 0..1 at a depth (how visible the world is without the lamp). */
export function ambientAtDepth(depth: number): number {
  const zone = zoneAtDepth(depth);
  const idx = ZONES.indexOf(zone);
  const next = ZONES[idx + 1];
  if (!next) return zone.ambient;
  const [lo, hi] = zoneRange(zone);
  const t = clamp((depth - lo) / (hi - lo), 0, 1);
  return lerp(zone.ambient, next.ambient, t);
}

export const rgb = (c: [number, number, number], a = 1) =>
  `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// --- World generation -------------------------------------------------------

let seedCounter = 1;

function spawnCreatures(): Creature[] {
  const out: Creature[] = [];
  for (const def of CREATURES) {
    const zone = ZONES.find((z) => z.id === def.zone)!;
    const idx = ZONES.indexOf(zone);
    const next = ZONES[idx + 1];
    const loM = zone.startDepth + 20;
    const hiM = (next ? next.startDepth : MAX_DEPTH) - 20;
    const count =
      def.rarity === "Enigma" ? 2 : def.rarity === "Rare" ? 3 : 5;
    for (let i = 0; i < count; i++) {
      const depthM = rand(loM, hiM);
      out.push({
        def,
        pos: { x: rand(60, WORLD_WIDTH - 60), y: depthM * PX_PER_M },
        vel: { x: rand(-1, 1) * def.speed, y: 0 },
        phase: rand(0, Math.PI * 2),
        scanned: false,
        scanProgress: 0,
        seed: seedCounter++,
      });
    }
  }
  return out;
}

export const STORY_LOGS: Omit<LogEntry, "pos" | "found">[] = [
  {
    id: "log0",
    title: "Dispatch — Surface Station",
    body:
      "Descent authorised. The array has been picking up a rhythmic signal from below the shelf for eleven days. It is not geological. It is not a whale. Find its source and document everything. You are the only vessel small enough to follow it down.",
  },
  {
    id: "log1",
    title: "Field Note — 300m",
    body:
      "The fish thin out and the light goes with them. My lamp catches shapes that turn away before I can name them. The signal is stronger here, and slower — as if whatever makes it is in no hurry at all.",
  },
  {
    id: "log2",
    title: "Recovered Fragment",
    body:
      "…a carved marker, half-swallowed by coral. The script is not any language on file, but the shape repeats: a spiral closing inward. The same shape pulses in the signal. Someone built down here. Someone wanted to be found.",
  },
  {
    id: "log3",
    title: "Field Note — 1200m",
    body:
      "Walls. Not rock — walls, with doorways, streets, the geometry of a place that was lived in. It is beautiful and it is drowned and it is far, far older than it should be. And the lights in the windows are not reflections of mine.",
  },
  {
    id: "log4",
    title: "Recovered Fragment",
    body:
      "…we did not sink. We chose the dark when the surface turned against us. We taught the light to live in our hands and our creatures and our walls. We are still here. We are only quiet. Come to the door and we will show you how we stayed.",
  },
  {
    id: "final",
    title: "The Inner Chamber",
    body:
      "Beyond the door the whole city is breathing light. The signal was never a distress call. It was an invitation, sent up over centuries in the only voice they had left. They are not dead. They are patient, and luminous, and they have been waiting for someone curious enough to come all this way down. Welcome, explorer. Stay a while.",
  },
];

function makeLogs(): LogEntry[] {
  const depthsM = [55, 320, 640, 1180, 1520, MAX_DEPTH - 40];
  return STORY_LOGS.map((l, i) => ({
    ...l,
    found: false,
    pos: {
      x: clamp(
        WORLD_WIDTH / 2 + rand(-700, 700),
        120,
        WORLD_WIDTH - 120,
      ),
      y: depthsM[i] * PX_PER_M,
    },
  }));
}

export interface WorldState {
  creatures: Creature[];
  logs: LogEntry[];
  door: DoorPuzzle;
  coral: { pos: Vec; cleared: boolean; progress: number }[];
}

export function generateWorld(): WorldState {
  const doorY = (MAX_DEPTH - 40) * PX_PER_M;
  const doorX = WORLD_WIDTH / 2;
  const door: DoorPuzzle = {
    pos: { x: doorX, y: doorY },
    needed: 3,
    cleared: 0,
    opened: false,
  };
  const coral = [-220, 0, 220].map((dx) => ({
    pos: { x: doorX + dx, y: doorY - 70 },
    cleared: false,
    progress: 0,
  }));
  return { creatures: spawnCreatures(), logs: makeLogs(), door, coral };
}
