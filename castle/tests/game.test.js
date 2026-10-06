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
  while (world.tiles[i].type !== 'keep') {
    assert.ok(!seen.has(i), 'flow loops')
    seen.add(i)
    assert.notEqual(world.tiles[i].type, 'wall', 'path goes through a wall despite the gap')
    i = flow.next[i]
  }
  assert.ok(seen.has(gap))
})

test('a sealed castle gets breached at a wall, not through scenery', () => {
  const game = new Game()
  const { world } = game
  for (const i of ring(game, 3)) world.build(i, 'wall')
  const flow = computeFlow(world)
  const start = world.idx(world.spawns[0].x, world.spawns[0].y)
  assert.ok(isFinite(flow.dist[start]))
  let i = start
  let hitWall = false
  for (let n = 0; n < 500 && world.tiles[i].type !== 'keep'; n++) {
    if (world.tiles[i].type === 'wall') hitWall = true
    assert.ok(!world.isBlocked(i))
    i = flow.next[i]
  }
  assert.ok(hitWall)
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

test('an undefended keep falls by wave 2', () => {
  const game = new Game()
  for (let w = 0; w < 2 && game.phase === 'build'; w++) {
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
    if (t.type === 'tree' || t.type === 'rock') t.type = 'grass'
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
  game.spawnEnemy({ type: 'brute', spawn: { x: k.x - 12, y: y - 2 }, hpMult: 50 })
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
  for (let n = 0; n < 200 && world.tiles[i].type !== 'keep'; n++) {
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
