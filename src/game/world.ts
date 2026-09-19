import type { FieldNode, GhostMiner, World } from "./types";
import { TROOPS } from "./combat";
import { makeItem } from "./hero";
import { mulberry32, pick, randInt } from "./rng";

export const COLS = 56;
export const ROWS = 42;
export const TILE = 48;
export const HOLD_R = 5;

export const TILE_DUST = 0;
export const TILE_ROCK = 1;
export const TILE_HOLD = 2;
export const TILE_VEIN = 3;

export function isHold(c: number, r: number) {
  const dc = c - COLS / 2;
  const dr = r - ROWS / 2;
  return dc * dc + dr * dr <= HOLD_R * HOLD_R;
}

export function spawnCell() {
  return { c: Math.floor(COLS / 2), r: Math.floor(ROWS / 2) };
}

export function generateWorld(seed: number): World {
  const rng = mulberry32(seed);
  const tiles = new Uint8Array(COLS * ROWS);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      if (isHold(c, r)) tiles[i] = TILE_HOLD;
      else if (rng() < 0.09) tiles[i] = TILE_ROCK;
      else if (rng() < 0.04) tiles[i] = TILE_VEIN;
      else tiles[i] = TILE_DUST;
    }
  }

  const nodes: FieldNode[] = [];
  const used = new Set<string>();
  const sc = Math.floor(COLS / 2);
  const sr = Math.floor(ROWS / 2);
  used.add(`${sc},${sr}`);

  const introC = sc + 3;
  const introR = sr;
  used.add(`${introC},${introR}`);
  tiles[introR * COLS + introC] = TILE_DUST;
  nodes.push({
    id: "crate-intro",
    kind: "crate",
    x: introC,
    y: introR,
    name: "Oddlot crate",
    taken: false,
    guards: [],
    bound: 180,
    tokens: { atk: 1 },
    items: [makeItem(rng, "uncommon")],
  });

  const nestC = sc + 6;
  const nestR = sr;
  used.add(`${nestC},${nestR}`);
  tiles[nestR * COLS + nestC] = TILE_DUST;
  nodes.push({
    id: "nest-intro",
    kind: "crate",
    x: nestC,
    y: nestR,
    name: "Scrap nest",
    taken: false,
    guards: [TROOPS.scrapRatsLite()],
    bound: 220,
    tokens: { def: 1 },
    items: [],
  });

  function place(kind: FieldNode["kind"], n: number) {
    let tries = 0;
    while (n > 0 && tries++ < 4000) {
      const c = randInt(rng, 2, COLS - 3);
      const r = randInt(rng, 2, ROWS - 3);
      const key = `${c},${r}`;
      if (used.has(key) || isHold(c, r) || tiles[r * COLS + c] === TILE_ROCK) continue;
      used.add(key);
      n--;
      if (kind === "crate") {
        nodes.push({
          id: `crate-${nodes.length}`,
          kind,
          x: c,
          y: r,
          name: "Oddlot crate",
          taken: false,
          guards: rng() < 0.22 ? [TROOPS.scrapRats()] : [],
          bound: randInt(rng, 40, 220),
          tokens: rng() < 0.55 ? { [pick(rng, ["atk", "def", "spd", "agi", "lck"] as const)]: 1 } : {},
          items: rng() < 0.35 ? [makeItem(rng, pick(rng, ["common", "common", "uncommon", "epic"] as const))] : [],
        });
      } else if (kind === "mine") {
        const hard = rng() > 0.55;
        nodes.push({
          id: `mine-${nodes.length}`,
          kind,
          x: c,
          y: r,
          name: hard ? "Crystal vein" : "Ore sink",
          taken: false,
          guards: hard ? [TROOPS.husks(), TROOPS.shooters()] : [TROOPS.pitGuard()],
          bound: hard ? randInt(rng, 600, 1400) : randInt(rng, 280, 640),
          tokens: { atk: hard ? 1 : 0, def: 1 },
          items: [makeItem(rng, hard ? "epic" : "uncommon")],
        });
        tiles[r * COLS + c] = TILE_VEIN;
      } else {
        nodes.push({
          id: `camp-${nodes.length}`,
          kind,
          x: c,
          y: r,
          name: "Warden camp",
          taken: false,
          guards: [TROOPS.pitGuard(), TROOPS.veinWarden()],
          bound: randInt(rng, 900, 2200),
          tokens: { atk: 1, lck: 1 },
          items: [makeItem(rng, "legendary")],
        });
      }
    }
  }

  place("crate", 26);
  place("mine", 7);
  place("camp", 3);

  const ghosts: GhostMiner[] = Array.from({ length: 18 }, (_, i) => ({
    id: `g${i}`,
    name: `Frame ${40 + i}`,
    weight: 20 + rng() * 90,
    x: randInt(rng, 4, COLS - 5) + 0.5,
    y: randInt(rng, 4, ROWS - 5) + 0.5,
    phase: rng() * Math.PI * 2,
  }));
  const ghostWeight = ghosts.reduce((s, g) => s + g.weight, 0);

  return {
    seed,
    cols: COLS,
    rows: ROWS,
    tiles,
    nodes,
    ghosts,
    ghostWeight,
    pool: 24_000,
    tick: 0,
    events: [{ id: "boot", text: "Field licensed. Pool is live.", kind: "fee" }],
  };
}

export function blocked(world: World, c: number, r: number) {
  if (c < 0 || r < 0 || c >= world.cols || r >= world.rows) return true;
  return world.tiles[r * world.cols + c] === TILE_ROCK;
}

export function nodeAt(world: World, x: number, y: number) {
  const c = Math.floor(x);
  const r = Math.floor(y);
  return world.nodes.find((n) => !n.taken && n.x === c && n.y === r);
}

export function nearestNode(world: World, x: number, y: number, maxDist = 9) {
  let best: FieldNode | null = null;
  let bestD = maxDist;
  for (const n of world.nodes) {
    if (n.taken) continue;
    const d = Math.hypot(n.x + 0.5 - x, n.y + 0.5 - y);
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  return best;
}
