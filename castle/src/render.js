import { STRUCTURES, KEEP, ARCHER, SWORDSMAN, TERRAIN } from './config.js'

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
  pike: [140, 100, 60],
  pikeTip: [226, 214, 186],
  door: [112, 72, 40],
  bowman: [74, 96, 52],
  catapult: [128, 92, 54],
  boulder: [128, 124, 116],
  shield: [178, 146, 62],
  hoard: [122, 84, 46],
  plaster: [222, 204, 168],
  roof: [150, 72, 50],
  soil: [118, 88, 56],
  crop: [196, 176, 74],
  sprout: [112, 150, 60],
  awning: [182, 58, 48],
  awningAlt: [236, 224, 196],
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

const WALL_FAMILY = new Set(['palisade', 'wall', 'thick', 'gate', 'tower', 'keep'])

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
    if (ui.orders) this.drawOrders(game, ui.orders)

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
    for (const s of game.swordsmen) addUnit(s, 2)
    // Gates swing open while your troops pass through.
    this.openGates = new Set(game.swordsmen.map((s) => world.idxAt(s.x, s.y)))

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
      const ground = world.groundElev(i)
      if (world.tiles[i].terrain === 'hill') this.drawHill(world, i, x, y, ground)
      // A rock under a wall: the wall rises out of it but tops out at its
      // usual height, so the rock just shortens the visible wall face.
      this.footZ = world.baseElev(i)
      if (world.tiles[i].rock) this.drawFoundation(x, y, ground, this.footZ, world.tiles[i].v)
      this.drawTile(world, i, x, y, ground, game.time)
      this.footZ = null
      const here = units.get(i)
      if (!here) continue
      here.sort((a, b) => cam.depth(a.u.x, a.u.y) - cam.depth(b.u.x, b.u.y))
      for (const { u, kind } of here) {
        if (kind === 0) this.drawEnemy(u, game.time)
        else if (kind === 1) this.drawArcher(u, game.time)
        else this.drawSwordsman(u)
      }
    }

    for (const p of game.projectiles) {
      if (p.kind === 'boulder') this.drawBoulder(p)
      else this.drawArrow(p)
    }
    for (const fx of game.effects) this.drawEffect(fx)
    if (ui.preview) this.drawPreview(game, ui.preview)
    this.drawBars(game)
    this.drawPlotTags(game)
    this.drawFloaters(game)
  }

  // Overlay drawn on top of the 3D renderer: everything flat or UI-like
  // that the 3D scene doesn't draw itself.
  renderOverlay(game, ui) {
    const { ctx, cam } = this
    const { world } = game
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, cam.vw, cam.vh)
    if (ui.showGrid) this.drawGrid(world)
    if (ui.orders) this.drawOrders(game, ui.orders)
    for (const fx of game.effects) this.drawEffect(fx)
    if (ui.preview) this.drawPreview(game, ui.preview)
    this.drawBars(game)
    this.drawPlotTags(game)
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
    // The ground is baked once into a world-space texture (terrain detail,
    // soft shadows and contact shading), then drawn with the camera's
    // ground-plane transform each frame.
    const sig = world.tiles.map((t) => t.terrain[0] + t.type + (t.rock ? 'r' : '')).join(',')
    if (sig !== this.groundSig) {
      this.groundSig = sig
      this.bakeGround(world)
    }
    const { cam } = this
    const k = cam.k
    const a = cam.cosT * k
    const b = cam.sinT * cam.sinE * k
    const c = -cam.sinT * k
    const d = cam.cosT * cam.sinE * k
    const e = cam.vw / 2 - (cam.fx * a + cam.fy * c)
    const f = cam.vh / 2 - (cam.fx * b + cam.fy * d)
    const dpr = this.dpr
    ctx.save()
    ctx.setTransform(dpr * a, dpr * b, dpr * c, dpr * d, dpr * e, dpr * f)
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(this.groundCanvas, 0, 0, w, h)
    ctx.restore()

    // Ripples on water and reeds in marsh.
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

  // Footprints (world-unit rects) and heights of things that cast shadows.
  shadowCasters(world) {
    const out = []
    const k = world.keep
    for (let i = 0; i < world.tiles.length; i++) {
      const t = world.tiles[i]
      const x = i % world.w
      const y = (i / world.w) | 0
      const r = (x0, y0, x1, y1, h) => out.push([x + x0, y + y0, x + x1, y + y1, h])
      switch (t.type) {
        case 'palisade':
        case 'wall': {
          const d = STRUCTURES[t.type]
          const hw = d.thin / 2
          r(0.5 - hw, 0.5 - hw, 0.5 + hw, 0.5 + hw, d.height)
          if (this.connects(world, x, y, 0)) r(0.5 - hw, 0, 0.5 + hw, 0.5, d.height)
          if (this.connects(world, x, y, 1)) r(0.5, 0.5 - hw, 1, 0.5 + hw, d.height)
          if (this.connects(world, x, y, 2)) r(0.5 - hw, 0.5, 0.5 + hw, 1, d.height)
          if (this.connects(world, x, y, 3)) r(0, 0.5 - hw, 0.5, 0.5 + hw, d.height)
          break
        }
        case 'thick':
        case 'gate':
          r(0, 0, 1, 1, STRUCTURES[t.type].height)
          break
        case 'tower':
          r(0.04, 0.04, 0.96, 0.96, STRUCTURES.tower.height)
          break
        case 'keep':
          if (x === k.x && y === k.y) out.push([x, y, x + 3, y + 3, KEEP.height])
          break
        case 'tree':
          r(0.25, 0.25, 0.75, 0.75, 1.3)
          break
        case 'rock':
          r(0.15, 0.2, 0.85, 0.85, 0.5)
          break
        case 'cottage':
          r(0.18, 0.24, 0.82, 0.76, 0.8)
          break
        case 'market':
          r(0.12, 0.2, 0.88, 0.8, 0.9)
          break
        case 'pikes':
          r(0.1, 0.3, 0.9, 0.7, 0.45)
          break
      }
    }
    return out
  }

  bakeGround(world) {
    const S = 24 // texture pixels per tile
    const { w, h } = world
    const cv = (this.groundCanvas ||= document.createElement('canvas'))
    cv.width = w * S
    cv.height = h * S
    const g = cv.getContext('2d')
    // Deterministic per-tile noise so the texture doesn't shimmer on rebake.
    let seed = 1
    const rnd = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let i = 0; i < world.tiles.length; i++) {
      const t = world.tiles[i]
      const x = (i % w) * S
      const y = ((i / w) | 0) * S
      const base = t.type === 'moat' ? COLORS.moatEdge : t.terrain === 'hill' ? COLORS.hillTop[0] : this.groundColor(t)
      g.fillStyle = rgb(base)
      g.fillRect(x, y, S, S)
      seed = i * 7919 + 13
      if (t.terrain === 'water' || t.terrain === 'shallows') {
        // Depth gradient and a few glints.
        for (let n = 0; n < 3; n++) {
          g.fillStyle = rgb(base, 1.08 + rnd() * 0.1, 0.5)
          g.fillRect(x + rnd() * S, y + rnd() * S, 4 + rnd() * 6, 1)
        }
        continue
      }
      // Speckles of lighter and darker earth.
      for (let n = 0; n < 16; n++) {
        g.fillStyle = rgb(base, 0.8 + rnd() * 0.38)
        const sz = 1 + rnd() * 2
        g.fillRect(x + rnd() * S, y + rnd() * S, sz, sz)
      }
      if (t.terrain === 'grass' && t.type !== 'moat') {
        // Little tufts of grass.
        g.strokeStyle = rgb(base, 1.22)
        g.lineWidth = 1
        g.beginPath()
        for (let n = 0; n < 5; n++) {
          const px = x + rnd() * S
          const py = y + rnd() * S
          g.moveTo(px, py)
          g.lineTo(px - 1 + rnd() * 2, py - 3 - rnd() * 2)
        }
        g.stroke()
      } else if (t.terrain === 'marsh') {
        for (let n = 0; n < 2; n++) {
          g.fillStyle = 'rgba(40,60,50,0.35)'
          g.beginPath()
          g.ellipse(x + rnd() * S, y + rnd() * S, 2 + rnd() * 4, 1.5 + rnd() * 2, 0, 0, Math.PI * 2)
          g.fill()
        }
      }
    }
    // Moats: dark water inside an earth bank.
    g.fillStyle = rgb(COLORS.moat)
    for (let i = 0; i < world.tiles.length; i++) {
      if (world.tiles[i].type !== 'moat') continue
      const x = i % w
      const y = (i / w) | 0
      const open = (dx, dy) => {
        if (!world.inBounds(x + dx, y + dy)) return false
        const n = world.tiles[world.idx(x + dx, y + dy)]
        return n.type === 'moat' || n.terrain === 'water' || n.terrain === 'shallows'
      }
      const m = 0.14
      const x0 = open(-1, 0) ? x : x + m
      const y0 = open(0, -1) ? y : y + m
      const x1 = open(1, 0) ? x + 1 : x + 1 - m
      const y1 = open(0, 1) ? y + 1 : y + 1 - m
      g.fillRect(x0 * S, y0 * S, (x1 - x0) * S, (y1 - y0) * S)
    }

    // Shadows cast away from the sun, plus a little contact darkening, drawn
    // into their own layer and softened by stacking offset copies.
    const sh = (this.shadowCanvas ||= document.createElement('canvas'))
    sh.width = cv.width
    sh.height = cv.height
    const s = sh.getContext('2d')
    s.clearRect(0, 0, sh.width, sh.height)
    s.fillStyle = '#000'
    const ox = -SUN[0] * 0.45
    const oy = -SUN[1] * 0.45
    for (const [x0, y0, x1, y1, hgt] of this.shadowCasters(world)) {
      for (let f = 0; f <= 1.001; f += 0.2) {
        const dx = ox * hgt * f
        const dy = oy * hgt * f
        s.fillRect((x0 + dx) * S, (y0 + dy) * S, (x1 - x0) * S, (y1 - y0) * S)
      }
      // Contact shading hugging the footprint.
      s.fillRect((x0 - 0.08) * S, (y0 - 0.08) * S, (x1 - x0 + 0.16) * S, (y1 - y0 + 0.16) * S)
    }
    g.save()
    g.globalAlpha = 0.045
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) g.drawImage(sh, dx * 2, dy * 2)
    g.restore()
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
  thinWall(world, x, y, z, h, width, c, f, hoard = false) {
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
    const foot = this.footZ ?? z
    for (const p of parts) this.box(p[0], p[1], p[2], p[3], foot, z + h, scale(c.side, f), scale(c.top, f), 0, false)
    if (!hoard) return
    // Wooden boards along both sides of the walkway.
    const rails = []
    const t = 0.06
    // Centre post: boards only on sides with no wall joining.
    const [c0, c1, c2, c3] = parts.find((p) => Math.abs(p[2] - p[0] - width) < 1e-6 && Math.abs(p[3] - p[1] - width) < 1e-6)
    if (!this.connects(world, x, y, 0)) rails.push([c0, c1, c2, c1 + t])
    if (!this.connects(world, x, y, 1)) rails.push([c2 - t, c1, c2, c3])
    if (!this.connects(world, x, y, 2)) rails.push([c0, c3 - t, c2, c3])
    if (!this.connects(world, x, y, 3)) rails.push([c0, c1, c0 + t, c3])
    for (const [x0, y0, x1, y1] of parts) {
      if (x0 === c0 && y0 === c1 && x1 === c2 && y1 === c3) continue
      const alongX = x1 - x0 > y1 - y0 + 1e-6
      const alongY = y1 - y0 > x1 - x0 + 1e-6
      if (!alongY) {
        rails.push([x0, y0, x1, y0 + t], [x0, y1 - t, x1, y1])
      }
      if (!alongX) {
        rails.push([x0, y0, x0 + t, y1], [x1 - t, y0, x1, y1])
      }
    }
    this.rails(rails, z + h)
  }

  rails(list, z) {
    const cam = this.cam
    list.sort((a, b) => cam.depth((a[0] + a[2]) / 2, (a[1] + a[3]) / 2) - cam.depth((b[0] + b[2]) / 2, (b[1] + b[3]) / 2))
    for (const r of list) this.box(r[0], r[1], r[2], r[3], z, z + 0.3, COLORS.hoard, scale(COLORS.hoard, 1.25), 0, true)
  }

  // Rails around the edges named by the N/E/S/W bit mask.
  edgeRails(x0, y0, x1, y1, z, edges) {
    const t = 0.07
    const list = []
    if (edges & 1) list.push([x0, y0, x1, y0 + t])
    if (edges & 2) list.push([x1 - t, y0, x1, y1])
    if (edges & 4) list.push([x0, y1 - t, x1, y1])
    if (edges & 8) list.push([x0, y0, x0 + t, y1])
    this.rails(list, z)
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
        this.thinWall(world, x, y, z, d.height, d.thin, COLORS.wall, f, t.hoard)
        break
      }
      case 'thick': {
        const h = STRUCTURES.thick.height
        const c = COLORS.thick
        this.box(x, y, x + 1, y + 1, this.footZ ?? z, z + h, scale(c.side, f), scale(c.top, f), this.hiddenSides(world, x, y, h), false)
        this.poly([x + 0.24, y + 0.24, z + h, x + 0.76, y + 0.24, z + h, x + 0.76, y + 0.76, z + h, x + 0.24, y + 0.76, z + h])
        this.ctx.fillStyle = rgb(c.walk, f)
        this.ctx.fill()
        // Battlements on sides that face open ground.
        let edges = 0
        for (let s = 0; s < 4; s++) if (!this.connects(world, x, y, s)) edges |= 1 << s
        if (t.hoard) this.edgeRails(x, y, x + 1, y + 1, z + h, edges)
        else this.merlons(x, y, x + 1, y + 1, z + h, c, edges)
        break
      }
      case 'tower': {
        const h = STRUCTURES.tower.height
        const c = COLORS.tower
        this.box(x + 0.04, y + 0.04, x + 0.96, y + 0.96, this.footZ ?? z, z + h, scale(c.side, f), scale(c.top, f))
        if (t.hoard) this.edgeRails(x + 0.04, y + 0.04, x + 0.96, y + 0.96, z + h, 15)
        else this.merlons(x + 0.04, y + 0.04, x + 0.96, y + 0.96, z + h, c, 15)
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
      case 'pikes':
        this.drawPikes(world, x, y, this.footZ ?? z, f)
        break
      case 'gate':
        this.drawGate(world, i, x, y, z, f)
        break
      case 'cottage':
        this.drawCottage(x, y, z, f)
        break
      case 'farm':
        this.drawFarm(x, y, z, f, t.v)
        break
      case 'market':
        this.drawMarket(x, y, z, f)
        break
      case 'plot':
        this.drawPlot(x, y, z, t.plot, time)
        break
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

  // Which way a gate or pike line runs: along x unless it only joins N/S.
  axisX(world, x, y, family) {
    const joins = (s) => {
      const nx = x + N4[s][0]
      const ny = y + N4[s][1]
      return world.inBounds(nx, ny) && family(world.tiles[world.idx(nx, ny)].type)
    }
    return joins(1) || joins(3) || !(joins(0) || joins(2))
  }

  // Cheval de frise: a log with sharpened stakes crossed through it,
  // pointing out both sides. Neighbouring pikes line up into a barrier.
  drawPikes(world, x, y, z, f) {
    const alongX = this.axisX(world, x, y, (t) => t === 'pikes' || WALL_FAMILY.has(t))
    const cx = x + 0.5
    const cy = y + 0.5
    const ax = alongX ? 1 : 0
    const ay = alongX ? 0 : 1
    const px = -ay
    const py = ax
    this.ellipse(cx, cy, z, 0.45, 'rgba(0,0,0,0.18)')
    const lw = Math.max(1.5, this.cam.k * 0.075)
    const wood = rgb(COLORS.pike, f)
    const tip = rgb(COLORS.pikeTip, f)
    const stakes = []
    for (const t of [-0.33, 0, 0.33]) {
      const bx = cx + ax * t
      const by = cy + ay * t
      for (const dir of [1, -1]) {
        // From the ground on one side, up through the log, to a point on the other.
        const x0 = bx - px * 0.36 * dir
        const y0 = by - py * 0.36 * dir
        const x1 = bx + px * 0.42 * dir
        const y1 = by + py * 0.42 * dir
        stakes.push([x0, y0, x1, y1])
      }
    }
    const cam = this.cam
    stakes.sort((a, b) => cam.depth(a[2], a[3]) - cam.depth(b[2], b[3]))
    const log = () => this.orientedBox(cx, cy, 0.5, 0.06, alongX ? 0 : Math.PI / 2, z + 0.2, z + 0.32, COLORS.trunk, scale(COLORS.trunk, 1.2))
    let drewLog = false
    for (const [x0, y0, x1, y1] of stakes) {
      // Draw the log once the stakes behind it are down.
      if (!drewLog && cam.depth(x1, y1) > cam.depth(cx, cy)) {
        log()
        drewLog = true
      }
      const mx = x0 + (x1 - x0) * 0.72
      const my = y0 + (y1 - y0) * 0.72
      this.line(x0, y0, z, mx, my, z + 0.45, wood, lw)
      this.line(mx, my, z + 0.45, x1, y1, z + 0.62, tip, lw * 0.8)
    }
    if (!drewLog) log()
  }

  drawGate(world, i, x, y, z, f) {
    const h = STRUCTURES.gate.height
    const c = COLORS.thick
    const side = scale(c.side, f)
    const top = scale(c.top, f)
    const alongX = this.axisX(world, x, y, (t) => WALL_FAMILY.has(t))
    const fz = this.footZ ?? z
    // Pillars at each end, a lintel over the passage, and the door.
    const parts = alongX
      ? [
          [x, y + 0.12, x + 0.3, y + 0.88, fz, z + h, side, top],
          [x + 0.7, y + 0.12, x + 1, y + 0.88, fz, z + h, side, top],
          [x + 0.3, y + 0.12, x + 0.7, y + 0.88, z + 0.85, z + h, side, top],
        ]
      : [
          [x + 0.12, y, x + 0.88, y + 0.3, fz, z + h, side, top],
          [x + 0.12, y + 0.7, x + 0.88, y + 1, fz, z + h, side, top],
          [x + 0.12, y + 0.3, x + 0.88, y + 0.7, z + 0.85, z + h, side, top],
        ]
    if (!this.openGates?.has(i)) {
      parts.push(alongX
        ? [x + 0.3, y + 0.44, x + 0.7, y + 0.56, fz, z + 0.85, COLORS.door, scale(COLORS.door, 1.2)]
        : [x + 0.44, y + 0.3, x + 0.56, y + 0.7, fz, z + 0.85, COLORS.door, scale(COLORS.door, 1.2)])
    }
    const cam = this.cam
    parts.sort((a, b) => cam.depth((a[0] + a[2]) / 2, (a[1] + a[3]) / 2) - cam.depth((b[0] + b[2]) / 2, (b[1] + b[3]) / 2))
    for (const p of parts) this.box(...p, 0, true)
    if (world.tiles[i].hoard) {
      if (alongX) this.edgeRails(x, y + 0.12, x + 1, y + 0.88, z + h, 5)
      else this.edgeRails(x + 0.12, y, x + 0.88, y + 1, z + h, 10)
    }
  }

  drawCottage(x, y, z, f) {
    const { ctx, cam } = this
    const x0 = x + 0.18
    const x1 = x + 0.82
    const y0 = y + 0.24
    const y1 = y + 0.76
    const h = z + 0.42
    const ridge = z + 0.8
    const cy = y + 0.5
    this.ellipse(x + 0.5, y + 0.5, z, 0.45, 'rgba(0,0,0,0.18)')
    this.box(x0, y0, x1, y1, z, h, scale(COLORS.plaster, f), scale(COLORS.plaster, f), 0, false)
    // Gable roof along x: back slope, end gables, front slope.
    const roof = (pts, shade) => {
      this.poly(pts)
      ctx.fillStyle = rgb(COLORS.roof, shade * f)
      ctx.fill()
      ctx.strokeStyle = 'rgba(40,20,10,0.35)'
      ctx.stroke()
    }
    const northSlope = [x0 - 0.04, y0 - 0.05, h, x1 + 0.04, y0 - 0.05, h, x1 + 0.04, cy, ridge, x0 - 0.04, cy, ridge]
    const southSlope = [x0 - 0.04, cy, ridge, x1 + 0.04, cy, ridge, x1 + 0.04, y1 + 0.05, h, x0 - 0.04, y1 + 0.05, h]
    const southFront = cam.faceVisible(0, 1)
    roof(southFront ? northSlope : southSlope, 0.8)
    for (const [gx, nx] of [[x0, -1], [x1, 1]]) {
      if (!cam.faceVisible(nx, 0)) continue
      this.poly([gx, y0, h, gx, y1, h, gx, cy, ridge])
      ctx.fillStyle = rgb(COLORS.plaster, faceShade(nx, 0) * f)
      ctx.fill()
    }
    roof(southFront ? southSlope : northSlope, 1)
    // Chimney.
    this.box(x1 - 0.16, cy - 0.22, x1 - 0.06, cy - 0.12, h, ridge + 0.08, [120, 100, 90], [90, 80, 72], 0, false)
  }

  drawFarm(x, y, z, f, v) {
    const { ctx } = this
    ctx.beginPath()
    this.pathQuad(x + 0.04, y + 0.04, x + 0.96, y + 0.96, z + 0.01)
    ctx.fillStyle = rgb(COLORS.soil, f)
    ctx.fill()
    const lw = Math.max(1.5, this.cam.k * 0.07)
    const ripe = v > 0.5
    for (let r = 0; r < 4; r++) {
      const yy = y + 0.17 + r * 0.22
      this.line(x + 0.12, yy, z + 0.03, x + 0.88, yy, z + 0.03, rgb(ripe ? COLORS.crop : COLORS.sprout, f), lw)
      // A few stalks so the rows read in 3D.
      for (const xx of [0.25, 0.5, 0.75])
        this.line(x + xx, yy, z, x + xx, yy, z + 0.14, rgb(ripe ? COLORS.crop : COLORS.sprout, f * 0.9), lw * 0.6)
    }
  }

  drawMarket(x, y, z, f) {
    const { ctx } = this
    this.ellipse(x + 0.5, y + 0.5, z, 0.48, 'rgba(0,0,0,0.18)')
    this.box(x + 0.15, y + 0.3, x + 0.85, y + 0.7, z, z + 0.35, scale(COLORS.catapult, f), scale(COLORS.catapult, 1.15 * f), 0, true)
    const lw = Math.max(1.5, this.cam.k * 0.05)
    for (const [px, py] of [[0.12, 0.2], [0.88, 0.2], [0.12, 0.8], [0.88, 0.8]])
      this.line(x + px, y + py, z, x + px, y + py, z + 0.85, '#4a3220', lw)
    // Striped awning sloping toward the front.
    for (let k = 0; k < 5; k++) {
      const a = x + 0.08 + k * 0.168
      const b = a + 0.168
      this.poly([a, y + 0.14, z + 0.95, b, y + 0.14, z + 0.95, b, y + 0.86, z + 0.75, a, y + 0.86, z + 0.75])
      ctx.fillStyle = rgb(k % 2 ? COLORS.awningAlt : COLORS.awning, f)
      ctx.fill()
    }
    this.ball(x + 0.35, y + 0.5, z + 0.42, 0.08, rgb(COLORS.crop))
    this.ball(x + 0.62, y + 0.45, z + 0.42, 0.07, '#a83a2a')
  }

  // A plot the village wants built: stakes, string and a ghost of the building.
  drawPlot(x, y, z, kind, time) {
    const { ctx } = this
    const pulse = 0.55 + 0.25 * Math.sin(time * 3)
    ctx.beginPath()
    this.pathQuad(x + 0.08, y + 0.08, x + 0.92, y + 0.92, z + 0.01)
    ctx.fillStyle = `rgba(240,210,120,${0.12 + pulse * 0.1})`
    ctx.fill()
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = `rgba(250,225,150,${pulse})`
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.setLineDash([])
    const lw = Math.max(1.2, this.cam.k * 0.04)
    for (const [px, py] of [[0.08, 0.08], [0.92, 0.08], [0.92, 0.92], [0.08, 0.92]])
      this.line(x + px, y + py, z, x + px, y + py, z + 0.25, '#e9d9b0', lw)
    ctx.globalAlpha = 0.35
    if (kind === 'cottage') this.drawCottage(x, y, z, 1)
    else if (kind === 'farm') this.drawFarm(x, y, z, 1, 0.2)
    else if (kind === 'market') this.drawMarket(x, y, z, 1)
    ctx.globalAlpha = 1
  }

  // Swordsman orders: their zones, the selection, and the box being dragged.
  drawOrders(game, orders) {
    const { ctx } = this
    const seen = new Set()
    for (const s of game.swordsmen) {
      const sel = orders.selected.has(s.id)
      if (!s.zone || (!orders.active && !sel)) continue
      const key = JSON.stringify(s.zone)
      if (seen.has(key)) continue
      seen.add(key)
      const z = s.zone
      ctx.beginPath()
      this.pathQuad(z.x0, z.y0, z.x1 + 1, z.y1 + 1)
      ctx.fillStyle = sel ? 'rgba(110,160,255,0.18)' : 'rgba(110,160,255,0.09)'
      ctx.fill()
      ctx.setLineDash([6, 5])
      ctx.strokeStyle = 'rgba(150,190,255,0.85)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.setLineDash([])
    }
    for (const s of game.swordsmen) {
      if (!orders.selected.has(s.id)) continue
      const { cam } = this
      cam.P(s.x, s.y, s.z)
      ctx.beginPath()
      ctx.ellipse(cam.sx, cam.sy, 0.36 * cam.k, 0.36 * cam.k * cam.sinE, 0, 0, Math.PI * 2)
      ctx.strokeStyle = '#f0c24b'
      ctx.lineWidth = 2.5
      ctx.stroke()
    }
    if (orders.box) {
      const { x0, y0, x1, y1 } = orders.box
      ctx.beginPath()
      this.pathQuad(x0, y0, x1 + 1, y1 + 1)
      ctx.fillStyle = orders.selected.size ? 'rgba(110,160,255,0.22)' : 'rgba(240,194,75,0.18)'
      ctx.fill()
      ctx.strokeStyle = orders.selected.size ? 'rgba(170,205,255,0.95)' : 'rgba(240,194,75,0.95)'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  // Craggy rock under a wall: a wide dark base with a mossy step on top.
  drawFoundation(x, y, z0, z1, v) {
    // Same stone as the bare rocks on the map, so it reads as the rock you built over.
    const side = COLORS.rock.side
    const moss = [138, 146, 112]
    const mid = z0 + (z1 - z0) * (0.55 + v * 0.2)
    const j = (v - 0.5) * 0.08
    this.box(x + 0.02, y + 0.03 + j, x + 0.98, y + 0.97 + j, z0, mid, side, COLORS.rock.top, 0, true)
    this.box(x + 0.1 - j, y + 0.12, x + 0.9 - j, y + 0.88, mid, z1, scale(side, 1.08), moss, 0, true)
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

  drawEnemy(e, time) {
    const { cam } = this
    const z = e.z
    if (e.type === 'catapult') {
      this.drawCatapult(e, time)
      return
    }
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
    if (e.type === 'bowman') {
      this.bow(e.x, e.y, z, e.heading, '#3b2a18')
      this.ball(e.x, e.y, z + 0.28 + bob, e.r, rgb(color), 'rgba(20,10,5,0.7)')
      this.ball(e.x, e.y, z + 0.52 + bob, e.r * 0.6, rgb(scale(COLORS.bowman, 0.7)), 'rgba(20,10,5,0.6)')
      return
    }
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
    this.bow(a.x, a.y, z, a.heading, '#6b4423')
    this.ball(a.x, a.y, z + 0.25 + bob, 0.13, a.flash > 0 ? '#fff' : rgb(COLORS.player), '#162440')
    this.ball(a.x, a.y, z + 0.47 + bob, 0.08, rgb(COLORS.skin), 'rgba(20,10,5,0.6)')
  }

  // Bow held out toward the target.
  bow(x, y, z, heading, color) {
    const bx = x + Math.cos(heading) * 0.2
    const by = y + Math.sin(heading) * 0.2
    const px = -Math.sin(heading) * 0.14
    const py = Math.cos(heading) * 0.14
    this.line(bx - px, by - py, z + 0.25, bx + px, by + py, z + 0.55, color, Math.max(1.2, this.cam.k * 0.045))
  }

  drawSwordsman(s) {
    const { cam } = this
    const z = s.z
    const bob = Math.abs(Math.sin(s.walk)) * 0.05
    this.ellipse(s.x, s.y, z, s.r * 1.1, 'rgba(0,0,0,0.3)')
    const swing = s.fighting ? Math.sin(s.walk * 2) * 0.5 : 0.3
    const h = s.heading
    // Sword on the right hand, shield on the left.
    this.line(
      s.x + Math.cos(h + 1.2) * 0.12, s.y + Math.sin(h + 1.2) * 0.12, z + 0.4 + bob,
      s.x + Math.cos(h + swing) * 0.42, s.y + Math.sin(h + swing) * 0.42, z + 0.5 + bob,
      '#dfe4ea', Math.max(1.5, cam.k * 0.06),
    )
    this.ball(s.x, s.y, z + 0.3 + bob, s.r, s.flash > 0 ? '#fff' : rgb(COLORS.player), '#162440')
    this.ball(s.x + Math.cos(h - 1.1) * 0.17, s.y + Math.sin(h - 1.1) * 0.17, z + 0.32 + bob, 0.11, rgb(COLORS.shield), '#4a3a14')
    this.ball(s.x, s.y, z + 0.6 + bob, s.r * 0.55, '#9aa3ad', '#2a2f36')
  }

  drawCatapult(e, time) {
    const z = e.z
    const wood = e.flash > 0 ? [255, 255, 255] : COLORS.catapult
    const c = Math.cos(e.heading)
    const s = Math.sin(e.heading)
    this.ellipse(e.x, e.y, z, 0.5, 'rgba(0,0,0,0.3)')
    for (const [l, w] of [[0.3, 0.27], [0.3, -0.27], [-0.3, 0.27], [-0.3, -0.27]])
      this.ball(e.x + c * l - s * w, e.y + s * l + c * w, z + 0.1, 0.09, '#3a2a1a')
    this.orientedBox(e.x, e.y, 0.42, 0.24, e.heading, z + 0.08, z + 0.26, wood, scale(wood, 1.2))
    // A-frame holding the pivot.
    const px = -s * 0.2
    const py = c * 0.2
    const pz = z + 0.7
    const frame = rgb(scale(wood, 0.75))
    const fw = Math.max(1.5, this.cam.k * 0.06)
    this.line(e.x + px, e.y + py, z + 0.26, e.x, e.y, pz, frame, fw)
    this.line(e.x - px, e.y - py, z + 0.26, e.x, e.y, pz, frame, fw)
    // Throwing arm: snaps forward when fired, then winches back down.
    const since = time - e.fired
    const fwd = since < 0.18 ? since / 0.18 : Math.max(0, 1 - (since - 0.18) / 1.8)
    const ang = -0.45 + fwd * 1.9 // radians up from pointing back and down
    const len = 0.7
    const ex = e.x - c * Math.cos(ang) * len
    const ey = e.y - s * Math.cos(ang) * len
    const ez = pz + Math.sin(ang) * len
    this.line(e.x + c * 0.18, e.y + s * 0.18, pz - Math.sin(ang) * 0.18, ex, ey, ez, rgb(scale(wood, 0.9)), Math.max(2.5, this.cam.k * 0.09))
    // Loaded bucket once the crew has winched it back.
    this.ball(ex, ey, ez + 0.04, 0.11, since > 1.2 ? rgb(COLORS.boulder) : rgb(scale(wood, 0.6)), '#3a2a1a')
  }

  drawBoulder(p) {
    const groundZ = p.sz + (p.tz - p.sz) * p.t
    this.ellipse(p.x, p.y, Math.max(0, groundZ - 0.4), 0.14, 'rgba(0,0,0,0.25)')
    this.ball(p.x, p.y, p.z, 0.14, rgb(COLORS.boulder), '#3d3a36')
  }

  drawEffect(fx) {
    const { ctx, cam } = this
    const k = fx.t / fx.life
    for (let n = 0; n < 4; n++) {
      const a = n * 1.7 + fx.x * 3
      const r = fx.size * (0.2 + k * 0.6)
      cam.P(fx.x + Math.cos(a) * r * 0.6, fx.y + Math.sin(a) * r * 0.6, fx.z + k * 0.6)
      ctx.beginPath()
      ctx.arc(cam.sx, cam.sy, Math.max(1, r * 0.55 * cam.k), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(170,155,130,${0.5 * (1 - k)})`
      ctx.fill()
    }
  }

  drawArrow(p) {
    const dx = p.x - p.px
    const dy = p.y - p.py
    const dz = p.z - p.pz
    const l = Math.hypot(dx, dy, dz) || 1
    const len = 0.35
    const color = p.hostile ? '#2a2018' : '#f3e6c4'
    this.line(p.x - (dx / l) * len, p.y - (dy / l) * len, p.z - (dz / l) * len, p.x, p.y, p.z, color, Math.max(1, this.cam.k * 0.04))
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
    const onTop = ['archer', 'upgrade', 'demolish', 'hoard'].includes(pv.type)
    const z = onTop ? world.surface(pv.i) + 0.02 : world.elev(pv.i) + 0.02
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
    else if (pv.type === 'swordsman') r = SWORDSMAN.guard
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
    for (const u of [...game.archers, ...game.swordsmen]) this.hpBar(u.x, u.y, u.z + 0.95, u.hp / u.maxHp, 0.4)
  }

  // Price tags over the village's plots: what it wants and what it costs.
  drawPlotTags(game) {
    const { ctx, cam } = this
    const { world } = game
    const size = Math.round(Math.max(10, Math.min(14, cam.k * 0.36)))
    ctx.font = `700 ${size}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (let i = 0; i < world.tiles.length; i++) {
      const t = world.tiles[i]
      if (t.type !== 'plot') continue
      const def = STRUCTURES[t.plot]
      cam.P((i % world.w) + 0.5, ((i / world.w) | 0) + 0.5, world.elev(i) + 1.15)
      const text = `${def.label} · ${def.cost}`
      const w = ctx.measureText(text).width + size * 2
      const h = size * 1.7
      const x = cam.sx - w / 2
      const y = cam.sy - h / 2
      const afford = game.gold >= def.cost
      ctx.fillStyle = 'rgba(24,20,15,0.88)'
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, h / 2)
      ctx.fill()
      ctx.strokeStyle = afford ? 'rgba(240,194,75,0.9)' : 'rgba(160,140,110,0.6)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      // Little coin before the text.
      ctx.beginPath()
      ctx.arc(x + size * 0.85, cam.sy, size * 0.32, 0, Math.PI * 2)
      ctx.fillStyle = '#f0c24b'
      ctx.fill()
      ctx.fillStyle = afford ? '#f3ead8' : '#b9ae98'
      ctx.fillText(text, cam.sx + size * 0.5, cam.sy + 1)
      // Pointer down to the plot.
      ctx.beginPath()
      ctx.moveTo(cam.sx - 4, y + h)
      ctx.lineTo(cam.sx + 4, y + h)
      ctx.lineTo(cam.sx, y + h + 5)
      ctx.fillStyle = 'rgba(24,20,15,0.88)'
      ctx.fill()
    }
    ctx.textBaseline = 'alphabetic'
  }

  drawFloaters(game) {
    const { ctx, cam } = this
    ctx.textAlign = 'center'
    ctx.font = `700 ${Math.round(Math.max(11, cam.k * 0.4))}px system-ui, sans-serif`
    for (const f of game.floaters) {
      cam.P(f.x, f.y, (f.z || 0) + 1 + f.t * 1.2)
      ctx.fillStyle = f.color === 'cost' ? `rgba(255,160,120,${1 - f.t / 1.2})` : `rgba(255,214,90,${1 - f.t / 1.2})`
      ctx.fillText(f.text, cam.sx, cam.sy)
    }
  }
}

function blockHeight(t) {
  if (t.type === 'thick') return STRUCTURES.thick.height
  if (t.type === 'gate') return STRUCTURES.gate.height
  if (t.type === 'keep') return KEEP.height
  return 0
}
