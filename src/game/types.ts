export type Rarity = "common" | "uncommon" | "epic" | "legendary" | "mythic" | "prime";

export type StatKey = "atk" | "def" | "spd" | "agi" | "lck";

export type Slot = "weapon" | "plate" | "core";

export type Screen = "title" | "field" | "combat" | "forge" | "codex";

export type NodeKind = "crate" | "mine" | "camp";

export type EventKind = "fee" | "drip" | "ghost" | "forge" | "loot" | "fight";

export interface Item {
  id: string;
  name: string;
  slot: Slot;
  rarity: Rarity;
  bonuses: Partial<Record<StatKey, number>>;
  value: number;
}

export interface TokenPile {
  atk: number;
  def: number;
  spd: number;
  agi: number;
  lck: number;
}

export interface Hero {
  id: string;
  name: string;
  river: string;
  stamp: string;
  rarity: Rarity;
  atk: number;
  def: number;
  spd: number;
  agi: number;
  lck: number;
  hp: number;
  hpMax: number;
  bound: number;
  x: number;
  y: number;
  equipped: Partial<Record<Slot, Item>>;
  inventory: Item[];
  tokens: TokenPile;
  cratesOpened: number;
  minesCleared: number;
  fightsWon: number;
  fightsLost: number;
  earned: number;
  feesPaid: number;
}

export interface TroopTemplate {
  id: string;
  name: string;
  count: number;
  attack: number;
  defense: number;
  health: number;
  dmin: number;
  dmax: number;
  speed: number;
  agi: number;
  luck: number;
  ranged?: boolean;
}

export interface CombatStack {
  id: string;
  name: string;
  side: "hero" | "foe";
  count: number;
  attack: number;
  defense: number;
  health: number;
  hpLeft: number;
  dmin: number;
  dmax: number;
  speed: number;
  agi: number;
  luck: number;
  ranged: boolean;
  retaliated: boolean;
  defended: boolean;
  waiting: boolean;
  acted: boolean;
}

export type CombatAction =
  | { type: "attack"; targetId: string }
  | { type: "defend" }
  | { type: "wait" }
  | { type: "flee" };

export interface CombatLogLine {
  id: string;
  text: string;
  kind: "hit" | "kill" | "miss" | "luck" | "evade" | "info" | "flee";
}

export interface CombatState {
  id: string;
  nodeId: string;
  round: number;
  phase: "pick" | "won" | "lost" | "fled";
  stacks: CombatStack[];
  log: CombatLogLine[];
  prizeBound: number;
  prizeTokens: Partial<TokenPile>;
  prizeItems: Item[];
  nodeKind: NodeKind;
}

export interface FieldNode {
  id: string;
  kind: NodeKind;
  x: number;
  y: number;
  name: string;
  taken: boolean;
  guards: TroopTemplate[];
  bound: number;
  tokens: Partial<TokenPile>;
  items: Item[];
}

export interface GhostMiner {
  id: string;
  name: string;
  weight: number;
  x: number;
  y: number;
  phase: number;
}

export interface FieldEvent {
  id: string;
  text: string;
  kind: EventKind;
}

export interface World {
  seed: number;
  cols: number;
  rows: number;
  tiles: Uint8Array;
  nodes: FieldNode[];
  ghosts: GhostMiner[];
  ghostWeight: number;
  pool: number;
  tick: number;
  events: FieldEvent[];
}

export interface GameSave {
  version: number;
  hero: Hero;
  world: Omit<World, "tiles"> & { tiles: number[] };
  screen: Screen;
  combat: CombatState | null;
  lastPoolTs: number;
}
