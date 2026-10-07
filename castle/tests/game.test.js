import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Game } from '../src/game.js'
import { computeFlow } from '../src/pathing.js'
import { STRUCTURES, ARCHER, KEEP, TOTAL_WAVES } from '../src/config.js'

function run(game, seconds, step = 1 / 60) {
  for (let t = 0; t < seconds && game.phase === 'attack'; t += step) game.update(step)
}

// Ring of tiles at Chebyshev radius r around the keep center.
function ring(game, r) {
  const { world } = game
  const cx = world.keep.x + 1
  const cy = world.keep.y + 1
  const out = []
  for (let y = cy - r; y <= cy + r; y++)
    for (let x = cx - r; x <= cx + r; x++)
      if (Math.max(Math.abs(x - cx), Math.abs(y - cy)) === r && world.inBounds(x, y)) out.push(world.idx(x, y))
  return out
}

test('every spawn can reach the keep on a fresh map', () => {
  const game = new Game()
  const { world, flow } = game
  for (const s of world.spawns) assert.ok(isFinite(flow.dist[world.idx(s.x, s.y)]), s.name)
})

test('enemies route around a wall with a gap instead of breaking it', () => {
  const game = new Game()
  const { world } = game
  const tiles = ring(game, 3)
  const gap = tiles[3] // middle of the north side
  for (const i of tiles) if (i !== gap) world.build(i, 'wall')
  const flow = computeFlow(world)
  // Follow the flow from the west spawn: it must pass through the gap
  // and never step onto a wall.
  let i = world.idx(world.spawns[0].x, world.spawns[0].y)
  const seen = new Set()
  while (i !== world.keep.step) {
    assert.ok(!seen.has(i), 'flow loops')
    seen.add(i)
    assert.notEqual(world.tiles[i].type, 'wall', 'path goes through a wall despite the gap')
    i = flow.next[i]
  }
  assert.ok(seen.has(gap))
})

test('a sealed stone castle: foot soldiers need ladders, rams batter through', () => {
  const game = new Game()
  const { world } = game
  for (const i of ring(game, 3)) world.build(i, 'wall')
  const start = world.idx(world.spawns[0].x, world.spawns[0].y)
  assert.equal(computeFlow(world, 'foot').dist[start], Infinity, 'no way in on foot')
  for (const mode of ['ladder', 'ram']) {
    const flow = computeFlow(world, mode)
    assert.ok(isFinite(flow.dist[start]), mode)
    let i = start
    let hitWall = false
    for (let n = 0; n < 500 && i !== world.keep.step; n++) {
      if (world.tiles[i].type === 'wall') hitWall = true
      assert.ok(!world.isBlocked(i))
      i = flow.next[i]
    }
    assert.ok(hitWall, mode)
  }
})

test('building costs gold and demolishing in the build phase refunds it fully', () => {
  const game = new Game()
  const i = ring(game, 4)[0]
  const before = game.gold
  assert.ok(game.place(i, 'tower'))
  assert.equal(game.gold, before - STRUCTURES.tower.cost)
  assert.ok(game.demolish(i))
  assert.equal(game.gold, before)
})

test('cannot build on reserved spawn tiles or with too little gold', () => {
  const game = new Game()
  const s = game.world.spawns[0]
  assert.equal(game.place(game.world.idx(s.x, s.y), 'wall'), false)
  game.gold = 1
  assert.equal(game.place(ring(game, 4)[0], 'wall'), false)
})

test('an undefended keep falls by wave 3', () => {
  const game = new Game()
  for (let w = 0; w < 3 && game.phase === 'build'; w++) {
    game.startWave()
    run(game, 300)
  }
  assert.equal(game.phase, 'lost')
})

test('a stone ring with towers and archers survives the first waves', () => {
  const game = new Game()
  const tiles = ring(game, 4)
  const W = 9
  const corners = [tiles[0], tiles[W - 1], tiles[tiles.length - W], tiles[tiles.length - 1]]
  for (let w = 0; w < 3; w++) {
    assert.equal(game.phase, 'build')
    for (const i of corners) if (w > 0) game.place(i, 'tower')
    for (const i of tiles) game.place(i, 'wall')
    for (const i of tiles) if (game.gold >= ARCHER.cost) game.place(i, 'archer')
    game.startWave()
    run(game, 300)
    for (const e of game.enemies) {
      assert.ok(Number.isFinite(e.x) && Number.isFinite(e.y))
      assert.ok(!game.world.isSolid(game.world.idxAt(e.x, e.y)), 'enemy inside a solid tile')
    }
  }
  assert.equal(game.wave, 3, `phase=${game.phase} keep=${game.world.keep.hp}`)
  assert.ok(TOTAL_WAVES > 3)
})

// ---- stage 2 ----------------------------------------------------------------

function clearMap(game) {
  // Flatten terrain and scenery so tests don't depend on map generation.
  for (const t of game.world.tiles) {
    t.terrain = 'grass'
    if (t.type === 'tree' || t.type === 'rock' || t.type === 'plot') t.type = 'grass'
  }
  game.world.dirty = true
}

test('generated maps always connect every gate to the keep', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const game = new Game(seed * 7717)
    for (const s of game.world.spawns)
      assert.ok(isFinite(game.flow.dist[game.world.idx(s.x, s.y)]), `seed ${seed} ${s.name}`)
  }
})

test('maps have terrain variety', () => {
  const kinds = new Set()
  for (let seed = 1; seed <= 10; seed++) for (const t of new Game(seed * 31).world.tiles) kinds.add(t.terrain)
  for (const k of ['grass', 'hill', 'marsh', 'water', 'shallows']) assert.ok(kinds.has(k), k)
})

test('the keep starts with archers and towers come with one', () => {
  const game = new Game()
  clearMap(game)
  assert.equal(game.archers.length, KEEP.archers)
  assert.ok(game.place(ring(game, 4)[3], 'tower'))
  assert.equal(game.archers.length, KEEP.archers + 1)
})

test('archers walk along a connected wall to reach attackers', () => {
  const game = new Game()
  clearMap(game)
  const { world } = game
  const k = world.keep
  // Stone wall running west from the keep for 8 tiles.
  const y = k.y + 1
  for (let x = k.x - 8; x < k.x; x++) game.place(world.idx(x, y), 'wall')
  const archer = game.archers[0]
  const startX = archer.x
  // An enemy far to the west, out of reach of the keep.
  game.phase = 'attack'
  game.spawnQueue = [{ t: 999 }]
  game.spawnEnemy({ type: 'brute', spawn: { x: k.x - 11, y: y - 2 }, hpMult: 50 })
  const e = game.enemies[0]
  e.speed = 0
  for (let t = 0; t < 10; t += 1 / 60) game.update(1 / 60)
  assert.ok(archer.x < startX - 4, `archer moved from ${startX} to ${archer.x}`)
  assert.ok(e.hp < e.maxHp, 'archer got in range and shot')
})

test('archers cannot stand on palisades', () => {
  const game = new Game()
  clearMap(game)
  const i = ring(game, 4)[3]
  game.place(i, 'palisade')
  assert.equal(game.canPlace(i, 'archer'), false)
  game.place(ring(game, 4)[4], 'wall')
  assert.equal(game.canPlace(ring(game, 4)[4], 'archer'), true)
})

test('enemies avoid wading a moat when a dry path is close', () => {
  const game = new Game()
  clearMap(game)
  const { world } = game
  const tiles = ring(game, 4)
  for (const i of tiles) if (i !== tiles[4]) game.place(i, 'moat')
  game.gold = 1000
  const flow = computeFlow(world)
  let i = world.idx(world.spawns[2].x, world.spawns[2].y) // north gate
  let wet = 0
  for (let n = 0; n < 200 && i >= 0 && i !== world.keep.step; n++) {
    if (world.tiles[i].type === 'moat') wet++
    i = flow.next[i]
  }
  assert.equal(wet, 0)
})

test('pikes hurt the enemies attacking them', () => {
  const game = new Game()
  clearMap(game)
  const { world } = game
  for (const i of ring(game, 4)) {
    game.gold = 100
    game.place(i, 'pikes')
  }
  game.archers = [] // isolate the pikes' damage
  game.startWave()
  let hurt = false
  for (let t = 0; t < 60 && !hurt; t += 1 / 60) {
    game.update(1 / 60)
    hurt = game.enemies.some((e) => e.attacking && e.hp < e.maxHp)
  }
  assert.ok(hurt)
  assert.ok(world)
})

// ---- stage 3 ----------------------------------------------------------------

function step(game, seconds) {
  for (let t = 0; t < seconds; t += 1 / 60) game.update(1 / 60)
}

// Put the game in an attack with no more spawns coming.
function skirmish(game) {
  game.phase = 'attack'
  game.spawnQueue = [{ t: 1e9 }]
}

test('swordsmen walk out through a gate; enemies must break it', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 10000
  const { world } = game
  const tiles = ring(game, 3)
  const gate = tiles[3] // middle of the north side
  for (const i of tiles) game.place(i, i === gate ? 'gate' : 'wall')
  assert.equal(world.tiles[gate].type, 'gate')
  assert.ok(world.isSolid(gate), 'enemies see the gate as solid')
  // A swordsman inside can path out through the gate.
  const inside = world.idx(world.keep.x + 1, world.keep.y - 1)
  const outside = world.idx(world.keep.x + 1, world.keep.y - 5)
  const path = game.troopPath(inside, outside)
  assert.ok(path && path.includes(gate))
})

test('swordsmen charge enemies near their post and kill them', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  game.archers = []
  const { world } = game
  const post = world.idx(world.keep.x - 3, world.keep.y + 1)
  assert.ok(game.place(post, 'swordsman'))
  skirmish(game)
  game.spawnEnemy({ type: 'raider', spawn: { x: world.keep.x - 6, y: world.keep.y + 1 }, hpMult: 1 })
  step(game, 8)
  assert.equal(game.enemies.length, 0, 'raider killed')
  assert.equal(game.swordsmen.length, 1)
})

test('upgrades step palisade to stone to thick and keep archers in place', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  const i = ring(game, 4)[3]
  game.place(i, 'palisade')
  let gold = game.gold
  assert.ok(game.place(i, 'upgrade'))
  assert.equal(game.world.tiles[i].type, 'wall')
  assert.equal(gold - game.gold, STRUCTURES.wall.cost - STRUCTURES.palisade.cost)
  game.place(i, 'archer')
  gold = game.gold
  assert.ok(game.place(i, 'upgrade'))
  assert.equal(game.world.tiles[i].type, 'thick')
  assert.equal(gold - game.gold, STRUCTURES.thick.cost - STRUCTURES.wall.cost)
  assert.equal(game.archers.filter((a) => a.tile === i).length, 1)
  // Thick walls can't go higher, but a damaged one can be repaired.
  assert.equal(game.upgradeInfo(i), null)
  game.world.tiles[i].hp = 100
  assert.equal(game.upgradeInfo(i).kind, 'repair')
  assert.ok(game.place(i, 'upgrade'))
  assert.equal(game.world.tiles[i].hp, STRUCTURES.thick.hp)
})

test('enemy bowmen shoot archers on the walls', () => {
  const game = new Game()
  clearMap(game)
  const { world } = game
  skirmish(game)
  const a = game.archers[0]
  game.spawnEnemy({ type: 'bowman', spawn: { x: Math.floor(a.x) - 3, y: Math.floor(a.y) - 1 }, hpMult: 100 })
  game.enemies[0].speed = 0
  step(game, 5)
  assert.ok(a.hp < a.maxHp || a.dead)
  assert.ok(world)
})

test('catapults bombard towers from beyond archer range', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  game.archers = []
  const { world } = game
  const tower = world.idx(world.keep.x - 4, world.keep.y + 1)
  game.place(tower, 'tower')
  skirmish(game)
  game.spawnEnemy({ type: 'catapult', spawn: { x: world.keep.x - 10, y: world.keep.y + 1 }, hpMult: 1 })
  const cat = game.enemies[0]
  step(game, 15)
  const t = world.tiles[tower]
  assert.ok(t.type !== 'tower' || t.hp < t.maxHp, 'tower took boulder damage')
  // It stopped at range rather than walking up to the wall.
  assert.ok(Math.hypot(cat.x - (world.keep.x - 3.5), cat.y - (world.keep.y + 1.5)) > 4)
})

// ---- stage 4 ----------------------------------------------------------------

import { World } from '../src/world.js'
import { computeRamFlow } from '../src/pathing.js'
import { HOARDING } from '../src/config.js'

function followFlow(world, flow, from) {
  const seen = []
  let i = from
  for (let n = 0; n < 300 && i >= 0 && i !== world.keep.step; n++) {
    seen.push(i)
    i = flow.next[i]
  }
  return seen
}

test('attackers head for a gate even when a wall is closer', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 10000
  const { world } = game
  const tiles = ring(game, 3)
  const gate = tiles[3] // north side; the west spawn faces the west wall
  for (const i of tiles) game.place(i, i === gate ? 'gate' : 'wall')
  const from = world.idx(world.spawns[0].x, world.spawns[0].y)
  for (const flow of [computeFlow(world), computeRamFlow(world)]) {
    const path = followFlow(world, flow, from)
    assert.ok(path.includes(gate), 'goes through the gate')
    assert.ok(!path.some((i) => world.tiles[i].type === 'wall'), 'never through a wall')
  }
})

test('the village proposes plots inside the walls, ignoring where attacks come from', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 10000
  const { world } = game
  for (const i of ring(game, 5)) game.place(i, 'wall')
  for (const t of world.tiles) if (t.type === 'plot') world.clear(world.tiles.indexOf(t))
  game.proposePlots()
  const plots = world.tiles.flatMap((t, i) => (t.type === 'plot' ? [i] : []))
  assert.ok(plots.length >= 1)
  const k = world.keep
  for (const i of plots) {
    const x = i % world.w
    const y = (i / world.w) | 0
    assert.ok(Math.max(Math.abs(x - (k.x + 1)), Math.abs(y - (k.y + 1))) < 5, 'plot inside the ring')
  }
  // Same castle, attacks from a different gate order: same choice.
  const a = game.safetyMap()
  world.spawns.reverse()
  const b = game.safetyMap()
  assert.deepEqual([...a], [...b])
})

test('built village buildings pay out each wave; farms get trampled', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  const { world } = game
  const plot = world.tiles.findIndex((t) => t.type === 'plot')
  assert.ok(plot < 0, 'clearMap removed the starting plot')
  game.proposePlots()
  const i = world.tiles.findIndex((t) => t.type === 'plot')
  assert.equal(world.tiles[i].plot, 'cottage')
  const before = game.gold
  assert.ok(game.place(i, 'settle'))
  assert.equal(before - game.gold, STRUCTURES.cottage.cost)
  assert.equal(game.income(), STRUCTURES.cottage.income)
  // A farm in an enemy's way gets trampled.
  const f = world.idx(world.keep.x - 4, world.keep.y + 1)
  world.build(f, 'farm')
  skirmish(game)
  game.archers = []
  game.spawnEnemy({ type: 'raider', spawn: { x: world.keep.x - 7, y: world.keep.y + 1 }, hpMult: 10 })
  step(game, 6)
  assert.notEqual(world.tiles[f].type, 'farm')
})

test('hoardings protect archers from arrows', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  const i = ring(game, 4)[3]
  game.place(i, 'wall')
  game.place(i, 'archer')
  const a = game.archers.find((u) => u.tile === i)
  const bare = game.coverFor(a)
  assert.ok(game.place(i, 'hoard'))
  assert.equal(game.coverFor(a), HOARDING.cover)
  assert.ok(game.coverFor(a) < bare)
})

test('swordsmen with orders cover their zone, not just their post', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  game.archers = []
  const { world } = game
  const k = world.keep
  game.place(world.idx(k.x - 3, k.y + 1), 'swordsman')
  const s = game.swordsmen[0]
  // Zone: a long strip to the north-west, far from the original post.
  const zone = { x0: k.x - 10, y0: k.y - 6, x1: k.x - 2, y1: k.y - 5 }
  assert.ok(game.orderSwordsmen([s.id], zone))
  skirmish(game)
  game.spawnEnemy({ type: 'raider', spawn: { x: k.x - 9, y: k.y - 5 }, hpMult: 1 })
  const e = game.enemies[0]
  e.speed = 0
  assert.ok(game.covers(s, e))
  step(game, 10)
  assert.ok(e.dead || e.hp < e.maxHp, 'swordsman went and fought in the zone')
})

test('a saved game restores castle, troops, gold and wave', () => {
  const game = new Game(4242)
  clearMap(game)
  game.gold = 2000
  const tiles = ring(game, 4)
  for (const i of tiles) game.place(i, 'wall')
  game.place(tiles[3], 'hoard')
  game.place(tiles[5], 'archer')
  game.place(ring(game, 6)[2], 'swordsman')
  game.wave = 3
  const data = JSON.parse(JSON.stringify(game.serialize()))
  const back = Game.restore(data)
  assert.equal(back.wave, 3)
  assert.equal(back.gold, game.gold)
  assert.equal(back.archers.length, game.archers.length)
  assert.equal(game.swordsmen.length, 1)
  assert.equal(back.swordsmen.length, 1)
  assert.ok(back.world.tiles[tiles[3]].hoard)
  for (let i = 0; i < game.world.tiles.length; i++) {
    assert.equal(back.world.tiles[i].type, game.world.tiles[i].type, `tile ${i}`)
    assert.equal(back.world.tiles[i].terrain, game.world.tiles[i].terrain)
  }
})

test('a saved map rebuilds the same landscape', () => {
  const a = new Game(777)
  const map = a.world.snapshotMap()
  const b = new Game(1, map)
  assert.deepEqual(b.world.snapshotMap(), map)
  assert.ok(new World(1, map).spawnsConnected())
})

// ---- rough ground and village flow -------------------------------------------

import { ROUGH_COST } from '../src/config.js'

test('walls go through marsh, water, trees and rocks at a higher price', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  const { world } = game
  const tiles = ring(game, 6)
  const cases = [
    ['marsh', null, ROUGH_COST.marsh],
    ['water', null, ROUGH_COST.water],
    ['grass', 'tree', ROUGH_COST.tree],
    ['grass', 'rock', ROUGH_COST.rock],
  ]
  cases.forEach(([terrain, scenery, mult], k) => {
    const i = tiles[3 + k * 2]
    world.tiles[i].terrain = terrain
    if (scenery) world.tiles[i].type = scenery
    const before = game.gold
    assert.ok(game.place(i, 'wall'), `${terrain}/${scenery}`)
    assert.equal(before - game.gold, Math.ceil(STRUCTURES.wall.cost * mult))
    assert.equal(world.tiles[i].type, 'wall')
  })
  // Removing it refunds what was paid, and a tree doesn't grow back.
  const treeTile = tiles[7]
  const before = game.gold
  game.demolish(treeTile)
  assert.equal(game.gold - before, Math.ceil(STRUCTURES.wall.cost * ROUGH_COST.tree))
  assert.equal(world.tiles[treeTile].type, 'grass')
})

test('village buildings and traps still need clear, dry ground', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  const { world } = game
  const i = ring(game, 6)[3]
  world.tiles[i].terrain = 'marsh'
  assert.equal(game.place(i, 'trap'), false)
  assert.equal(world.canBuild(i, 'cottage'), false)
  // The village never stakes plots on water or marsh.
  for (let seed = 1; seed <= 15; seed++) {
    const g = new Game(seed * 131)
    for (const t of g.world.tiles) if (t.type === 'plot') assert.equal(t.terrain === 'grass' || t.terrain === 'hill', true)
  }
})

test('the end-of-wave event lists the plots the village just staked', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  game.startWave()
  game.enemies = []
  game.spawnQueue = []
  game.update(1 / 60)
  const ev = game.events.find((e) => e.type === 'waveEnd')
  assert.ok(ev && Array.isArray(ev.plots) && ev.plots.length >= 1)
})

test('a wall built on a rock is bedded into it, tougher, and leaves the rock behind', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  const { world } = game
  const tiles = ring(game, 5)
  const onRock = tiles[3]
  const plain = tiles[5]
  world.tiles[onRock].type = 'rock'
  game.place(onRock, 'wall')
  game.place(plain, 'wall')
  const t = world.tiles[onRock]
  assert.equal(t.type, 'wall')
  assert.ok(t.rock, 'rock kept as foundation')
  assert.ok(t.maxHp > world.tiles[plain].maxHp)
  // Same top height as any other wall: only hills lift walls.
  assert.equal(world.surface(onRock), world.surface(plain))
  assert.equal(world.perch(onRock), world.perch(plain))
  assert.ok(world.baseElev(onRock) > world.elev(onRock), 'rock forms a base')
  // Upgrading keeps the foundation and its bonus.
  game.place(onRock, 'upgrade')
  assert.equal(t.type, 'thick')
  assert.ok(t.rock && t.maxHp > STRUCTURES.thick.hp)
  // Saved maps and games remember the rock.
  const back = Game.restore(JSON.parse(JSON.stringify(game.serialize())))
  assert.ok(back.world.tiles[onRock].rock && back.world.tiles[onRock].type === 'thick')
  // Knocked down, the rock is still there.
  world.damage(onRock, 1e6)
  assert.equal(t.type, 'rock')
  assert.ok(world.isBlocked(onRock))
})

test('painting a stronger wall over a weaker one upgrades it for the difference', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  const tiles = ring(game, 5)
  const i = tiles[3]
  game.place(i, 'palisade')
  let before = game.gold
  assert.ok(game.place(i, 'thick'), 'thick over palisade')
  assert.equal(before - game.gold, STRUCTURES.thick.cost - STRUCTURES.palisade.cost)
  assert.equal(game.world.tiles[i].type, 'thick')
  // Weaker over stronger does nothing.
  before = game.gold
  assert.equal(game.place(i, 'wall'), false)
  assert.equal(game.gold, before)
  assert.equal(game.world.tiles[i].type, 'thick')
  // Archers on a stone wall stay when it's thickened.
  const j = tiles[5]
  game.place(j, 'wall')
  game.place(j, 'archer')
  before = game.gold
  assert.ok(game.place(j, 'thick'))
  assert.equal(before - game.gold, STRUCTURES.thick.cost - STRUCTURES.wall.cost)
  assert.equal(game.archers.filter((a) => a.tile === j).length, 1)
  // Removing refunds the total paid.
  before = game.gold
  game.demolish(j)
  assert.equal(game.gold - before, STRUCTURES.thick.cost)
})

// ---- stage 5: ladders, the keep door, smooth hills -----------------------------

test('foot soldiers never damage stone; they wait at the wall', () => {
  const game = new Game()
  clearMap(game)
  const { world } = game
  for (const i of ring(game, 3)) world.build(i, 'wall')
  game.archers = []
  skirmish(game)
  for (let k = 0; k < 4; k++) game.spawnEnemy({ type: k % 2 ? 'brute' : 'raider', spawn: { x: world.keep.x - 6, y: world.keep.y + 1 }, hpMult: 1 })
  step(game, 8)
  for (const i of ring(game, 3)) assert.equal(world.tiles[i].hp, world.tiles[i].maxHp)
  assert.ok(game.enemies.some((e) => e.stuck > 0), 'someone is waiting at the wall')
})

test('a ladder crew puts a ladder up and its raiders climb over the wall', () => {
  const game = new Game()
  clearMap(game)
  const { world } = game
  const tiles = ring(game, 3)
  for (const i of tiles) world.build(i, 'wall')
  game.archers = []
  skirmish(game)
  game.spawnEnemy({ type: 'ladder', spawn: { x: world.keep.x - 6, y: world.keep.y + 1 }, hpMult: 1 })
  let raised = false
  let inside = false
  for (let t = 0; t < 30 && !inside; t += 1 / 60) {
    game.update(1 / 60)
    raised ||= game.ladders.length > 0
    const k = world.keep
    inside = game.enemies.some((e) => e.type === 'raider' && Math.abs(e.x - (k.x + 1.5)) < 2.5 && Math.abs(e.y - (k.y + 1.5)) < 2.5 && !world.tiles[world.idxAt(e.x, e.y)].ladder)
  }
  assert.ok(raised, 'ladder went up')
  assert.ok(inside, 'a raider got inside the ring')
  assert.ok(tiles.every((i) => world.tiles[i].hp === world.tiles[i].maxHp), 'walls untouched')
})

test('archers on the wall push a ladder off', () => {
  const game = new Game()
  clearMap(game)
  const { world } = game
  const tiles = ring(game, 3)
  for (const i of tiles) world.build(i, 'wall')
  const target = tiles.find((i) => i % world.w === world.keep.x - 2 && ((i / world.w) | 0) === world.keep.y + 1)
  game.addArcher(target)
  skirmish(game)
  const l = { id: 1, tile: target, dir: [1, 0], hp: 80, maxHp: 80 }
  game.ladders.push(l)
  world.tiles[target].ladder = l
  step(game, 8)
  assert.equal(game.ladders.length, 0)
  assert.equal(world.tiles[target].ladder, null)
  assert.ok(game.fallen.length === 1, 'it lies where it fell')
})

test('attackers break the keep door, go in, and the lord\'s guard fights back', () => {
  const game = new Game()
  clearMap(game)
  const { world } = game
  game.archers = []
  skirmish(game)
  const k = world.keep
  const sx = k.step % world.w
  const sy = (k.step / world.w) | 0
  game.spawnEnemy({ type: 'raider', spawn: { x: sx, y: sy + 2 }, hpMult: 1 })
  step(game, 60)
  assert.equal(k.doorHp, 0, 'door broken')
  assert.ok(k.hp < k.maxHp, 'lord hurt')
  assert.ok(k.hp > 0, 'a lone raider cannot kill him')
  assert.equal(game.intruders.length, 0, 'the guard killed the intruder')
})

test('catapults do not bombard the keep', () => {
  const game = new Game()
  clearMap(game)
  const { world } = game
  skirmish(game)
  const e = game.spawnEnemy({ type: 'catapult', spawn: { x: world.keep.x - 4, y: world.keep.y + 1 }, hpMult: 1 })
  assert.equal(game.catapultTarget(e, 6), -1)
})

test('hills slope smoothly into the ground around them', () => {
  const game = new Game()
  clearMap(game)
  const { world } = game
  const hx = 4
  const hy = 4
  world.tiles[world.idx(hx, hy)].terrain = 'hill'
  const top = world.groundElev(world.idx(hx, hy))
  assert.ok(Math.abs(world.heightAt(hx + 0.5, hy + 0.5) - top) < 1e-9, 'centre at full height')
  // Continuous across every edge: sample just either side.
  for (let x = hx - 1; x <= hx + 2; x++)
    for (let f = 0.05; f < 1; f += 0.1) {
      const a = world.heightAt(x - 1e-6, hy + f)
      const b = world.heightAt(x + 1e-6, hy + f)
      assert.ok(Math.abs(a - b) < 1e-4, `step at x=${x} f=${f}`)
    }
  assert.ok(world.heightAt(hx + 1.5, hy + 0.5) === 0, 'neighbour centre stays level')
  assert.ok(world.heightAt(hx + 1, hy + 0.5) > 0 && world.heightAt(hx + 1, hy + 0.5) < top, 'edge in between')
})

// ---- stage 6: gates in walls, stairs, swordsmen on the ramparts ----------------

test('a gate drops into an existing wall for the difference in price', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  const { world } = game
  const i = ring(game, 4)[3]
  game.place(i, 'thick')
  game.addArcher(i)
  game.addArcher(i)
  const before = game.gold
  assert.ok(game.canPlace(i, 'gate'))
  assert.ok(game.place(i, 'gate'))
  assert.equal(world.tiles[i].type, 'gate')
  assert.equal(game.gold, before - (STRUCTURES.gate.cost - STRUCTURES.thick.cost))
  assert.ok(game.archers.filter((a) => a.tile === i && !a.path.length).length <= world.slots(i), 'extra archer moved off')
  assert.equal(game.layOverCost(i, 'wall'), null, 'no going back down to a wall by painting')
})

test('stairs must touch a rampart, and let swordsmen up onto the wall', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  const { world } = game
  const tiles = ring(game, 3)
  for (const i of tiles) game.place(i, 'wall')
  const k = world.keep
  const wall = world.idx(k.x - 2, k.y + 1)
  const inside = world.idx(k.x - 1, k.y + 1)
  const loose = world.idx(k.x - 1, k.y)
  assert.equal(game.canPlace(world.idx(k.x - 6, k.y), 'stair'), false, 'nothing to climb')
  assert.equal(game.troopRoute(inside * 2, wall * 2 + 1), null, 'no way up without stairs')
  assert.ok(game.place(inside, 'stair'))
  assert.equal(game.stairFace(inside), wall)
  const route = game.troopRoute(loose * 2, wall * 2 + 1)
  assert.ok(route && route.includes(inside * 2) && route[route.length - 1] === wall * 2 + 1)
  // Up there they can walk the wall all the way round.
  const far = world.idx(k.x + 4, k.y + 1)
  assert.ok(game.troopRoute(wall * 2 + 1, far * 2 + 1))
})

test('a swordsman climbs the stairs to his post on the wall', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  const { world } = game
  for (const i of ring(game, 3)) game.place(i, 'wall')
  const k = world.keep
  const wall = world.idx(k.x - 2, k.y + 1)
  game.place(world.idx(k.x - 1, k.y + 1), 'stair')
  game.place(world.idx(k.x - 1, k.y - 1), 'swordsman')
  const s = game.swordsmen[0]
  assert.equal(s.up, false)
  game.orderSwordsmen([s.id], null, wall)
  step(game, 6)
  assert.equal(world.idxAt(s.x, s.y), wall)
  assert.ok(s.up && s.z > 0.9, `up on the wall (z=${s.z})`)
})

test('swordsmen on the wall cut down raiders coming up a ladder', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  const { world } = game
  const tiles = ring(game, 3)
  for (const i of tiles) game.place(i, 'wall')
  game.archers = []
  const wall = world.idx(world.keep.x - 2, world.keep.y + 1)
  game.place(wall, 'swordsman')
  assert.ok(game.swordsmen[0].up)
  skirmish(game)
  const l = { id: 1, tile: wall, dir: [1, 0], hp: 1e9, maxHp: 1e9 }
  game.ladders.push(l)
  world.tiles[wall].ladder = l
  world.dirty = true
  const e = game.spawnEnemy({ type: 'raider', spawn: { x: world.keep.x - 3, y: world.keep.y + 1 }, hpMult: 1 })
  step(game, 10)
  assert.ok(e.dead, 'the climber was killed')
  assert.ok(game.swordsmen[0].hp > 0)
})

test('swordsmen posted on the keep shield the lord', () => {
  const lordAfter = (guards) => {
    const game = new Game()
    clearMap(game)
    game.gold = 1000
    const k = game.world.keep
    for (let n = 0; n < guards; n++) game.place(game.world.idx(k.x + 1, k.y + 1), 'swordsman')
    skirmish(game)
    k.doorHp = 0
    for (let n = 0; n < 4; n++) game.intruders.push({ type: 'raider', hp: 40, maxHp: 40, dps: 8, gold: 3, climb: 0 })
    step(game, 6)
    return k.hp
  }
  assert.ok(lordAfter(2) > lordAfter(0))
  assert.equal(lordAfter(2), 1000, 'the guards took the blows')
})

test('a gate stays barred while enemies are at it, so swordsmen stay inside', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 10000
  const { world } = game
  const tiles = ring(game, 3)
  const gate = tiles[3] // middle of the north side
  for (const i of tiles) game.place(i, i === gate ? 'gate' : 'wall')
  game.archers = []
  const gx = gate % world.w
  const gy = (gate / world.w) | 0
  // Guard post just inside the gate: the raider outside is within reach.
  game.place(world.idx(gx, gy + 1), 'swordsman')
  const s = game.swordsmen[0]
  skirmish(game)
  const e = game.spawnEnemy({ type: 'brute', spawn: { x: gx, y: gy - 6 }, hpMult: 20 })
  let wentOut = false
  for (let t = 0; t < 16; t += 1 / 60) {
    game.update(1 / 60)
    if (s.y < gy) wentOut = true
  }
  assert.ok(game.gateLocks.has(gate), 'gate is barred')
  assert.ok(e.attacking, 'the brute is battering the gate')
  assert.equal(wentOut, false, 'the swordsman stayed inside')
  // Once the enemy is gone the gate opens again.
  e.dead = true
  game.enemies = []
  step(game, 2)
  assert.ok(!game.gateLocks.has(gate))
  assert.ok(game.troopPath(world.idx(gx, gy + 1), world.idx(gx, gy - 2)), 'route out reopens')
})

// ---- stage 7: aim, plunder, armies ----------------------------------------------

test('archers rarely miss at the foot of the wall and often miss at long range', () => {
  const game = new Game()
  clearMap(game)
  const { world } = game
  const i = ring(game, 3)[3]
  world.build(i, 'wall')
  const a = game.addArcher(i)
  const near = game.hitChance(a, { x: a.x, y: a.y - 1 })
  const far = game.hitChance(a, { x: a.x, y: a.y - game.range(i) })
  assert.ok(near >= 0.85, `near ${near}`)
  assert.ok(far <= 0.5, `far ${far}`)
  // Over many shots the misses really happen.
  skirmish(game)
  const e = game.spawnEnemy({ type: 'raider', spawn: { x: a.x - 0.5, y: a.y - 4.5 }, hpMult: 1 })
  let misses = 0
  for (let n = 0; n < 200; n++) {
    game.shoot(a.x, a.y, a.z, e, 0, false, far)
    if (game.projectiles[game.projectiles.length - 1].miss) misses++
  }
  assert.ok(misses > 60 && misses < 150, `misses ${misses}`)
})

test('raiders break off to plunder an undefended cottage', () => {
  const game = new Game()
  clearMap(game)
  game.gold = 1000
  const { world } = game
  game.archers = []
  const k = world.keep
  const cottage = world.idx(k.x - 6, k.y + 4)
  world.build(cottage, 'cottage')
  world.dirty = true
  skirmish(game)
  game.spawnEnemy({ type: 'raider', spawn: { x: k.x - 9, y: k.y + 2 }, hpMult: 1 })
  game.spawnEnemy({ type: 'raider', spawn: { x: k.x - 9, y: k.y + 3 }, hpMult: 1 })
  step(game, 20)
  assert.notEqual(world.tiles[cottage].type, 'cottage', 'the cottage was sacked')
})

test('a wave arrives as one army per gate, all at once', () => {
  const game = new Game()
  game.wave = 4
  game.startWave()
  const bySpawn = new Map()
  for (const q of game.spawnQueue) {
    if (!bySpawn.has(q.spawn.name)) bySpawn.set(q.spawn.name, new Set())
    bySpawn.get(q.spawn.name).add(q.t)
  }
  assert.ok(bySpawn.size >= 2)
  for (const times of bySpawn.values()) assert.equal(times.size, 1, 'one arrival time per army')
  step(game, 2.5)
  assert.equal(game.spawnQueue.length, 0, 'everyone is on the field')
  assert.ok(game.enemies.filter((e) => e.march).length > 10, 'foot soldiers march together')
})
