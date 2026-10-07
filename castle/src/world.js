import { GRID_W, GRID_H, STRUCTURES, KEEP, TERRAIN, ROCK_FOUNDATION } from './config.js'

// Each tile has a terrain (grass, hill, marsh, shallows, water) and an
// occupant `type`: 'grass' means empty, otherwise scenery (tree, rock),
// a player structure (see STRUCTURES) or the keep.

export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TERRAIN_CODES = { grass: 'g', hill: 'h', marsh: 'm', shallows: 's', water: 'w' }
const TERRAIN_NAMES = Object.fromEntries(Object.entries(TERRAIN_CODES).map(([k, v]) => [v, k]))

export class World {
  // `map` (from snapshotMap) rebuilds a saved landscape instead of generating one.
  constructor(seed = 1, map = null) {
    this.w = GRID_W
    this.h = GRID_H
    this.tiles = []
    this.reserved = new Uint8Array(this.w * this.h)
    this.keep = { hp: KEEP.hp, maxHp: KEEP.hp, x: 0, y: 0 }
    this.spawns = []
    this.dirty = true // path costs changed
    if (map) this.applyMap(map)
    else this.generate(seed)
  }

  // The landscape only (terrain, trees, rocks), compact enough to store.
  snapshotMap() {
    let terrain = ''
    let scenery = ''
    let v = ''
    for (const t of this.tiles) {
      terrain += TERRAIN_CODES[t.terrain]
      scenery += t.type === 'tree' ? 't' : t.type === 'rock' || t.rock ? 'r' : '.'
      v += Math.min(9, Math.floor(t.v * 10))
    }
    return { w: this.w, h: this.h, terrain, scenery, v }
  }

  applyMap(map) {
    if (map.w !== this.w || map.h !== this.h) throw new Error('map size mismatch')
    this.tiles = []
    for (let i = 0; i < this.w * this.h; i++) {
      const sc = map.scenery[i]
      this.tiles.push({
        type: sc === 't' ? 'tree' : sc === 'r' ? 'rock' : 'grass',
        terrain: TERRAIN_NAMES[map.terrain[i]] || 'grass',
        hp: 0,
        maxHp: 0,
        v: (Number(map.v[i]) + 0.5) / 10,
        weakened: false,
      })
    }
    this.placeFixtures()
    this.dirty = true
  }

  // Keep in the middle, four gates on the edges, reserved ground around them.
  placeFixtures() {
    const { w, h } = this
    const kx = Math.floor(w / 2) - 1
    const ky = Math.floor(h / 2) - 1
    const cx = kx + 1
    const cy = ky + 1
    // The keep's door is in the middle of its south face; `step` is the
    // tile outside it, where attackers gather to break in.
    this.keep = {
      hp: KEEP.hp,
      maxHp: KEEP.hp,
      x: kx,
      y: ky,
      door: this.idx(kx + 1, ky + KEEP.size - 1),
      step: this.idx(kx + 1, ky + KEEP.size),
      doorHp: KEEP.doorHp,
      doorMax: KEEP.doorHp,
      inside: 0,
    }
    // Order matters: waves unlock gates in this order.
    this.spawns = [
      { x: 0, y: cy, name: 'west' },
      { x: w - 1, y: cy - 1, name: 'east' },
      { x: cx, y: 0, name: 'north' },
      { x: cx - 1, y: h - 1, name: 'south' },
    ]
    this.reserved.fill(0)
    for (let y = ky; y < ky + KEEP.size; y++)
      for (let x = kx; x < kx + KEEP.size; x++) {
        const t = this.tiles[this.idx(x, y)]
        t.type = 'keep'
        t.terrain = 'grass'
      }
    // The doorstep stays clear so the door can always be reached.
    const step = this.tiles[this.keep.step]
    this.reserved[this.keep.step] = 1
    step.terrain = 'grass'
    if (step.type === 'tree' || step.type === 'rock') step.type = 'grass'
    for (const s of this.spawns) {
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!this.inBounds(s.x + dx, s.y + dy)) continue
          const i = this.idx(s.x + dx, s.y + dy)
          this.reserved[i] = 1
          const t = this.tiles[i]
          if (t.terrain === 'water') t.terrain = 'shallows'
          if (t.type === 'tree' || t.type === 'rock') t.type = 'grass'
        }
    }
  }

  idx(x, y) {
    return y * this.w + x
  }
  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h
  }
  idxAt(fx, fy) {
    const x = Math.min(this.w - 1, Math.max(0, Math.floor(fx)))
    const y = Math.min(this.h - 1, Math.max(0, Math.floor(fy)))
    return this.idx(x, y)
  }

  isBlocked(i) {
    const t = this.tiles[i]
    return t.type === 'tree' || t.type === 'rock' || TERRAIN[t.terrain].blocked === true
  }
  isSolid(i) {
    const t = this.tiles[i]
    return t.type === 'keep' || STRUCTURES[t.type]?.solid === true
  }
  isWalkable(i) {
    return !this.isBlocked(i) && !this.isSolid(i)
  }
  // Speed multiplier for anyone walking this tile.
  slow(i) {
    const t = this.tiles[i]
    const s = TERRAIN[t.terrain].slow ?? 1
    return t.type === 'moat' ? Math.min(s, STRUCTURES.moat.slow) : s
  }
  // Height of the ground itself (hills), ignoring any rock on it.
  groundElev(i) {
    return TERRAIN[this.tiles[i].terrain].elev || 0
  }
  // Same rock height the renderer draws for a bare rock.
  rockHeight(i) {
    return 0.35 + this.tiles[i].v * 0.3
  }
  // Smooth ground height at any point. Each tile's centre sits at its own
  // height; edges and corners average the tiles that meet there, so hills
  // slope down into their neighbours instead of ending in a cliff. The
  // tile is a fan of eight triangles around its centre.
  heightAt(px, py) {
    const x = Math.min(this.w - 1, Math.max(0, Math.floor(px)))
    const y = Math.min(this.h - 1, Math.max(0, Math.floor(py)))
    const u = Math.min(1, Math.max(0, px - x))
    const v = Math.min(1, Math.max(0, py - y))
    const sx = u < 0.5 ? -1 : 1
    const sy = v < 0.5 ? -1 : 1
    const a = Math.abs(u - 0.5) * 2 // toward the side edge
    const b = Math.abs(v - 0.5) * 2 // toward the top/bottom edge
    const c = this.groundAt(x, y)
    const ex = (c + this.groundAt(x + sx, y)) / 2
    const ey = (c + this.groundAt(x, y + sy)) / 2
    const k = this.cornerHeight(x + (sx > 0 ? 1 : 0), y + (sy > 0 ? 1 : 0))
    return a >= b ? c + a * (ex - c) + b * (k - ex) : c + b * (ey - c) + a * (k - ey)
  }
  // Ground height of tile (x, y); off the map counts as level ground.
  groundAt(x, y) {
    return this.inBounds(x, y) ? this.groundElev(this.idx(x, y)) : 0
  }
  // Height at grid corner (cx, cy): the average of the tiles around it.
  cornerHeight(cx, cy) {
    let sum = 0
    let n = 0
    for (const [x, y] of [[cx - 1, cy - 1], [cx, cy - 1], [cx - 1, cy], [cx, cy]]) {
      if (!this.inBounds(x, y)) continue
      sum += this.groundElev(this.idx(x, y))
      n++
    }
    return n ? sum / n : 0
  }
  // Lowest ground under tile i, so upright blocks never float.
  minGround(i) {
    const x = i % this.w
    const y = (i / this.w) | 0
    let m = this.groundElev(i)
    for (const [cx, cy] of [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]]) m = Math.min(m, this.cornerHeight(cx, cy))
    return m
  }
  // Is anything about this tile's ground not level at zero?
  sloped(i) {
    const x = i % this.w
    const y = (i / this.w) | 0
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) if (this.groundAt(x + dx, y + dy) !== 0) return true
    return false
  }

  // Where things stand. Only hills raise it: a rock under a wall is a
  // natural base the wall rises out of, not a plinth that lifts it.
  elev(i) {
    return this.groundElev(i)
  }
  // Top of the rock a wall is bedded into (or the ground if none).
  baseElev(i) {
    const t = this.tiles[i]
    return this.groundElev(i) + (t.rock ? this.rockHeight(i) : 0)
  }
  maxHpFor(i, type) {
    const hp = STRUCTURES[type]?.hp || 0
    return Math.round(hp * (this.tiles[i].rock ? ROCK_FOUNDATION.hp : 1))
  }
  // The rampart a stair tile climbs to, or -1. Walls first, then the rest.
  stairFace(i) {
    const x = i % this.w
    const y = (i / this.w) | 0
    let best = -1
    let rank = 9
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      if (!this.inBounds(x + dx, y + dy)) continue
      const j = this.idx(x + dx, y + dy)
      if (!this.isRampart(j)) continue
      const r = ['wall', 'thick', 'gate', 'tower', 'keep'].indexOf(this.tiles[j].type)
      if (r < rank) {
        rank = r
        best = j
      }
    }
    return best
  }
  isRampart(i) {
    const t = this.tiles[i]
    return t.type === 'keep' || STRUCTURES[t.type]?.rampart === true
  }
  slots(i) {
    const t = this.tiles[i]
    if (t.type === 'keep') return KEEP.slots
    return STRUCTURES[t.type]?.slots || 0
  }
  // Extra archer range from standing here (height of wall plus hill).
  perch(i) {
    const t = this.tiles[i]
    const s = t.type === 'keep' ? KEEP.perch : STRUCTURES[t.type]?.perch || 0
    return s + (TERRAIN[t.terrain].perch || 0)
  }
  // Top surface height (where an archer stands).
  surface(i) {
    const t = this.tiles[i]
    const h = t.type === 'keep' ? KEEP.height : STRUCTURES[t.type]?.height || 0
    return this.elev(i) + h
  }
  // Surface height at a point on tile i: walls follow the slope of the
  // ground under them; towers, gates and the keep are level.
  surfaceAt(i, px, py) {
    const t = this.tiles[i]
    if (t.type === 'wall' || t.type === 'thick' || t.type === 'palisade' || t.type === 'grass')
      return this.heightAt(px, py) + (STRUCTURES[t.type]?.height || 0)
    return this.surface(i)
  }

  generate(seed) {
    // Retry with a new seed until every spawn can reach the keep.
    for (let attempt = 0; attempt < 50; attempt++) {
      this.tryGenerate(seed + attempt * 7919)
      if (this.spawnsConnected()) return
    }
  }

  tryGenerate(seed) {
    const rnd = mulberry32(seed)
    const { w, h } = this
    this.tiles = []
    for (let i = 0; i < w * h; i++)
      this.tiles.push({ type: 'grass', terrain: 'grass', hp: 0, maxHp: 0, v: rnd(), weakened: false })
    this.placeFixtures()
    const cx = this.keep.x + 1
    const cy = this.keep.y + 1
    const nearSpawn = (x, y, d) => this.spawns.some((s) => Math.abs(x - s.x) + Math.abs(y - s.y) < d)
    const nearKeep = (x, y, dx, dy) => Math.abs(x - cx) < dx && Math.abs(y - cy) < dy
    const set = (x, y, terrain) => {
      if (this.inBounds(x, y)) this.tiles[this.idx(x, y)].terrain = terrain
    }
    const terrainAt = (x, y) => (this.inBounds(x, y) ? this.tiles[this.idx(x, y)].terrain : null)
    const blob = (r, fn) => {
      const bx = Math.floor(rnd() * w)
      const by = Math.floor(rnd() * h)
      for (let y = by - 4; y <= by + 4; y++)
        for (let x = bx - 4; x <= bx + 4; x++) {
          if (!this.inBounds(x, y)) continue
          const d = Math.hypot(x - bx, y - by) + rnd() * 0.9
          if (d < r) fn(x, y, d)
        }
    }

    // Hills first so water can cut through them.
    const hills = 3 + Math.floor(rnd() * 3)
    for (let k = 0; k < hills; k++)
      blob(1.6 + rnd() * 1.6, (x, y) => {
        if (!nearKeep(x, y, 3, 3)) set(x, y, 'hill')
      })

    // A river with two fords, on one side of the keep.
    if (rnd() < 0.8) {
      const vertical = rnd() < 0.6
      const len = vertical ? h : w
      let pos = vertical
        ? rnd() < 0.5 ? 5 + Math.floor(rnd() * 3) : w - 8 + Math.floor(rnd() * 3)
        : rnd() < 0.5 ? 2 + Math.floor(rnd() * 2) : h - 4 - Math.floor(rnd() * 2)
      const lo = vertical ? 3 : 1
      const hi = vertical ? w - 5 : h - 3
      const fordA = Math.floor(len * (0.15 + rnd() * 0.25))
      const fordB = Math.floor(len * (0.6 + rnd() * 0.25))
      for (let t = 0; t < len; t++) {
        if (rnd() < 0.3) pos = Math.max(lo, Math.min(hi, pos + (rnd() < 0.5 ? -1 : 1)))
        const ford = Math.abs(t - fordA) <= 1 || Math.abs(t - fordB) <= 1
        for (const off of [0, 1]) {
          const x = vertical ? pos + off : t
          const y = vertical ? t : pos + off
          if (nearKeep(x, y, 6, 5)) continue
          set(x, y, ford ? 'shallows' : 'water')
        }
      }
    }

    // Lakes ringed by shallows, and marsh.
    const lakes = Math.floor(rnd() * 3)
    for (let k = 0; k < lakes; k++) {
      const r = 1.3 + rnd() * 1.2
      blob(r + 1, (x, y, d) => {
        if (nearKeep(x, y, 6, 5)) return
        set(x, y, d < r ? 'water' : 'shallows')
      })
    }
    const marshes = 1 + Math.floor(rnd() * 3)
    for (let k = 0; k < marshes; k++)
      blob(1.5 + rnd() * 1.5, (x, y) => {
        if (!nearKeep(x, y, 4, 3) && terrainAt(x, y) === 'grass') set(x, y, 'marsh')
      })

    // Keep and spawn areas are always flat, dry ground.
    this.placeFixtures()

    // Tree clusters and rocks (rocks favour hills).
    const clusters = 8 + Math.floor(rnd() * 4)
    for (let c = 0; c < clusters; c++) {
      let x = Math.floor(rnd() * w)
      let y = Math.floor(rnd() * h)
      const size = 3 + Math.floor(rnd() * 6)
      const onHill = terrainAt(x, y) === 'hill'
      const kind = rnd() < (onHill ? 0.45 : 0.85) ? 'tree' : 'rock'
      for (let k = 0; k < size; k++) {
        if (this.inBounds(x, y) && !nearKeep(x, y, 6, 5) && !nearSpawn(x, y, 4)) {
          const t = this.tiles[this.idx(x, y)]
          if (t.terrain === 'grass' || t.terrain === 'hill' || (kind === 'tree' && t.terrain === 'marsh')) t.type = kind
        }
        x += Math.floor(rnd() * 3) - 1
        y += Math.floor(rnd() * 3) - 1
      }
    }
    this.dirty = true
  }

  spawnsConnected() {
    const seen = new Uint8Array(this.w * this.h)
    const k = this.keep
    const queue = [this.idx(k.x, k.y)]
    seen[queue[0]] = 1
    while (queue.length) {
      const i = queue.pop()
      const x = i % this.w
      const y = (i / this.w) | 0
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx
        const ny = y + dy
        if (!this.inBounds(nx, ny)) continue
        const ni = this.idx(nx, ny)
        if (seen[ni] || this.isBlocked(ni)) continue
        seen[ni] = 1
        queue.push(ni)
      }
    }
    return this.spawns.every((s) => seen[this.idx(s.x, s.y)])
  }

  // Why a structure can't go here, or null if it can.
  // Walls and other fortifications push through anything for a price
  // (see ROUGH_COST); everything else needs clear, dry ground.
  isRough(type) {
    const def = STRUCTURES[type]
    return !!def?.solid && !def.village
  }

  buildProblem(i, type) {
    const t = this.tiles[i]
    if (this.reserved[i]) return 'reserved'
    if (this.isRough(type)) return t.type === 'grass' || t.type === 'tree' || t.type === 'rock' ? null : 'occupied'
    if (t.type !== 'grass') return 'occupied'
    const terrain = TERRAIN[t.terrain]
    if (terrain.blocked || terrain.noBuild) return 'terrain'
    if (STRUCTURES[type]?.flatOnly && t.terrain !== 'grass') return 'terrain'
    return null
  }
  canBuild(i, type = 'wall') {
    return this.buildProblem(i, type) === null
  }

  build(i, type) {
    const t = this.tiles[i]
    // Fortifications sit on top of a rock; anything else would clear it.
    if (t.type === 'rock') t.rock = this.isRough(type)
    t.type = type
    t.plot = null
    t.hp = t.maxHp = this.maxHpFor(i, type)
    t.weakened = false
    this.dirty = true
  }

  // Remove a player structure, returning it to empty ground.
  clear(i) {
    const t = this.tiles[i]
    // A wall's rock foundation outlasts the wall.
    t.type = t.rock ? 'rock' : 'grass'
    t.rock = false
    t.hoard = false
    t.ladder = null
    t.plot = null
    t.paid = undefined
    t.hp = t.maxHp = 0
    this.dirty = true
  }

  // Returns true if the structure was destroyed.
  damage(i, amount) {
    const t = this.tiles[i]
    if (t.type === 'keep') {
      this.keep.hp = Math.max(0, this.keep.hp - amount)
      return this.keep.hp <= 0
    }
    t.hp -= amount
    if (t.hp <= 0) {
      this.clear(i)
      return true
    }
    // Weakened walls become more attractive breach points.
    if (t.hp < t.maxHp * 0.5 && !t.weakened) {
      t.weakened = true
      this.dirty = true
    }
    return false
  }
}
