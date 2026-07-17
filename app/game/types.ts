// Shared types for Deep Sea Explorer

export type Vec = { x: number; y: number };

export type ZoneId = "sunlight" | "twilight" | "midnight" | "abyss";

export interface Zone {
  id: ZoneId;
  name: string;
  /** Depth in meters where this zone begins. */
  startDepth: number;
  /** Water colour at the top of the zone (deep = darker). */
  topColor: [number, number, number];
  /** Water colour at the bottom of the zone. */
  bottomColor: [number, number, number];
  /** Ambient light 0..1 — how much the world is lit without the sub's lamp. */
  ambient: number;
  blurb: string;
}

export interface CreatureDef {
  id: string;
  name: string;
  zone: ZoneId;
  /** Rough body radius in world px, used for collision-free scanning. */
  size: number;
  /** Bioluminescent glow colour. */
  glow: string;
  /** How the creature drifts. */
  behavior: "drift" | "bob" | "dart" | "pulse";
  speed: number;
  codexEntry: string;
  /** Codex rarity flavour. */
  rarity: "Common" | "Uncommon" | "Rare" | "Enigma";
}

export interface Creature {
  def: CreatureDef;
  pos: Vec;
  vel: Vec;
  phase: number;
  scanned: boolean;
  /** 0..1 scan progress while the beam is held on it. */
  scanProgress: number;
  seed: number;
}

export interface LogEntry {
  id: string;
  pos: Vec;
  title: string;
  body: string;
  found: boolean;
}

export interface DoorPuzzle {
  pos: Vec;
  /** Number of coral clusters that must be cleared. */
  needed: number;
  cleared: number;
  opened: boolean;
}
