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
//   upgrade: what the Upgrade tool turns it into
//   gate:    your troops can walk through it; enemies must break it
export const STRUCTURES = {
  palisade: { label: 'Palisade', cost: 1, hp: 120, height: 0.9, solid: true, thin: 0.3, upgrade: 'wall' },
  wall: { label: 'Wall', cost: 2, hp: 300, height: 1.0, solid: true, thin: 0.6, rampart: true, slots: 1, perch: 0.5, upgrade: 'thick' },
  thick: { label: 'Thick wall', cost: 5, hp: 750, height: 1.35, solid: true, rampart: true, slots: 2, perch: 1 },
  // Weaker than stone on purpose: attackers go for gates first.
  gate: { label: 'Gate', cost: 15, hp: 240, height: 1.25, solid: true, rampart: true, slots: 1, perch: 0.5, gate: true },
  tower: { label: 'Tower', cost: 60, hp: 550, height: 2.2, solid: true, rampart: true, slots: 3, perch: 1.5, freeArchers: 1 },
  moat: { label: 'Moat', cost: 3, slow: 0.35, flatOnly: true },
  // Built against a wall, tower or the keep: lets swordsmen climb up and
  // fight on the ramparts. Enemies just walk over it.
  stair: { label: 'Stairs', cost: 4, stair: true },
  pikes: { label: 'Pikes', cost: 3, hp: 110, height: 0.6, solid: true, thorns: 18 },
  trap: { label: 'Spikes', cost: 20, dps: 22 },
  // Village buildings: proposed by the village, built by you, pay out each wave.
  cottage: { label: 'Cottage', cost: 30, hp: 160, height: 0.9, solid: true, village: true, income: 10 },
  farm: { label: 'Farm', cost: 15, hp: 40, village: true, income: 6, trample: 90 },
  market: { label: 'Market', cost: 60, hp: 260, height: 1.0, solid: true, village: true, income: 25 },
}

// Walls, gates, towers and pikes can be built over rough ground at a price.
// Multipliers stack: terrain times whatever has to be cleared first.
export const ROUGH_COST = { hill: 1, marsh: 2, shallows: 3, water: 4, tree: 2, rock: 3 }
// Fortifications built on a rock keep it as a natural base: a bit tougher.
export const ROCK_FOUNDATION = { hp: 1.25 }

// Wooden hoarding built on top of a stone wall, gate or tower.
export const HOARDING = { label: 'Hoarding', cost: 3, cover: 0.2, splash: 0.5, on: ['wall', 'thick', 'gate', 'tower'] }

// How the village grows: plots appear between waves where it feels safe.
// It judges safety from your walls and towers, never from where attacks come.
export const VILLAGE = { maxPlots: 3, marketAfter: 3 }

// Gates draw attackers: path cost multiplier on a gate's HP (rams care most).
export const GATE_LURE = 0.5
export const RAM_GATE_LURE = 0.12

export const ARCHER = { label: 'Archer', cost: 20, hp: 50, range: 4, fireRate: 0.9, damage: 10, speed: 2.4 }

// Melee troops: guard a spot, charge enemies within `guard` tiles of it.
export const SWORDSMAN = { label: 'Swordsman', cost: 25, hp: 130, dps: 20, speed: 1.9, guard: 4, r: 0.22 }
// Swordsmen with orders cover their zone plus this margin.
export const ZONE_MARGIN = 0.75

// The keep's `hp` is the lord's life. Attackers must batter the door
// (doorHp) and then fight their way up to him; his guard fights back,
// splitting `guard` damage per second among whoever is inside.
export const KEEP = { size: 3, hp: 1000, height: 2.6, slots: 2, perch: 1.5, archers: 2, doorHp: 260, guard: 22, climb: 2.5 }

// Foot soldiers can't hurt stone. They break gates and wooden things, and
// get over stone walls with ladders carried by a crew of two.
//   raise: seconds to set a ladder up, hp: shoves to push it off the wall,
//   push:  shove damage per second from each archer on or beside the wall,
//   climb: speed multiplier while climbing, cost: path cost of a ladder,
//   regroup: seconds stuck at a wall before two soldiers lash a new ladder.
export const LADDER = { raise: 1.2, hp: 80, push: 16, climb: 0.35, cost: 9, regroup: 14, reach: ['wall', 'thick'] }
// Structures foot soldiers can't damage.
export const STONE = ['wall', 'thick', 'tower']

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
  // Two raiders carrying a ladder. Once it's up they climb as raiders.
  ladder: { hp: 80, speed: 1.25, dps: 0, siege: 0, gold: 6, r: 0.34, crew: 2 },
  brute: { hp: 140, speed: 0.95, dps: 16, siege: 1.2, gold: 8, r: 0.3 },
  // Siege engines (rams, catapults) are the only things that break stone.
  ram: { hp: 380, speed: 0.6, dps: 26, siege: 3, gold: 15, r: 0.38, noMelee: true, siegeEngine: true },
  // Ranged: stop to shoot your archers and swordsmen.
  bowman: { hp: 34, speed: 1.3, dps: 4, siege: 0.6, gold: 5, r: 0.2, range: 4, rate: 0.6, shot: 6 },
  // Siege: lobs boulders at structures from beyond archer range.
  // After `ammo` boulders it rolls forward into archer range.
  catapult: { hp: 240, speed: 0.45, dps: 0, siege: 0, gold: 25, r: 0.42, range: 6, rate: 0.22, boulder: 90, splash: 35, ammo: 10, noMelee: true, siegeEngine: true },
}

export const ARROW_SPEED = 11
// Archers behind battlements take this share of arrow damage.
export const COVER = 0.5

// Wave n (1-based): what spawns and from how many gates.
export function waveComposition(n) {
  return {
    raider: 8 + n * 3,
    ladder: 1 + Math.floor(n / 2),
    brute: n >= 2 ? (n - 1) * 3 : 0,
    ram: n >= 4 ? Math.ceil((n - 3) * 1.5) : 0,
    bowman: n >= 3 ? n - 2 : 0,
    catapult: n >= 5 ? Math.floor((n - 3) / 2) : 0,
    hpMult: 1 + (n - 1) * 0.07,
    spawnCount: n >= 7 ? 4 : n >= 5 ? 3 : n >= 3 ? 2 : 1,
  }
}

export function waveBonus(n) {
  return 50 + n * 12
}
