// Tunable game constants. Distances are in tiles, times in seconds.

export const GRID_W = 32
export const GRID_H = 20
export const TILE_PX = 32 // screen px per tile at zoom 1

export const START_GOLD = 250
export const TOTAL_WAVES = 10
// Extra path cost per point of structure HP: how strongly enemies prefer
// walking around a wall rather than breaking through it.
export const SIEGE_COST_PER_HP = 1 / 16

export const STRUCTURES = {
  wall: { label: 'Wall', cost: 2, hp: 300, height: 1.0 },
  tower: { label: 'Tower', cost: 70, hp: 260, height: 2.0, range: 4.5, fireRate: 1.0, damage: 13 },
  trap: { label: 'Spikes', cost: 20, dps: 22 },
}

export const KEEP = { size: 3, hp: 1000, height: 2.6, range: 5.5, fireRate: 0.8, damage: 10 }

export const ENEMIES = {
  raider: { hp: 40, speed: 1.6, dps: 8, siege: 1, gold: 3, r: 0.22 },
  brute: { hp: 140, speed: 0.95, dps: 16, siege: 1.2, gold: 8, r: 0.3 },
  ram: { hp: 380, speed: 0.6, dps: 26, siege: 3, gold: 15, r: 0.38 },
}

export const ARROW_SPEED = 11

// Wave n (1-based): what spawns and from how many gates.
export function waveComposition(n) {
  return {
    raider: 6 + n * 3,
    brute: n >= 2 ? (n - 1) * 2 : 0,
    ram: n >= 4 ? n - 3 : 0,
    hpMult: 1 + (n - 1) * 0.1,
    spawnCount: n >= 7 ? 4 : n >= 5 ? 3 : n >= 3 ? 2 : 1,
  }
}

export function waveBonus(n) {
  return 40 + n * 10
}
