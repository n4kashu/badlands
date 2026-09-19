import type { Hero, Item, Rarity, StatKey } from "./types";
import { heroHpMax } from "./combat";
import { pick, randInt, mulberry32 } from "./rng";

export const RIVERS = [
  "Volga",
  "Rhine",
  "Thames",
  "Hudson",
  "Nile",
  "Ganges",
  "Mekong",
  "Loire",
  "Yukon",
  "Congo",
] as const;

export const STAMPS = [
  "Operator",
  "Collector",
  "Marine",
  "Helm",
  "Medic",
  "Cutter",
  "Stevedore",
  "Longshot",
] as const;

const RARITY_ROLL: { r: Rarity; w: number }[] = [
  { r: "common", w: 6966 },
  { r: "uncommon", w: 1969 },
  { r: "epic", w: 696 },
  { r: "legendary", w: 269 },
  { r: "mythic", w: 73 },
  { r: "prime", w: 27 },
];

const RANGES: Record<Rarity, [number, number]> = {
  common: [1, 6],
  uncommon: [2, 7],
  epic: [3, 8],
  legendary: [4, 9],
  mythic: [5, 10],
  prime: [6, 12],
};

const NAMES_A = ["Mira", "Ren", "Io", "Kell", "Orin", "Sami", "Jan", "Vira", "Tess", "Jorn", "Nia", "Cal"];
const NAMES_B = ["Voss", "Paduk", "Fenn", "Brant", "Dale", "Orr", "Toll", "Shen", "Hook", "Rael", "Kade", "Pell"];

function rollRarity(rng: () => number): Rarity {
  const total = RARITY_ROLL.reduce((s, x) => s + x.w, 0);
  let n = rng() * total;
  for (const row of RARITY_ROLL) {
    n -= row.w;
    if (n <= 0) return row.r;
  }
  return "common";
}

export function mintHero(seed: number): Hero {
  const rng = mulberry32(seed);
  const rarity = rollRarity(rng);
  const [lo, hi] = RANGES[rarity];
  const hero: Hero = {
    id: `WAKE-${seed.toString(16).slice(0, 6).toUpperCase()}`,
    name: `${pick(rng, NAMES_A)} ${pick(rng, NAMES_B)}`,
    river: pick(rng, RIVERS),
    stamp: pick(rng, STAMPS),
    rarity,
    atk: randInt(rng, lo, hi),
    def: randInt(rng, lo, hi),
    spd: randInt(rng, lo, hi),
    agi: randInt(rng, lo, hi),
    lck: randInt(rng, Math.max(0, lo - 3), Math.min(3, hi - 4)),
    hp: 1,
    hpMax: 1,
    bound: 8_000 + randInt(rng, 0, 4_000),
    x: 0,
    y: 0,
    equipped: {},
    inventory: [],
    tokens: { atk: 1, def: 0, spd: 0, agi: 0, lck: 0 },
    cratesOpened: 0,
    minesCleared: 0,
    fightsWon: 0,
    fightsLost: 0,
    earned: 0,
    feesPaid: 0,
  };
  hero.hpMax = heroHpMax(hero);
  hero.hp = hero.hpMax;
  return hero;
}

const ITEM_NAMES: Record<Item["slot"], string[]> = {
  weapon: ["Pit hook", "Arc blade", "Driver", "Cut-bar"],
  plate: ["Seal harness", "Mare plate", "Foil wrap", "Cage mail"],
  core: ["Oddlot brick", "Vein cell", "Wake spark", "Bound chip"],
};

export function makeItem(rng: () => number, rarity: Rarity = "common"): Item {
  const slot = pick(rng, ["weapon", "plate", "core"] as const);
  const bonus: StatKey = slot === "weapon" ? "atk" : slot === "plate" ? "def" : pick(rng, ["spd", "agi", "lck"] as const);
  const mag = { common: 1, uncommon: 1, epic: 2, legendary: 3, mythic: 4, prime: 5 }[rarity];
  return {
    id: `it-${Math.floor(rng() * 1e9).toString(36)}`,
    name: pick(rng, ITEM_NAMES[slot]),
    slot,
    rarity,
    bonuses: { [bonus]: mag },
    value: mag * 120 * { common: 1, uncommon: 2, epic: 4, legendary: 8, mythic: 14, prime: 22 }[rarity],
  };
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Mythic",
  prime: "Prime",
};
