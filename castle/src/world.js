import { GRID_W, GRID_H, STRUCTURES, KEEP } from './config.js'

// Tile types:
//   grass, trap        -> walkable
//   wall, tower, keep  -> solid, can be attacked
//   tree, rock         -> impassable scenery

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

export class World {
  constructor(seed = 1) {
    this.w = GRID_W
    this.h = GRID_H
    this.tiles = []
    this.reserved = new Uint8Array(this.w * this.h)
    this.towers = new Set()
    this.keep = { hp: KEEP.hp, maxHp: KEEP.hp, cd: 0, x: 0, y: 0 }
    this.spawns = []
    this.dirty = true // path costs changed
    this.generate(seed)
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

  isWalkable(i) {
    const t = this.tiles[i].type
    return t === 'grass' || t === 'trap'
  }
  isSolid(i) {
    const t = this.tiles[i].type
    return t === 'wall' || t === 'tower' || t === 'keep'
  }
  isBlocked(i) {
    const t = this.tiles[i].type
    return t === 'tree' || t === 'rock'
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
    for (let i = 0; i < w * h; i++) this.tiles.push({ type: 'grass', hp: 0, maxHp: 0, v: rnd(), cd: 0 })
    this.reserved.fill(0)
    this.towers.clear()

    const kx = Math.floor(w / 2) - 1
    const ky = Math.floor(h / 2) - 1
    this.keep = { hp: KEEP.hp, maxHp: KEEP.hp, cd: 0, x: kx, y: ky }
    for (let y = ky; y < ky + KEEP.size; y++)
      for (let x = kx; x < kx + KEEP.size; x++) this.tiles[this.idx(x, y)].type = 'keep'

    const cy = Math.floor(h / 2)
    const cx = Math.floor(w / 2)
    // Order matters: waves unlock gates in this order.
    this.spawns = [
      { x: 0, y: cy, name: 'west' },
      { x: w - 1, y: cy - 1, name: 'east' },
      { x: cx, y: 0, name: 'north' },
      { x: cx - 1, y: h - 1, name: 'south' },
    ]
    for (const s of this.spawns) {
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++)
          if (this.inBounds(s.x + dx, s.y + dy)) this.reserved[this.idx(s.x + dx, s.y + dy)] = 1
    }

    // Scatter tree clusters and rocks away from the keep and spawns.
    const clear = (x, y) => {
      if (Math.abs(x - cx) < 6 && Math.abs(y - cy) < 5) return false
      for (const s of this.spawns) if (Math.abs(x - s.x) + Math.abs(y - s.y) < 4) return false
      return true
    }
    const clusters = 9 + Math.floor(rnd() * 4)
    for (let c = 0; c < clusters; c++) {
      let x = Math.floor(rnd() * w)
      let y = Math.floor(rnd() * h)
      const size = 3 + Math.floor(rnd() * 6)
      const kind = rnd() < 0.75 ? 'tree' : 'rock'
      for (let k = 0; k < size; k++) {
        if (this.inBounds(x, y) && clear(x, y)) this.tiles[this.idx(x, y)].type = kind
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

  canBuild(i) {
    return this.tiles[i].type === 'grass' && !this.reserved[i]
  }

  build(i, type) {
    const t = this.tiles[i]
    t.type = type
    const def = STRUCTURES[type]
    t.hp = t.maxHp = def.hp || 0
    t.cd = 0
    t.weakened = false
    if (type === 'tower') this.towers.add(i)
    this.dirty = true
  }

  // Remove a player structure, returning it to grass.
  clear(i) {
    const t = this.tiles[i]
    if (t.type === 'tower') this.towers.delete(i)
    t.type = 'grass'
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
