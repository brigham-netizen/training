import { World, mulberry32 } from './world.js'
import { computeFlow, computeRamFlow, computeLadderFlow, computeVillageFlow, computeFootNav } from './pathing.js'
import {
  START_GOLD, TOTAL_WAVES, STRUCTURES, KEEP, ENEMIES, ARCHER, SWORDSMAN, ARROW_SPEED, COVER,
  HOARDING, VILLAGE, ZONE_MARGIN, ROUGH_COST, LADDER, STONE, AIM, PLUNDER_RANGE, ARMY,
  UNIT_SCALE, DROPS, MOAT, RENOWN, TERRAIN, RESEARCH,
  waveComposition, waveBonus,
} from './config.js'

const THINK = 0.4 // seconds between unit decisions
const ARCHER_SEARCH = 60 // max rampart tiles an archer will consider walking to
const BREACH_SEARCH = 140 // ...and how far they'll hurry to reach a breach
const CATAPULT_DECAY = 6 // seconds an abandoned catapult takes to fall apart
const MELEE_REACH = 0.42 // how far past touching a sword or axe reaches
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]]
// Gates are barred while an enemy is this close (tiles), before your
// swordsmen guarding nearby would charge out at it.
const GATE_BAR_RANGE = 3.2

const SAVE_VERSION = 1
// Wall strengths, weakest first. Painting a stronger one over a weaker one
// upgrades it in place for the difference.
const WALL_TIERS = ['palisade', 'wall', 'thick']

export class Game {
  // `map` is a saved landscape (World.snapshotMap); otherwise `seed` generates one.
  constructor(seed = 20261006, map = null, style = 'random') {
    this.seed = seed
    this.reset(seed, map, style)
  }

  reset(seed = this.seed, map = this.map, style = this.style || 'random') {
    this.seed = seed
    this.map = map
    this.style = style
    this.world = new World(seed, map, style)
    this.research = new Set() // armory upgrades bought
    this.gold = START_GOLD
    this.renown = 0 // the score
    this.wave = 0 // waves completed
    this.phase = 'build' // build | attack | won | lost
    this.enemies = []
    this.archers = []
    this.swordsmen = []
    this.projectiles = []
    this.ladders = [] // ladders standing against walls
    this.fallen = [] // ladders pushed off, lying where they fell
    this.intruders = [] // attackers inside the keep, climbing to the lord
    this.gateLocks = new Map() // gate tile -> seconds it stays barred
    this.effects = [] // dust puffs and the like, purely visual
    this.floaters = []
    this.spawnQueue = []
    this.waveTime = 0
    this.time = 0
    this.nextId = 1
    this.events = [] // drained by the UI
    this.sounds = [] // drained by the UI each frame
    this.rnd = mulberry32(seed ^ 0x9e3779b9)
    this.repath()

    // The keep starts garrisoned, one archer per outer side.
    const k = this.world.keep
    for (const [dx, dy] of [[1, 0], [0, 2], [2, 2]].slice(0, KEEP.archers))
      this.addArcher(this.world.idx(k.x + dx, k.y + dy))
    this.proposePlots()
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
    if (type === 'hoard') return this.canHoard(i)
    if (DROPS[type]) return this.canDrop(i, type)
    if (type === 'moat' && this.world.canBuild(i, 'moat') && !this.leavesWayOut(i)) return false
    if (type === 'settle') return this.canSettle(i)
    const over = this.layOverCost(i, type)
    if (over !== null) return this.gold >= over
    if (!this.world.canBuild(i, type)) return false
    if (STRUCTURES[type].stair && this.stairFace(i) < 0) return false
    if (this.gold < this.costAt(i, type)) return false
    if (STRUCTURES[type].solid && (this.enemyOnTile(i) || this.swordsmanOnTile(i))) return false
    return true
  }

  place(i, type) {
    if (type === 'archer') return this.placeArcher(i)
    if (type === 'swordsman') return this.placeSwordsman(i)
    if (type === 'upgrade') return this.upgrade(i)
    if (type === 'hoard') return this.hoard(i)
    if (DROPS[type]) return this.addDrop(i, type)
    if (type === 'settle') return this.settle(i)
    if (this.layOverCost(i, type) !== null) return this.layOver(i, type)
    if (!this.canPlace(i, type)) return false
    const cost = this.costAt(i, type)
    this.gold -= cost
    this.world.build(i, type)
    this.world.tiles[i].paid = cost
    if (cost > STRUCTURES[type].cost) {
      const [x, y] = this.center(i)
      this.floaters.push({ x, y, z: this.world.surface(i), text: `-${cost}`, t: 0, color: 'cost' })
    }
    for (let k = 0; k < (STRUCTURES[type].freeArchers || 0); k++) this.addArcher(i)
    this.sfx('build', ...this.center(i))
    return true
  }

  // Cost to turn the wall on tile i into a stronger `type`, or null if
  // that isn't a lay-over (empty tile, not a wall, or not stronger).
  // A gate can also be dropped into any wall.
  layOverCost(i, type) {
    const from = this.world.tiles[i].type
    // Wall tiers, then gate, then gatehouse: each can go over the ones before.
    const rank = (k) => (k === 'gatehouse' ? WALL_TIERS.length + 1 : k === 'gate' ? WALL_TIERS.length : WALL_TIERS.indexOf(k))
    const a = rank(from)
    const b = rank(type)
    if (a < 0 || b <= a || this.phase === 'won' || this.phase === 'lost') return null
    return Math.max(1, this.costAt(i, type) - this.costAt(i, from))
  }

  layOver(i, type) {
    const cost = this.layOverCost(i, type)
    if (cost === null || this.gold < cost) return false
    this.gold -= cost
    const t = this.world.tiles[i]
    t.paid = (t.paid ?? this.costAt(i, t.type)) + cost
    // Rebuilt in place: archers standing on it stay put.
    t.type = type
    t.hp = t.maxHp = this.world.maxHpFor(i, type)
    t.weakened = false
    t.broken = false
    if (!HOARDING.on.includes(type)) t.hoard = false
    this.world.dirty = true
    // Archers who no longer fit (a gate holds fewer) move along the wall.
    const here = this.archers.filter((a) => a.tile === i && !a.path.length)
    for (const a of here.slice(this.world.slots(i))) {
      const path = this.rampartPath(a, (j) => this.hasRoom(j, a))
      if (path) a.path = path
      else this.rehouse(a)
    }
    const [x, y] = this.center(i)
    this.floaters.push({ x, y, z: this.world.surface(i), text: `-${cost}`, t: 0, color: 'cost' })
    this.sfx('build', x, y)
    return true
  }

  // Price of building `type` on tile i, including rough ground.
  costAt(i, type) {
    const base = STRUCTURES[type].cost
    if (!this.world.isRough(type)) return base
    const t = this.world.tiles[i]
    const mult = (ROUGH_COST[t.terrain] || 1) * (ROUGH_COST[t.type] || 1)
    return Math.ceil(base * mult)
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
      t.paid = (t.paid ?? STRUCTURES[t.type].cost) + info.cost
      t.type = info.to
      t.hp = t.maxHp = this.world.maxHpFor(i, info.to)
      t.weakened = false
      this.world.dirty = true
    } else {
      // Repairs also hang a new door on a broken gate.
      t.hp = t.maxHp
      t.weakened = false
      t.broken = false
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
    const value = (t.paid ?? def.cost) + (t.hoard ? HOARDING.cost : 0)
    return Math.floor(value * health * rate)
  }

  demolish(i) {
    const t = this.world.tiles[i]
    if (t.type === 'plot') {
      // Turn down the village's proposal; it will pick somewhere else.
      this.world.clear(i)
      return true
    }
    if (!STRUCTURES[t.type]) return false
    this.gold += this.refundFor(i)
    const stranded = this.archers.filter((a) => a.tile === i)
    this.world.clear(i)
    // Archers on a removed structure fall back to the keep.
    for (const a of stranded) this.rehouse(a)
    return true
  }

  // ---- hoardings ------------------------------------------------------------

  canHoard(i) {
    const t = this.world.tiles[i]
    return this.phase !== 'won' && this.phase !== 'lost' && HOARDING.on.includes(t.type) && !t.hoard && this.gold >= HOARDING.cost
  }

  hoard(i) {
    if (!this.canHoard(i)) return false
    this.gold -= HOARDING.cost
    this.world.tiles[i].hoard = true
    this.sfx('build', ...this.center(i))
    return true
  }

  // ---- things dropped from the walls ----------------------------------------

  canDrop(i, kind) {
    const t = this.world.tiles[i]
    const d = DROPS[kind]
    return this.phase !== 'won' && this.phase !== 'lost' && d.on.includes(t.type) && !t[kind] && this.gold >= d.cost
  }

  addDrop(i, kind) {
    if (!this.canDrop(i, kind)) return false
    this.gold -= DROPS[kind].cost
    this.world.tiles[i][kind] = true
    this.world.tiles[i][kind + 'Used'] = false
    this.sfx('build', ...this.center(i))
    return true
  }

  // Ground-level enemies within r of (x, y).
  enemiesNear(x, y, r, ground = true) {
    return this.enemies.filter((e) => !e.dead && !e.gone && Math.hypot(e.x - x, e.y - y) <= r && (!ground || !this.elevated(e)))
  }

  // Each wall with oil or rocks lets them go once per wave, at the moment
  // they'll do the most good.
  updateDrops() {
    const { world } = this
    for (let i = 0; i < world.tiles.length; i++) {
      const t = world.tiles[i]
      if (!t.oil && !t.rocks) continue
      const [cx, cy] = this.center(i)
      if (t.oil && !t.oilUsed) {
        // Oil waits for a crowd, a ram, or a wall that's taking a beating.
        const near = this.enemiesNear(cx, cy, DROPS.oil.radius).filter((e) => e.type !== 'catapult')
        const ram = near.some((e) => e.type === 'ram' && e.attacking)
        const hurting = near.some((e) => e.attacking) && (t.hp < t.maxHp * 0.85 || near.length >= 3)
        if (near.length >= 4 || ram || hurting) {
          t.oilUsed = true
          for (const e of near) this.hurt(e, DROPS.oil.damage)
          this.effects.push({ type: 'oil', x: cx, y: cy, z: world.surface(i), t: 0, life: 1.4, size: DROPS.oil.radius })
          this.sfx('splash', cx, cy)
        }
      }
      if (t.rocks && !t.rocksUsed) {
        // Rocks go on whoever is coming up a ladder, or battering right below.
        const ladder = this.ladders.find((l) => l.tile === i)
        const climbers = this.enemies.filter((e) => !e.dead && !e.gone && world.idxAt(e.x, e.y) === i)
        const below = this.enemiesNear(cx, cy, DROPS.rocks.radius + 0.3).filter((e) => e.attacking)
        if (ladder || climbers.length || below.length) {
          t.rocksUsed = true
          let fx = cx
          let fy = cy
          if (ladder) {
            const g = this.ladderGeom(ladder)
            fx = (g.fx + g.tx) / 2
            fy = (g.fy + g.ty) / 2
            ladder.hp = 0 // knocked off the wall
          } else if (below.length) {
            fx = below[0].x
            fy = below[0].y
          }
          for (const e of this.enemies) {
            if (e.dead || e.gone) continue
            if (Math.hypot(e.x - fx, e.y - fy) <= DROPS.rocks.radius || world.idxAt(e.x, e.y) === i) this.hurt(e, DROPS.rocks.damage)
          }
          this.effects.push({ type: 'rocks', x: fx, y: fy, z: 0, t: 0, life: 1.0, size: 0.8, from: world.surface(i) })
          this.sfx('impact', fx, fy)
        }
      }
    }
  }

  // ---- moats ------------------------------------------------------------------

  // Would a moat on tile i still leave the keep a dry way out to the edge
  // of the map? (Your own buildings don't count: gates can go in them.)
  leavesWayOut(i) {
    const { world } = this
    const t = world.tiles[i]
    const was = t.type
    t.type = 'moat'
    const seen = new Uint8Array(world.w * world.h)
    const queue = [world.keep.step]
    seen[world.keep.step] = 1
    let out = false
    while (queue.length && !out) {
      const u = queue.pop()
      const x = u % world.w
      const y = (u / world.w) | 0
      if (x === 0 || y === 0 || x === world.w - 1 || y === world.h - 1) out = true
      for (const [dx, dy] of N4) {
        const nx = x + dx
        const ny = y + dy
        if (!world.inBounds(nx, ny)) continue
        const v = world.idx(nx, ny)
        const n = world.tiles[v]
        if (seen[v] || n.type === 'moat' || n.type === 'keep' || n.type === 'tree' || n.type === 'rock' || TERRAIN[n.terrain].blocked) continue
        seen[v] = 1
        queue.push(v)
      }
    }
    t.type = was
    return out
  }

  // ---- village --------------------------------------------------------------

  villageCount(type) {
    return this.world.tiles.filter((t) => t.type === type).length
  }

  canSettle(i) {
    const t = this.world.tiles[i]
    return this.phase !== 'won' && this.phase !== 'lost' && t.type === 'plot' &&
      this.gold >= STRUCTURES[t.plot].cost && !(STRUCTURES[t.plot].solid && this.enemyOnTile(i))
  }

  settle(i) {
    if (!this.canSettle(i)) return false
    const kind = this.world.tiles[i].plot
    this.gold -= STRUCTURES[kind].cost
    this.world.build(i, kind)
    this.sfx('build', ...this.center(i))
    return true
  }

  income() {
    let sum = 0
    for (const t of this.world.tiles) sum += STRUCTURES[t.type]?.income || 0
    return sum
  }

  // How safe each empty tile feels to a villager. Judged only from your
  // own works: walls around it, towers and ramparts nearby, distance from
  // the keep and from the map's edge. It never looks at where attacks come from.
  safetyMap() {
    const { world } = this
    const { w, h } = world
    // Ground an outsider could walk to from any edge without breaking a wall.
    const open = new Uint8Array(w * h)
    const queue = []
    for (let i = 0; i < w * h; i++) {
      const x = i % w
      const y = (i / w) | 0
      if ((x === 0 || y === 0 || x === w - 1 || y === h - 1) && world.isWalkable(i)) {
        open[i] = 1
        queue.push(i)
      }
    }
    for (let q = 0; q < queue.length; q++) {
      const u = queue[q]
      const ux = u % w
      const uy = (u / w) | 0
      for (const [dx, dy] of N4) {
        const nx = ux + dx
        const ny = uy + dy
        if (!world.inBounds(nx, ny)) continue
        const v = world.idx(nx, ny)
        if (open[v] || !world.isWalkable(v)) continue
        open[v] = 1
        queue.push(v)
      }
    }
    const k = world.keep
    const score = new Float32Array(w * h).fill(-Infinity)
    for (let i = 0; i < w * h; i++) {
      if (!world.canBuild(i, 'cottage') || this.tiles_villageBlocked(i)) continue
      const x = i % w
      const y = (i / w) | 0
      let s = open[i] ? 0 : 30
      // Watchful ramparts within a few tiles.
      for (let yy = Math.max(0, y - 4); yy <= Math.min(h - 1, y + 4); yy++)
        for (let xx = Math.max(0, x - 4); xx <= Math.min(w - 1, x + 4); xx++) {
          const t = world.tiles[world.idx(xx, yy)].type
          if (t === 'tower') s += 2.5
          else if (STRUCTURES[t]?.rampart) s += 0.4
        }
      s -= Math.hypot(x - (k.x + 1), y - (k.y + 1)) * 0.8
      const edge = Math.min(x, y, w - 1 - x, h - 1 - y)
      if (edge < 3) s -= (3 - edge) * 4
      if (world.tiles[i].terrain === 'hill') s -= 1 // villagers like flat ground
      score[i] = s
    }
    return score
  }

  // Villagers don't build hard against walls or block the keep's doorstep.
  tiles_villageBlocked(i) {
    const { world } = this
    const x = i % world.w
    const y = (i / world.w) | 0
    for (const [dx, dy] of N4) {
      const nx = x + dx
      const ny = y + dy
      if (!world.inBounds(nx, ny)) continue
      const t = world.tiles[world.idx(nx, ny)].type
      if (t === 'keep' || (STRUCTURES[t]?.solid && !STRUCTURES[t]?.village)) return true
    }
    return false
  }

  // Between waves the village asks for new buildings where it feels safest.
  proposePlots() {
    const { world } = this
    const plots = world.tiles.filter((t) => t.type === 'plot').length
    if (plots >= VILLAGE.maxPlots) return []
    const score = this.safetyMap()
    const near = (i, types) => {
      const x = i % world.w
      const y = (i / world.w) | 0
      let n = 0
      for (const [dx, dy] of [...N4, [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        if (!world.inBounds(x + dx, y + dy)) continue
        const t = world.tiles[world.idx(x + dx, y + dy)]
        if (types.includes(t.type) || types.includes(t.plot)) n++
      }
      return n
    }
    const best = (bonus) => {
      let pick = -1
      let top = -Infinity
      for (let i = 0; i < score.length; i++) {
        if (score[i] === -Infinity || world.tiles[i].type !== 'grass') continue
        const s = score[i] + bonus(i) + this.rnd() * 0.5
        if (s > top) {
          top = s
          pick = i
        }
      }
      return pick
    }
    const added = []
    const propose = (kind, bonus) => {
      const i = best(bonus)
      if (i < 0) return
      world.tiles[i].type = 'plot'
      world.tiles[i].plot = kind
      added.push(kind)
    }
    const cottages = this.villageCount('cottage')
    const want = []
    if (cottages >= VILLAGE.marketAfter && !this.villageCount('market') &&
      !world.tiles.some((t) => t.plot === 'market')) want.push('market')
    want.push('cottage')
    if (cottages > 0) want.push('farm')
    for (const kind of want.slice(0, VILLAGE.maxPlots - plots)) {
      // Houses cluster together; farms sit beside houses.
      if (kind === 'farm') propose(kind, (i) => near(i, ['cottage', 'farm']) * 6)
      else propose(kind, (i) => near(i, ['cottage', 'market']) * 3)
    }
    return added
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
    return ARCHER.range + this.world.perch(i) + (this.research.has('longbow') ? 1 : 0)
  }

  // ---- armory -----------------------------------------------------------------

  // Share of damage your troops take (chainmail cuts it).
  armour() {
    return this.research.has('mail') ? 0.65 : 1
  }

  swordDps() {
    return SWORDSMAN.dps * (this.research.has('steel') ? 1.4 : 1)
  }

  canResearch(id) {
    return this.phase === 'build' && RESEARCH[id] && !this.research.has(id) && this.gold >= RESEARCH[id].cost
  }

  buyResearch(id) {
    if (!this.canResearch(id)) return false
    this.gold -= RESEARCH[id].cost
    this.research.add(id)
    if (id === 'guard') this.applyKeepResearch()
    this.sfx('build', this.world.keep.x + 1.5, this.world.keep.y + 1.5)
    return true
  }

  // A stronger keep door with the lord's guard researched.
  applyKeepResearch() {
    const k = this.world.keep
    k.doorMax = KEEP.doorHp * (this.research.has('guard') ? 1.5 : 1)
    k.doorHp = k.doorMax
  }

  enemyInRange(i) {
    const [x, y] = this.center(i)
    const r2 = this.range(i) ** 2
    return this.enemies.some((e) => !e.dead && (e.x - x) ** 2 + (e.y - y) ** 2 <= r2)
  }

  // Is an enemy on the wall or inside it within range of rampart tile i?
  breachInRange(i) {
    const [x, y] = this.center(i)
    const r2 = this.range(i) ** 2
    return this.enemies.some((e) => !e.dead && !e.gone && (e.x - x) ** 2 + (e.y - y) ** 2 <= r2 && this.threat(e) === 0)
  }

  // Breadth-first search along connected ramparts. Returns the path to the
  // first tile satisfying `goal`, excluding the start.
  rampartPath(a, goal, limit = ARCHER_SEARCH) {
    const { world } = this
    const prev = new Map([[a.tile, -1]])
    const queue = [a.tile]
    for (let q = 0; q < queue.length && q < limit; q++) {
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
        const surf = world.surfaceAt(d < 0.5 ? next : a.tile, a.x, a.y)
        a.z += (surf - a.z) * Math.min(1, dt * 10)
        return
      }
    }
    a.z += (world.surfaceAt(a.tile, a.x, a.y) - a.z) * Math.min(1, dt * 10)

    const target = this.pickTarget(a.x, a.y, this.range(a.tile))
    // A breach somewhere: archers who can't shoot at it hurry along the
    // walls to where they can, rather than plinking at stragglers.
    if (this.phase === 'attack' && a.think <= 0 && this.breaching && (!target || this.threat(target) > 0)) {
      a.think = THINK
      const path = this.rampartPath(a, (i) => this.hasRoom(i, a) && this.breachInRange(i), BREACH_SEARCH)
      if (path && path.length) {
        a.path = path
        return
      }
    }
    if (target) {
      a.heading = Math.atan2(target.y - a.y, target.x - a.x)
      if (a.cd <= 0) {
        a.cd = 1 / (ARCHER.fireRate * (this.research.has('fletchers') ? 1.25 : 1))
        this.shoot(a.x, a.y, a.z + 0.5 * UNIT_SCALE, target, ARCHER.damage * (this.research.has('bodkin') ? 1.4 : 1), false, this.hitChance(a, target))
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

  // Your troops walk on open ground and through gates. They can also go
  // up onto the ramparts (walls, gates, towers, the keep) by stairs, or
  // into the keep by its door, and walk along connected ramparts up there.
  troopPassable(i) {
    const t = this.world.tiles[i].type
    return this.world.isWalkable(i) || (STRUCTURES[t]?.gate === true && !this.gateLocks.has(i))
  }

  // Gates are barred while enemies are at them (and a moment after), so
  // your swordsmen don't throw them open and charge out into the attack.
  updateGateLocks(dt) {
    const { world } = this
    for (const [i, t] of this.gateLocks) {
      if (t - dt <= 0 || !world.isGate(i) || world.tiles[i].broken) this.gateLocks.delete(i)
      else this.gateLocks.set(i, t - dt)
    }
    for (const e of this.enemies) {
      if (e.dead || e.gone || this.elevated(e)) continue
      const R = GATE_BAR_RANGE
      for (let y = Math.floor(e.y - R); y <= Math.floor(e.y + R); y++)
        for (let x = Math.floor(e.x - R); x <= Math.floor(e.x + R); x++) {
          if (!world.inBounds(x, y)) continue
          const i = world.idx(x, y)
          if (!world.isGate(i) || world.tiles[i].broken) continue
          if (Math.hypot(x + 0.5 - e.x, y + 0.5 - e.y) <= R) this.gateLocks.set(i, 1.5)
        }
    }
  }

  stairFace(i) {
    return this.world.stairFace(i)
  }

  // Troop routes run over nodes: tile * 2 + (1 if up on the ramparts).
  troopNext(node) {
    const { world } = this
    const u = node >> 1
    const up = node & 1
    const k = world.keep
    const ux = u % world.w
    const uy = (u / world.w) | 0
    const out = []
    // Towers and gatehouses open onto the ground diagonally too (a corner
    // tower's inner door faces the courtyard).
    if (STRUCTURES[world.tiles[u].type]?.stairs) {
      for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        if (!world.inBounds(ux + dx, uy + dy)) continue
        const v = world.idx(ux + dx, uy + dy)
        if (up && this.troopPassable(v)) out.push(v * 2)
      }
    }
    if (!up) {
      for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        if (!world.inBounds(ux + dx, uy + dy)) continue
        const v = world.idx(ux + dx, uy + dy)
        if (STRUCTURES[world.tiles[v].type]?.stairs) out.push(v * 2 + 1)
      }
    }
    for (const [dx, dy] of N4) {
      const vx = ux + dx
      const vy = uy + dy
      if (!world.inBounds(vx, vy)) continue
      const v = world.idx(vx, vy)
      // Towers and gatehouses have stairs inside, reached from the ground
      // at their foot.
      const inside = (j) => STRUCTURES[world.tiles[j].type]?.stairs
      if (up) {
        if (world.isRampart(v)) out.push(v * 2 + 1)
        else if (world.tiles[v].type === 'stair' && this.stairFace(v) === u) out.push(v * 2)
        else if (u === k.door && v === k.step) out.push(v * 2)
        else if (inside(u) && this.troopPassable(v)) out.push(v * 2)
      } else {
        if (this.troopPassable(v)) out.push(v * 2)
        if (world.isRampart(v) && ((world.tiles[u].type === 'stair' && this.stairFace(u) === v) || (u === k.step && v === k.door) || inside(v))) out.push(v * 2 + 1)
      }
    }
    return out
  }

  // Shortest route between two nodes (excluding the start), or null.
  troopRoute(a, b, limit = 900) {
    if (a === b) return []
    const prev = new Map([[a, -1]])
    const queue = [a]
    for (let q = 0; q < queue.length && q < limit; q++) {
      const u = queue[q]
      if (u === b) {
        const path = []
        for (let v = u; v !== a; v = prev.get(v)) path.push(v)
        return path.reverse()
      }
      for (const v of this.troopNext(u)) {
        if (prev.has(v)) continue
        prev.set(v, u)
        queue.push(v)
      }
    }
    return null
  }

  // Ground-level route from tile a to tile b, as tiles.
  troopPath(a, b, limit = 900) {
    const r = this.troopRoute(a * 2, b * 2, limit)
    return r && r.map((n) => n >> 1)
  }

  // Is this unit up on a wall (or a ladder) rather than on the ground?
  elevated(u) {
    return u.z - this.world.heightAt(u.x, u.y) > 0.5
  }

  swordsmanOnTile(i) {
    const x = i % this.world.w
    const y = (i / this.world.w) | 0
    return this.swordsmen.some((s) => !s.up && s.x > x && s.x < x + 1 && s.y > y && s.y < y + 1)
  }

  canPlaceSwordsman(i) {
    const { world } = this
    return (
      this.phase !== 'won' && this.phase !== 'lost' &&
      this.gold >= SWORDSMAN.cost &&
      ((world.isWalkable(i) && !world.reserved[i]) || world.isRampart(i))
    )
  }

  placeSwordsman(i) {
    if (!this.canPlaceSwordsman(i)) return false
    this.gold -= SWORDSMAN.cost
    const [x, y] = this.center(i)
    const up = !this.world.isWalkable(i)
    const s = {
      id: this.nextId++,
      kind: 'swordsman',
      post: i,
      postUp: up,
      up,
      x: x + (this.rnd() - 0.5) * 0.3,
      y: y + (this.rnd() - 0.5) * 0.3,
      z: 0,
      hp: SWORDSMAN.hp,
      maxHp: SWORDSMAN.hp,
      r: SWORDSMAN.r * UNIT_SCALE,
      path: [],
      zone: null, // {x0, y0, x1, y1} in tiles when given orders
      target: null,
      think: 0,
      heading: Math.PI / 2,
      walk: 0,
      fighting: false,
      flash: 0,
    }
    s.z = this.troopZ(s)
    this.swordsmen.push(s)
    this.sfx('recruit', x, y)
    return true
  }

  // Where a swordsman's feet are: on the rampart, partway up a stair, or
  // on the ground.
  troopZ(s) {
    const { world } = this
    const i = world.idxAt(s.x, s.y)
    if (s.up && world.isRampart(i)) return world.surfaceAt(i, s.x, s.y)
    const ground = world.heightAt(s.x, s.y)
    if (world.tiles[i].type === 'stair') {
      const f = this.stairFace(i)
      if (f >= 0) {
        const [cx, cy] = this.center(i)
        const [fx, fy] = this.center(f)
        const p = Math.max(0, Math.min(1, (s.x - cx) * (fx - cx) + (s.y - cy) * (fy - cy) + 0.5))
        return ground + p * (world.surfaceAt(f, cx + (fx - cx) / 2, cy + (fy - cy) / 2) - ground)
      }
    }
    return ground
  }

  covers(s, e) {
    const z = s.zone
    if (!z) {
      const [px, py] = this.center(s.post)
      return Math.hypot(e.x - px, e.y - py) <= SWORDSMAN.guard
    }
    const m = ZONE_MARGIN
    return e.x >= z.x0 - m && e.x <= z.x1 + 1 + m && e.y >= z.y0 - m && e.y <= z.y1 + 1 + m
  }

  // Give a group of swordsmen orders: cover a zone (tiles, inclusive), or
  // with no zone, stand guard at `post` (on the ground or up on a rampart).
  orderSwordsmen(ids, zone, post = null) {
    const { world } = this
    const group = this.swordsmen.filter((s) => ids.includes(s.id))
    if (!group.length) return false
    let spots = []
    if (zone) {
      for (let y = zone.y0; y <= zone.y1; y++)
        for (let x = zone.x0; x <= zone.x1; x++) {
          const i = world.idx(x, y)
          if (world.inBounds(x, y) && world.isWalkable(i)) spots.push(i)
        }
      // Spread them out evenly over the zone.
      spots.sort((a, b) => (a % world.w) - (b % world.w) || a - b)
    } else if (post !== null && (world.isWalkable(post) || world.isRampart(post))) spots = [post]
    if (!spots.length) return false
    group.forEach((s, k) => {
      s.zone = zone
      s.post = spots[Math.floor(((k + 0.5) / group.length) * spots.length)]
      s.postUp = !world.isWalkable(s.post)
      s.think = 0
    })
    return true
  }

  updateSwordsman(s, dt) {
    const { world } = this
    s.flash = Math.max(0, s.flash - dt)
    s.think -= dt
    let here = world.idxAt(s.x, s.y)
    // The rampart came down under them: they're on the ground now.
    if (s.up && !world.isRampart(here)) s.up = false
    s.z += (this.troopZ(s) - s.z) * Math.min(1, dt * 8)
    const [px, py] = this.center(s.post)
    const node = here * 2 + (s.up ? 1 : 0)
    const postNode = s.post * 2 + (s.postUp ? 1 : 0)

    if (s.think <= 0) {
      s.think = THINK
      s.target = null
      if (this.phase === 'attack') {
        // Charge the closest enemy inside their zone (or near their post).
        let best = Infinity
        for (const e of this.enemies) {
          if (e.dead || e.gone || !this.covers(s, e)) continue
          const d = Math.hypot(e.x - s.x, e.y - s.y)
          if (d < best) {
            best = d
            s.target = e
          }
        }
      }
      let path = null
      if (s.target) {
        const e = s.target
        const ei = world.idxAt(e.x, e.y)
        path = this.troopRoute(node, ei * 2 + (this.elevated(e) && world.isRampart(ei) ? 1 : 0))
      }
      if (!path) {
        // Unreachable (say, outside a wall with no gate): hold the post.
        s.target = null
        path = this.troopRoute(node, postNode)
      }
      s.path = path || []
    }

    const e = s.target
    if (e && !e.dead && !e.gone) {
      const d = Math.hypot(e.x - s.x, e.y - s.y)
      if (d <= s.r + e.r + MELEE_REACH && Math.abs(e.z - s.z) < 0.6) {
        s.fighting = true
        s.heading = Math.atan2(e.y - s.y, e.x - s.x)
        s.walk += dt * 8
        this.hurt(e, this.swordDps() * dt, false)
        if (Math.random() < dt * 2) this.sfx('clash', s.x, s.y)
        return
      }
    }
    s.fighting = false

    // Follow the route tile by tile (up stairs, along walls), then close in
    // on the target or post at the same level.
    const speed = SWORDSMAN.speed * (s.up ? 1 : world.slow(here))
    // Close by and on the same level: go straight at them.
    if (e && !e.dead && !e.gone && Math.hypot(e.x - s.x, e.y - s.y) < 1.6 && Math.abs(e.z - s.z) < 0.6) s.path = []
    const next = s.path[0]
    if (next !== undefined && !(next & 1) && next >> 1 !== here && this.gateLocks.has(next >> 1)) {
      s.path = [] // barred: wait for a new route
      s.think = Math.min(s.think, 0.1)
    }
    if (s.path.length) {
      const [tx, ty] = this.center(s.path[0] >> 1)
      const dx = tx - s.x
      const dy = ty - s.y
      const d = Math.hypot(dx, dy)
      const step = Math.min(d, speed * dt)
      if (d > 1e-6) {
        s.heading = Math.atan2(dy, dx)
        s.x += (dx / d) * step
        s.y += (dy / d) * step
        s.walk += step * 6
      }
      here = world.idxAt(s.x, s.y)
      if (here === s.path[0] >> 1) s.up = !!(s.path[0] & 1)
      if (d - step < 0.3) s.path.shift()
      return
    }
    let tx = px
    let ty = py
    if (e && !e.dead && !e.gone) {
      tx = e.x
      ty = e.y
    }
    const dx = tx - s.x
    const dy = ty - s.y
    const d = Math.hypot(dx, dy)
    if (d < 0.05) return
    const step = Math.min(d, speed * dt)
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
    sprinkle('ladder', comp.ladder)
    sprinkle('brute', comp.brute)
    sprinkle('bowman', comp.bowman)
    // Siege engines arrive in the back half so the wall has been tested.
    const half = Math.floor(list.length / 2)
    sprinkle('ram', comp.ram, half)
    sprinkle('catapult', comp.catapult, half)

    // Each gate's share arrives as one army, all at once.
    const groups = spawns.map(() => [])
    list.forEach((type, k) => groups[k % spawns.length].push(type))
    this.spawnQueue = []
    groups.forEach((g, n) => {
      // Siege engines at the back by the banner, raiders in the front rows.
      const order = { raider: 4, ladder: 3, brute: 3, bowman: 2, ram: 1, catapult: 0 }
      g.sort((a, b) => order[a] - order[b])
      g.forEach((type, k) => this.spawnQueue.push({ type, spawn: spawns[n], t: 1 + n * 0.5, rank: k, hpMult: comp.hpMult }))
    })
    this.spawnQueue.sort((a, b) => a.t - b.t)
    this.waveTime = 0
    this.phase = 'attack'
    this.emit('waveStart', { wave: n, spawns: spawns.map((s) => s.name) })
  }

  spawnEnemy({ type, spawn, hpMult, rank = null }) {
    let x = spawn.x + 0.5 + (this.rnd() - 0.5) * 0.4
    let y = spawn.y + 0.5 + (this.rnd() - 0.5) * 0.4
    if (rank !== null) [x, y] = this.formationSpot(spawn, rank)
    const e = this.makeEnemy(type, x, y, hpMult)
    // Armies march together until they're close, then charge.
    if (rank !== null && !ENEMIES[type].siegeEngine) e.march = true
    this.enemies.push(e)
    return e
  }

  // The rank-th spot of an army massing at a spawn banner: rows of five
  // along the map edge, each row a step further into the map.
  formationSpot(spawn, rank) {
    const { world } = this
    const inX = spawn.x === 0 ? 1 : spawn.x === world.w - 1 ? -1 : 0
    const inY = spawn.y === 0 ? 1 : spawn.y === world.h - 1 ? -1 : 0
    const perRow = 5
    const row = Math.floor(rank / perRow)
    const col = (rank % perRow) - (perRow - 1) / 2
    const deep = 0.1 + row * 0.6
    let x = spawn.x + 0.5 + inX * deep + (inY ? col * 0.6 : 0)
    let y = spawn.y + 0.5 + inY * deep + (inX ? col * 0.6 : 0)
    for (let tries = 0; tries < 10 && this.blockedAt(x, y, 0.2); tries++) {
      x += (this.rnd() - 0.5) * 0.8 + inX * 0.25
      y += (this.rnd() - 0.5) * 0.8 + inY * 0.25
    }
    if (this.blockedAt(x, y, 0.2)) return [spawn.x + 0.5, spawn.y + 0.5]
    return [x, y]
  }

  makeEnemy(type, x, y, hpMult = 1) {
    const def = ENEMIES[type]
    const hp = Math.round(def.hp * hpMult)
    const e = {
      id: this.nextId++,
      type,
      x,
      y,
      z: this.world.heightAt(x, y),
      hp,
      maxHp: hp,
      speed: def.speed * (0.9 + this.rnd() * 0.2),
      dps: def.dps,
      siege: def.siege,
      gold: def.gold,
      r: def.r * UNIT_SCALE,
      heading: 0,
      attacking: false,
      shooting: false,
      fired: -9, // time of last shot (for the catapult arm animation)
      cd: 0.5 + this.rnd(),
      ammo: def.ammo || 0,
      walk: this.rnd() * 10,
      flash: 0,
      dead: false,
      stuck: 0, // seconds spent waiting at a wall they can't get over
      raising: 0, // ladder crews: progress putting the ladder up
    }
    // A ladder crew is two soldiers; they climb on their own once it's up.
    if (def.crew) {
      e.members = []
      for (let k = 0; k < def.crew; k++) {
        const mhp = Math.round(ENEMIES.raider.hp * hpMult)
        e.members.push({ type: 'raider', hp: mhp, maxHp: mhp })
      }
    }
    return e
  }

  // ---- simulation ---------------------------------------------------------

  update(dt) {
    this.time += dt
    for (const f of this.floaters) f.t += dt
    this.floaters = this.floaters.filter((f) => f.t < 1.2)
    for (const fx of this.effects) fx.t += dt
    this.effects = this.effects.filter((fx) => fx.t < fx.life)
    if (this.world.dirty) this.repath()

    this.updateGateLocks(dt)
    this.breaching = this.phase === 'attack' && this.enemies.some((e) => !e.dead && !e.gone && this.threat(e) === 0)
    for (const a of this.archers) this.updateArcher(a, dt)
    for (const s of this.swordsmen) this.updateSwordsman(s, dt)
    this.reapDefenders()
    if (this.phase !== 'attack') return

    this.waveTime += dt
    while (this.spawnQueue.length && this.spawnQueue[0].t <= this.waveTime)
      this.spawnEnemy(this.spawnQueue.shift())

    for (const e of this.enemies) this.updateEnemy(e, dt)
    this.updateLadders(dt)
    this.updateDrops()
    this.regroup(dt)
    this.updateIntruders(dt)
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
    this.enemies = this.enemies.filter((e) => !e.dead && !e.gone)

    if (this.world.keep.hp <= 0) {
      this.phase = 'lost'
      this.emit('lost', { wave: this.nextWave, renown: this.renown })
      return
    }
    if (!this.spawnQueue.length && !this.enemies.length && !this.intruders.length) this.endWave()
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
    this.ladderFlow = computeLadderFlow(this.world)
    this.ramFlow = computeRamFlow(this.world)
    this.ramWaitFlow = computeFlow(this.world, 'ramWait')
    this.villageFlow = computeVillageFlow(this.world)
    this.footNav = computeFootNav(this.world)
    // How far out from the keep door your castle reaches (walls, towers).
    const { world } = this
    const k = world.keep
    let reach = 3
    for (let i = 0; i < world.tiles.length; i++) {
      const t = world.tiles[i].type
      if (!STRUCTURES[t]?.solid || STRUCTURES[t].village) continue
      reach = Math.max(reach, Math.hypot((i % world.w) + 0.5 - (k.x + 1.5), ((i / world.w) | 0) + 0.5 - (k.y + KEEP.size)))
    }
    this.castleReach = reach
    this.inside = this.insideMask()
    this.world.dirty = false
  }

  // Tiles enclosed by your walls: everything the outside can't reach
  // without going through something solid (water and woods don't count).
  insideMask() {
    const { world } = this
    const { w, h } = world
    const seen = new Uint8Array(w * h)
    const queue = []
    for (let i = 0; i < w * h; i++) {
      const x = i % w
      const y = (i / w) | 0
      if ((x === 0 || y === 0 || x === w - 1 || y === h - 1) && !world.isSolid(i)) {
        seen[i] = 1
        queue.push(i)
      }
    }
    while (queue.length) {
      const i = queue.pop()
      const x = i % w
      const y = (i / w) | 0
      for (const [dx, dy] of N4) {
        const nx = x + dx
        const ny = y + dy
        if (!world.inBounds(nx, ny)) continue
        const j = world.idx(nx, ny)
        if (seen[j] || world.isSolid(j)) continue
        seen[j] = 1
        queue.push(j)
      }
    }
    const inside = new Uint8Array(w * h)
    for (let i = 0; i < w * h; i++) if (!seen[i] && !world.isSolid(i)) inside[i] = 1
    return inside
  }

  // How urgently archers should shoot an enemy: 0 for anyone on a wall or
  // already inside it, 1 for anyone breaking in (or a siege engine), 2 for
  // everyone else.
  threat(e) {
    const i = this.world.idxAt(e.x, e.y)
    if (this.world.tiles[i].ladder || this.elevated(e) || this.inside?.[i]) return 0
    if (e.attacking || e.type === 'catapult' || e.type === 'ram') return 1
    return 2
  }

  // Which flow field an enemy follows. Foot soldiers with no way in (stone
  // all round, no ladder up) follow the ladder crews' field to the foot of
  // the wall and wait there.
  flowFor(e) {
    if (ENEMIES[e.type].siegeEngine) {
      // No dry way in: roll up to the moat and wait for it to be filled.
      const ci = this.world.idxAt(e.x, e.y)
      return isFinite(this.ramFlow.dist[ci]) ? this.ramFlow : this.ramWaitFlow
    }
    if (e.type === 'ladder') return this.ladderFlow
    const ci = this.world.idxAt(e.x, e.y)
    return isFinite(this.flow.dist[ci]) ? this.flow : this.ladderFlow
  }

  // Foot soldiers: everyone except siege engines and ladder crews.
  climbs(e) {
    return !ENEMIES[e.type].siegeEngine && e.type !== 'ladder'
  }

  endWave() {
    this.wave++
    this.projectiles = []
    // Ladders are taken down and the keep door mended between waves.
    for (const l of this.ladders) this.world.tiles[l.tile].ladder = null
    this.ladders = []
    this.fallen = []
    this.intruders = []
    this.gateLocks.clear()
    this.world.keep.doorHp = this.world.keep.doorMax
    this.world.keep.inside = 0
    this.world.dirty = true
    // Oil cauldrons refilled, rock buckets restocked.
    for (const t of this.world.tiles) {
      if (t.oil) t.oilUsed = false
      if (t.rocks) t.rocksUsed = false
    }
    // Renown: for holding out, and for every village building still standing.
    const renown = this.renownForWave()
    this.renown += renown
    // Survivors patch themselves up between waves.
    for (const u of [...this.archers, ...this.swordsmen]) u.hp = u.maxHp
    if (this.wave >= TOTAL_WAVES) {
      this.phase = 'won'
      const lord = Math.round((this.world.keep.hp / this.world.keep.maxHp) * RENOWN.lord)
      this.renown += lord
      this.emit('won', { wave: this.wave, renown: this.renown })
      return
    }
    const bonus = waveBonus(this.wave)
    const village = this.income()
    this.gold += bonus + village
    // Masons patch up the keep between waves; walls are on you.
    this.world.keep.hp = this.world.keep.maxHp
    this.phase = 'build'
    const plots = this.proposePlots()
    this.emit('waveEnd', { wave: this.wave, bonus, village, plots, renown })
  }

  // Renown earned this wave: holding out, plus each village building left.
  renownForWave() {
    let r = RENOWN.wave
    for (const t of this.world.tiles) r += RENOWN[t.type] && STRUCTURES[t.type]?.village ? RENOWN[t.type] : 0
    return r
  }

  // `mode`: 'troop' (your swordsmen, through gates), 'troopUp' (your
  // swordsmen on the ramparts), 'climb' (foot soldiers, up ladders) or null.
  blockedAt(x, y, r, mode = null, from = -1) {
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
        if (mode === 'troopUp') {
          if (!world.isRampart(i)) return true
        } else if (mode === 'troop' ? !this.troopPassable(i) && i !== from : !world.isWalkable(i) && !(mode === 'climb' && world.tiles[i].ladder)) return true
      }
    return false
  }

  // Move with axis-separated sliding so units glide along walls.
  tryMove(u, dx, dy) {
    const cr = u.r * 0.8
    const mode = u.kind === 'swordsman' ? (u.up ? 'troopUp' : 'troop') : null
    const from = this.world.idxAt(u.x, u.y)
    if (dx && !this.blockedAt(u.x + dx, u.y, cr, mode, from)) u.x += dx
    if (dy && !this.blockedAt(u.x, u.y + dy, cr, mode, from)) u.y += dy
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

  // Catapults go for towers first, then any other structure.
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
        if (!world.isSolid(i) || world.tiles[i].type === 'keep') continue
        const d = Math.hypot(x + 0.5 - e.x, y + 0.5 - e.y)
        if (d > range) continue
        const type = world.tiles[i].type
        const score = d + (type === 'tower' ? -4 : 0)
        if (score < bestScore) {
          bestScore = score
          best = i
        }
      }
    return best
  }

  updateEnemy(e, dt) {
    const { world } = this
    const def = ENEMIES[e.type]
    e.flash = Math.max(0, e.flash - dt)
    e.cd -= dt
    const ci = world.idxAt(e.x, e.y)
    // Up on the wall walk, partway down a stair, or on the (smooth) ground.
    if (e.up && !world.isRampart(ci)) e.up = false // the wall came down
    e.z += (this.troopZ(e) - e.z) * Math.min(1, dt * 8)
    e.attacking = false
    e.shooting = false

    if (e.type === 'bowman') {
      const t = this.nearestDefender(e.x, e.y, def.range)
      if (t) {
        e.shooting = true
        e.heading = Math.atan2(t.y - e.y, t.x - e.x)
        if (e.cd <= 0) {
          e.cd = 1 / def.rate
          this.shoot(e.x, e.y, e.z + 0.5 * UNIT_SCALE, t, def.shot, true)
          this.sfx('bow', e.x, e.y)
        }
        return
      }
    } else if (e.type === 'catapult' && e.ammo <= 0) {
      // Out of boulders: the crew abandons it where it stands and it
      // falls apart rather than rolling forward to be shot.
      e.abandoned = true
      this.hurt(e, (e.maxHp / CATAPULT_DECAY) * dt, false)
      if (e.dead) {
        this.effects.push({ type: 'dust', x: e.x, y: e.y, z: e.z + 0.2, t: 0, life: 0.9, size: 0.9 })
        this.sfx('crumble', e.x, e.y)
      }
      return
    } else if (e.type === 'catapult') {
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

    // Melee enemies stop to fight swordsmen in their way, and archers on
    // the wall once they're up a ladder.
    if (!def.noMelee && def.dps > 0) {
      for (const s of this.swordsmen) {
        if (s.dead || Math.hypot(s.x - e.x, s.y - e.y) > e.r + s.r + MELEE_REACH || Math.abs(s.z - e.z) > 0.6) continue
        e.attacking = true
        e.heading = Math.atan2(s.y - e.y, s.x - e.x)
        e.walk += dt * 6
        s.hp -= e.dps * dt * this.armour()
        s.flash = 0.1
        return
      }
      if (e.up) {
        for (const a of this.archers) {
          if (a.dead || Math.hypot(a.x - e.x, a.y - e.y) > e.r + 0.4) continue
          e.attacking = true
          e.heading = Math.atan2(a.y - e.y, a.x - e.x)
          e.walk += dt * 6
          a.hp -= e.dps * dt * this.armour()
          a.flash = 0.1
          return
        }
      }
    }

    // At the keep: batter the door, then go in after the lord.
    const k = world.keep
    const doorX = k.x + 1.5
    const doorY = k.y + KEEP.size
    // Marching armies keep pace until the castle is near.
    if (e.march && Math.hypot(e.x - doorX, e.y - doorY) < this.castleReach + ARMY.charge) e.march = false
    // Easy pickings: an undefended village building within reach.
    if (!e.up && this.plunders(e, ci)) {
      const vt = this.villageFlow.next[ci]
      if (vt < 0) {
        // Standing in a field: trample it.
        e.attacking = true
        e.walk += dt * 6
        this.damageStructure(ci, (STRUCTURES[world.tiles[ci].type]?.trample || 0) * dt)
        return
      }
      const [vx, vy] = this.center(vt)
      if (world.isSolid(vt)) {
        if (Math.max(Math.abs(vx - e.x), Math.abs(vy - e.y)) <= 0.5 + e.r + 0.08) {
          e.attacking = true
          e.heading = Math.atan2(vy - e.y, vx - e.x)
          e.walk += dt * 6
          this.damageStructure(vt, e.dps * e.siege * dt)
          return
        }
      }
      this.walkToward(e, vx, vy, ci, dt)
      return
    }
    // Foot soldiers find their way on two levels: the ground and the walls.
    let target = -2
    if (this.climbs(e) && this.footNav) {
      const node = ci * 2 + (e.up ? 1 : 0)
      if (isFinite(this.footNav.dist[node])) {
        const nx = this.footNav.next[node]
        if (nx < 0 && e.up) {
          // On a wall beside the keep: in through a window, after the lord.
          e.gone = true
          this.intruders.push({ type: e.type, hp: e.hp, maxHp: e.maxHp, dps: e.dps, gold: e.gold, climb: KEEP.climb })
          k.inside = this.intruders.length
          return
        }
        if (nx >= 0) {
          const tgt = nx >> 1
          const lvl = nx & 1
          if (e.up || lvl === 1) return this.walkWalls(e, ci, tgt, lvl, dt)
          target = tgt
        } else target = -1
      } else if (e.up) {
        // Stranded on the wall with no way down: hold here and fight.
        e.stuck += dt
        return
      }
    }
    const flow = target === -2 ? this.flowFor(e) : null
    if (target === -2) target = flow.next[ci]
    if (ci === k.step || target < 0) {
      const d = Math.hypot(doorX - e.x, doorY - e.y)
      if (d <= e.r + (k.doorHp > 0 ? 0.3 : 0.7)) {
        if (e.type === 'ladder') return this.splitCrew(e)
        if (e.type === 'catapult') return
        e.heading = Math.atan2(doorY - e.y, doorX - e.x)
        if (k.doorHp > 0) {
          e.attacking = true
          e.walk += dt * 6
          k.doorHp = Math.max(0, k.doorHp - e.dps * e.siege * dt)
          if (k.doorHp <= 0) {
            this.effects.push({ type: 'dust', x: doorX, y: doorY, z: 0.4, t: 0, life: 0.9, size: 0.8 })
            this.sfx('crumble', doorX, doorY)
            this.emit('doorBroken')
          }
        } else if (this.climbs(e)) {
          // In through the door and up the stairs.
          e.gone = true
          this.intruders.push({ type: e.type, hp: e.hp, maxHp: e.maxHp, dps: e.dps, gold: e.gold, climb: KEEP.climb })
          k.inside = this.intruders.length
        }
        return
      }
      this.walkToward(e, doorX, doorY, ci, dt)
      return
    }
    const [tx, ty] = this.center(target)
    const tt = world.tiles[target]
    // Siege engines can't cross a moat; they wait at the edge.
    if (tt.type === 'moat' && def.siegeEngine) {
      e.heading = Math.atan2(ty - e.y, tx - e.x)
      if (Math.max(Math.abs(tx - e.x), Math.abs(ty - e.y)) <= 0.5 + e.r + 0.1) return
    }

    if (world.isSolid(target) && !(tt.ladder && this.climbs(e))) {
      const reach = Math.max(Math.abs(tx - e.x), Math.abs(ty - e.y))
      if (reach <= 0.5 + e.r + 0.08) {
        e.heading = Math.atan2(ty - e.y, tx - e.x)
        if (e.type === 'catapult') return // out of boulders: parked at the wall
        if (e.type === 'ladder') {
          if (tt.ladder) return this.splitCrew(e)
          // Put the ladder up against the wall, then climb.
          e.raising += dt
          if (e.raising >= LADDER.raise) this.raiseLadder(e, target)
          return
        }
        if (STONE.includes(tt.type) && !def.siegeEngine) {
          // Stone they can't hurt: wait here for a ladder.
          e.stuck += dt
          return
        }
        e.attacking = true
        e.walk += dt * 6
        const thorns = STRUCTURES[tt.type]?.thorns
        if (thorns) this.hurt(e, thorns * dt, false)
        this.damageStructure(target, e.dps * e.siege * dt)
        return
      }
    }
    e.stuck = 0
    this.walkToward(e, tx, ty, ci, dt)
    // Marching boots ruin crops.
    const under = world.idxAt(e.x, e.y)
    const trample = STRUCTURES[world.tiles[under].type]?.trample
    if (trample) this.damageStructure(under, trample * dt)
  }

  // Moving on the walls: along the wall walk, onto a ladder, or down by
  // stairs. With nothing but the ladder to get down by, they first haul it
  // over the wall, which takes a while.
  walkWalls(e, ci, tgt, lvl, dt) {
    const { world } = this
    const t = world.tiles[ci]
    if (e.up && lvl === 0 && t.ladder && world.tiles[tgt].type !== 'stair' && !STRUCTURES[t.type]?.stairs) {
      e.haul = (e.haul || 0) + dt
      if (e.haul < LADDER.haul) {
        e.attacking = true
        return
      }
    }
    const [tx, ty] = this.center(tgt)
    const dx = tx - e.x
    const dy = ty - e.y
    const d = Math.hypot(dx, dy) || 1
    const speed = e.speed * (lvl !== (e.up ? 1 : 0) ? LADDER.climb : 0.9)
    const step = Math.min(d, speed * dt)
    e.heading = Math.atan2(dy, dx)
    e.walk += step * 6
    e.x += (dx / d) * step
    e.y += (dy / d) * step
    e.stuck = 0
    if (world.idxAt(e.x, e.y) === tgt) {
      e.up = lvl === 1
      e.haul = 0
    }
  }

  // Foot soldiers break off to loot village buildings they can walk to
  // without breaking anything.
  plunders(e, ci) {
    if (!this.climbs(e) || e.type === 'bowman' || !this.villageFlow) return false
    return this.villageFlow.dist[ci] <= PLUNDER_RANGE
  }

  walkToward(e, tx, ty, ci, dt) {
    const dx = tx - e.x
    const dy = ty - e.y
    const len = Math.hypot(dx, dy) || 1
    const base = e.march ? Math.min(e.speed, ARMY.pace) : e.speed
    const speed = base * (this.world.tiles[ci].ladder ? LADDER.climb : this.world.slow(ci))
    const step = Math.min(len, speed * dt)
    e.heading = Math.atan2(dy, dx)
    e.walk += dt * speed * 6
    this.tryMove(e, (dx / len) * step, (dy / len) * step)
  }

  // ---- ladders --------------------------------------------------------------

  raiseLadder(e, tile) {
    const { world } = this
    const [cx, cy] = this.center(tile)
    // The ladder leans on the side of the wall the crew is standing on.
    const ddx = cx - e.x
    const ddy = cy - e.y
    const dir = Math.abs(ddx) >= Math.abs(ddy) ? [Math.sign(ddx), 0] : [0, Math.sign(ddy)]
    const l = { id: this.nextId++, tile, dir, hp: LADDER.hp, maxHp: LADDER.hp }
    this.ladders.push(l)
    world.tiles[tile].ladder = l
    world.dirty = true
    this.sfx('build', cx, cy)
    this.splitCrew(e)
  }

  // The crew drops what they carry and carries on as soldiers.
  splitCrew(e) {
    e.gone = true
    e.members.forEach((m, k) => {
      const u = this.makeEnemy(m.type, e.x + (k - 0.5) * 0.25, e.y + (k - 0.5) * 0.25)
      u.hp = Math.max(1, Math.round(m.hp * (e.hp / e.maxHp)))
      u.maxHp = m.maxHp
      u.z = e.z
      this.enemies.push(u)
    })
  }

  // Where a ladder stands: foot on the ground, top against the wall.
  ladderGeom(l) {
    const { world } = this
    const [cx, cy] = this.center(l.tile)
    const t = world.tiles[l.tile]
    const half = t.type === 'wall' ? STRUCTURES.wall.thin / 2 : 0.5
    const tx = cx - l.dir[0] * half
    const ty = cy - l.dir[1] * half
    const tz = world.surfaceAt(l.tile, tx, ty) + 0.12
    const fx = tx - l.dir[0] * 0.5
    const fy = ty - l.dir[1] * 0.5
    return { fx, fy, fz: world.heightAt(fx, fy), tx, ty, tz }
  }

  // Archers on or beside a laddered wall shove the ladder off. Anyone on
  // it falls back down outside.
  updateLadders(dt) {
    const { world } = this
    for (const l of this.ladders) {
      const t = world.tiles[l.tile]
      if (!LADDER.reach.includes(t.type)) l.hp = 0 // the wall under it is gone
      const [cx, cy] = this.center(l.tile)
      for (const a of this.archers) {
        if (!a.dead && Math.abs(a.x - cx) < 1.4 && Math.abs(a.y - cy) < 1.4) l.hp -= LADDER.push * dt
      }
      if (l.hp > 0) continue
      l.down = true
      if (t.ladder === l) t.ladder = null
      world.dirty = true
      const g = this.ladderGeom(l)
      this.fallen.push({ x: g.fx - l.dir[0] * 0.4, y: g.fy - l.dir[1] * 0.4, dir: l.dir })
      this.sfx('crumble', cx, cy)
      for (const e of this.enemies) {
        if (e.dead || e.gone || world.idxAt(e.x, e.y) !== l.tile) continue
        e.x = g.fx - l.dir[0] * 0.2
        e.y = g.fy - l.dir[1] * 0.2
        e.up = false
        this.hurt(e, 25)
      }
    }
    this.ladders = this.ladders.filter((l) => !l.down)
  }

  // Soldiers stuck at the foot of a wall pick up a fallen ladder, or after
  // a while lash a new one together, and become a ladder crew again.
  regroup(dt) {
    const waiting = this.enemies.filter((e) => !e.dead && !e.gone && e.stuck > 0.5 && (e.type === 'raider' || e.type === 'brute'))
    if (waiting.length < 2) return
    for (const e of waiting) {
      if (e.gone) continue
      const near = this.fallen.findIndex((f) => Math.hypot(f.x - e.x, f.y - e.y) < 2)
      if (near < 0 && e.stuck < LADDER.regroup) continue
      const mate = waiting.find((o) => o !== e && !o.gone && Math.hypot(o.x - e.x, o.y - e.y) < 2.5)
      if (!mate) continue
      if (near >= 0) this.fallen.splice(near, 1)
      e.gone = mate.gone = true
      const crew = this.makeEnemy('ladder', (e.x + mate.x) / 2, (e.y + mate.y) / 2)
      crew.members = [e, mate].map((m) => ({ type: m.type, hp: m.hp, maxHp: m.maxHp }))
      crew.hp = e.hp + mate.hp
      crew.maxHp = e.maxHp + mate.maxHp
      crew.z = e.z
      this.enemies.push(crew)
    }
  }

  // Inside the keep: climb the stairs, then fight the lord and his guard.
  updateIntruders(dt) {
    const k = this.world.keep
    // Climbing the stair in single file; only the first few reach the lord.
    for (const u of this.intruders) u.climb -= dt
    const up = this.intruders.filter((u) => u.climb <= 0).slice(0, KEEP.stair)
    if (up.length) {
      // Swordsmen posted on the keep fight beside the lord's guard and take
      // the blows meant for him.
      const keepers = this.swordsmen.filter((s) => !s.dead && s.up && this.world.tiles[this.world.idxAt(s.x, s.y)].type === 'keep')
      const guard = ((KEEP.guard * (this.research.has('guard') ? 1.6 : 1) + keepers.length * this.swordDps()) / up.length) * dt
      for (const [n, u] of up.entries()) {
        const s = keepers[n % (keepers.length || 1)]
        if (s) {
          s.hp -= u.dps * dt * this.armour()
          s.flash = 0.1
          s.fighting = true
        } else k.hp = Math.max(0, k.hp - u.dps * dt)
        u.hp -= guard
        if (u.hp <= 0) {
          u.dead = true
          this.gold += u.gold
          this.floaters.push({ x: k.x + 1.5, y: k.y + 1.5, z: KEEP.height + 0.3, text: `+${u.gold}`, t: 0 })
          this.sfx('fall', k.x + 1.5, k.y + 1.5)
        }
      }
      if (Math.random() < dt * 3) this.sfx('clash', k.x + 1.5, k.y + 1.5)
    }
    this.intruders = this.intruders.filter((u) => !u.dead)
    k.inside = this.intruders.length
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
        if (Math.abs(A.z - B.z) > 0.5) continue // one is up on the wall
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

  // Spike pits and moats under the attackers' feet.
  updateTraps(dt) {
    const { world } = this
    for (const e of this.enemies) {
      if (e.dead || e.gone) continue
      const i = world.idxAt(e.x, e.y)
      const t = world.tiles[i]
      if (t.type === 'trap') {
        this.hurt(e, STRUCTURES.trap.dps * dt, false)
        // Every pair of feet wears the spikes down; a ram smashes them flat.
        t.hp -= e.type === 'ram' ? t.hp : STRUCTURES.trap.wear * dt
        if (t.hp <= 0) {
          world.clear(i)
          const [x, y] = this.center(i)
          this.effects.push({ type: 'dust', x, y, z: 0.1, t: 0, life: 0.8, size: 0.7 })
          this.sfx('crumble', x, y)
        }
      } else if (t.type === 'moat' && this.climbs(e)) {
        // Soldiers wading in throw in earth and brush until it's filled.
        t.fill = (t.fill || 0) + dt
        if (t.fill >= MOAT.fill) {
          world.clear(i)
          const [x, y] = this.center(i)
          this.effects.push({ type: 'dust', x, y, z: 0.1, t: 0, life: 0.9, size: 0.8 })
          this.sfx('crumble', x, y)
        }
      }
    }
  }

  hurt(e, amount, flash = true) {
    e.hp -= amount
    if (flash) e.flash = 0.12
    if (e.hp <= 0) e.dead = true
  }

  pickTarget(x, y, range) {
    const { world } = this
    let best = null
    let bestDist = Infinity
    for (const e of this.enemies) {
      if (e.dead) continue
      if ((e.x - x) ** 2 + (e.y - y) ** 2 > range * range) continue
      // Shoot whoever is closest to breaking in; siege engines first.
      const ei = world.idxAt(e.x, e.y)
      let d = this.climbs(e) && this.footNav ? this.footNav.dist[ei * 2 + (e.up ? 1 : 0)] : this.flowFor(e).dist[ei]
      if (!isFinite(d)) d = 1e6
      // Breaches first, then whoever is breaking in, then the rest.
      d += this.threat(e) * 1e7
      if (d < bestDist) {
        bestDist = d
        best = e
      }
    }
    return best
  }

  // Share of arrow damage that gets through to a unit.
  coverFor(u) {
    if (u.kind !== 'archer') return 1
    return this.world.tiles[u.tile]?.hoard ? HOARDING.cover : COVER
  }

  // Odds an archer's arrow finds its mark: near-certain at the foot of the
  // wall, a long shot at the edge of range.
  hitChance(a, target) {
    const d = Math.hypot(target.x - a.x, target.y - a.y)
    const range = this.range(a.tile)
    const f = Math.max(0, Math.min(1, (d - AIM.near) / Math.max(0.5, range - AIM.near)))
    return AIM.close + (AIM.far - AIM.close) * f
  }

  shoot(x, y, z, target, dmg, hostile, chance = 1) {
    const dist = Math.hypot(target.x - x, target.y - y)
    // A miss flies at where the target was, a little off, and doesn't follow.
    const miss = this.rnd() >= chance
    const off = miss ? 0.35 + this.rnd() * 0.5 : 0
    const ang = this.rnd() * Math.PI * 2
    this.projectiles.push({
      miss,
      kind: 'arrow',
      hostile,
      sx: x, sy: y, sz: z,
      tx: target.x + Math.cos(ang) * off, ty: target.y + Math.sin(ang) * off, tz: miss ? this.world.heightAt(target.x, target.y) : target.z + 0.4 * UNIT_SCALE,
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
      if (p.kind === 'arrow' && !p.miss && !p.target.dead) {
        p.tx = p.target.x
        p.ty = p.target.y
        p.tz = p.target.z + 0.4 * UNIT_SCALE
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
          a.hp -= p.splash * (this.world.tiles[a.tile].hoard ? HOARDING.splash : 1) * this.armour()
          a.flash = 0.15
        }
        this.effects.push({ type: 'dust', x: p.tx, y: p.ty, z: p.tz, t: 0, life: 0.7, size: 0.8 })
        this.sfx('impact', p.tx, p.ty)
      } else if (p.miss) {
        // Thunk into the dirt.
      } else if (!p.target.dead) {
        if (p.hostile) {
          p.target.hp -= p.dmg * this.coverFor(p.target) * this.armour()
          p.target.flash = 0.12
        } else this.hurt(p.target, p.dmg)
        this.sfx('hit', p.tx, p.ty)
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.done)
  }

  // ---- saving ---------------------------------------------------------------

  // Snapshot for a progress save (only taken between waves).
  serialize() {
    const { world } = this
    return {
      v: SAVE_VERSION,
      seed: this.seed,
      map: world.snapshotMap(),
      wave: this.wave,
      gold: this.gold,
      types: world.tiles.map((t) => (t.type === 'tree' || t.type === 'rock' ? '' : t.type === 'grass' ? '' : t.type)),
      hp: world.tiles.map((t) => Math.round(t.hp || 0)),
      hoard: world.tiles.flatMap((t, i) => (t.hoard ? [i] : [])),
      oil: world.tiles.flatMap((t, i) => (t.oil ? [i] : [])),
      rocks: world.tiles.flatMap((t, i) => (t.rocks ? [i] : [])),
      renown: this.renown,
      style: this.style,
      research: [...this.research],
      plots: world.tiles.flatMap((t, i) => (t.type === 'plot' ? [[i, t.plot]] : [])),
      archers: this.archers.map((a) => a.post),
      swordsmen: this.swordsmen.map((s) => ({ post: s.post, zone: s.zone })),
      savedAt: Date.now(),
    }
  }

  static restore(data) {
    if (!data || data.v !== SAVE_VERSION) throw new Error('unsupported save')
    const g = new Game(data.seed, data.map)
    const { world } = g
    g.archers = []
    world.tiles.forEach((t, i) => {
      const type = data.types[i]
      if (type && type !== 'keep' && type !== 'plot') {
        world.build(i, type)
        t.hp = Math.min(t.maxHp, data.hp[i] || t.maxHp)
      } else if (type !== 'keep' && t.type === 'plot') world.clear(i)
    })
    for (const i of data.hoard) world.tiles[i].hoard = true
    for (const i of data.oil || []) world.tiles[i].oil = true
    for (const i of data.rocks || []) world.tiles[i].rocks = true
    g.renown = data.renown || 0
    g.style = data.style || 'random'
    g.research = new Set(data.research || [])
    g.applyKeepResearch()
    for (const [i, kind] of data.plots) {
      world.tiles[i].type = 'plot'
      world.tiles[i].plot = kind
    }
    for (const post of data.archers) g.addArcher(post)
    g.gold = 0
    for (const s of data.swordsmen) {
      g.gold = SWORDSMAN.cost
      if (g.placeSwordsman(s.post)) g.swordsmen[g.swordsmen.length - 1].zone = s.zone
    }
    g.gold = data.gold
    g.wave = data.wave
    g.sounds.length = 0
    world.dirty = true
    g.repath()
    return g
  }
}
