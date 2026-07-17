// localStorage-backed save system for Deep Sea Explorer. Persists codex
// discoveries, story logs found, the ancient-door puzzle state, the deepest
// depth reached, and the mute preference. All access is SSR-safe and tolerant
// of corrupt/absent data.

const KEY = "deep-sea-explorer.save.v1";
const VERSION = 1;

export interface SaveData {
  version: number;
  /** Creature def ids that have been scanned. */
  codex: string[];
  /** Story log ids that have been found. */
  logs: string[];
  door: { cleared: number; opened: boolean; coral: boolean[] };
  /** Deepest depth reached, in metres. */
  deepestDepth: number;
  muted: boolean;
}

export function defaultSave(): SaveData {
  return {
    version: VERSION,
    codex: [],
    logs: [],
    door: { cleared: 0, opened: false, coral: [false, false, false] },
    deepestDepth: 0,
    muted: false,
  };
}

export function loadSave(): SaveData {
  if (typeof window === "undefined") return defaultSave();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    if (!parsed || parsed.version !== VERSION) return defaultSave();
    const d = defaultSave();
    return {
      version: VERSION,
      codex: Array.isArray(parsed.codex) ? parsed.codex : d.codex,
      logs: Array.isArray(parsed.logs) ? parsed.logs : d.logs,
      door: {
        cleared: parsed.door?.cleared ?? d.door.cleared,
        opened: parsed.door?.opened ?? d.door.opened,
        coral: Array.isArray(parsed.door?.coral)
          ? parsed.door!.coral
          : d.door.coral,
      },
      deepestDepth: parsed.deepestDepth ?? d.deepestDepth,
      muted: parsed.muted ?? d.muted,
    };
  } catch {
    return defaultSave();
  }
}

export function writeSave(data: SaveData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full or blocked — fail silently */
  }
}

/** Persist only the mute flag, merging into any existing save. */
export function saveMuted(muted: boolean) {
  const cur = loadSave();
  cur.muted = muted;
  writeSave(cur);
}

/** True if the save contains meaningful progress (worth a "Continue"). */
export function hasProgress(s: SaveData): boolean {
  return (
    s.codex.length > 0 ||
    s.logs.length > 0 ||
    s.door.cleared > 0 ||
    s.deepestDepth > 30
  );
}

/** Reset progress but keep the mute preference. */
export function clearProgress(): SaveData {
  const muted = loadSave().muted;
  const fresh = defaultSave();
  fresh.muted = muted;
  writeSave(fresh);
  return fresh;
}
