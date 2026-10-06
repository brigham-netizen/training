import { World, mulberry32 } from './world.js'
import { computeFlow } from './pathing.js'
import {
  START_GOLD, TOTAL_WAVES, STRUCTURES, KEEP, ENEMIES, ARCHER, ARROW_SPEED,
  waveComposition, waveBonus,
} from './config.js'

const SPAWN_INTERVAL = 0.75
const ARCHER_THINK = 0.5
const ARCHER_SEARCH = 60 // max rampart tiles an archer will consider walking to
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]]

export class Game {
  constructor(seed = 20261006) {
    this.seed = seed
    this.reset()
  }

  reset(seed = this.seed) {
    this.seed = seed
    this.world = new World(seed)
    this.gold = START_GOLD
    this.wave = 0 // waves completed
    this.phase = 'build' // build | attack | won | lost
    this.enemies = []
    this.archers = []
    this.projectiles = []
    this.floaters = []
    this.spawnQueue = []
    this.waveTime = 0
    this.time = 0
    this.nextId = 1
    this.events = [] // drained by the UI
    this.rnd = mulberry32(seed ^ 0x9e3779b9)
    this.flow = computeFlow(this.world)
    this.world.dirty = false

    // The keep starts garrisoned, one archer per outer side.
    const k = this.world.keep
    for (const [dx, dy] of [[1, 0], [0, 2], [2, 2]].slice(0, KEEP.archers))
      this.addArcher(this.world.idx(k.x + dx, k.y + dy))
  }

  emit(type, data = {}) {
    this.events.push({ type, ...data })
  }

  get nextWave() {
    return this.wave + 1
  }

  activeSpawns(n = this.nextWave) {
    return this.world.spawns.slice(0, waveComposition(n).spawnCount)
  }

  // ---- building -----------------------------------------------------------

  enemyOnTile(i) {
    const x = i % this.world.w
    const y = (i / this.world.w) | 0
    return this.enemies.some(
      (e) => e.x + e.r > x && e.x - e.r < x + 1 && e.y + e.r > y && e.y - e.r < y + 1,
    )
  }

  canPlace(i, type) {
    if (this.phase === 'won' || this.phase === 'lost') return false
    if (type === 'archer') return this.canPlaceArcher(i)
    if (!this.world.canBuild(i, type)) return false
    if (this.gold < STRUCTURES[type].cost) return false
    if (STRUCTURES[type].solid && this.enemyOnTile(i)) return false
    return true
  }

  place(i, type) {
    if (type === 'archer') return this.placeArcher(i)
    if (!this.canPlace(i, type)) return false
    this.gold -= STRUCTURES[type].cost
    this.world.build(i, type)
    for (let k = 0; k < (STRUCTURES[type].freeArchers || 0); k++) this.addArcher(i)
    return true
  }

  refundFor(i) {
    const t = this.world.tiles[i]
    const def = STRUCTURES[t.type]
    if (!def) return 0
    const health = t.maxHp ? t.hp / t.maxHp : 1
    // Free rearranging between waves; half value once the fighting starts.
    const rate = this.phase === 'build' ? 1 : 0.5
    return Math.floor(def.cost * health * rate)
  }

  demolish(i) {
    if (!STRUCTURES[this.world.tiles[i].type]) return false
    this.gold += this.refundFor(i)
    const stranded = this.archers.filter((a) => a.tile === i)
    this.world.clear(i)
    // Archers on a removed structure fall back to the keep.
    for (const a of stranded) this.rehouse(a)
    return true
  }

  // ---- archers --------------------------------------------------------------

  // Archers standing on or heading to tile i.
  occupancy(i, except = null) {
    let n = 0
    for (const a of this.archers) {
      if (a === except) continue
      const dest = a.path.length ? a.path[a.path.length - 1] : a.tile
      if (dest === i) n++
    }
    return n
  }

  hasRoom(i, except = null) {
    return this.world.isRampart(i) && this.occupancy(i, except) < this.world.slots(i)
  }

  canPlaceArcher(i) {
    return this.phase !== 'won' && this.phase !== 'lost' && this.gold >= ARCHER.cost && this.hasRoom(i)
  }

  placeArcher(i) {
    if (!this.canPlaceArcher(i)) return false
    this.gold -= ARCHER.cost
    this.addArcher(i)
    return true
  }

  addArcher(i) {
    if (!this.hasRoom(i)) return null
    const { world } = this
    const a = {
      id: this.nextId++,
      tile: i,
      post: i,
      path: [],
      // Small personal offset so archers sharing a tower don't overlap.
      ox: (this.rnd() - 0.5) * 0.3,
      oy: (this.rnd() - 0.5) * 0.3,
      x: (i % world.w) + 0.5,
      y: ((i / world.w) | 0) + 0.5,
      z: world.surface(i),
      cd: 0,
      think: this.rnd() * ARCHER_THINK,
      heading: Math.PI / 2,
    }
    a.x += a.ox
    a.y += a.oy
    this.archers.push(a)
    return a
  }

  // Send an archer whose post is gone to a free spot in the keep.
  rehouse(a) {
    const { world } = this
    const k = world.keep
    for (let y = k.y; y < k.y + KEEP.size; y++)
      for (let x = k.x; x < k.x + KEEP.size; x++) {
        const i = world.idx(x, y)
        if (this.hasRoom(i, a)) {
          a.tile = a.post = i
          a.path = []
          a.x = x + 0.5 + a.ox
          a.y = y + 0.5 + a.oy
          a.z = world.surface(i)
          return
        }
      }
    // Nowhere to go: pay them off.
    this.archers = this.archers.filter((b) => b !== a)
    this.gold += ARCHER.cost
  }

  range(i) {
    return ARCHER.range + this.world.perch(i)
  }

  enemyInRange(i) {
    const { world } = this
    const x = (i % world.w) + 0.5
    const y = ((i / world.w) | 0) + 0.5
    const r2 = this.range(i) ** 2
    return this.enemies.some((e) => !e.dead && (e.x - x) ** 2 + (e.y - y) ** 2 <= r2)
  }

  // Breadth-first search along connected ramparts. Returns the path to the
  // first tile satisfying `goal`, excluding the start.
  rampartPath(a, goal) {
    const { world } = this
    const prev = new Map([[a.tile, -1]])
    const queue = [a.tile]
    for (let q = 0; q < queue.length && q < ARCHER_SEARCH; q++) {
      const u = queue[q]
      if (u !== a.tile && goal(u)) {
        const path = []
        for (let v = u; v !== a.tile; v = prev.get(v)) path.push(v)
        return path.reverse()
      }
      const ux = u % world.w
      const uy = (u / world.w) | 0
      for (const [dx, dy] of N4) {
        const nx = ux + dx
        const ny = uy + dy
        if (!world.inBounds(nx, ny)) continue
        const v = world.idx(nx, ny)
        if (prev.has(v) || !world.isRampart(v)) continue
        prev.set(v, u)
        queue.push(v)
      }
    }
    return null
  }

  updateArcher(a, dt) {
    const { world } = this
    if (!world.isRampart(a.tile)) {
      a.dead = true // the wall came down under them
      return
    }
    a.cd -= dt
    a.think -= dt

    if (a.path.length) {
      const next = a.path[0]
      if (!world.isRampart(next)) {
        a.path = []
      } else {
        const tx = (next % world.w) + 0.5 + a.ox
        const ty = ((next / world.w) | 0) + 0.5 + a.oy
        const dx = tx - a.x
        const dy = ty - a.y
        const d = Math.hypot(dx, dy)
        const step = ARCHER.speed * dt
        a.heading = Math.atan2(dy, dx)
        if (d <= step) {
          a.x = tx
          a.y = ty
          a.tile = a.path.shift()
        } else {
          a.x += (dx / d) * step
          a.y += (dy / d) * step
        }
        // Step up or down onto the next surface as they cross the seam.
        const surf = world.surface(d < 0.5 ? next : a.tile)
        a.z += (surf - a.z) * Math.min(1, dt * 10)
        return
      }
    }
    a.z += (world.surface(a.tile) - a.z) * Math.min(1, dt * 10)

    const target = this.pickTarget(a.x, a.y, this.range(a.tile))
    if (target) {
      a.heading = Math.atan2(target.y - a.y, target.x - a.x)
      if (a.cd <= 0) {
        a.cd = 1 / ARCHER.fireRate
        this.shoot(a.x, a.y, a.z + 0.5, target, ARCHER.damage)
      }
      return
    }
    if (a.think > 0) return
    a.think = ARCHER_THINK
    if (this.phase === 'attack') {
      // Nothing to shoot: walk the walls to the nearest spot that has a target.
      const path = this.rampartPath(a, (i) => this.hasRoom(i, a) && this.enemyInRange(i))
      if (path) a.path = path
    } else if (a.tile !== a.post) {
      const path = this.rampartPath(a, (i) => i === a.post)
      if (path) a.path = path
      else a.post = a.tile // post was cut off; stay here
    }
  }

  // ---- waves --------------------------------------------------------------

  startWave() {
    if (this.phase !== 'build') return
    const n = this.nextWave
    const comp = waveComposition(n)
    const spawns = this.activeSpawns(n)
    const list = []
    for (let k = 0; k < comp.raider; k++) list.push('raider')
    for (let k = 0; k < comp.brute; k++) list.splice(Math.floor(this.rnd() * (list.length + 1)), 0, 'brute')
    // Rams arrive in the back half so the wall has already been tested.
    const half = Math.floor(list.length / 2)
    for (let k = 0; k < comp.ram; k++)
      list.splice(half + Math.floor(this.rnd() * (list.length - half + 1)), 0, 'ram')

    // Each gate spawns its share in parallel.
    this.spawnQueue = list.map((type, k) => ({
      type,
      spawn: spawns[k % spawns.length],
      t: Math.floor(k / spawns.length) * SPAWN_INTERVAL * Math.min(2, spawns.length) + 1,
      hpMult: comp.hpMult,
    }))
    this.spawnQueue.sort((a, b) => a.t - b.t)
    this.waveTime = 0
    this.phase = 'attack'
    this.emit('waveStart', { wave: n, spawns: spawns.map((s) => s.name) })
  }

  spawnEnemy({ type, spawn, hpMult }) {
    const def = ENEMIES[type]
    const hp = Math.round(def.hp * hpMult)
    this.enemies.push({
      id: this.nextId++,
      type,
      x: spawn.x + 0.5 + (this.rnd() - 0.5) * 0.4,
      y: spawn.y + 0.5 + (this.rnd() - 0.5) * 0.4,
      z: 0,
      hp,
      maxHp: hp,
      speed: def.speed * (0.9 + this.rnd() * 0.2),
      dps: def.dps,
      siege: def.siege,
      gold: def.gold,
      r: def.r,
      heading: 0,
      attacking: false,
      walk: this.rnd() * 10,
      flash: 0,
      dead: false,
    })
  }

  // ---- simulation ---------------------------------------------------------

  update(dt) {
    this.time += dt
    for (const f of this.floaters) f.t += dt
    this.floaters = this.floaters.filter((f) => f.t < 1.2)
    if (this.world.dirty) this.repath()

    for (const a of this.archers) this.updateArcher(a, dt)
    this.archers = this.archers.filter((a) => !a.dead)
    if (this.phase !== 'attack') return

    this.waveTime += dt
    while (this.spawnQueue.length && this.spawnQueue[0].t <= this.waveTime)
      this.spawnEnemy(this.spawnQueue.shift())

    for (const e of this.enemies) this.updateEnemy(e, dt)
    this.separate()
    this.updateTraps(dt)
    this.updateProjectiles(dt)

    for (const e of this.enemies) {
      if (e.dead) {
        this.gold += e.gold
        this.floaters.push({ x: e.x, y: e.y, z: e.z, text: `+${e.gold}`, t: 0 })
      }
    }
    this.enemies = this.enemies.filter((e) => !e.dead)

    if (this.world.keep.hp <= 0) {
      this.phase = 'lost'
      this.emit('lost', { wave: this.nextWave })
      return
    }
    if (!this.spawnQueue.length && !this.enemies.length) this.endWave()
  }

  repath() {
    this.flow = computeFlow(this.world)
    this.world.dirty = false
  }

  endWave() {
    this.wave++
    this.projectiles = []
    if (this.wave >= TOTAL_WAVES) {
      this.phase = 'won'
      this.emit('won', { wave: this.wave })
      return
    }
    const bonus = waveBonus(this.wave)
    this.gold += bonus
    // Masons patch up the keep between waves; walls are on you.
    this.world.keep.hp = this.world.keep.maxHp
    this.phase = 'build'
    this.emit('waveEnd', { wave: this.wave, bonus })
  }

  blockedAt(x, y, r) {
    const { world } = this
    if (x - r < 0 || y - r < 0 || x + r > world.w || y + r > world.h) return true
    const x0 = Math.floor(x - r)
    const x1 = Math.floor(x + r)
    const y0 = Math.floor(y - r)
    const y1 = Math.floor(y + r)
    for (let ty = y0; ty <= y1; ty++)
      for (let tx = x0; tx <= x1; tx++) if (!world.isWalkable(world.idx(tx, ty))) return true
    return false
  }

  // Move with axis-separated sliding so enemies glide along walls.
  tryMove(e, dx, dy) {
    const cr = e.r * 0.8
    if (dx && !this.blockedAt(e.x + dx, e.y, cr)) e.x += dx
    if (dy && !this.blockedAt(e.x, e.y + dy, cr)) e.y += dy
  }

  updateEnemy(e, dt) {
    const { world, flow } = this
    e.flash = Math.max(0, e.flash - dt)
    const ci = world.idxAt(e.x, e.y)
    e.z += (world.elev(ci) - e.z) * Math.min(1, dt * 8)
    let target = flow.next[ci]
    if (target < 0) {
      // Off the flow field (should be rare): head straight for the keep.
      const k = world.keep
      target = world.idxAt(k.x + 1.5, k.y + 1.5)
    }
    const tx = (target % world.w) + 0.5
    const ty = ((target / world.w) | 0) + 0.5

    if (world.isSolid(target)) {
      const reach = Math.max(Math.abs(tx - e.x), Math.abs(ty - e.y))
      if (reach <= 0.5 + e.r + 0.08) {
        e.attacking = true
        e.heading = Math.atan2(ty - e.y, tx - e.x)
        e.walk += dt * 6
        const thorns = STRUCTURES[world.tiles[target].type]?.thorns
        if (thorns) this.hurt(e, thorns * dt, false)
        world.damage(target, e.dps * e.siege * dt)
        return
      }
    }
    e.attacking = false
    const dx = tx - e.x
    const dy = ty - e.y
    const len = Math.hypot(dx, dy) || 1
    const speed = e.speed * world.slow(ci)
    const step = speed * dt
    e.heading = Math.atan2(dy, dx)
    e.walk += dt * speed * 6
    this.tryMove(e, (dx / len) * step, (dy / len) * step)
  }

  separate() {
    const es = this.enemies
    for (let a = 0; a < es.length; a++) {
      for (let b = a + 1; b < es.length; b++) {
        const A = es[a]
        const B = es[b]
        const dx = B.x - A.x
        const dy = B.y - A.y
        const min = (A.r + B.r) * 0.85
        const d2 = dx * dx + dy * dy
        if (d2 >= min * min || d2 === 0) continue
        const d = Math.sqrt(d2)
        const push = (min - d) * 0.25
        const ux = dx / d
        const uy = dy / d
        this.tryMove(A, -ux * push, -uy * push)
        this.tryMove(B, ux * push, uy * push)
      }
    }
  }

  updateTraps(dt) {
    const { world } = this
    for (const e of this.enemies) {
      if (world.tiles[world.idxAt(e.x, e.y)].type === 'trap') this.hurt(e, STRUCTURES.trap.dps * dt, false)
    }
  }

  hurt(e, amount, flash = true) {
    e.hp -= amount
    if (flash) e.flash = 0.12
    if (e.hp <= 0) e.dead = true
  }

  pickTarget(x, y, range) {
    const { world, flow } = this
    let best = null
    let bestDist = Infinity
    for (const e of this.enemies) {
      if (e.dead) continue
      if ((e.x - x) ** 2 + (e.y - y) ** 2 > range * range) continue
      // Shoot whoever is closest to breaking in.
      const d = flow.dist[world.idxAt(e.x, e.y)]
      if (d < bestDist) {
        bestDist = d
        best = e
      }
    }
    return best
  }

  shoot(x, y, z, e, dmg) {
    const dist = Math.hypot(e.x - x, e.y - y)
    this.projectiles.push({
      sx: x, sy: y, sz: z,
      tx: e.x, ty: e.y, tz: e.z + 0.4,
      x, y, z,
      px: x, py: y, pz: z,
      target: e,
      t: 0,
      dur: Math.max(0.15, dist / ARROW_SPEED),
      dmg,
    })
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      if (!p.target.dead) {
        p.tx = p.target.x
        p.ty = p.target.y
        p.tz = p.target.z + 0.4
      }
      p.t = Math.min(1, p.t + dt / p.dur)
      p.px = p.x
      p.py = p.y
      p.pz = p.z
      p.x = p.sx + (p.tx - p.sx) * p.t
      p.y = p.sy + (p.ty - p.sy) * p.t
      const arc = Math.min(1.5, p.dur * 2)
      p.z = p.sz + (p.tz - p.sz) * p.t + Math.sin(p.t * Math.PI) * arc
      if (p.t >= 1) {
        if (!p.target.dead) this.hurt(p.target, p.dmg)
        p.done = true
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.done)
  }
}
