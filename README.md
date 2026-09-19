# BADLANDS

Oddlot Lab Field license. One Wake walks a commons of crates, mines, and camps. Combat is Heroes of Might and Magic III arithmetic on a single stack. Every fee hits a live `$BOUND` pool — whoever is still out on the Field gets paid.

This is the playable V1 client. Chain, TBA wallets, and blood-lock come later.

## Play

1. **Print a Wake** — identity is rolled, not chosen. Rarity, stamp, river, stats.
2. Spawn in the **Hold** (green ring). Safe. No pool share in here.
3. Walk **east**. Amber crate first, then the scrap nest.
4. **E / Interact** a node. Unguarded crates open. Guarded nodes go to the pit.
5. **Strike / Defend / Wait / Flee**. Speed order, one retaliation per stack per round. Flee taxes 3% of `$BOUND` into the pool.
6. **F** forge — burn a `+1` token **and** 10,000 `$BOUND` into the pool. That is the only upgrade.
7. Stay on the Field. 2.4% of the pool drips each tick, split by weight.

### Controls

| Input | Action |
| --- | --- |
| WASD / arrows | Walk |
| E / Interact | Work the cell you stand on |
| F | Forge |
| C | Codex |
| 1–3 | Strike stack |
| V | Defend |
| Q | Wait |
| X | Flee (3%) |

Touch: D-pad + Interact on phones.

## Combat kernel (HoMM3 subset)

```
base = count × uniform[dmin, dmax]
if ATK ≥ DEF: I1 = +5% per point, cap +300%
if DEF > ATK: R1 = −2.5% per point, cap −70%
lucky strike (Luck 1/2/3 = 1/24, 1/12, 1/8) adds +100% in the additive bucket
dmg = floor(base × (1 + I1 + luck) × (1 − R1)), min 1
```

Agility evade is the only house rule: 1.5% per AGI, cap 40%, full miss. No hex board in V1 — the formula and the speed queue are the contract.

## Economy

| Action | Fee to the Field pool |
| --- | --- |
| Oddlot crate | 40 `$BOUND` |
| Mine | 180 |
| Warden camp | 260 |
| Flee | 3% of holdings |
| Apply +1 token | 10,000 |

Weight ≈ `√(equipped value + identity) × (1 + 0.04·LCK + 0.02·AGI + 0.02·DEF) × rarity`.

Ghost frames simulate other actives so the commons breathes when you are alone.

## Stack

TanStack Start · React 19 · Vite · Tailwind v4 · Zustand · Canvas 2D.

```bash
npm install
npm run dev
```

Save is local (`badlands-save-v2`). Wipe from the title screen by printing a new Wake.

## V2 (not in this build)

Castles that print troop stacks. Those stacks join the Wake as an entourage — then combat is 7v7 HoMM3, still without a hex contract. New river expansions bring different loot tables.
