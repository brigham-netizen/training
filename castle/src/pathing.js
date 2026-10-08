import { SIEGE_COST_PER_HP, GATE_LURE, RAM_GATE_LURE, STONE, LADDER } from './config.js'

// Flow fields toward the keep's door. Breakable structures cost extra in
// proportion to their HP, so enemies walk around when a gap exists and
// break through the weakest point when the castle is sealed. Foot soldiers
// can't break stone at all: they need a gate, wood, or a ladder.

const DIRS = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
]

class MinHeap {
  constructor() {
    this.items = []
  }
  get size() {
    return this.items.length
  }
  push(id, pri) {
    const a = this.items
    a.push([pri, id])
    let i = a.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (a[p][0] <= a[i][0]) break
      ;[a[p], a[i]] = [a[i], a[p]]
      i = p
    }
  }
  pop() {
    const a = this.items
    const top = a[0]
    const last = a.pop()
    if (a.length) {
      a[0] = last
      let i = 0
      for (;;) {
        const l = i * 2 + 1
        const r = l + 1
        let m = i
        if (l < a.length && a[l][0] < a[m][0]) m = l
        if (r < a.length && a[r][0] < a[m][0]) m = r
        if (m === i) break
        ;[a[m], a[i]] = [a[i], a[m]]
        i = m
      }
    }
    return top
  }
}

// Cost of stepping into tile i (Infinity if this kind of attacker can't).
//   foot:   can't hurt stone; climbs it only where a ladder is up
//   ladder: a ladder crew, who can put a ladder up against a wall
//   ram:    siege engines, who batter through anything but can't cross
//           a moat; ramWait is the same but rolls up to moats to wait
function stepCost(world, i, step, mode) {
  const t = world.tiles[i]
  if (t.type === 'keep') return Infinity
  // Siege engines can't cross water: a moat must be filled first.
  if (t.type === 'moat' && mode === 'ram') return Infinity
  if (world.isSolid(i)) {
    const stone = STONE.includes(t.type)
    if (stone && mode !== 'ram' && mode !== 'ramWait') {
      if (t.ladder) return step / LADDER.climb
      if (mode === 'ladder' && LADDER.reach.includes(t.type)) return step / LADDER.climb + LADDER.cost
      return Infinity
    }
    const lure = t.type === 'gate' ? (mode === 'ram' || mode === 'ramWait' ? RAM_GATE_LURE : GATE_LURE) : 1
    return step + Math.max(0, t.hp) * SIEGE_COST_PER_HP * lure
  }
  return step / world.slow(i)
}

// A diagonal step may not squeeze between two corners.
function diagonalOk(world, x, y, dx, dy) {
  if (!dx || !dy) return true
  return world.isWalkable(world.idx(x + dx, y)) && world.isWalkable(world.idx(x, y + dy))
}

// Flow field toward the keep's doorstep for one kind of attacker.
export function computeFlow(world, mode = 'foot') {
  const { w, h } = world
  const n = w * h
  const dist = new Float64Array(n).fill(Infinity)
  const next = new Int32Array(n).fill(-1)
  const heap = new MinHeap()
  const goal = world.keep.step
  dist[goal] = 0
  heap.push(goal, 0)

  while (heap.size) {
    const [d, u] = heap.pop()
    if (d > dist[u]) continue
    const ux = u % w
    const uy = (u / w) | 0
    for (const [dx, dy, step] of DIRS) {
      // Reverse search: consider stepping from neighbor v into u.
      const vx = ux - dx
      const vy = uy - dy
      if (vx < 0 || vy < 0 || vx >= w || vy >= h) continue
      const v = world.idx(vx, vy)
      if (world.isBlocked(v) || world.tiles[v].type === 'keep') continue
      if (!diagonalOk(world, vx, vy, dx, dy)) continue
      const nd = d + stepCost(world, u, step, mode)
      if (nd < dist[v]) {
        dist[v] = nd
        heap.push(v, nd)
      }
    }
  }

  for (let i = 0; i < n; i++) {
    if (!isFinite(dist[i]) || dist[i] === 0) continue
    const x = i % w
    const y = (i / w) | 0
    let best = Infinity
    for (const [dx, dy, step] of DIRS) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
      const j = world.idx(nx, ny)
      if (world.isBlocked(j) || !diagonalOk(world, x, y, dx, dy)) continue
      const c = dist[j] + stepCost(world, j, step, mode)
      if (c < best) {
        best = c
        next[i] = j
      }
    }
  }

  return { dist, next }
}

export function computeRamFlow(world) {
  return computeFlow(world, 'ram')
}

export function computeLadderFlow(world) {
  return computeFlow(world, 'ladder')
}

// Flow toward village buildings that can be reached without breaking
// anything: easy pickings for raiders. Solid buildings (cottages, markets)
// are the goal tiles; farms are walked onto and trampled.
export function computeVillageFlow(world) {
  const { w, h } = world
  const n = w * h
  const dist = new Float64Array(n).fill(Infinity)
  const next = new Int32Array(n).fill(-1)
  const heap = new MinHeap()
  const isGoal = (i) => world.tiles[i].type === 'cottage' || world.tiles[i].type === 'market' || world.tiles[i].type === 'farm'
  const enter = (i, step) => (isGoal(i) ? step : world.isWalkable(i) ? step / world.slow(i) : Infinity)
  for (let i = 0; i < n; i++) if (isGoal(i)) {
    dist[i] = 0
    heap.push(i, 0)
  }
  while (heap.size) {
    const [d, u] = heap.pop()
    if (d > dist[u]) continue
    const ux = u % w
    const uy = (u / w) | 0
    for (const [dx, dy, step] of DIRS) {
      const vx = ux - dx
      const vy = uy - dy
      if (vx < 0 || vy < 0 || vx >= w || vy >= h) continue
      const v = world.idx(vx, vy)
      if (!world.isWalkable(v) || !diagonalOk(world, vx, vy, dx, dy)) continue
      const nd = d + enter(u, step)
      if (nd < dist[v]) {
        dist[v] = nd
        next[v] = u
        heap.push(v, nd)
      }
    }
  }
  return { dist, next }
}
