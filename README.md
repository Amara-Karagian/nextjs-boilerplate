# Deep Sea Explorer 🌊

A 2D exploration game about descending into the ocean depths — discover bizarre
creatures, follow a mysterious signal, and uncover the story of a civilization
that chose the dark. Focused on discovery and wonder, not combat. Built with
Next.js + React and rendered entirely on an HTML5 canvas (no image assets).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and press **Begin Descent**.

## How to play

| Input | Action |
| --- | --- |
| `WASD` / arrow keys | Pilot the submarine |
| hold `Shift` | Boost (drains power) |
| hold `Space` | Scan a creature in your lamp to add it to the Codex |
| `E` | Interact (clear coral blocking the ancient door) |
| `C` | Open / close the Creature Codex |
| `Esc` / `P` | Pause |

**The loop:** descend through four depth zones, scan every creature you can find
to complete the codex, read the story fragments that glow in the dark, and clear
the coral sealing the ancient door in the abyss to reach the ending. Watch your
**oxygen** and **power** — return toward the surface to refill them. Running out
just resurfaces you; your codex progress is kept.

## Depth zones

- **Sunlight (0–220m)** — bright, coral, fish. Calm and beautiful.
- **Twilight (220–1000m)** — colour drains, bioluminescence begins.
- **Midnight (1000–1600m)** — true dark; only your lamp and living light.
- **Abyss (1600m+)** — ancient structures and the source of the signal.

## Project structure

All game code lives in `app/game/`:

| File | Responsibility |
| --- | --- |
| `world.ts` | Zone definitions, the creature catalogue, and story logs — **edit this to add content** |
| `types.ts` | Shared TypeScript types |
| `engine.ts` | World generation + colour/lighting/depth maths (pure helpers) |
| `creatures.ts` | Procedural canvas drawing for the sub, creatures, and structures |
| `DeepSeaExplorer.tsx` | The React component: game loop, input, physics, lighting, and HUD |

### How to extend it

- **Add a creature:** append a `CreatureDef` to `CREATURES` in `world.ts`, then
  add a `case` for its `id` in `drawCreature()` (or let it fall through to the
  default glowing blob). It spawns automatically in its zone.
- **Add a zone:** append to `ZONES` in `world.ts` with its start depth and
  colours; the water gradient, ambient light, and creature spawning all follow.
- **Add a story beat:** append to `STORY_LOGS` and add a depth in `makeLogs()`.

This is a hand-crafted vertical slice designed to grow — new creatures, zones,
puzzles, and secrets all slot in without touching the engine.
