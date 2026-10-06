import { World, mulberry32 } from './world.js'
import { computeFlow } from './pathing.js'
import {
  START_GOLD, TOTAL_WAVES, STRUCTURES, KEEP, ENEMIES, ARROW_SPEED,
  waveComposition, waveBonus,
} from './config.js'

const SPAWN_INTERVAL = 0.75

export class Game {
  constructor(seed = 20261006) {
    this.seed = seed
    this.reset()
  }

  reset() {
    this.world = new World(this.seed)
    this.gold = START_GOLD
    this.wave = 0 // waves completed
    this.phase = 'build' // build | attack | won | lost
    this.enemies = []
    this.projectiles = []
    this.floaters = []
    this.spawnQueue = []
    this.waveTime = 0
    this.time = 0
    this.nextId = 1
    this.events = [] // drained by the UI
    this.rnd = mulberry32(this.seed ^ 0x9e3779b9)
    this.flow = computeFlow(this.world)
    this.world.dirty = false
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
    if (!this.world.canBuild(i)) return false
    if (this.gold < STRUCTURES[type].cost) return false
    if (type !== 'trap' && this.enemyOnTile(i)) return false
    return true
  }

  place(i, type) {
    if (!this.canPlace(i, type)) return false
    this.gold -= STRUCTURES[type].cost
    this.world.build(i, type)
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
    this.world.clear(i)
    return true
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
    if (this.phase !== 'attack') return

    this.waveTime += dt
    while (this.spawnQueue.length && this.spawnQueue[0].t <= this.waveTime)
      this.spawnEnemy(this.spawnQueue.shift())

    for (const e of this.enemies) this.updateEnemy(e, dt)
    this.separate()
    this.updateTraps(dt)
    this.updateShooters(dt)
    this.updateProjectiles(dt)

    for (const e of this.enemies) {
      if (e.dead) {
        this.gold += e.gold
        this.floaters.push({ x: e.x, y: e.y, text: `+${e.gold}`, t: 0 })
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
      for (let tx = x0; tx <= x1; tx++) {
        const i = world.idx(tx, ty)
        if (world.isSolid(i) || world.isBlocked(i)) return true
      }
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
        world.damage(target, e.dps * e.siege * dt)
        return
      }
    }
    e.attacking = false
    const dx = tx - e.x
    const dy = ty - e.y
    const len = Math.hypot(dx, dy) || 1
    const step = e.speed * dt
    e.heading = Math.atan2(dy, dx)
    e.walk += dt * e.speed * 6
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

  updateShooters(dt) {
    const { world } = this
    const shooters = [...world.towers].map((i) => ({
      state: world.tiles[i],
      x: (i % world.w) + 0.5,
      y: ((i / world.w) | 0) + 0.5,
      z: STRUCTURES.tower.height + 0.3,
      def: STRUCTURES.tower,
    }))
    const k = world.keep
    shooters.push({ state: k, x: k.x + 1.5, y: k.y + 1.5, z: KEEP.height + 0.4, def: KEEP })

    for (const s of shooters) {
      s.state.cd -= dt
      if (s.state.cd > 0) continue
      const e = this.pickTarget(s.x, s.y, s.def.range)
      if (!e) continue
      s.state.cd = 1 / s.def.fireRate
      const dist = Math.hypot(e.x - s.x, e.y - s.y)
      this.projectiles.push({
        sx: s.x, sy: s.y, sz: s.z,
        tx: e.x, ty: e.y,
        x: s.x, y: s.y, z: s.z,
        px: s.x, py: s.y, pz: s.z,
        target: e,
        t: 0,
        dur: Math.max(0.15, dist / ARROW_SPEED),
        dmg: s.def.damage,
      })
    }
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      if (!p.target.dead) {
        p.tx = p.target.x
        p.ty = p.target.y
      }
      p.t = Math.min(1, p.t + dt / p.dur)
      p.px = p.x
      p.py = p.y
      p.pz = p.z
      p.x = p.sx + (p.tx - p.sx) * p.t
      p.y = p.sy + (p.ty - p.sy) * p.t
      const arc = Math.min(1.5, p.dur * 2)
      p.z = p.sz + (0.4 - p.sz) * p.t + Math.sin(p.t * Math.PI) * arc
      if (p.t >= 1) {
        if (!p.target.dead) this.hurt(p.target, p.dmg)
        p.done = true
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.done)
  }
}
