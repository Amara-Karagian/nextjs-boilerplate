// Maze generation + grid utilities + pathfinding.
// A "perfect" maze (exactly one path between any two cells) is produced with an
// iterative recursive-backtracker, then lightly "braided" to remove some
// dead-ends so the world feels more open and enemies have room to roam.

export type Dir = "n" | "e" | "s" | "w";

export type Walls = Record<Dir, boolean>;

export interface Cell {
  x: number;
  y: number;
  walls: Walls;
}

export interface Maze {
  cols: number;
  rows: number;
  cells: Cell[]; // row-major: index = y * cols + x
}

export interface Point {
  x: number;
  y: number;
}

export const DELTA: Record<Dir, { dx: number; dy: number; opp: Dir }> = {
  n: { dx: 0, dy: -1, opp: "s" },
  e: { dx: 1, dy: 0, opp: "w" },
  s: { dx: 0, dy: 1, opp: "n" },
  w: { dx: -1, dy: 0, opp: "e" },
};

const ALL_DIRS: Dir[] = ["n", "e", "s", "w"];

export function idx(cols: number, x: number, y: number): number {
  return y * cols + x;
}

export function cellAt(maze: Maze, x: number, y: number): Cell {
  return maze.cells[idx(maze.cols, x, y)];
}

export function inBounds(maze: Maze, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < maze.cols && y < maze.rows;
}

/** Can you walk from (x,y) one step in direction `d`? */
export function canMove(maze: Maze, x: number, y: number, d: Dir): boolean {
  if (!inBounds(maze, x, y)) return false;
  if (cellAt(maze, x, y).walls[d]) return false;
  const { dx, dy } = DELTA[d];
  return inBounds(maze, x + dx, y + dy);
}

export function openDirs(maze: Maze, x: number, y: number): Dir[] {
  return ALL_DIRS.filter((d) => canMove(maze, x, y, d));
}

/**
 * Generate a maze. `braid` (0..1) is the fraction of dead-ends to open up.
 */
export function generateMaze(
  cols: number,
  rows: number,
  braid = 0.18,
  rng: () => number = Math.random,
): Maze {
  const cells: Cell[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      cells.push({ x, y, walls: { n: true, e: true, s: true, w: true } });
    }
  }
  const maze: Maze = { cols, rows, cells };

  const visited = new Uint8Array(cols * rows);
  const stack: Cell[] = [];
  const start = cells[0];
  visited[0] = 1;
  stack.push(start);

  while (stack.length > 0) {
    const cur = stack[stack.length - 1];
    const candidates: Dir[] = [];
    for (const d of ALL_DIRS) {
      const { dx, dy } = DELTA[d];
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (inBounds(maze, nx, ny) && !visited[idx(cols, nx, ny)]) {
        candidates.push(d);
      }
    }
    if (candidates.length === 0) {
      stack.pop();
      continue;
    }
    const d = candidates[Math.floor(rng() * candidates.length)];
    const { dx, dy, opp } = DELTA[d];
    const next = cellAt(maze, cur.x + dx, cur.y + dy);
    cur.walls[d] = false;
    next.walls[opp] = false;
    visited[idx(cols, next.x, next.y)] = 1;
    stack.push(next);
  }

  if (braid > 0) braidMaze(maze, braid, rng);
  return maze;
}

/** Open a wall on a fraction of dead-end cells to create loops. */
function braidMaze(maze: Maze, fraction: number, rng: () => number): void {
  for (const cell of maze.cells) {
    const open = openDirs(maze, cell.x, cell.y);
    if (open.length !== 1) continue; // only dead-ends
    if (rng() > fraction) continue;
    // Knock out a wall toward a valid neighbor that isn't the one open exit.
    const closed = ALL_DIRS.filter((d) => {
      if (!cell.walls[d]) return false;
      const { dx, dy } = DELTA[d];
      return inBounds(maze, cell.x + dx, cell.y + dy);
    });
    if (closed.length === 0) continue;
    const d = closed[Math.floor(rng() * closed.length)];
    const { dx, dy, opp } = DELTA[d];
    const next = cellAt(maze, cell.x + dx, cell.y + dy);
    cell.walls[d] = false;
    next.walls[opp] = false;
  }
}

/** Cells with exactly one open direction (excluding given points). */
export function deadEnds(maze: Maze, exclude: Point[] = []): Cell[] {
  const ex = new Set(exclude.map((p) => idx(maze.cols, p.x, p.y)));
  const result: Cell[] = [];
  for (const cell of maze.cells) {
    if (ex.has(idx(maze.cols, cell.x, cell.y))) continue;
    if (openDirs(maze, cell.x, cell.y).length === 1) result.push(cell);
  }
  return result;
}

/** Breadth-first distance map (in steps) from a source cell. -1 = unreachable. */
export function distanceMap(maze: Maze, src: Point): Int32Array {
  const total = maze.cols * maze.rows;
  const dist = new Int32Array(total).fill(-1);
  const queue: number[] = [];
  const s = idx(maze.cols, src.x, src.y);
  dist[s] = 0;
  queue.push(s);
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    const cx = cur % maze.cols;
    const cy = Math.floor(cur / maze.cols);
    for (const d of openDirs(maze, cx, cy)) {
      const { dx, dy } = DELTA[d];
      const ni = idx(maze.cols, cx + dx, cy + dy);
      if (dist[ni] === -1) {
        dist[ni] = dist[cur] + 1;
        queue.push(ni);
      }
    }
  }
  return dist;
}

/**
 * First step (direction) along a shortest path from `from` to `to`.
 * Returns null if already there or unreachable.
 */
export function stepToward(maze: Maze, from: Point, to: Point): Dir | null {
  if (from.x === to.x && from.y === to.y) return null;
  const total = maze.cols * maze.rows;
  const prev = new Int32Array(total).fill(-1);
  const seen = new Uint8Array(total);
  const startI = idx(maze.cols, from.x, from.y);
  const goalI = idx(maze.cols, to.x, to.y);
  const queue: number[] = [startI];
  seen[startI] = 1;
  let head = 0;
  let found = false;
  while (head < queue.length) {
    const cur = queue[head++];
    if (cur === goalI) {
      found = true;
      break;
    }
    const cx = cur % maze.cols;
    const cy = Math.floor(cur / maze.cols);
    for (const d of openDirs(maze, cx, cy)) {
      const { dx, dy } = DELTA[d];
      const ni = idx(maze.cols, cx + dx, cy + dy);
      if (!seen[ni]) {
        seen[ni] = 1;
        prev[ni] = cur;
        queue.push(ni);
      }
    }
  }
  if (!found) return null;

  // Walk back from goal to the cell right after start.
  let cur = goalI;
  while (prev[cur] !== startI && prev[cur] !== -1) {
    cur = prev[cur];
  }
  const nx = cur % maze.cols;
  const ny = Math.floor(cur / maze.cols);
  for (const d of ALL_DIRS) {
    if (from.x + DELTA[d].dx === nx && from.y + DELTA[d].dy === ny) return d;
  }
  return null;
}
