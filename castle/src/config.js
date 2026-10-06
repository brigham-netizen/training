// Tunable game constants. Distances are in tiles, times in seconds.

export const GRID_W = 32
export const GRID_H = 20
export const TILE_PX = 32 // screen px per tile at zoom 1

export const START_GOLD = 250
export const TOTAL_WAVES = 10
// Extra path cost per point of structure HP: how strongly enemies prefer
// walking around a wall rather than breaking through it.
export const SIEGE_COST_PER_HP = 1 / 16

// Structures the player can build.
//   rampart: archers can stand on it (and walk along connected ramparts)
//   slots:   archers per tile, perch: extra range from standing on it
//   thin:    drawn as a connected wall segment rather than a full block
export const STRUCTURES = {
  palisade: { label: 'Palisade', cost: 1, hp: 120, height: 0.9, solid: true, thin: 0.3 },
  wall: { label: 'Wall', cost: 2, hp: 300, height: 1.0, solid: true, thin: 0.6, rampart: true, slots: 1, perch: 0.5 },
  thick: { label: 'Thick wall', cost: 5, hp: 750, height: 1.35, solid: true, rampart: true, slots: 2, perch: 1 },
  tower: { label: 'Tower', cost: 60, hp: 550, height: 2.2, solid: true, rampart: true, slots: 3, perch: 1.5, freeArchers: 1 },
  moat: { label: 'Moat', cost: 3, slow: 0.35, flatOnly: true },
  pikes: { label: 'Pikes', cost: 3, hp: 90, height: 0.6, solid: true, thorns: 14 },
  trap: { label: 'Spikes', cost: 20, dps: 22 },
}

export const ARCHER = { label: 'Archer', cost: 20, range: 4, fireRate: 0.9, damage: 10, speed: 2.4 }

export const KEEP = { size: 3, hp: 1000, height: 2.6, slots: 2, perch: 1.5, archers: 2 }

// Terrain. `slow` multiplies enemy speed (and so raises path cost).
export const TERRAIN = {
  grass: { slow: 1 },
  hill: { slow: 0.7, elev: 0.55, perch: 1 },
  marsh: { slow: 0.55, noBuild: true },
  shallows: { slow: 0.45, noBuild: true },
  water: { blocked: true },
}

export const ENEMIES = {
  raider: { hp: 40, speed: 1.6, dps: 8, siege: 1, gold: 3, r: 0.22 },
  brute: { hp: 140, speed: 0.95, dps: 16, siege: 1.2, gold: 8, r: 0.3 },
  ram: { hp: 380, speed: 0.6, dps: 26, siege: 3, gold: 15, r: 0.38 },
}

export const ARROW_SPEED = 11

// Wave n (1-based): what spawns and from how many gates.
export function waveComposition(n) {
  return {
    raider: 8 + n * 3,
    brute: n >= 2 ? (n - 1) * 3 : 0,
    ram: n >= 4 ? Math.ceil((n - 3) * 1.5) : 0,
    hpMult: 1 + (n - 1) * 0.07,
    spawnCount: n >= 7 ? 4 : n >= 5 ? 3 : n >= 3 ? 2 : 1,
  }
}

export function waveBonus(n) {
  return 40 + n * 10
}
