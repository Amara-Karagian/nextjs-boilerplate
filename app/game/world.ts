// World definition: zones, creature catalogue, story logs.
import type { Zone, CreatureDef } from "./types";

/** Pixels per metre of depth. World Y = depth(m) * PX_PER_M. */
export const PX_PER_M = 4;
/** Playable width of the ocean in world px. */
export const WORLD_WIDTH = 2600;
/** Deepest reachable depth in metres. */
export const MAX_DEPTH = 2200;
export const WORLD_HEIGHT = MAX_DEPTH * PX_PER_M;

export const ZONES: Zone[] = [
  {
    id: "sunlight",
    name: "Sunlight Zone",
    startDepth: 0,
    topColor: [56, 170, 210],
    bottomColor: [22, 96, 140],
    ambient: 0.95,
    blurb: "Coral gardens and shoals of fish, warmed by light from above.",
  },
  {
    id: "twilight",
    name: "Twilight Zone",
    startDepth: 220,
    topColor: [18, 74, 118],
    bottomColor: [14, 30, 72],
    ambient: 0.42,
    blurb: "The last of the sun fades. Bioluminescence begins to bloom.",
  },
  {
    id: "midnight",
    name: "Midnight Zone",
    startDepth: 1000,
    topColor: [8, 16, 44],
    bottomColor: [4, 8, 26],
    ambient: 0.14,
    blurb: "True dark. Only your lamp and living light remain.",
  },
  {
    id: "abyss",
    name: "Abyssal Zone",
    startDepth: 1600,
    topColor: [4, 6, 20],
    bottomColor: [2, 3, 10],
    ambient: 0.06,
    blurb: "Ancient structures loom in water that has never seen the sun.",
  },
];

export function zoneAtDepth(depth: number): Zone {
  let z = ZONES[0];
  for (const zone of ZONES) if (depth >= zone.startDepth) z = zone;
  return z;
}

export const CREATURES: CreatureDef[] = [
  {
    id: "clownfish",
    name: "Reef Clownfish",
    zone: "sunlight",
    size: 12,
    glow: "#ff9a3c",
    behavior: "dart",
    speed: 34,
    rarity: "Common",
    codexEntry:
      "Bright and unbothered, they weave through anemones near the surface. A good omen — where they gather, the reef is healthy.",
  },
  {
    id: "greenturtle",
    name: "Drifting Sea Turtle",
    zone: "sunlight",
    size: 26,
    glow: "#7bd67b",
    behavior: "drift",
    speed: 16,
    rarity: "Common",
    codexEntry:
      "It has circled these waters longer than your expedition has existed. It regards the submarine with mild, ancient patience.",
  },
  {
    id: "moonjelly",
    name: "Moon Jelly",
    zone: "twilight",
    size: 20,
    glow: "#8ad7ff",
    behavior: "pulse",
    speed: 12,
    rarity: "Common",
    codexEntry:
      "A slow pale bell pulsing in the half-light. Nearly weightless, nearly mindless, wholly beautiful.",
  },
  {
    id: "lanternfish",
    name: "Lanternfish Shoal",
    zone: "twilight",
    size: 10,
    glow: "#bff0c0",
    behavior: "dart",
    speed: 40,
    rarity: "Uncommon",
    codexEntry:
      "Rows of light run down their flanks. At this depth their glow is a language — and something down here is listening.",
  },
  {
    id: "vampsquid",
    name: "Vampire Squid",
    zone: "midnight",
    size: 22,
    glow: "#c86bff",
    behavior: "bob",
    speed: 14,
    rarity: "Rare",
    codexEntry:
      "Not a predator despite the name. When startled it turns itself inside out into a cloak of spines and drifts, waiting for calm.",
  },
  {
    id: "anglerfish",
    name: "Deep Angler",
    zone: "midnight",
    size: 24,
    glow: "#ffe070",
    behavior: "drift",
    speed: 10,
    rarity: "Rare",
    codexEntry:
      "A single lure hangs before a mouth of glass teeth. The light is a lie told patiently in a place where patience is everything.",
  },
  {
    id: "siphonophore",
    name: "Ghost Siphonophore",
    zone: "abyss",
    size: 40,
    glow: "#7affe0",
    behavior: "pulse",
    speed: 8,
    rarity: "Enigma",
    codexEntry:
      "Not one animal but thousands, strung into a single glowing thread longer than your vessel. It pulses in time with the ruins nearby.",
  },
  {
    id: "sentinel",
    name: "The Sentinel",
    zone: "abyss",
    size: 34,
    glow: "#5ad0ff",
    behavior: "bob",
    speed: 6,
    rarity: "Enigma",
    codexEntry:
      "It is shaped like the carvings on the ancient door. It watches you finish what its makers began, and its light is almost kind.",
  },
];
