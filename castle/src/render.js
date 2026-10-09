import { STRUCTURES, KEEP, ARCHER, SWORDSMAN, TERRAIN, UNIT_SCALE, MOAT } from './config.js'
import { stoneTexture, flagstoneTexture, woodTexture, TEXTURE_PX, TEXTURE_LUM } from './textures.js'
import { paintTerrain, terrainReady, GROUND_PX } from './terrain.js'
import { floraReady, floraSprites, treeSpec, rockSpec } from './flora.js'
import { LOOKS, SPRITE, SpriteAnim, spriteFrame, spritesReady } from './units.js'

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
  ladder: [168, 124, 74],
  lord: [120, 48, 120],
  crown: [236, 196, 70],
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

const WALL_FAMILY = new Set(['palisade', 'wall', 'thick', 'gate', 'gatehouse', 'tower', 'keep'])

function rgb(c, f = 1, a = 1) {
  const r = Math.min(255, c[0] * f) | 0
  const g = Math.min(255, c[1] * f) | 0
  const b = Math.min(255, c[2] * f) | 0
  return a === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`
}

function scale(c, f) {
  return [c[0] * f, c[1] * f, c[2] * f]
}

const lum = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]

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

  // Draw a unit at UNIT_SCALE about its own position: a stand-in camera
  // that shrinks every point (and pixel size) toward the unit.
  atUnitScale(u, fn) {
    const real = this.cam
    const s = UNIT_SCALE
    const proxy = Object.create(real)
    proxy.k = real.k * s
    proxy.P = (x, y, z = 0) => {
      real.P(u.x + (x - u.x) * s, u.y + (y - u.y) * s, u.z + (z - u.z) * s)
      proxy.sx = real.sx
      proxy.sy = real.sy
    }
    this.cam = proxy
    try {
      fn()
    } finally {
      this.cam = real
    }
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
  // `tex` ('stone' or 'wood') maps a texture onto the faces instead of a
  // flat colour, shaded to match the colour it replaces.
  // z0 and z1 may be functions (x, y) => z for blocks that follow a slope.
  box(x0, y0, x1, y1, z0, z1, side, top, skip = 0, outline = true, tex = null) {
    const { ctx, cam } = this
    const cx = [x0, x1, x1, x0]
    const cy = [y0, y0, y1, y1]
    const zb = typeof z0 === 'function' ? cx.map((x, k) => z0(x, cy[k])) : [z0, z0, z0, z0]
    const zt = typeof z1 === 'function' ? cx.map((x, k) => z1(x, cy[k])) : [z1, z1, z1, z1]
    const texLum = tex ? TEXTURE_LUM[tex] : 0
    if (cam.cosE > 0.01) {
      for (let s = 0; s < 4; s++) {
        if (skip & (1 << s)) continue
        const [nx, ny, a, b] = SIDES[s]
        if (!cam.faceVisible(nx, ny)) continue
        this.poly([cx[a], cy[a], zb[a], cx[b], cy[b], zb[b], cx[b], cy[b], zt[b], cx[a], cy[a], zt[a]])
        if (tex) this.texFace(cx[a], cy[a], cx[b], cy[b], tex, (faceShade(nx, ny) * lum(side)) / texLum)
        else {
          ctx.fillStyle = rgb(side, faceShade(nx, ny))
          ctx.fill()
        }
      }
    }
    this.poly([x0, y0, zt[0], x1, y0, zt[1], x1, y1, zt[2], x0, y1, zt[3]])
    const zm = (zt[0] + zt[1] + zt[2] + zt[3]) / 4
    if (tex) this.texTop(zm, tex === 'wood' ? 'wood' : 'flag', lum(top) / TEXTURE_LUM[tex === 'wood' ? 'wood' : 'flag'])
    else {
      ctx.fillStyle = rgb(top)
      ctx.fill()
    }
    if (outline) {
      ctx.strokeStyle = 'rgba(30,24,16,0.35)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  pattern(name) {
    this.patterns ||= {}
    if (!this.patterns[name]) {
      const src = name === 'stone' ? stoneTexture() : name === 'flag' ? flagstoneTexture() : woodTexture()
      this.patterns[name] = this.ctx.createPattern(src, 'repeat')
    }
    return this.patterns[name]
  }

  // Fill the current path (a vertical face from a to b) with a texture laid
  // in the face's own plane: u runs along the wall, v down from the top.
  // u starts at the wall's world position so courses continue across tiles.
  texFace(ax, ay, bx, by, tex, factor) {
    const { ctx, cam } = this
    const len = Math.hypot(bx - ax, by - ay)
    if (len < 1e-6) return
    cam.P(ax, ay, 0)
    const ox = cam.sx
    const oy = cam.sy
    cam.P(bx, by, 0)
    const ux = (cam.sx - ox) / len
    const uy = (cam.sy - oy) / len
    cam.P(ax, ay, -1)
    const vx = cam.sx - ox
    const vy = cam.sy - oy
    const u0 = (ax * (bx - ax) + ay * (by - ay)) / len
    const k = this.dpr / TEXTURE_PX
    ctx.save()
    ctx.setTransform(ux * k, uy * k, vx * k, vy * k, this.dpr * (ox - ux * u0), this.dpr * (oy - uy * u0))
    ctx.fillStyle = this.pattern(tex)
    ctx.fill()
    ctx.restore()
    this.shadeFill(factor)
  }

  // Fill the current path (a horizontal face at height z) with a texture in
  // world x/y, using the camera's ground transform lifted to that height.
  texTop(z, tex, factor) {
    const { ctx, cam } = this
    const kk = cam.k
    const a = cam.cosT * kk
    const b = cam.sinT * cam.sinE * kk
    const c = -cam.sinT * kk
    const d = cam.cosT * cam.sinE * kk
    const e = cam.vw / 2 - (cam.fx * a + cam.fy * c)
    const f = cam.vh / 2 - (cam.fx * b + cam.fy * d) - z * cam.cosE * kk
    const s = this.dpr / TEXTURE_PX
    ctx.save()
    ctx.setTransform(a * s, b * s, c * s, d * s, this.dpr * e, this.dpr * f)
    ctx.fillStyle = this.pattern(tex)
    ctx.fill()
    ctx.restore()
    this.shadeFill(factor)
  }

  // Darken the current path so a texture matches the face's lighting.
  shadeFill(factor) {
    const a = Math.max(0, Math.min(0.85, 1 - factor))
    if (a < 0.01) return
    this.ctx.fillStyle = `rgba(16,12,8,${a.toFixed(3)})`
    this.ctx.fill()
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

    // Sprite animation clock: game time, so pauses and fast-forward apply.
    this.dt = this.lastTime === undefined ? 0 : Math.min(0.1, Math.max(0, game.time - this.lastTime))
    this.lastTime = game.time
    this.anims ??= new Map()
    this.spriteSeen = new Set()

    this.drawGround(world, game.time)
    // Grid lines only help in the top-down view; hide them once the camera tilts.
    if (ui.showGrid && this.cam.sinE > 0.97) this.drawGrid(world)
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
    this.barred = game.gateLocks

    const order = []
    for (let i = 0; i < world.tiles.length; i++) {
      const t = world.tiles[i]
      const hasContent = t.type !== 'grass' || this.slopes[i] || units.has(i)
      if (!hasContent) continue
      const x = i % world.w
      const y = (i / world.w) | 0
      if (!this.onScreen(x + 0.5, y + 0.5)) continue
      order.push({ d: cam.depth(x + 0.5, y + 0.5), i, x, y })
    }
    // Ladders against walls and ladders lying where they fell slot into
    // the same order by their midpoints.
    for (const l of game.ladders) {
      const g = game.ladderGeom(l)
      order.push({ d: cam.depth((g.fx + g.tx) / 2, (g.fy + g.ty) / 2), ladder: g })
    }
    for (const f of game.fallen) order.push({ d: cam.depth(f.x, f.y) - 0.01, fallen: f })
    // The fallen play out their death where they dropped.
    for (const st of this.anims.values()) if (st.dying > 0) order.push({ d: cam.depth(st.x, st.y), corpse: st })
    order.sort((a, b) => a.d - b.d)
    for (const { i, x, y, ladder, fallen, corpse } of order) {
      if (corpse) {
        this.atUnitScale(corpse, () => {
          this.ellipse(corpse.x, corpse.y, corpse.z, 0.18 * corpse.scale, `rgba(0,0,0,${(0.3 * Math.min(1, corpse.dying)).toFixed(3)})`)
          this.ctx.globalAlpha = Math.min(1, corpse.dying * 2)
          this.blitSprite(corpse.id, 'death', corpse.anim.frame, corpse.x, corpse.y, corpse.z, corpse.heading, corpse.scale, false)
          this.ctx.globalAlpha = 1
        })
        continue
      }
      if (ladder) {
        this.drawLadder(ladder.fx, ladder.fy, ladder.fz, ladder.tx, ladder.ty, ladder.tz)
        continue
      }
      if (fallen) {
        const z = world.heightAt(fallen.x, fallen.y) + 0.03
        const [dx, dy] = fallen.dir
        this.drawLadder(fallen.x + dx * 0.55, fallen.y + dy * 0.55, z, fallen.x - dx * 0.55, fallen.y - dy * 0.55, z)
        continue
      }
      const ground = world.groundElev(i)
      if (this.slopes[i]) this.drawSlope(world, i, x, y)
      // A rock under a wall: the wall rises out of it but tops out at its
      // usual height, so the rock just shortens the visible wall face.
      const t = world.tiles[i]
      this.footZ = t.rock ? world.baseElev(i) : null
      this.minFoot = world.minGround(i)
      if (t.rock) this.drawFoundation(x, y, ground, this.footZ, t.v)
      this.drawTile(world, i, x, y, ground, game.time)
      if (t.oil || t.rocks) this.drawDrops(world, i, x, y)
      this.footZ = null
      const here = units.get(i)
      if (!here) continue
      here.sort((a, b) => cam.depth(a.u.x, a.u.y) - cam.depth(b.u.x, b.u.y))
      for (const { u, kind } of here)
        this.atUnitScale(u, () => {
          if (kind === 0) this.drawEnemy(u, game.time)
          else if (kind === 1) this.drawArcher(u, game.time)
          else this.drawSwordsman(u)
        })
    }

    this.sweepSprites()

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
    // Grid lines only help in the top-down view; hide them once the camera tilts.
    if (ui.showGrid && this.cam.sinE > 0.97) this.drawGrid(world)
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
    const sig = (terrainReady() ? 'T' : 'F') + world.tiles.map((t) => t.terrain[0] + t.type + (t.rock ? 'r' : '')).join(',')
    if (sig !== this.groundSig) {
      this.groundSig = sig
      this.bakeGround(world)
      this.slopes = new Uint8Array(world.tiles.length)
      for (let i = 0; i < world.tiles.length; i++) this.slopes[i] = world.sloped(i) ? 1 : 0
      this.groundPattern = null
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
        case 'gatehouse':
          r(0, 0, 1, 1, STRUCTURES.gatehouse.height + 0.35)
          break
        case 'tower':
          r(0.04, 0.04, 0.96, 0.96, STRUCTURES.tower.height)
          break
        case 'keep':
          if (x === k.x && y === k.y) out.push([x, y, x + 3, y + 3, KEEP.height])
          break
        case 'tree': {
          // Round shadows sized to each tree's own canopy.
          const sp = treeSpec(t.v, x, y, t.terrain === 'hill')
          const rr = sp.radius * 0.8
          out.push([x + sp.cx - rr, y + sp.cy - rr, x + sp.cx + rr, y + sp.cy + rr, sp.height, true])
          break
        }
        case 'rock':
          for (const b of rockSpec(t.v, x, y)) {
            const rr = b.size * 0.45
            out.push([x + b.dx - rr, y + b.dy - rr, x + b.dx + rr, y + b.dy + rr, b.height, true])
          }
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
    const painted = terrainReady()
    const S = painted ? GROUND_PX : 24 // texture pixels per tile
    const { w, h } = world
    this.groundW = w
    const cv = (this.groundCanvas ||= document.createElement('canvas'))
    cv.width = w * S
    cv.height = h * S
    const g = cv.getContext('2d')
    if (painted) {
      // Photographic ground, repainted only when the landscape or moats
      // change; shadows go on a fresh copy every bake.
      const key = world.tiles.map((t) => t.terrain[0] + (t.type === 'moat' ? 'm' : '')).join('')
      if (key !== this.terrainKey) {
        this.terrainKey = key
        this.terrainCanvas = paintTerrain(world, { shade: true })
      }
      g.drawImage(this.terrainCanvas, 0, 0)
      this.bakeShadows(world, g, S)
      return
    }
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

    this.bakeShadows(world, g, S)
  }

  // Shadows cast away from the sun, plus a little contact darkening, drawn
  // into their own layer and softened by stacking offset copies.
  bakeShadows(world, g, S) {
    const cv = g.canvas
    const sh = (this.shadowCanvas ||= document.createElement('canvas'))
    sh.width = cv.width
    sh.height = cv.height
    const s = sh.getContext('2d')
    s.clearRect(0, 0, sh.width, sh.height)
    s.fillStyle = '#000'
    const ox = -SUN[0] * 0.45
    const oy = -SUN[1] * 0.45
    for (const [x0, y0, x1, y1, hgt, round] of this.shadowCasters(world)) {
      if (round) {
        // Canopies and boulders: a soft oval thrown away from the sun.
        const rx = ((x1 - x0) / 2) * S
        const ry = ((y1 - y0) / 2) * S
        for (let f = 0.3; f <= 1.001; f += 0.35) {
          s.beginPath()
          s.ellipse(((x0 + x1) / 2 + ox * hgt * f) * S, ((y0 + y1) / 2 + oy * hgt * f) * S, rx, ry, 0, 0, Math.PI * 2)
          s.fill()
        }
        continue
      }
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
    const blur = Math.max(1, Math.round(S / 12))
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) g.drawImage(sh, dx * blur, dy * blur)
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

  // Smooth ground on and around hills: the tile is drawn as a fan of
  // triangles around its centre, textured with the baked ground and shaded
  // by how each facet faces the sun.
  drawSlope(world, i, x, y) {
    const c = world.groundElev(i)
    const e = [
      (c + world.groundAt(x, y - 1)) / 2,
      (c + world.groundAt(x + 1, y)) / 2,
      (c + world.groundAt(x, y + 1)) / 2,
      (c + world.groundAt(x - 1, y)) / 2,
    ]
    const k = [world.cornerHeight(x, y), world.cornerHeight(x + 1, y), world.cornerHeight(x + 1, y + 1), world.cornerHeight(x, y + 1)]
    // Ring around the centre: NW, N, NE, E, SE, S, SW, W.
    const ring = [
      [x, y, k[0]], [x + 0.5, y, e[0]], [x + 1, y, k[1]], [x + 1, y + 0.5, e[1]],
      [x + 1, y + 1, k[2]], [x + 0.5, y + 1, e[2]], [x, y + 1, k[3]], [x, y + 0.5, e[3]],
    ]
    if (ring.every((p) => p[2] === c)) {
      if (c === 0) return
      this.groundTri([x, y, c], [x + 1, y, c], [x + 1, y + 1, c], [x, y + 1, c])
      return
    }
    const mid = [x + 0.5, y + 0.5, c]
    for (let n = 0; n < 8; n++) this.groundTri(mid, ring[n], ring[(n + 1) % 8])
  }

  // Fill a ground facet (3 or 4 coplanar world points) with the baked
  // ground texture, mapped by the affine that takes world x/y to screen.
  groundTri(...pts) {
    const { ctx, cam } = this
    const scr = pts.map(([x, y, z]) => {
      cam.P(x, y, z)
      return [cam.sx, cam.sy]
    })
    const [A, B, C] = pts
    const [sa, sb, sc] = scr
    const det = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])
    if (Math.abs(det) < 1e-9) return
    // Solve screen = M * (x, y, 1) from the three points.
    const ux = ((sb[0] - sa[0]) * (C[1] - A[1]) - (sc[0] - sa[0]) * (B[1] - A[1])) / det
    const vx = ((sc[0] - sa[0]) * (B[0] - A[0]) - (sb[0] - sa[0]) * (C[0] - A[0])) / det
    const uy = ((sb[1] - sa[1]) * (C[1] - A[1]) - (sc[1] - sa[1]) * (B[1] - A[1])) / det
    const vy = ((sc[1] - sa[1]) * (B[0] - A[0]) - (sb[1] - sa[1]) * (C[0] - A[0])) / det
    const ox = sa[0] - ux * A[0] - vx * A[1]
    const oy = sa[1] - uy * A[0] - vy * A[1]
    // Path in screen space, nudged outward half a pixel to hide seams.
    let mx = 0
    let my = 0
    for (const p of scr) {
      mx += p[0] / scr.length
      my += p[1] / scr.length
    }
    ctx.beginPath()
    scr.forEach(([px, py], n) => {
      const dx = px - mx
      const dy = py - my
      const d = Math.hypot(dx, dy) || 1
      const qx = px + (dx / d) * 0.6
      const qy = py + (dy / d) * 0.6
      if (n === 0) ctx.moveTo(qx, qy)
      else ctx.lineTo(qx, qy)
    })
    ctx.closePath()
    this.groundPattern ||= ctx.createPattern(this.groundCanvas, 'no-repeat')
    const S = this.groundCanvas.width / this.groundW
    const d = this.dpr / S
    ctx.save()
    ctx.setTransform(ux * d, uy * d, vx * d, vy * d, this.dpr * ox, this.dpr * oy)
    ctx.fillStyle = this.groundPattern
    ctx.fill()
    ctx.restore()
    // Sun shading: facets tilted toward the sun lighten, away darken.
    const ax = B[0] - A[0], ay = B[1] - A[1], az = B[2] - A[2]
    const bx = C[0] - A[0], by = C[1] - A[1], bz = C[2] - A[2]
    let nx = ay * bz - az * by
    let ny = az * bx - ax * bz
    let nz = ax * by - ay * bx
    const nl = Math.hypot(nx, ny, nz) || 1
    if (nz < 0) {
      nx = -nx
      ny = -ny
    }
    const lit = ((nx * SUN[0] + ny * SUN[1]) / nl) * 0.9
    // Painted ground has smooth sunlight baked in; only the fallback needs it.
    if (!terrainReady() && Math.abs(lit) > 0.01) {
      ctx.fillStyle = lit > 0 ? `rgba(255,248,220,${(lit * 0.35).toFixed(3)})` : `rgba(12,18,8,${(-lit * 0.75).toFixed(3)})`
      ctx.fill()
    }
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
  thinWall(world, x, y, z, h, width, c, f, hoard = false, tex = null) {
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
    // The wall follows the ground: its top runs along the slope of the
    // centre line, its foot along the ground (or the rock it's bedded in).
    const top = (px, py) => (Math.abs(px - cx) >= Math.abs(py - cy) ? world.heightAt(px, cy) : world.heightAt(cx, py)) + h
    const foot = this.footZ ?? ((px, py) => world.heightAt(px, py))
    for (const p of parts) this.box(p[0], p[1], p[2], p[3], foot, top, scale(c.side, f), scale(c.top, f), 0, false, tex)
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
    this.rails(rails, top)
  }

  // `z` is a height or a function (x, y) => height.
  rails(list, z) {
    const cam = this.cam
    const z0 = typeof z === 'function' ? z : () => z
    list.sort((a, b) => cam.depth((a[0] + a[2]) / 2, (a[1] + a[3]) / 2) - cam.depth((b[0] + b[2]) / 2, (b[1] + b[3]) / 2))
    for (const r of list) this.box(r[0], r[1], r[2], r[3], z0, (px, py) => z0(px, py) + 0.3, COLORS.hoard, scale(COLORS.hoard, 1.25), 0, true)
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
        this.thinWall(world, x, y, z, d.height, d.thin, COLORS.palisade, f, false, 'wood')
        break
      }
      case 'wall': {
        const d = STRUCTURES.wall
        this.thinWall(world, x, y, z, d.height, d.thin, COLORS.wall, f, t.hoard, 'stone')
        this.drawWaterArch(world, i, x, y, d.thin / 2)
        break
      }
      case 'thick': {
        const h = STRUCTURES.thick.height
        const c = COLORS.thick
        const top = (px, py) => world.heightAt(px, py) + h
        const foot = this.footZ ?? ((px, py) => world.heightAt(px, py))
        this.box(x, y, x + 1, y + 1, foot, top, scale(c.side, f), scale(c.top, f), this.hiddenSides(world, x, y, h), false, 'stone')
        this.poly([x + 0.24, y + 0.24, top(x + 0.24, y + 0.24), x + 0.76, y + 0.24, top(x + 0.76, y + 0.24), x + 0.76, y + 0.76, top(x + 0.76, y + 0.76), x + 0.24, y + 0.76, top(x + 0.24, y + 0.76)])
        this.ctx.fillStyle = 'rgba(0,0,0,0.1)'
        this.ctx.fill()
        // Battlements on sides that face open ground.
        let edges = 0
        for (let s = 0; s < 4; s++) if (!this.connects(world, x, y, s)) edges |= 1 << s
        if (t.hoard) this.edgeRails(x, y, x + 1, y + 1, top, edges)
        else this.merlons(x, y, x + 1, y + 1, top, c, edges)
        this.drawWaterArch(world, i, x, y, 0.5)
        break
      }
      case 'tower': {
        const h = STRUCTURES.tower.height
        const c = COLORS.tower
        this.box(x + 0.04, y + 0.04, x + 0.96, y + 0.96, this.footZ ?? this.minFoot ?? z, z + h, scale(c.side, f), scale(c.top, f), 0, true, 'stone')
        if (t.hoard) this.edgeRails(x + 0.04, y + 0.04, x + 0.96, y + 0.96, z + h, 15)
        else this.merlons(x + 0.04, y + 0.04, x + 0.96, y + 0.96, z + h, c, 15)
        break
      }
      case 'keep': {
        const k = world.keep
        const h = KEEP.height
        const c = COLORS.keep
        this.box(x, y, x + 1, y + 1, z, z + h, c.side, c.top, this.hiddenSides(world, x, y, h), false, 'stone')
        // Each tile draws its share of the inner roof so painter order holds.
        const rx0 = Math.max(x, k.x + 0.4)
        const ry0 = Math.max(y, k.y + 0.4)
        const rx1 = Math.min(x + 1, k.x + 2.6)
        const ry1 = Math.min(y + 1, k.y + 2.6)
        this.poly([rx0, ry0, z + h, rx1, ry0, z + h, rx1, ry1, z + h, rx0, ry1, z + h])
        this.ctx.fillStyle = 'rgba(0,0,0,0.12)'
        this.ctx.fill()
        let edges = 0
        if (y === k.y) edges |= 1
        if (x === k.x + 2) edges |= 2
        if (y === k.y + 2) edges |= 4
        if (x === k.x) edges |= 8
        this.merlons(x, y, x + 1, y + 1, z + h, c, edges)
        if (i === k.door) this.drawKeepDoor(k, x, y, z)
        if (x === k.x + 1 && y === k.y + 1) {
          this.flag(x + 0.5, y + 0.5, z + h, time)
          this.atUnitScale({ x: x + 0.85, y: y + 0.8, z: z + h }, () => this.drawLord(x + 0.85, y + 0.8, z + h, k))
        }
        break
      }
      case 'pikes':
        this.drawPikes(world, x, y, this.footZ ?? z, f)
        break
      case 'stair':
        this.drawStair(world, i, x, y)
        break
      case 'moat':
        if (t.fill > 0) {
          // Earth and brush thrown in by the attackers.
          const f = Math.min(1, t.fill / MOAT.fill)
          this.ellipse(x + 0.5, y + 0.5, 0.02, 0.15 + f * 0.35, `rgba(104,82,52,${(0.4 + f * 0.5).toFixed(3)})`)
        }
        break
      case 'gate':
      case 'gatehouse':
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
      case 'tree':
        if (floraReady()) this.drawTree(treeSpec(t.v, x, y, t.terrain === 'hill'), x, y, world)
        else {
          const v = t.v
          const cx = x + 0.5 + (v - 0.5) * 0.2
          const cy = y + 0.5 + (((v * 7) % 1) - 0.5) * 0.2
          this.box(cx - 0.07, cy - 0.07, cx + 0.07, cy + 0.07, z, z + 0.55, COLORS.trunk, COLORS.trunk, 0, false)
          this.ball(cx, cy, z + 0.95, 0.42, rgb(COLORS.leaf, 0.9 + v * 0.2), 'rgba(10,30,10,0.5)')
        }
        break
      case 'rock':
        if (floraReady()) this.drawRocks(rockSpec(t.v, x, y), x, y, world)
        else {
          const c = COLORS.rock
          this.box(x + 0.12, y + 0.16, x + 0.88, y + 0.86, z, z + 0.35 + t.v * 0.3, c.side, c.top)
        }
        break
    }
  }

  // A tree: bark trunk, then leaf clumps (or fir tiers) back to front. Seen
  // from straight above, firs show their star of needles instead.
  drawTree(spec, x, y, world) {
    const { ctx, cam } = this
    const sp = floraSprites()
    const bx = x + spec.cx
    const by = y + spec.cy
    const z = world.heightAt(bx, by)
    const k = cam.k
    const fromAbove = cam.sinE > 0.86
    if (!fromAbove) {
      const top = spec.clumps[0]
      cam.P(bx, by, z)
      const x0 = cam.sx
      const y0 = cam.sy
      cam.P(bx + (top?.dx || 0) * 0.5, by + (top?.dy || 0) * 0.5, z + spec.trunk)
      ctx.lineCap = 'round'
      ctx.strokeStyle = spec.species === 'pine' ? '#4a2f1c' : '#5a3d24'
      ctx.lineWidth = Math.max(1.5, spec.trunkR * 2 * k)
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(cam.sx, cam.sy)
      ctx.stroke()
      ctx.strokeStyle = 'rgba(255,230,190,0.18)'
      ctx.lineWidth = Math.max(0.6, spec.trunkR * 0.7 * k)
      ctx.beginPath()
      ctx.moveTo(x0 - spec.trunkR * 0.4 * k, y0)
      ctx.lineTo(cam.sx - spec.trunkR * 0.4 * k, cam.sy)
      ctx.stroke()
    }
    if (spec.species === 'pine') {
      if (fromAbove) {
        for (const [n, c] of spec.clumps.entries()) {
          if (n % 2) continue
          cam.P(bx + c.dx, by + c.dy, z + c.dz)
          const s = c.size * k * 1.05
          ctx.drawImage(sp.pineTop[c.variant], cam.sx - s / 2, cam.sy - s / 2, s, s)
        }
        return
      }
      for (const c of spec.clumps) {
        cam.P(bx + c.dx, by + c.dy, z + c.dz)
        const w = c.size * k
        const h = w * 0.75
        ctx.drawImage(sp.pineSide[c.variant], cam.sx - w / 2, cam.sy - h * 0.55, w, h)
      }
      return
    }
    const set = spec.species === 'oak' ? sp.oak : sp.beech
    const order = spec.clumps.map((c) => ({ c, d: cam.depth(bx + c.dx, by + c.dy) + c.dz * 0.35 }))
    order.sort((a, b) => a.d - b.d)
    for (const { c } of order) {
      cam.P(bx + c.dx, by + c.dy, z + c.dz)
      const s = c.size * k
      ctx.drawImage(set[c.variant], cam.sx - s / 2, cam.sy - s / 2, s, s)
    }
  }

  // A rock outcrop: boulders and stones, back to front.
  drawRocks(list, x, y, world) {
    const { ctx, cam } = this
    const sp = floraSprites()
    const sorted = [...list].sort((a, b) => cam.depth(x + a.dx, y + a.dy) - cam.depth(x + b.dx, y + b.dy))
    for (const r of sorted) {
      const px = x + r.dx
      const py = y + r.dy
      cam.P(px, py, world.heightAt(px, py))
      const w = r.size * cam.k
      // Taller when seen from the side, a rounder footprint from above.
      const h = w * (0.62 + (1 - cam.sinE) * 0.35 + r.height * 0.3)
      ctx.drawImage(sp.rocks[r.variant], cam.sx - w / 2, cam.sy - h * 0.82, w, h)
    }
  }

  // Oil cauldron and rock bucket on top of a wall (empty once used).
  drawDrops(world, i, x, y) {
    const t = world.tiles[i]
    const cx = x + 0.5
    const cy = y + 0.5
    if (t.oil) {
      const z = world.surfaceAt(i, cx - 0.18, cy - 0.12)
      this.box(cx - 0.3, cy - 0.24, cx - 0.06, cy, z, z + 0.18, [54, 50, 46], [70, 66, 60], 0, true)
      if (!t.oilUsed) {
        this.ellipse(cx - 0.18, cy - 0.12, z + 0.19, 0.1, 'rgb(150,96,24)')
        this.ball(cx - 0.18, cy - 0.12, z + 0.32 + Math.sin(Date.now() / 300 + x) * 0.03, 0.05, 'rgba(230,230,225,0.45)')
      }
    }
    if (t.rocks) {
      const z = world.surfaceAt(i, cx + 0.16, cy + 0.12)
      this.box(cx + 0.04, cy, cx + 0.3, cy + 0.26, z, z + 0.14, [112, 80, 46], [138, 100, 60], 0, true)
      if (!t.rocksUsed)
        for (const [ox, oy] of [[0.11, 0.08], [0.21, 0.1], [0.15, 0.18]]) this.ball(cx + ox, cy + oy, z + 0.19, 0.05, '#8d877c', '#3a352e')
    }
  }

  // A flight of stone steps rising to the rampart it's built against.
  drawStair(world, i, x, y) {
    const f = world.stairFace(i)
    const cx = x + 0.5
    const cy = y + 0.5
    const n = 4
    let dx = 0
    let dy = 1
    let top = world.elev(i) + 0.4
    if (f >= 0) {
      dx = (f % world.w) - x
      dy = ((f / world.w) | 0) - y
      top = world.surfaceAt(f, cx + dx * 0.5, cy + dy * 0.5)
    }
    const c = COLORS.wall
    const steps = []
    for (let k = 0; k < n; k++) {
      // Step k spans [a, b] along the climb direction, measured from the far edge.
      const a = -0.5 + k / n
      const b = -0.5 + (k + 1) / n
      const hw = 0.3
      const x0 = dx ? cx + Math.min(a * dx, b * dx) : cx - hw
      const x1 = dx ? cx + Math.max(a * dx, b * dx) : cx + hw
      const y0 = dy ? cy + Math.min(a * dy, b * dy) : cy - hw
      const y1 = dy ? cy + Math.max(a * dy, b * dy) : cy + hw
      steps.push([x0, y0, x1, y1, (k + 1) / n])
    }
    const cam = this.cam
    steps.sort((p, q) => cam.depth((p[0] + p[2]) / 2, (p[1] + p[3]) / 2) - cam.depth((q[0] + q[2]) / 2, (q[1] + q[3]) / 2))
    const ground = (px, py) => world.heightAt(px, py)
    for (const [x0, y0, x1, y1, h] of steps) {
      const g = world.heightAt((x0 + x1) / 2, (y0 + y1) / 2)
      this.box(x0, y0, x1, y1, ground, g + (top - g) * h, c.side, c.top, 0, true, 'stone')
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

  // Gates and gatehouses. A broken gate has lost only its door: the stone
  // arch stands open over a litter of splintered planks.
  drawGate(world, i, x, y, z, f) {
    const t = world.tiles[i]
    const big = t.type === 'gatehouse'
    const h = STRUCTURES[t.type].height
    const c = COLORS.thick
    const side = scale(c.side, f)
    const top = scale(c.top, f)
    const alongX = this.axisX(world, x, y, (ty) => WALL_FAMILY.has(ty))
    const fz = this.footZ ?? this.minFoot ?? z
    // Rectangles in the gate's own frame: u runs along the wall, v across.
    const R = (u0, v0, u1, v1) => (alongX ? [x + u0, y + v0, x + u1, y + v1] : [x + v0, y + u0, x + v1, y + u1])
    const open = t.broken || this.openGates?.has(i)
    const arch = big ? 1.15 : 0.85
    const parts = []
    if (big) {
      // Twin towers flanking the passage, rising above the gate's roof.
      parts.push([...R(0, 0, 0.34, 1), fz, z + h + 0.35, side, top, 'tower'])
      parts.push([...R(0.66, 0, 1, 1), fz, z + h + 0.35, side, top, 'tower'])
      parts.push([...R(0.34, 0.06, 0.66, 0.94), z + arch, z + h, side, top])
    } else {
      parts.push([...R(0, 0.12, 0.3, 0.88), fz, z + h, side, top])
      parts.push([...R(0.7, 0.12, 1, 0.88), fz, z + h, side, top])
      parts.push([...R(0.3, 0.12, 0.7, 0.88), z + arch, z + h, side, top])
    }
    const u0 = big ? 0.34 : 0.3
    const u1 = big ? 0.66 : 0.7
    if (!open) parts.push([...R(u0, 0.44, u1, 0.56), fz, z + arch, COLORS.door, scale(COLORS.door, 1.2)])
    else if (t.broken) this.splinters(R, z, i)
    const cam = this.cam
    parts.sort((a, b) => cam.depth((a[0] + a[2]) / 2, (a[1] + a[3]) / 2) - cam.depth((b[0] + b[2]) / 2, (b[1] + b[3]) / 2))
    if (this.barred?.has(i) && !open) {
      // Barred: a heavy beam across the door on both faces.
      const bz = fz + 0.42
      parts.push([...R(u0 - 0.04, 0.38, u1 + 0.04, 0.62), bz, bz + 0.1, [70, 64, 58], [96, 90, 82]])
    }
    for (const p of parts) {
      this.box(...p.slice(0, 8), 0, true, p[6] === side ? 'stone' : null)
      if (p[8] === 'tower') {
        if (t.hoard) this.edgeRails(p[0], p[1], p[2], p[3], p[5], 15)
        else this.merlons(p[0], p[1], p[2], p[3], p[5], c, 15)
      }
    }
    if (big) {
      // The portcullis: an iron grate hanging in the arch on the side
      // facing the camera, down when the gate holds, up when it's broken.
      const near = cam.depth(...R(0.5, 0.03, 0.5, 0.03).slice(0, 2)) > cam.depth(...R(0.5, 0.97, 0.5, 0.97).slice(0, 2))
      const v = near ? 0.04 : 0.96
      const bottom = open ? z + arch - 0.25 : fz
      const w = Math.max(1, cam.k * 0.03)
      for (let k = 1; k < 6; k++) {
        const [px, py] = R(u0 + ((u1 - u0) * k) / 6, v, 0, 0)
        this.line(px, py, bottom, px, py, z + arch, '#2b2a28', w)
      }
      for (let zz = bottom + 0.2; zz < z + arch; zz += 0.28) {
        const [ax, ay] = R(u0, v, 0, 0)
        const [bx, by] = R(u1, v, 0, 0)
        this.line(ax, ay, zz, bx, by, zz, '#2b2a28', w)
      }
    }
    if (t.hoard && !big) {
      if (alongX) this.edgeRails(x, y + 0.12, x + 1, y + 0.88, z + h, 5)
      else this.edgeRails(x + 0.12, y, x + 0.88, y + 1, z + h, 10)
    }
  }

  // Where a wall stands in water, an arch at its foot lets the water
  // through, shut by an iron grate that runs down into the water.
  drawWaterArch(world, i, x, y, hw) {
    const axis = world.waterArch(i)
    const cam = this.cam
    if (!axis || cam.cosE < 0.05) return
    const cx = x + 0.5
    const cy = y + 0.5
    // Draw on whichever face of the wall looks toward the camera.
    const front = axis === 'x'
      ? (cam.depth(cx, cy + 1) > cam.depth(cx, cy - 1) ? 1 : -1)
      : (cam.depth(cx + 1, cy) > cam.depth(cx - 1, cy) ? 1 : -1)
    const P = (u, zz) => (axis === 'x' ? [x + u, cy + front * (hw + 0.004), zz] : [cx + front * (hw + 0.004), y + u, zz])
    const zw = world.heightAt(cx, cy)
    const z0 = zw - 0.08
    const spring = zw + 0.32
    const r = 0.26
    const u0 = 0.5 - r
    const u1 = 0.5 + r
    const crown = (u) => spring + Math.sqrt(Math.max(0, r * r - (u - 0.5) * (u - 0.5)))
    const pts = [...P(u0, z0), ...P(u0, spring)]
    for (let k = 1; k < 10; k++) {
      const u = u0 + ((u1 - u0) * k) / 10
      pts.push(...P(u, crown(u)))
    }
    pts.push(...P(u1, spring), ...P(u1, z0))
    const ctx = this.ctx
    this.poly(pts)
    ctx.fillStyle = 'rgba(14,18,22,0.88)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(70,64,56,0.9)'
    ctx.lineWidth = Math.max(1, cam.k * 0.03)
    ctx.stroke()
    // Water running through, catching a little light.
    this.poly([...P(u0, z0), ...P(u0, zw + 0.06), ...P(u1, zw + 0.06), ...P(u1, z0)])
    ctx.fillStyle = 'rgba(52,104,132,0.7)'
    ctx.fill()
    const w = Math.max(1, cam.k * 0.035)
    for (let k = 1; k < 6; k++) {
      const u = u0 + ((u1 - u0) * k) / 6
      this.line(...P(u, z0), ...P(u, crown(u)), '#3a3936', w)
    }
    for (const zz of [zw + 0.2, spring + 0.1]) {
      const span = Math.sqrt(Math.max(0, r * r - Math.max(0, zz - spring) ** 2))
      this.line(...P(0.5 - span, zz), ...P(0.5 + span, zz), '#3a3936', w)
    }
  }

  // Planks of a smashed door strewn through the gateway.
  splinters(R, z, i) {
    const ang = [0.4, -0.7, 1.3, 2.2]
    const at = [[0.42, 0.3], [0.58, 0.62], [0.47, 0.78], [0.55, 0.22]]
    for (let k = 0; k < 4; k++) {
      const [px, py] = R(at[k][0], at[k][1], 0, 0)
      this.orientedBox(px, py, 0.16, 0.035, ang[k] + i, z, z + 0.04, COLORS.door, scale(COLORS.door, 1.15))
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

  // The keep's door on its south face: oak while it holds, a dark hole
  // with splinters once it's broken.
  drawKeepDoor(k, x, y, z) {
    if (!this.cam.faceVisible(0, 1)) return
    const fy = y + 1.002
    const x0 = x + 0.3
    const x1 = x + 0.7
    const hgt = 0.95
    this.poly([x0, fy, z, x1, fy, z, x1, fy, z + hgt * 0.8, x + 0.5, fy, z + hgt, x0, fy, z + hgt * 0.8])
    const broken = k.doorHp <= 0
    const f = 0.6 + 0.4 * (k.doorHp / k.doorMax)
    this.ctx.fillStyle = broken ? 'rgb(24,18,14)' : rgb(COLORS.door, f)
    this.ctx.fill()
    this.ctx.strokeStyle = 'rgba(30,20,10,0.8)'
    this.ctx.lineWidth = Math.max(1, this.cam.k * 0.03)
    this.ctx.stroke()
    if (broken) {
      for (const [ax, az, bx, bz] of [[0.32, 0.2, 0.42, 0.55], [0.68, 0.1, 0.6, 0.6], [0.36, 0.75, 0.5, 0.62]])
        this.line(x + ax, fy, z + az, x + bx, fy, z + bz, rgb(COLORS.door, 1.1), Math.max(1.5, this.cam.k * 0.05))
    } else {
      for (const bz of [0.25, 0.6]) this.line(x0, fy, z + bz, x1, fy, z + bz, 'rgba(40,30,20,0.9)', Math.max(1, this.cam.k * 0.04))
    }
  }

  // The lord on the keep roof: what the attackers are after.
  drawLord(x, y, z, k) {
    const hurt = k.hp < k.maxHp && (k.inside > 0)
    this.ellipse(x, y, z, 0.14, 'rgba(0,0,0,0.3)')
    const lord = this.lordSpot ?? (this.lordSpot = {})
    Object.assign(lord, { x, y, z, hp: k.hp })
    const sprite = this.drawSprite('lord', 'lord', lord, Math.PI * 0.75, { fighting: k.inside > 0, flash: hurt && Math.sin(performance.now() / 50) > 0.3 })
    if (!sprite) {
      this.ball(x, y, z + 0.27, 0.14, hurt ? '#fff' : rgb(COLORS.lord), '#2a1030')
      this.ball(x, y, z + 0.5, 0.09, rgb(COLORS.skin), 'rgba(20,10,5,0.6)')
    }
    this.cam.P(x, y, z + (sprite ? 0.66 : 0.6))
    const s = Math.max(2, this.cam.k * 0.09)
    const { ctx } = this
    ctx.beginPath()
    ctx.moveTo(this.cam.sx - s, this.cam.sy)
    ctx.lineTo(this.cam.sx - s, this.cam.sy - s * 1.1)
    ctx.lineTo(this.cam.sx - s * 0.5, this.cam.sy - s * 0.5)
    ctx.lineTo(this.cam.sx, this.cam.sy - s * 1.2)
    ctx.lineTo(this.cam.sx + s * 0.5, this.cam.sy - s * 0.5)
    ctx.lineTo(this.cam.sx + s, this.cam.sy - s * 1.1)
    ctx.lineTo(this.cam.sx + s, this.cam.sy)
    ctx.closePath()
    ctx.fillStyle = rgb(COLORS.crown)
    ctx.fill()
  }

  // A ladder from (fx, fy, fz) to (tx, ty, tz): two rails and rungs.
  drawLadder(fx, fy, fz, tx, ty, tz) {
    const dx = tx - fx
    const dy = ty - fy
    const len = Math.hypot(dx, dy) || 1
    const px = (-dy / len) * 0.13
    const py = (dx / len) * 0.13
    const w = Math.max(1.2, this.cam.k * 0.045)
    const col = rgb(COLORS.ladder)
    const dark = rgb(COLORS.ladder, 0.7)
    const n = 6
    for (let r = 1; r < n; r++) {
      const f = r / n
      const x = fx + dx * f
      const y = fy + dy * f
      const z = fz + (tz - fz) * f
      this.line(x - px, y - py, z, x + px, y + py, z, dark, w * 0.8)
    }
    this.line(fx - px, fy - py, fz, tx - px, ty - py, tz, col, w)
    this.line(fx + px, fy + py, fz, tx + px, ty + py, tz, col, w)
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
    const zf = typeof z === 'function' ? z : () => z
    for (const [mx, my] of spots) {
      const mz = zf(mx, my)
      this.box(mx - s / 2, my - s / 2, mx + s / 2, my + s / 2, mz, mz + hgt, c.side, cap, 0, true)
    }
  }

  flag(x, y, z, time) {
    const top = z + 1.3
    this.line(x, y, z, x, y, top, '#2b2016', Math.max(1.5, this.cam.k * 0.05))
    const wave = Math.sin(time * 3) * 0.08
    this.poly([x, y, top, x + 0.7, y + wave, top - 0.18, x, y, top - 0.4])
    this.ctx.fillStyle = rgb(COLORS.player)
    this.ctx.fill()
  }

  // Draw a unit as an animated sprite (once the sheets are baked). Returns
  // false so the caller can fall back to the simple figure.
  drawSprite(key, id, unit, heading, { fighting = false, flash = false, height } = {}) {
    if (!spritesReady()) return false
    const k = `${id}:${key}`
    let st = this.anims.get(k)
    if (!st || st.unit !== unit) {
      st = { anim: new SpriteAnim(), unit, px: unit.x, py: unit.y, cd: unit.cd ?? 0 }
      this.anims.set(k, st)
    }
    this.spriteSeen.add(k)
    const dt = this.dt
    const x = unit.x
    const y = unit.y
    const moving = dt > 0 ? Math.hypot(x - st.px, y - st.py) / dt / UNIT_SCALE : 0
    st.px = x
    st.py = y
    if (unit.cd !== undefined) {
      if (unit.cd > st.cd + 0.05) st.anim.strike()
      st.cd = unit.cd
    }
    st.anim.update(dt, { moving, fighting })
    Object.assign(st, { id, x, y, z: unit.z, heading, scale: (height ?? LOOKS[id].height) / LOOKS[id].height })
    this.blitSprite(id, st.anim.anim, st.anim.frame, x, y, unit.z, heading, st.scale, flash)
    return true
  }

  // Sprites whose unit is gone: the dead fall where they stood, the rest
  // are forgotten.
  sweepSprites() {
    for (const [k, st] of this.anims) {
      if (this.spriteSeen.has(k)) continue
      if (st.dying === undefined && (st.unit.hp ?? 1) <= 0 && this.dt > 0) st.dying = 1.4
      if (st.dying > 0) {
        st.dying -= this.dt
        st.anim.update(this.dt, { dead: true })
        if (st.dying > 0) continue
      }
      this.anims.delete(k)
    }
  }

  // A stand-in unit for one of a ladder's two carriers, kept between frames.
  crewOf(e, o, x, y, z) {
    this.crew ??= new WeakMap()
    if (!this.crew.has(e)) this.crew.set(e, {})
    const men = this.crew.get(e)
    men[o] ??= {}
    return Object.assign(men[o], { x, y, z, hp: e.hp })
  }

  blitSprite(id, anim, frame, x, y, z, heading, scale, flash) {
    const { cam, ctx } = this
    // Facing in the camera's frame picks the sprite column.
    const c = Math.cos(heading)
    const s = Math.sin(heading)
    const fr = spriteFrame(id, anim, frame, Math.atan2(c * cam.sinT + s * cam.cosT, c * cam.cosT - s * cam.sinT))
    if (!fr) return
    const { cell, world, footY } = SPRITE
    cam.P(x, y, z)
    const px = (world / cell) * cam.k * scale
    const w = cell * px
    const dx = cam.sx - w / 2
    const dy = cam.sy - footY * px
    ctx.drawImage(fr.sheet, fr.sx, fr.sy, cell, cell, dx, dy, w, w)
    if (flash) {
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha *= 0.55
      ctx.drawImage(fr.sheet, fr.sx, fr.sy, cell, cell, dx, dy, w, w)
      ctx.globalAlpha /= 0.55
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  drawEnemy(e, time) {
    const { cam } = this
    const z = e.z
    if (e.type === 'catapult') {
      this.drawCatapult(e, time)
      return
    }
    this.ellipse(e.x, e.y, z, (e.r / UNIT_SCALE) * 1.1, 'rgba(0,0,0,0.3)')
    const hit = e.flash > 0
    if (e.type === 'ram') {
      const side = hit ? [255, 255, 255] : COLORS.ram
      this.orientedBox(e.x, e.y, 0.45, 0.26, e.heading, z + 0.05, z + 0.42, side, scale(side, 1.25))
      const hx = e.x + Math.cos(e.heading) * (0.45 + (e.attacking ? Math.abs(Math.sin(e.walk)) * 0.12 : 0))
      const hy = e.y + Math.sin(e.heading) * 0.45
      this.ball(hx, hy, z + 0.25, 0.1, '#555', '#222')
      return
    }
    if (e.type === 'ladder') {
      // Two raiders with a ladder on their shoulders (raised as they set it up).
      const hx = Math.cos(e.heading)
      const hy = Math.sin(e.heading)
      const color = rgb(hit ? [255, 255, 255] : COLORS.raider)
      const men = [[0.24, 0], [-0.24, Math.PI]]
      men.sort((a, b) => cam.depth(e.x + hx * a[0], e.y + hy * a[0]) - cam.depth(e.x + hx * b[0], e.y + hy * b[0]))
      for (const [o, ph] of men) {
        const mx = e.x + hx * o
        const my = e.y + hy * o
        if (spritesReady()) {
          // Each carrier is its own figure, walking alongside the ladder.
          this.drawSprite(`${e.id}:${o}`, 'raider', this.crewOf(e, o, mx, my, z), e.heading, { flash: hit, height: 0.56 })
          continue
        }
        const b = Math.abs(Math.sin(e.walk + ph)) * 0.05
        this.ball(mx, my, z + 0.28 + b, 0.17, color, 'rgba(20,10,5,0.7)')
        this.ball(mx, my, z + 0.55 + b, 0.1, rgb(COLORS.skin), 'rgba(20,10,5,0.6)')
      }
      const lift = Math.min(1, e.raising / 1.2) * 0.9
      this.drawLadder(e.x - hx * 0.5, e.y - hy * 0.5, z + 0.5, e.x + hx * 0.5, e.y + hy * 0.5, z + 0.5 + lift)
      return
    }
    if (this.drawSprite(e.id, e.type, e, e.heading, { fighting: e.attacking && e.type !== 'bowman', flash: hit })) return
    const color = hit ? [255, 255, 255] : COLORS[e.type]
    const bob = Math.abs(Math.sin(e.walk)) * 0.06
    const big = e.type === 'brute'
    if (e.type === 'bowman') {
      this.bow(e.x, e.y, z, e.heading, '#3b2a18')
      this.ball(e.x, e.y, z + 0.28 + bob, e.r / UNIT_SCALE, rgb(color), 'rgba(20,10,5,0.7)')
      this.ball(e.x, e.y, z + 0.52 + bob, (e.r / UNIT_SCALE) * 0.6, rgb(scale(COLORS.bowman, 0.7)), 'rgba(20,10,5,0.6)')
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
    this.ball(e.x, e.y, z + 0.3 + bob, e.r / UNIT_SCALE, rgb(color), 'rgba(20,10,5,0.7)')
    this.ball(e.x, e.y, z + 0.62 + bob, (e.r / UNIT_SCALE) * 0.55, big ? '#777' : rgb(COLORS.skin), 'rgba(20,10,5,0.6)')
  }

  drawArcher(a, time) {
    const { cam } = this
    const z = a.z
    const walking = a.path.length > 0
    const bob = walking ? Math.abs(Math.sin(time * 12 + a.id)) * 0.05 : 0
    this.ellipse(a.x, a.y, z, 0.15, 'rgba(0,0,0,0.3)')
    if (this.drawSprite(a.id, 'archer', a, a.heading, { flash: a.flash > 0 })) return
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
    this.ellipse(s.x, s.y, z, (s.r / UNIT_SCALE) * 1.1, 'rgba(0,0,0,0.3)')
    if (this.drawSprite(s.id, 'swordsman', s, s.heading, { fighting: s.fighting, flash: s.flash > 0 })) return
    const swing = s.fighting ? Math.sin(s.walk * 2) * 0.5 : 0.3
    const h = s.heading
    // Sword on the right hand, shield on the left.
    this.line(
      s.x + Math.cos(h + 1.2) * 0.12, s.y + Math.sin(h + 1.2) * 0.12, z + 0.4 + bob,
      s.x + Math.cos(h + swing) * 0.42, s.y + Math.sin(h + swing) * 0.42, z + 0.5 + bob,
      '#dfe4ea', Math.max(1.5, cam.k * 0.06),
    )
    this.ball(s.x, s.y, z + 0.3 + bob, s.r / UNIT_SCALE, s.flash > 0 ? '#fff' : rgb(COLORS.player), '#162440')
    this.ball(s.x + Math.cos(h - 1.1) * 0.17, s.y + Math.sin(h - 1.1) * 0.17, z + 0.32 + bob, 0.11, rgb(COLORS.shield), '#4a3a14')
    this.ball(s.x, s.y, z + 0.6 + bob, (s.r / UNIT_SCALE) * 0.55, '#9aa3ad', '#2a2f36')
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
    if (fx.type === 'oil') {
      // A pour of boiling oil spreading into a steaming pool.
      const pour = Math.min(1, k * 3)
      cam.P(fx.x, fx.y, fx.z)
      const x0 = cam.sx
      const y0 = cam.sy
      cam.P(fx.x, fx.y, 0)
      ctx.strokeStyle = `rgba(70,46,14,${(0.85 * (1 - k)).toFixed(3)})`
      ctx.lineWidth = Math.max(2, cam.k * 0.18)
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x0 + (cam.sx - x0) * pour, y0 + (cam.sy - y0) * pour)
      ctx.stroke()
      if (k > 0.2) {
        const r = fx.size * Math.min(1, (k - 0.2) * 2.5)
        this.ellipse(fx.x, fx.y, 0.02, r, `rgba(52,34,10,${(0.6 * (1 - k)).toFixed(3)})`)
        for (let n = 0; n < 5; n++) {
          const a = n * 1.3 + fx.x
          cam.P(fx.x + Math.cos(a) * r * 0.6, fx.y + Math.sin(a) * r * 0.6, 0.2 + k * 0.9)
          ctx.beginPath()
          ctx.arc(cam.sx, cam.sy, Math.max(1, cam.k * 0.12 * (0.5 + k)), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(235,235,230,${(0.35 * (1 - k)).toFixed(3)})`
          ctx.fill()
        }
      }
      return
    }
    if (fx.type === 'rocks') {
      // Stones tumbling from the wall top, then dust where they land.
      const f = Math.min(1, k * 2.2)
      for (let n = 0; n < 4; n++) {
        const ox = Math.cos(n * 2.1) * 0.18
        const oy = Math.sin(n * 2.1) * 0.18
        const z = (fx.from || 1) * (1 - f * f) + 0.08
        this.ball(fx.x + ox, fx.y + oy, z, 0.07 + n * 0.012, '#8d877c', '#3a352e')
      }
      if (f < 1) return
    }
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
    const k = world.keep
    if (k.doorHp > 0 && k.doorHp < k.doorMax) this.hpBar(k.x + 1.5, k.y + 3.05, 1.35, k.doorHp / k.doorMax, 0.6)
    if (k.inside > 0) this.insideBadge(k)
    for (const e of game.enemies) this.hpBar(e.x, e.y, e.z + 1.0 * UNIT_SCALE, e.hp / e.maxHp, 0.45)
    for (const u of [...game.archers, ...game.swordsmen]) this.hpBar(u.x, u.y, u.z + 0.95 * UNIT_SCALE, u.hp / u.maxHp, 0.35)
  }

  // How many attackers are inside the keep, fighting their way up.
  insideBadge(k) {
    const { ctx, cam } = this
    cam.P(k.x + 1.5, k.y + 1.5, KEEP.height + 2.1)
    const text = `⚔ ${k.inside} inside`
    const fs = Math.max(11, Math.min(16, cam.k * 0.38))
    ctx.font = `700 ${fs}px system-ui, sans-serif`
    const w = ctx.measureText(text).width + fs
    const h = fs * 1.6
    ctx.fillStyle = 'rgba(150,30,24,0.92)'
    ctx.beginPath()
    ctx.roundRect(cam.sx - w / 2, cam.sy - h / 2, w, h, h / 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, cam.sx, cam.sy + 1)
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
  if (t.type === 'gate' || t.type === 'gatehouse') return STRUCTURES[t.type].height
  if (t.type === 'keep') return KEEP.height
  return 0
}
