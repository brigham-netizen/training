import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Game } from '../src/game.js'
import { computeFlow } from '../src/pathing.js'
import { STRUCTURES, TOTAL_WAVES } from '../src/config.js'

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

test('undefended keep takes damage during wave 1', () => {
  const game = new Game()
  game.startWave()
  run(game, 120)
  assert.ok(game.world.keep.hp < game.world.keep.maxHp)
})

test('a modest castle survives the first waves and the sim stays sane', () => {
  const game = new Game()
  // Inner wall ring with towers in the corners, built from starting gold.
  for (const i of ring(game, 3)) game.place(i, 'wall')
  const corners = ring(game, 2).filter((i, k, arr) => k === 0 || k === arr.length - 1)
  for (const i of corners) game.place(i, 'tower')
  for (let w = 0; w < 3; w++) {
    assert.equal(game.phase, 'build')
    game.startWave()
    run(game, 300)
    for (const e of game.enemies) {
      assert.ok(Number.isFinite(e.x) && Number.isFinite(e.y))
      assert.ok(!game.world.isSolid(game.world.idxAt(e.x, e.y)), 'enemy inside a solid tile')
    }
    // Spend wave gold on more towers.
    for (const i of ring(game, 2)) if (game.gold >= STRUCTURES.tower.cost) game.place(i, 'tower')
  }
  assert.equal(game.wave, 3, `phase=${game.phase} keep=${game.world.keep.hp}`)
  assert.ok(TOTAL_WAVES > 3)
})
