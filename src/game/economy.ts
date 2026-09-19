import type { EventKind, FieldEvent, Hero, Rarity, World } from "./types";
import { liveStats } from "./combat";

export const UPGRADE_FEE = 10_000;
export const CRATE_FEE = 40;
export const MINE_FEE = 180;
export const CAMP_FEE = 260;
export const FLEE_BPS = 300;
export const DRIP_BPS = 240;

export const NODE_FEE: Record<"crate" | "mine" | "camp", number> = {
  crate: CRATE_FEE,
  mine: MINE_FEE,
  camp: CAMP_FEE,
};

export const RARITY_WEIGHT: Record<Rarity, number> = {
  common: 1,
  uncommon: 1.1,
  epic: 1.25,
  legendary: 1.45,
  mythic: 1.7,
  prime: 2.2,
};

export function equippedValue(hero: Hero) {
  let v = 0;
  for (const it of Object.values(hero.equipped)) {
    if (it) v += it.value;
  }
  return v;
}

/** Pro-rata weight for the Field pool. Equipped mark + identity floor, damped. */
export function playerWeight(hero: Hero) {
  const s = liveStats(hero);
  const identity = 80 + (s.atk + s.def + s.spd) * 12;
  const mEq = equippedValue(hero);
  const base = Math.sqrt(Math.max(1, mEq + identity));
  const pull = 1 + 0.04 * s.lck + 0.02 * s.agi + 0.02 * s.def;
  return base * pull * RARITY_WEIGHT[hero.rarity];
}

export function fleeTax(bound: number) {
  return Math.max(25, Math.floor((bound * FLEE_BPS) / 10000));
}

/** Drip 2.4% of the pool per tick, split by weight. */
export function drip(pool: number, selfW: number, ghostW: number) {
  const released = Math.floor((pool * DRIP_BPS) / 10000);
  const totalW = Math.max(1, selfW + ghostW);
  const share = Math.floor((released * selfW) / totalW);
  return { released, share, remain: pool - released };
}

export function pushEvent(world: World, text: string, kind: EventKind): FieldEvent[] {
  const ev: FieldEvent = { id: Math.random().toString(36).slice(2, 9), text, kind };
  return [ev, ...world.events].slice(0, 10);
}
