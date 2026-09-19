import type { GameSave, World } from "./types";
import { COLS, ROWS } from "./world";

const KEY = "badlands-save-v2";
const VERSION = 2;

export { KEY as SAVE_KEY };

export function serializeWorld(world: World): GameSave["world"] {
  return { ...world, tiles: Array.from(world.tiles) };
}

export function hydrateWorld(w: GameSave["world"]): World {
  const tiles = new Uint8Array(COLS * ROWS);
  tiles.set(w.tiles.slice(0, tiles.length));
  return {
    ...w,
    cols: COLS,
    rows: ROWS,
    tiles,
    events: w.events ?? [],
    ghosts: (w.ghosts ?? []).map((g, i) => ({
      ...g,
      x: g.x ?? 8 + i,
      y: g.y ?? 8,
      phase: g.phase ?? i,
    })),
  };
}

export function saveGame(data: GameSave) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...data, version: VERSION }));
  } catch {
    /* private mode */
  }
}

export function loadGame(): GameSave | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameSave;
    if (!parsed?.hero || !parsed?.world) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasSave() {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
