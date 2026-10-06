import { STRUCTURES, KEEP, ARCHER, TERRAIN } from './config.js'

const COLORS = {
  grass: [[76, 114, 53], [80, 119, 56], [73, 109, 51], [83, 123, 58]],
  hillTop: [[96, 132, 62], [101, 138, 66]],
  hillSide: [120, 96, 64],
  marsh: [[78, 92, 52], [72, 86, 48]],
  shallows: [92, 140, 138],
  water: [44, 92, 128],
  moat: [38, 78, 110],
  moatEdge: [96, 84, 66],
  reed: [120, 132, 70],
  wall: { side: [138, 132, 118], top: [176, 168, 151] },
  thick: { side: [128, 122, 108], top: [170, 161, 143], walk: [146, 139, 124] },
  tower: { side: [125, 118, 104], top: [170, 161, 143] },
  keep: { side: [112, 106, 95], top: [158, 149, 132] },
  palisade: { side: [128, 90, 52], top: [162, 120, 74] },
  pike: [150, 112, 70],
  rock: { side: [110, 108, 102], top: [150, 147, 140] },
  trunk: [92, 60, 32],
  leaf: [44, 98, 42],
  leafHi: [62, 124, 52],
  dirt: [110, 86, 58],
  raider: [205, 92, 30],
  brute: [140, 40, 44],
  ram: [118, 82, 48],
  skin: [226, 184, 140],
  banner: [196, 48, 40],
  player: [52, 92, 170],
}

// Faces lit from a fixed sun so rotating the camera changes the shading.
const SUN = (() => {
  const x = -0.55
  const y = 0.83
  const l = Math.hypot(x, y)
  return [x / l, y / l]
})()

const N4 = [[0, -1], [1, 0], [0, 1], [-1, 0]] // N E S W, matching box() skip bits

const WALL_FAMILY = new Set(['palisade', 'wall', 'thick', 'tower', 'keep'])

function rgb(c, f = 1, a = 1) {
  const r = Math.min(255, c[0] * f) | 0
  const g = Math.min(255, c[1] * f) | 0
  const b = Math.min(255, c[2] * f) | 0
  return a === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`
}

function scale(c, f) {
  return [c[0] * f, c[1] * f, c[2] * f]
}

function faceShade(nx, ny) {
  return 0.62 + 0.3 * Math.max(0, nx * SUN[0] + ny * SUN[1])
}

const SIDES = [
  // [nx, ny, corner a, corner b] with corners 0..3 = (x0,y0) (x1,y0) (x1,y1) (x0,y1)
  [0, -1, 0, 1],
  [1, 0, 1, 2],
  [0, 1, 2, 3],
  [-1, 0, 3, 0],
]

export class Renderer {
  constructor(canvas, camera) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.cam = camera
    this.dpr = 1
  }

  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = window.innerWidth
    const h = window.innerHeight
    this.canvas.width = Math.round(w * dpr)
    this.canvas.height = Math.round(h * dpr)
    this.canvas.style.width = `${w}px`
    this.canvas.style.height = `${h}px`
    this.dpr = dpr
    this.cam.setViewport(w, h)
  }

  // ---- primitives ---------------------------------------------------------

  poly(points) {
    const { ctx, cam } = this
    ctx.beginPath()
    for (let i = 0; i < points.length; i += 3) {
      cam.P(points[i], points[i + 1], points[i + 2])
      if (i === 0) ctx.moveTo(cam.sx, cam.sy)
      else ctx.lineTo(cam.sx, cam.sy)
    }
    ctx.closePath()
  }

  // Axis-aligned box. `skip` is a 4-bit mask (N,E,S,W) of hidden sides.
  box(x0, y0, x1, y1, z0, z1, side, top, skip = 0, outline = true) {
    const { ctx, cam } = this
    const cx = [x0, x1, x1, x0]
    const cy = [y0, y0, y1, y1]
    if (cam.cosE > 0.01) {
      for (let s = 0; s < 4; s++) {
        if (skip & (1 << s)) continue
        const [nx, ny, a, b] = SIDES[s]
        if (!cam.faceVisible(nx, ny)) continue
        this.poly([cx[a], cy[a], z0, cx[b], cy[b], z0, cx[b], cy[b], z1, cx[a], cy[a], z1])
        ctx.fillStyle = rgb(side, faceShade(nx, ny))
        ctx.fill()
      }
    }
    this.poly([x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1])
    ctx.fillStyle = rgb(top)
    ctx.fill()
    if (outline) {
      ctx.strokeStyle = 'rgba(30,24,16,0.35)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  // Box rotated by `angle` around its center (used for the battering ram).
  orientedBox(x, y, halfL, halfW, angle, z0, z1, side, top) {
    const { ctx, cam } = this
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const local = [[halfL, -halfW], [halfL, halfW], [-halfL, halfW], [-halfL, -halfW]]
    const pts = local.map(([lx, ly]) => [x + lx * c - ly * s, y + lx * s + ly * c])
    for (let i = 0; i < 4; i++) {
      const a = pts[i]
      const b = pts[(i + 1) % 4]
      let nx = b[1] - a[1]
      let ny = -(b[0] - a[0])
      const l = Math.hypot(nx, ny)
      nx /= l
      ny /= l
      if (!cam.faceVisible(nx, ny)) continue
      this.poly([a[0], a[1], z0, b[0], b[1], z0, b[0], b[1], z1, a[0], a[1], z1])
      ctx.fillStyle = rgb(side, faceShade(nx, ny))
      ctx.fill()
    }
    this.poly(pts.flatMap(([px, py]) => [px, py, z1]))
    ctx.fillStyle = rgb(top)
    ctx.fill()
    ctx.strokeStyle = 'rgba(30,20,10,0.4)'
    ctx.stroke()
  }

  ellipse(x, y, z, r, fill) {
    const { ctx, cam } = this
    cam.P(x, y, z)
    ctx.beginPath()
    ctx.ellipse(cam.sx, cam.sy, r * cam.k, r * cam.k * cam.sinE, 0, 0, Math.PI * 2)
    ctx.fillStyle = fill
    ctx.fill()
  }

  // Upright billboard circle (bodies, foliage).
  ball(x, y, z, r, fill, stroke) {
    const { ctx, cam } = this
    cam.P(x, y, z)
    ctx.beginPath()
    ctx.arc(cam.sx, cam.sy, Math.max(0.5, r * cam.k), 0, Math.PI * 2)
    ctx.fillStyle = fill
    ctx.fill()
    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = Math.max(1, cam.k * 0.03)
      ctx.stroke()
    }
  }

  line(x0, y0, z0, x1, y1, z1, color, width) {
    const { ctx, cam } = this
    ctx.beginPath()
    cam.P(x0, y0, z0)
    ctx.moveTo(cam.sx, cam.sy)
    cam.P(x1, y1, z1)
    ctx.lineTo(cam.sx, cam.sy)
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.stroke()
  }

  pathQuad(x0, y0, x1, y1, z = 0) {
    const { ctx, cam } = this
    cam.P(x0, y0, z)
    ctx.moveTo(cam.sx, cam.sy)
    cam.P(x1, y0, z)
    ctx.lineTo(cam.sx, cam.sy)
    cam.P(x1, y1, z)
    ctx.lineTo(cam.sx, cam.sy)
    cam.P(x0, y1, z)
    ctx.lineTo(cam.sx, cam.sy)
    ctx.closePath()
  }

  onScreen(x, y, margin = 3) {
    const { cam } = this
    cam.P(x, y, 0)
    const m = margin * cam.k
    return cam.sx > -m && cam.sx < cam.vw + m && cam.sy > -m * 1.5 && cam.sy < cam.vh + m
  }

  // ---- frame --------------------------------------------------------------

  render(game, ui) {
    const { ctx, cam } = this
    const { world } = game
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)

    const sky = ctx.createLinearGradient(0, 0, 0, cam.vh)
    sky.addColorStop(0, '#1d2a22')
    sky.addColorStop(1, '#0f1712')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, cam.vw, cam.vh)

    this.drawGround(world, game.time)
    if (ui.showGrid) this.drawGrid(world)
    this.drawSpawns(game)

    // Painter's algorithm by tile: terrain, then structure, then the
    // units standing on that tile, nearest tiles last.
    const units = new Map()
    const addUnit = (u, kind) => {
      const i = world.idxAt(u.x, u.y)
      if (!units.has(i)) units.set(i, [])
      units.get(i).push({ u, kind })
    }
    for (const e of game.enemies) addUnit(e, 0)
    for (const a of game.archers) addUnit(a, 1)

    const order = []
    for (let i = 0; i < world.tiles.length; i++) {
      const t = world.tiles[i]
      const hasContent = t.type !== 'grass' || t.terrain === 'hill' || units.has(i)
      if (!hasContent) continue
      const x = i % world.w
      const y = (i / world.w) | 0
      if (!this.onScreen(x + 0.5, y + 0.5)) continue
      order.push({ d: cam.depth(x + 0.5, y + 0.5), i, x, y })
    }
    order.sort((a, b) => a.d - b.d)
    for (const { i, x, y } of order) {
      const base = world.elev(i)
      if (world.tiles[i].terrain === 'hill') this.drawHill(world, i, x, y, base)
      this.drawTile(world, i, x, y, base, game.time)
      const here = units.get(i)
      if (!here) continue
      here.sort((a, b) => cam.depth(a.u.x, a.u.y) - cam.depth(b.u.x, b.u.y))
      for (const { u, kind } of here) {
        if (kind === 0) this.drawEnemy(u)
        else this.drawArcher(u, game.time)
      }
    }

    for (const p of game.projectiles) this.drawArrow(p)
    if (ui.preview) this.drawPreview(game, ui.preview)
    this.drawBars(game)
    this.drawFloaters(game)
  }

  groundColor(t) {
    const v = Math.floor(t.v * 4)
    switch (t.terrain) {
      case 'marsh':
        return COLORS.marsh[v & 1]
      case 'shallows':
        return COLORS.shallows
      case 'water':
        return COLORS.water
      default:
        return COLORS.grass[v]
    }
  }

  drawGround(world, time) {
    const { ctx } = this
    const { w, h } = world
    this.poly([0, 0, 0, w, 0, 0, w, h, 0, 0, h, 0])
    ctx.fillStyle = rgb(COLORS.grass[0])
    ctx.fill()

    // Batch flat tiles by colour.
    const buckets = new Map()
    for (let i = 0; i < world.tiles.length; i++) {
      const t = world.tiles[i]
      if (t.terrain === 'hill') continue
      const c = t.type === 'moat' ? COLORS.moatEdge : this.groundColor(t)
      if (c === COLORS.grass[0]) continue
      if (!buckets.has(c)) buckets.set(c, [])
      buckets.get(c).push(i)
    }
    for (const [c, list] of buckets) {
      ctx.beginPath()
      for (const i of list) {
        const x = i % w
        const y = (i / w) | 0
        this.pathQuad(x, y, x + 1, y + 1)
      }
      ctx.fillStyle = rgb(c)
      ctx.fill()
    }

    // Moats: dark water inside an earth bank.
    ctx.beginPath()
    for (let i = 0; i < world.tiles.length; i++) {
      if (world.tiles[i].type !== 'moat') continue
      const x = i % w
      const y = (i / w) | 0
      // Water runs to the edge where the neighbour is moat or water too.
      const open = (dx, dy) => {
        if (!world.inBounds(x + dx, y + dy)) return false
        const n = world.tiles[world.idx(x + dx, y + dy)]
        return n.type === 'moat' || n.terrain === 'water' || n.terrain === 'shallows'
      }
      const m = 0.14
      this.pathQuad(open(-1, 0) ? x : x + m, open(0, -1) ? y : y + m, open(1, 0) ? x + 1 : x + 1 - m, open(0, 1) ? y + 1 : y + 1 - m)
    }
    ctx.fillStyle = rgb(COLORS.moat)
    ctx.fill()

    // Ripples on water and reeds in marsh.
    const k = this.cam.k
    ctx.beginPath()
    for (let i = 0; i < world.tiles.length; i++) {
      const t = world.tiles[i]
      if (t.terrain !== 'water' && t.terrain !== 'shallows' && t.type !== 'moat') continue
      const x = i % w
      const y = (i / w) | 0
      const ph = (time * 0.4 + t.v * 7) % 1
      const yy = y + 0.2 + ph * 0.6
      const xx = x + 0.2 + t.v * 0.3
      this.cam.P(xx, yy)
      ctx.moveTo(this.cam.sx, this.cam.sy)
      this.cam.P(xx + 0.3, yy)
      ctx.lineTo(this.cam.sx, this.cam.sy)
    }
    ctx.strokeStyle = 'rgba(200,230,255,0.25)'
    ctx.lineWidth = Math.max(1, k * 0.04)
    ctx.stroke()
    for (let i = 0; i < world.tiles.length; i++) {
      const t = world.tiles[i]
      if (t.terrain !== 'marsh' || t.type !== 'grass') continue
      const x = i % w
      const y = (i / w) | 0
      for (let r = 0; r < 3; r++) {
        const px = x + 0.2 + ((t.v * (r + 3) * 7) % 0.6)
        const py = y + 0.2 + ((t.v * (r + 5) * 11) % 0.6)
        this.line(px, py, 0, px + 0.03, py, 0.3, rgb(COLORS.reed), Math.max(1, k * 0.035))
      }
    }
  }

  drawGrid(world) {
    const { ctx, cam } = this
    ctx.beginPath()
    for (let x = 0; x <= world.w; x++) {
      cam.P(x, 0)
      ctx.moveTo(cam.sx, cam.sy)
      cam.P(x, world.h)
      ctx.lineTo(cam.sx, cam.sy)
    }
    for (let y = 0; y <= world.h; y++) {
      cam.P(0, y)
      ctx.moveTo(cam.sx, cam.sy)
      cam.P(world.w, y)
      ctx.lineTo(cam.sx, cam.sy)
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.beginPath()
    for (let i = 0; i < world.tiles.length; i++) {
      if (!world.reserved[i]) continue
      this.pathQuad(i % world.w, (i / world.w) | 0, (i % world.w) + 1, ((i / world.w) | 0) + 1)
    }
    ctx.fillStyle = 'rgba(200,60,40,0.12)'
    ctx.fill()
  }

  drawSpawns(game) {
    const active = game.activeSpawns(game.wave + 1)
    const pulse = 0.5 + 0.5 * Math.sin(game.time * 4)
    for (const s of game.world.spawns) {
      const on = active.includes(s)
      const x = s.x + 0.5
      const y = s.y + 0.5
      if (on) this.ellipse(x, y, 0, 0.7 + pulse * 0.15, `rgba(220,60,40,${0.18 + pulse * 0.12})`)
      this.line(x, y, 0, x, y, 1.6, '#3a2a1a', Math.max(1.5, this.cam.k * 0.06))
      this.poly([x, y, 1.6, x + 0.55, y, 1.45, x, y, 1.15])
      this.ctx.fillStyle = on ? rgb(COLORS.banner) : 'rgba(120,110,100,0.8)'
      this.ctx.fill()
      // Top-down: a banner seen from above is invisible, so show a dot.
      if (this.cam.cosE < 0.05) this.ball(x, y, 0, 0.22, on ? rgb(COLORS.banner) : '#777', '#2a1a10')
    }
  }

  drawHill(world, i, x, y, h) {
    let skip = 0
    for (let s = 0; s < 4; s++) {
      const nx = x + N4[s][0]
      const ny = y + N4[s][1]
      if (world.inBounds(nx, ny) && world.tiles[world.idx(nx, ny)].terrain === 'hill') skip |= 1 << s
    }
    const top = COLORS.hillTop[Math.floor(world.tiles[i].v * 2)]
    this.box(x, y, x + 1, y + 1, 0, h, COLORS.hillSide, top, skip, false)
  }

  // Mask of sides hidden by an equally tall neighbouring block.
  hiddenSides(world, x, y, height) {
    let mask = 0
    for (let s = 0; s < 4; s++) {
      const nx = x + N4[s][0]
      const ny = y + N4[s][1]
      if (!world.inBounds(nx, ny)) continue
      const n = world.idx(nx, ny)
      if (blockHeight(world.tiles[n]) + world.elev(n) >= height + world.elev(world.idx(x, y))) mask |= 1 << s
    }
    return mask
  }

  connects(world, x, y, s) {
    const nx = x + N4[s][0]
    const ny = y + N4[s][1]
    return world.inBounds(nx, ny) && WALL_FAMILY.has(world.tiles[world.idx(nx, ny)].type)
  }

  // Thin wall: a post with arms reaching toward connected neighbours.
  thinWall(world, x, y, z, h, width, c, f) {
    const hw = width / 2
    const cx = x + 0.5
    const cy = y + 0.5
    const parts = [[cx - hw, cy - hw, cx + hw, cy + hw]]
    if (this.connects(world, x, y, 0)) parts.push([cx - hw, y, cx + hw, cy - hw])
    if (this.connects(world, x, y, 1)) parts.push([cx + hw, cy - hw, x + 1, cy + hw])
    if (this.connects(world, x, y, 2)) parts.push([cx - hw, cy + hw, cx + hw, y + 1])
    if (this.connects(world, x, y, 3)) parts.push([x, cy - hw, cx - hw, cy + hw])
    const cam = this.cam
    parts.sort((a, b) => cam.depth((a[0] + a[2]) / 2, (a[1] + a[3]) / 2) - cam.depth((b[0] + b[2]) / 2, (b[1] + b[3]) / 2))
    for (const p of parts) this.box(p[0], p[1], p[2], p[3], z, z + h, scale(c.side, f), scale(c.top, f), 0, false)
  }

  drawTile(world, i, x, y, z, time) {
    const t = world.tiles[i]
    const dmg = t.maxHp ? 1 - t.hp / t.maxHp : 0
    const f = 1 - dmg * 0.35
    switch (t.type) {
      case 'palisade': {
        const d = STRUCTURES.palisade
        this.thinWall(world, x, y, z, d.height, d.thin, COLORS.palisade, f)
        break
      }
      case 'wall': {
        const d = STRUCTURES.wall
        this.thinWall(world, x, y, z, d.height, d.thin, COLORS.wall, f)
        break
      }
      case 'thick': {
        const h = STRUCTURES.thick.height
        const c = COLORS.thick
        this.box(x, y, x + 1, y + 1, z, z + h, scale(c.side, f), scale(c.top, f), this.hiddenSides(world, x, y, h), false)
        this.poly([x + 0.24, y + 0.24, z + h, x + 0.76, y + 0.24, z + h, x + 0.76, y + 0.76, z + h, x + 0.24, y + 0.76, z + h])
        this.ctx.fillStyle = rgb(c.walk, f)
        this.ctx.fill()
        // Battlements on sides that face open ground.
        let edges = 0
        for (let s = 0; s < 4; s++) if (!this.connects(world, x, y, s)) edges |= 1 << s
        this.merlons(x, y, x + 1, y + 1, z + h, c, edges)
        break
      }
      case 'tower': {
        const h = STRUCTURES.tower.height
        const c = COLORS.tower
        this.box(x + 0.04, y + 0.04, x + 0.96, y + 0.96, z, z + h, scale(c.side, f), scale(c.top, f))
        this.merlons(x + 0.04, y + 0.04, x + 0.96, y + 0.96, z + h, c, 15)
        break
      }
      case 'keep': {
        const k = world.keep
        const h = KEEP.height
        const c = COLORS.keep
        this.box(x, y, x + 1, y + 1, z, z + h, c.side, c.top, this.hiddenSides(world, x, y, h), false)
        // Each tile draws its share of the inner roof so painter order holds.
        const rx0 = Math.max(x, k.x + 0.4)
        const ry0 = Math.max(y, k.y + 0.4)
        const rx1 = Math.min(x + 1, k.x + 2.6)
        const ry1 = Math.min(y + 1, k.y + 2.6)
        this.poly([rx0, ry0, z + h, rx1, ry0, z + h, rx1, ry1, z + h, rx0, ry1, z + h])
        this.ctx.fillStyle = rgb(c.top, 0.86)
        this.ctx.fill()
        let edges = 0
        if (y === k.y) edges |= 1
        if (x === k.x + 2) edges |= 2
        if (y === k.y + 2) edges |= 4
        if (x === k.x) edges |= 8
        this.merlons(x, y, x + 1, y + 1, z + h, c, edges)
        if (x === k.x + 1 && y === k.y + 1) this.flag(x + 0.5, y + 0.5, z + h, time)
        break
      }
      case 'pikes': {
        // Cheval de frise: crossed stakes on a beam.
        const lw = Math.max(1.2, this.cam.k * 0.06)
        const col = rgb(COLORS.pike, f)
        this.line(x + 0.1, y + 0.5, z + 0.25, x + 0.9, y + 0.5, z + 0.25, rgb(COLORS.trunk), lw * 1.3)
        for (const px of [0.2, 0.5, 0.8]) {
          this.line(x + px, y + 0.15, z, x + px, y + 0.85, z + 0.6, col, lw)
          this.line(x + px, y + 0.85, z, x + px, y + 0.15, z + 0.6, col, lw)
        }
        break
      }
      case 'trap': {
        this.ctx.beginPath()
        this.pathQuad(x + 0.08, y + 0.08, x + 0.92, y + 0.92, z + 0.01)
        this.ctx.fillStyle = rgb(COLORS.dirt)
        this.ctx.fill()
        for (let sy = 0; sy < 3; sy++)
          for (let sx = 0; sx < 3; sx++) {
            const px = x + 0.25 + sx * 0.25
            const py = y + 0.25 + sy * 0.25
            this.line(px, py, z, px, py, z + 0.18, '#c9c4b8', Math.max(1, this.cam.k * 0.05))
          }
        break
      }
      case 'tree': {
        const v = t.v
        const cx = x + 0.5 + (v - 0.5) * 0.2
        const cy = y + 0.5 + (((v * 7) % 1) - 0.5) * 0.2
        this.ellipse(cx, cy, z, 0.42, 'rgba(0,0,0,0.25)')
        this.box(cx - 0.07, cy - 0.07, cx + 0.07, cy + 0.07, z, z + 0.55, COLORS.trunk, COLORS.trunk, 0, false)
        this.ball(cx, cy, z + 0.95, 0.42, rgb(COLORS.leaf, 0.9 + v * 0.2), 'rgba(10,30,10,0.5)')
        this.ball(cx - 0.08, cy - 0.08, z + 1.25, 0.26, rgb(COLORS.leafHi, 0.9 + v * 0.2))
        break
      }
      case 'rock': {
        const c = COLORS.rock
        const h = 0.35 + t.v * 0.3
        this.box(x + 0.12, y + 0.16, x + 0.88, y + 0.86, z, z + h, c.side, c.top)
        break
      }
    }
  }

  merlons(x0, y0, x1, y1, z, c, edges) {
    const s = 0.2
    const hgt = 0.22
    const spots = []
    const along = (ax, ay, bx, by) => {
      for (const f of [0, 0.5, 1]) spots.push([ax + (bx - ax) * f, ay + (by - ay) * f])
    }
    if (edges & 1) along(x0 + s / 2, y0 + s / 2, x1 - s / 2, y0 + s / 2)
    if (edges & 2) along(x1 - s / 2, y0 + s / 2, x1 - s / 2, y1 - s / 2)
    if (edges & 4) along(x0 + s / 2, y1 - s / 2, x1 - s / 2, y1 - s / 2)
    if (edges & 8) along(x0 + s / 2, y0 + s / 2, x0 + s / 2, y1 - s / 2)
    const cam = this.cam
    spots.sort((a, b) => cam.depth(a[0], a[1]) - cam.depth(b[0], b[1]))
    const cap = scale(c.top, 1.18)
    for (const [mx, my] of spots)
      this.box(mx - s / 2, my - s / 2, mx + s / 2, my + s / 2, z, z + hgt, c.side, cap, 0, true)
  }

  flag(x, y, z, time) {
    const top = z + 1.3
    this.line(x, y, z, x, y, top, '#2b2016', Math.max(1.5, this.cam.k * 0.05))
    const wave = Math.sin(time * 3) * 0.08
    this.poly([x, y, top, x + 0.7, y + wave, top - 0.18, x, y, top - 0.4])
    this.ctx.fillStyle = rgb(COLORS.player)
    this.ctx.fill()
  }

  drawEnemy(e) {
    const { cam } = this
    const z = e.z
    this.ellipse(e.x, e.y, z, e.r * 1.1, 'rgba(0,0,0,0.3)')
    const hit = e.flash > 0
    if (e.type === 'ram') {
      const side = hit ? [255, 255, 255] : COLORS.ram
      this.orientedBox(e.x, e.y, 0.45, 0.26, e.heading, z + 0.05, z + 0.42, side, scale(side, 1.25))
      const hx = e.x + Math.cos(e.heading) * (0.45 + (e.attacking ? Math.abs(Math.sin(e.walk)) * 0.12 : 0))
      const hy = e.y + Math.sin(e.heading) * 0.45
      this.ball(hx, hy, z + 0.25, 0.1, '#555', '#222')
      return
    }
    const color = hit ? [255, 255, 255] : COLORS[e.type]
    const bob = Math.abs(Math.sin(e.walk)) * 0.06
    const big = e.type === 'brute'
    // Weapon: swings while attacking, points ahead while marching.
    const swing = e.attacking ? Math.sin(e.walk * 2) * 0.25 : 0
    const reach = big ? 0.42 : 0.34
    this.line(
      e.x, e.y, z + 0.38 + bob,
      e.x + Math.cos(e.heading + swing) * reach, e.y + Math.sin(e.heading + swing) * reach, z + 0.5 + bob + swing * 0.3,
      big ? '#3b3b3b' : '#cfcfcf', Math.max(1.5, cam.k * 0.06),
    )
    this.ball(e.x, e.y, z + 0.3 + bob, e.r, rgb(color), 'rgba(20,10,5,0.7)')
    this.ball(e.x, e.y, z + 0.62 + bob, e.r * 0.55, big ? '#777' : rgb(COLORS.skin), 'rgba(20,10,5,0.6)')
  }

  drawArcher(a, time) {
    const { cam } = this
    const z = a.z
    const walking = a.path.length > 0
    const bob = walking ? Math.abs(Math.sin(time * 12 + a.id)) * 0.05 : 0
    this.ellipse(a.x, a.y, z, 0.15, 'rgba(0,0,0,0.3)')
    // Bow held out toward the target.
    const bx = a.x + Math.cos(a.heading) * 0.2
    const by = a.y + Math.sin(a.heading) * 0.2
    const px = -Math.sin(a.heading) * 0.14
    const py = Math.cos(a.heading) * 0.14
    this.line(bx - px, by - py, z + 0.25, bx + px, by + py, z + 0.55, '#6b4423', Math.max(1.2, cam.k * 0.045))
    this.ball(a.x, a.y, z + 0.25 + bob, 0.13, rgb(COLORS.player), '#162440')
    this.ball(a.x, a.y, z + 0.47 + bob, 0.08, rgb(COLORS.skin), 'rgba(20,10,5,0.6)')
  }

  drawArrow(p) {
    const dx = p.x - p.px
    const dy = p.y - p.py
    const dz = p.z - p.pz
    const l = Math.hypot(dx, dy, dz) || 1
    const len = 0.35
    this.line(p.x - (dx / l) * len, p.y - (dy / l) * len, p.z - (dz / l) * len, p.x, p.y, p.z, '#f3e6c4', Math.max(1, this.cam.k * 0.04))
  }

  rangeRing(x, y, z, r) {
    const { ctx, cam } = this
    ctx.beginPath()
    for (let a = 0; a <= 48; a++) {
      const ang = (a / 48) * Math.PI * 2
      cam.P(x + Math.cos(ang) * r, y + Math.sin(ang) * r, z)
      if (a === 0) ctx.moveTo(cam.sx, cam.sy)
      else ctx.lineTo(cam.sx, cam.sy)
    }
    ctx.fillStyle = 'rgba(120,180,255,0.08)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(150,200,255,0.6)'
    ctx.setLineDash([6, 6])
    ctx.stroke()
    ctx.setLineDash([])
  }

  drawPreview(game, pv) {
    const { ctx } = this
    const { world } = game
    const x = pv.i % world.w
    const y = (pv.i / world.w) | 0
    const z = pv.type === 'archer' ? world.surface(pv.i) + 0.02 : world.elev(pv.i) + 0.02
    ctx.beginPath()
    this.pathQuad(x, y, x + 1, y + 1, z)
    ctx.fillStyle = pv.ok ? 'rgba(120,230,120,0.35)' : 'rgba(240,80,60,0.35)'
    ctx.fill()
    ctx.strokeStyle = pv.ok ? 'rgba(160,255,160,0.9)' : 'rgba(255,120,100,0.9)'
    ctx.lineWidth = 2
    ctx.stroke()
    // Archer reach from a tower, or from the spot an archer would stand.
    let r = 0
    if (pv.type === 'tower') r = ARCHER.range + STRUCTURES.tower.perch + (TERRAIN[world.tiles[pv.i].terrain].perch || 0)
    else if (pv.type === 'archer' && world.isRampart(pv.i)) r = game.range(pv.i)
    if (r) this.rangeRing(x + 0.5, y + 0.5, world.elev(pv.i), r)
  }

  hpBar(x, y, z, frac, width = 0.7) {
    if (frac >= 1) return
    const { ctx, cam } = this
    cam.P(x, y, z)
    const w = width * cam.k
    const h = Math.max(3, cam.k * 0.09)
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(cam.sx - w / 2 - 1, cam.sy - h / 2 - 1, w + 2, h + 2)
    ctx.fillStyle = frac > 0.5 ? '#6fcf57' : frac > 0.25 ? '#e8c547' : '#e2543b'
    ctx.fillRect(cam.sx - w / 2, cam.sy - h / 2, w * Math.max(0, frac), h)
  }

  drawBars(game) {
    const { world } = game
    for (let i = 0; i < world.tiles.length; i++) {
      const t = world.tiles[i]
      if (t.maxHp && t.hp < t.maxHp) {
        this.hpBar((i % world.w) + 0.5, ((i / world.w) | 0) + 0.5, world.surface(i) + 0.45, t.hp / t.maxHp)
      }
    }
    for (const e of game.enemies) this.hpBar(e.x, e.y, e.z + 1.0, e.hp / e.maxHp, 0.5)
  }

  drawFloaters(game) {
    const { ctx, cam } = this
    ctx.textAlign = 'center'
    ctx.font = `700 ${Math.round(Math.max(11, cam.k * 0.4))}px system-ui, sans-serif`
    for (const f of game.floaters) {
      cam.P(f.x, f.y, (f.z || 0) + 1 + f.t * 1.2)
      ctx.fillStyle = `rgba(255,214,90,${1 - f.t / 1.2})`
      ctx.fillText(f.text, cam.sx, cam.sy)
    }
  }
}

function blockHeight(t) {
  if (t.type === 'thick') return STRUCTURES.thick.height
  if (t.type === 'keep') return KEEP.height
  return 0
}
