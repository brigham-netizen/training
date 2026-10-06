import { World, mulberry32 } from './world.js'
import { computeFlow } from './pathing.js'
import {
  START_GOLD, TOTAL_WAVES, STRUCTURES, KEEP, ENEMIES, ARCHER, SWORDSMAN, ARROW_SPEED, COVER,
  waveComposition, waveBonus,
} from './config.js'

const SPAWN_INTERVAL = 0.75
const THINK = 0.4 // seconds between unit decisions
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
    this.swordsmen = []
    this.projectiles = []
    this.effects = [] // dust puffs and the like, purely visual
    this.floaters = []
    this.spawnQueue = []
    this.waveTime = 0
    this.time = 0
    this.nextId = 1
    this.events = [] // drained by the UI
    this.sounds = [] // drained by the UI each frame
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

  sfx(name, x, y) {
    if (this.sounds.length < 48) this.sounds.push({ name, x, y })
  }

  get nextWave() {
    return this.wave + 1
  }

  activeSpawns(n = this.nextWave) {
    return this.world.spawns.slice(0, waveComposition(n).spawnCount)
  }

  center(i) {
    return [(i % this.world.w) + 0.5, ((i / this.world.w) | 0) + 0.5]
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
    if (type === 'swordsman') return this.canPlaceSwordsman(i)
    if (type === 'upgrade') return this.upgradeInfo(i) !== null && this.gold >= this.upgradeInfo(i).cost
    if (!this.world.canBuild(i, type)) return false
    if (this.gold < STRUCTURES[type].cost) return false
    if (STRUCTURES[type].solid && (this.enemyOnTile(i) || this.swordsmanOnTile(i))) return false
    return true
  }

  place(i, type) {
    if (type === 'archer') return this.placeArcher(i)
    if (type === 'swordsman') return this.placeSwordsman(i)
    if (type === 'upgrade') return this.upgrade(i)
    if (!this.canPlace(i, type)) return false
    this.gold -= STRUCTURES[type].cost
    this.world.build(i, type)
    for (let k = 0; k < (STRUCTURES[type].freeArchers || 0); k++) this.addArcher(i)
    this.sfx('build', ...this.center(i))
    return true
  }

  // What the Upgrade tool would do here: upgrade to the next tier, or
  // repair a damaged structure that's already at the top tier.
  upgradeInfo(i) {
    const t = this.world.tiles[i]
    const def = STRUCTURES[t.type]
    if (!def || !def.hp) return null
    if (def.upgrade) {
      const to = STRUCTURES[def.upgrade]
      return { kind: 'upgrade', to: def.upgrade, cost: Math.max(1, to.cost - def.cost) }
    }
    if (t.hp < t.maxHp) {
      const missing = 1 - t.hp / t.maxHp
      return { kind: 'repair', cost: Math.max(1, Math.ceil(def.cost * missing)) }
    }
    return null
  }

  upgrade(i) {
    const info = this.upgradeInfo(i)
    if (!info || this.gold < info.cost || this.phase === 'won' || this.phase === 'lost') return false
    this.gold -= info.cost
    const t = this.world.tiles[i]
    if (info.kind === 'upgrade') {
      // Rebuild in place; archers standing on it stay put.
      t.type = info.to
      t.hp = t.maxHp = STRUCTURES[info.to].hp
      t.weakened = false
      this.world.dirty = true
    } else {
      t.hp = t.maxHp
      t.weakened = false
      this.world.dirty = true
    }
    this.floaters.push({ x: (i % this.world.w) + 0.5, y: ((i / this.world.w) | 0) + 0.5, z: this.world.surface(i), text: `-${info.cost}`, t: 0, color: 'cost' })
    this.sfx('build', ...this.center(i))
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
    this.sfx('recruit', ...this.center(i))
    return true
  }

  addArcher(i) {
    if (!this.hasRoom(i)) return null
    const { world } = this
    const a = {
      id: this.nextId++,
      kind: 'archer',
      tile: i,
      post: i,
      path: [],
      hp: ARCHER.hp,
      maxHp: ARCHER.hp,
      // Small personal offset so archers sharing a tower don't overlap.
      ox: (this.rnd() - 0.5) * 0.3,
      oy: (this.rnd() - 0.5) * 0.3,
      x: (i % world.w) + 0.5,
      y: ((i / world.w) | 0) + 0.5,
      z: world.surface(i),
      cd: 0,
      think: this.rnd() * THINK,
      heading: Math.PI / 2,
      flash: 0,
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
    const [x, y] = this.center(i)
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
    a.flash = Math.max(0, a.flash - dt)

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
        this.shoot(a.x, a.y, a.z + 0.5, target, ARCHER.damage, false)
        this.sfx('bow', a.x, a.y)
      }
      return
    }
    if (a.think > 0) return
    a.think = THINK
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

  // ---- swordsmen ------------------------------------------------------------

  // Your troops walk on open ground and through gates.
  troopPassable(i) {
    const t = this.world.tiles[i].type
    return this.world.isWalkable(i) || t === 'gate'
  }

  swordsmanOnTile(i) {
    const x = i % this.world.w
    const y = (i / this.world.w) | 0
    return this.swordsmen.some((s) => s.x > x && s.x < x + 1 && s.y > y && s.y < y + 1)
  }

  canPlaceSwordsman(i) {
    return (
      this.phase !== 'won' && this.phase !== 'lost' &&
      this.gold >= SWORDSMAN.cost && this.world.isWalkable(i) && !this.world.reserved[i]
    )
  }

  placeSwordsman(i) {
    if (!this.canPlaceSwordsman(i)) return false
    this.gold -= SWORDSMAN.cost
    const [x, y] = this.center(i)
    this.swordsmen.push({
      id: this.nextId++,
      kind: 'swordsman',
      post: i,
      x: x + (this.rnd() - 0.5) * 0.3,
      y: y + (this.rnd() - 0.5) * 0.3,
      z: this.world.elev(i),
      hp: SWORDSMAN.hp,
      maxHp: SWORDSMAN.hp,
      r: SWORDSMAN.r,
      path: [],
      target: null,
      think: 0,
      heading: Math.PI / 2,
      walk: 0,
      fighting: false,
      flash: 0,
    })
    this.sfx('recruit', x, y)
    return true
  }

  // Shortest 4-way path for troops from tile a to tile b (excluding a).
  troopPath(a, b, limit = 500) {
    if (a === b) return []
    const { world } = this
    const prev = new Map([[a, -1]])
    const queue = [a]
    for (let q = 0; q < queue.length && q < limit; q++) {
      const u = queue[q]
      if (u === b) {
        const path = []
        for (let v = u; v !== a; v = prev.get(v)) path.push(v)
        return path.reverse()
      }
      const ux = u % world.w
      const uy = (u / world.w) | 0
      for (const [dx, dy] of N4) {
        const nx = ux + dx
        const ny = uy + dy
        if (!world.inBounds(nx, ny)) continue
        const v = world.idx(nx, ny)
        if (prev.has(v) || !this.troopPassable(v)) continue
        prev.set(v, u)
        queue.push(v)
      }
    }
    return null
  }

  updateSwordsman(s, dt) {
    const { world } = this
    s.flash = Math.max(0, s.flash - dt)
    s.think -= dt
    const here = world.idxAt(s.x, s.y)
    s.z += (world.elev(here) - s.z) * Math.min(1, dt * 8)
    const [px, py] = this.center(s.post)

    if (s.think <= 0) {
      s.think = THINK
      s.target = null
      if (this.phase === 'attack') {
        // Charge the closest enemy that has come within guard range of the post.
        let best = Infinity
        for (const e of this.enemies) {
          if (e.dead || Math.hypot(e.x - px, e.y - py) > SWORDSMAN.guard) continue
          const d = Math.hypot(e.x - s.x, e.y - s.y)
          if (d < best) {
            best = d
            s.target = e
          }
        }
      }
      let path = s.target ? this.troopPath(here, world.idxAt(s.target.x, s.target.y)) : null
      if (!path) {
        // Unreachable (say, outside a wall with no gate): hold the post.
        s.target = null
        path = this.troopPath(here, s.post)
      }
      s.path = path || []
    }

    const e = s.target
    if (e && !e.dead) {
      const d = Math.hypot(e.x - s.x, e.y - s.y)
      if (d <= s.r + e.r + 0.3) {
        s.fighting = true
        s.heading = Math.atan2(e.y - s.y, e.x - s.x)
        s.walk += dt * 8
        this.hurt(e, SWORDSMAN.dps * dt, false)
        if (Math.random() < dt * 2) this.sfx('clash', s.x, s.y)
        return
      }
    }
    s.fighting = false

    // Walk the path tile by tile, then straight at the target or post.
    let tx
    let ty
    if (s.path.length) {
      ;[tx, ty] = this.center(s.path[0])
      if (Math.hypot(tx - s.x, ty - s.y) < 0.3) s.path.shift()
    } else if (e && !e.dead) {
      tx = e.x
      ty = e.y
    } else {
      tx = px
      ty = py
    }
    const dx = tx - s.x
    const dy = ty - s.y
    const d = Math.hypot(dx, dy)
    if (d < 0.05) return
    const step = Math.min(d, SWORDSMAN.speed * world.slow(here) * dt)
    s.heading = Math.atan2(dy, dx)
    s.walk += step * 6
    this.tryMove(s, (dx / d) * step, (dy / d) * step)
  }

  // ---- waves --------------------------------------------------------------

  startWave() {
    if (this.phase !== 'build') return
    const n = this.nextWave
    const comp = waveComposition(n)
    const spawns = this.activeSpawns(n)
    const list = []
    const sprinkle = (type, count, from = 0) => {
      for (let k = 0; k < count; k++)
        list.splice(from + Math.floor(this.rnd() * (list.length - from + 1)), 0, type)
    }
    for (let k = 0; k < comp.raider; k++) list.push('raider')
    sprinkle('brute', comp.brute)
    sprinkle('bowman', comp.bowman)
    // Siege engines arrive in the back half so the wall has been tested.
    const half = Math.floor(list.length / 2)
    sprinkle('ram', comp.ram, half)
    sprinkle('catapult', comp.catapult, half)

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
      shooting: false,
      fired: -9, // time of last shot (for the catapult arm animation)
      cd: 0.5 + this.rnd(),
      ammo: def.ammo || 0,
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
    for (const fx of this.effects) fx.t += dt
    this.effects = this.effects.filter((fx) => fx.t < fx.life)
    if (this.world.dirty) this.repath()

    for (const a of this.archers) this.updateArcher(a, dt)
    for (const s of this.swordsmen) this.updateSwordsman(s, dt)
    this.reapDefenders()
    if (this.phase !== 'attack') return

    this.waveTime += dt
    while (this.spawnQueue.length && this.spawnQueue[0].t <= this.waveTime)
      this.spawnEnemy(this.spawnQueue.shift())

    for (const e of this.enemies) this.updateEnemy(e, dt)
    this.separate()
    this.updateTraps(dt)
    this.updateProjectiles(dt)
    this.reapDefenders()

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

  reapDefenders() {
    for (const list of [this.archers, this.swordsmen])
      for (const u of list) if (u.dead || u.hp <= 0) {
        u.dead = true
        this.sfx('fall', u.x, u.y)
      }
    this.archers = this.archers.filter((a) => !a.dead)
    this.swordsmen = this.swordsmen.filter((s) => !s.dead)
  }

  repath() {
    this.flow = computeFlow(this.world)
    this.world.dirty = false
  }

  endWave() {
    this.wave++
    this.projectiles = []
    // Survivors patch themselves up between waves.
    for (const u of [...this.archers, ...this.swordsmen]) u.hp = u.maxHp
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

  blockedAt(x, y, r, troop = false) {
    const { world } = this
    // >= so a unit flush with the far edge never reads past the grid.
    if (x - r < 0 || y - r < 0 || x + r >= world.w || y + r >= world.h) return true
    const x0 = Math.floor(x - r)
    const x1 = Math.floor(x + r)
    const y0 = Math.floor(y - r)
    const y1 = Math.floor(y + r)
    for (let ty = y0; ty <= y1; ty++)
      for (let tx = x0; tx <= x1; tx++) {
        const i = world.idx(tx, ty)
        if (troop ? !this.troopPassable(i) : !world.isWalkable(i)) return true
      }
    return false
  }

  // Move with axis-separated sliding so units glide along walls.
  tryMove(u, dx, dy) {
    const cr = u.r * 0.8
    const troop = u.kind === 'swordsman'
    if (dx && !this.blockedAt(u.x + dx, u.y, cr, troop)) u.x += dx
    if (dy && !this.blockedAt(u.x, u.y + dy, cr, troop)) u.y += dy
  }

  nearestDefender(x, y, range) {
    let best = null
    let bestD = range
    for (const list of [this.archers, this.swordsmen])
      for (const u of list) {
        if (u.dead) continue
        const d = Math.hypot(u.x - x, u.y - y)
        if (d <= bestD) {
          bestD = d
          best = u
        }
      }
    return best
  }

  // Catapults go for towers first, then any other structure, then the keep.
  catapultTarget(e, range) {
    const { world } = this
    let best = -1
    let bestScore = Infinity
    const x0 = Math.max(0, Math.floor(e.x - range))
    const x1 = Math.min(world.w - 1, Math.floor(e.x + range))
    const y0 = Math.max(0, Math.floor(e.y - range))
    const y1 = Math.min(world.h - 1, Math.floor(e.y + range))
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const i = world.idx(x, y)
        if (!world.isSolid(i)) continue
        const d = Math.hypot(x + 0.5 - e.x, y + 0.5 - e.y)
        if (d > range) continue
        const type = world.tiles[i].type
        const score = d + (type === 'tower' ? -4 : type === 'keep' ? 3 : 0)
        if (score < bestScore) {
          bestScore = score
          best = i
        }
      }
    return best
  }

  updateEnemy(e, dt) {
    const { world, flow } = this
    const def = ENEMIES[e.type]
    e.flash = Math.max(0, e.flash - dt)
    e.cd -= dt
    const ci = world.idxAt(e.x, e.y)
    e.z += (world.elev(ci) - e.z) * Math.min(1, dt * 8)
    e.attacking = false
    e.shooting = false

    if (e.type === 'bowman') {
      const t = this.nearestDefender(e.x, e.y, def.range)
      if (t) {
        e.shooting = true
        e.heading = Math.atan2(t.y - e.y, t.x - e.x)
        if (e.cd <= 0) {
          e.cd = 1 / def.rate
          this.shoot(e.x, e.y, e.z + 0.5, t, def.shot, true)
          this.sfx('bow', e.x, e.y)
        }
        return
      }
    } else if (e.type === 'catapult' && e.ammo > 0) {
      const ti = this.catapultTarget(e, def.range)
      if (ti >= 0) {
        e.shooting = true
        const [tx, ty] = this.center(ti)
        e.heading = Math.atan2(ty - e.y, tx - e.x)
        if (e.cd <= 0) {
          e.cd = 1 / def.rate
          e.fired = this.time
          e.ammo--
          this.lob(e, ti, def)
          this.sfx('launch', e.x, e.y)
        }
        return
      }
    }

    // Melee enemies stop to fight swordsmen in their way.
    if (!def.noMelee) {
      for (const s of this.swordsmen) {
        if (s.dead || Math.hypot(s.x - e.x, s.y - e.y) > e.r + s.r + 0.3) continue
        e.attacking = true
        e.heading = Math.atan2(s.y - e.y, s.x - e.x)
        e.walk += dt * 6
        s.hp -= e.dps * dt
        s.flash = 0.1
        return
      }
    }

    let target = flow.next[ci]
    if (target < 0) {
      // Off the flow field (should be rare): head straight for the keep.
      const k = world.keep
      target = world.idxAt(k.x + 1.5, k.y + 1.5)
    }
    const [tx, ty] = this.center(target)

    if (world.isSolid(target)) {
      const reach = Math.max(Math.abs(tx - e.x), Math.abs(ty - e.y))
      if (reach <= 0.5 + e.r + 0.08) {
        if (e.type === 'catapult') return // out of boulders: parked at the wall
        e.attacking = true
        e.heading = Math.atan2(ty - e.y, tx - e.x)
        e.walk += dt * 6
        const thorns = STRUCTURES[world.tiles[target].type]?.thorns
        if (thorns) this.hurt(e, thorns * dt, false)
        this.damageStructure(target, e.dps * e.siege * dt)
        return
      }
    }
    const dx = tx - e.x
    const dy = ty - e.y
    const len = Math.hypot(dx, dy) || 1
    const speed = e.speed * world.slow(ci)
    const step = speed * dt
    e.heading = Math.atan2(dy, dx)
    e.walk += dt * speed * 6
    this.tryMove(e, (dx / len) * step, (dy / len) * step)
  }

  damageStructure(i, amount) {
    const before = this.world.tiles[i].type
    if (this.world.damage(i, amount) && before !== 'keep') {
      const [x, y] = this.center(i)
      this.effects.push({ type: 'dust', x, y, z: 0.3, t: 0, life: 0.9, size: 1 })
      this.sfx('crumble', x, y)
    }
  }

  separate() {
    // Swordsmen take part so a line of them can hold a gap.
    const us = [...this.enemies, ...this.swordsmen]
    for (let a = 0; a < us.length; a++) {
      for (let b = a + 1; b < us.length; b++) {
        const A = us[a]
        const B = us[b]
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
      // Shoot whoever is closest to breaking in; siege engines first.
      let d = flow.dist[world.idxAt(e.x, e.y)]
      if (e.type === 'catapult') d -= 20
      if (d < bestDist) {
        bestDist = d
        best = e
      }
    }
    return best
  }

  shoot(x, y, z, target, dmg, hostile) {
    const dist = Math.hypot(target.x - x, target.y - y)
    this.projectiles.push({
      kind: 'arrow',
      hostile,
      sx: x, sy: y, sz: z,
      tx: target.x, ty: target.y, tz: target.z + 0.4,
      x, y, z,
      px: x, py: y, pz: z,
      target,
      t: 0,
      dur: Math.max(0.15, dist / ARROW_SPEED),
      dmg,
    })
  }

  lob(e, tile, def) {
    const [tx, ty] = this.center(tile)
    const dist = Math.hypot(tx - e.x, ty - e.y)
    this.projectiles.push({
      kind: 'boulder',
      sx: e.x, sy: e.y, sz: e.z + 0.6,
      tx, ty, tz: this.world.surface(tile),
      x: e.x, y: e.y, z: e.z + 0.6,
      px: e.x, py: e.y, pz: e.z + 0.6,
      tile,
      t: 0,
      dur: 0.8 + dist * 0.12,
      dmg: def.boulder,
      splash: def.splash,
    })
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      if (p.kind === 'arrow' && !p.target.dead) {
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
      const arc = p.kind === 'boulder' ? 2.5 + p.dur : Math.min(1.5, p.dur * 2)
      p.z = p.sz + (p.tz - p.sz) * p.t + Math.sin(p.t * Math.PI) * arc
      if (p.t < 1) continue
      p.done = true
      if (p.kind === 'boulder') {
        this.damageStructure(p.tile, p.dmg)
        // Archers on or next to the impact get knocked about.
        for (const a of this.archers) if (Math.hypot(a.x - p.tx, a.y - p.ty) < 0.9) {
          a.hp -= p.splash
          a.flash = 0.15
        }
        this.effects.push({ type: 'dust', x: p.tx, y: p.ty, z: p.tz, t: 0, life: 0.7, size: 0.8 })
        this.sfx('impact', p.tx, p.ty)
      } else if (!p.target.dead) {
        if (p.hostile) {
          p.target.hp -= p.dmg * (p.target.kind === 'archer' ? COVER : 1)
          p.target.flash = 0.12
        } else this.hurt(p.target, p.dmg)
        this.sfx('hit', p.tx, p.ty)
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.done)
  }
}
