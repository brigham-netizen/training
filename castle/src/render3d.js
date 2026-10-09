// Real-3D renderer (preview). Draws the same game as render.js with WebGL:
// lit, shadowed low-poly models. The orthographic camera is built to match
// camera.js exactly, so input, picking and the 2D overlay (health bars,
// tags, previews) line up without changes.
//
// Coordinates: game (x, y, height z) -> three (X = x, Y = z, Z = y).

import * as THREE from 'three'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { STRUCTURES, KEEP, UNIT_SCALE, MOAT } from './config.js'
import { stoneTexture, woodTexture, TEXTURE_LUM } from './textures.js'
import { paintTerrain, terrainReady } from './terrain.js'
import { floraReady, floraSprites, treeSpec, rockSpec, FLORA_URLS } from './flora.js'
import { unitsReady, Actor } from './units.js'

const C = {
  grass: [0x58823c, 0x5d8a40, 0x537c39, 0x618f44],
  hill: [0x6f9a49, 0x76a14e],
  hillSide: 0x7a6142,
  marsh: [0x56633a, 0x4f5c35],
  bedShallow: 0x6f8c72,
  bedDeep: 0x2d4a5c,
  dirt: 0x5c4630,
  water: 0x3c7aa8,
  stone: 0xb9b09c,
  stoneDark: 0x958d7c,
  keep: 0xa29a88,
  wood: 0x8a5a32,
  woodLight: 0xb07a46,
  door: 0x5e3a1e,
  roof: 0x9a4632,
  plaster: 0xe2d2ac,
  rock: 0x8d8a83,
  moss: 0x7c8a5e,
  trunk: 0x5c3b1f,
  pine: 0x2f5f33,
  leaf: 0x3f7a3a,
  soil: 0x765838,
  crop: 0xc9b04a,
  sprout: 0x6f9a3e,
  awning: 0xb63a30,
  awningAlt: 0xece0c4,
  iron: 0x555555,
  banner: 0xc4302a,
  player: 0x345cb0,
  skin: 0xe2b88c,
  helmet: 0x9aa3ad,
  shield: 0xb2923e,
  raider: 0xcd5c1e,
  brute: 0x8c282c,
  bowman: 0x4a6034,
  ram: 0x76522f,
  catapult: 0x80583a,
  boulder: 0x807c74,
  arrow: 0xf0e2c0,
  arrowHostile: 0x2a2018,
  ladder: 0xa87c4a,
  lord: 0x783078,
  crown: 0xecc446,
  hole: 0x181210,
}

// How high or low each kind of ground sits (the 3D terrain is smoothed
// between tiles the same way world.heightAt smooths hills).
function groundLevel(world, i) {
  const t = world.tiles[i]
  if (t.type === 'moat') return -0.3
  if (t.terrain === 'water') return -0.32
  if (t.terrain === 'shallows') return -0.14
  if (t.terrain === 'marsh') return -0.02
  return world.groundElev(i)
}

const UP = new THREE.Vector3(0, 1, 0)
// World-space UVs for a merged, non-indexed geometry: each triangle is
// projected onto the plane it faces most, one texture repeat per tile, with
// v running up walls so masonry courses stay level and line up across tiles.
function worldUVs(g) {
  const p = g.attributes.position.array
  const n = g.attributes.normal.array
  const uv = new Float32Array((p.length / 3) * 2)
  for (let t = 0; t < p.length; t += 9) {
    const nx = Math.abs(n[t] + n[t + 3] + n[t + 6])
    const ny = Math.abs(n[t + 1] + n[t + 4] + n[t + 7])
    const nz = Math.abs(n[t + 2] + n[t + 5] + n[t + 8])
    for (let v = 0; v < 9; v += 3) {
      const X = p[t + v]
      const Y = p[t + v + 1]
      const Z = p[t + v + 2]
      const o = ((t + v) / 3) * 2
      if (ny >= nx && ny >= nz) {
        uv[o] = X
        uv[o + 1] = Z
      } else if (nx >= nz) {
        uv[o] = Z
        uv[o + 1] = Y
      } else {
        uv[o] = X
        uv[o + 1] = Y
      }
    }
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
}

const WALLISH = new Set(['palisade', 'wall', 'thick', 'gate', 'gatehouse', 'tower', 'keep'])

export class Renderer3D {
  constructor(canvas) {
    this.canvas = canvas
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
    r.shadowMap.enabled = true
    r.shadowMap.type = THREE.PCFSoftShadowMap
    r.outputColorSpace = THREE.SRGBColorSpace
    r.toneMapping = THREE.ACESFilmicToneMapping
    r.toneMappingExposure = 1.05
    this.renderer = r

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1a2620)
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400)

    this.scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x3a4a2a, 1.1))
    const sun = new THREE.DirectionalLight(0xfff0d8, 2.2)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.03
    const sc = sun.shadow.camera
    sc.left = -24
    sc.right = 24
    sc.top = 24
    sc.bottom = -24
    sc.near = 1
    sc.far = 120
    this.sun = sun
    this.scene.add(sun)
    this.scene.add(sun.target)

    this.terrain = new THREE.Group()
    this.structures = new THREE.Group()
    // Leaf clumps: camera-facing sprites, rebuilt with the structures.
    this.foliage = new THREE.Group()
    this.scene.add(this.terrain, this.structures, this.foliage)

    this.mats = {}
    this.mapSig = ''
    this.structSig = ''
    this.pools = {}
    // Animated troop models, one per unit, keyed by the unit's id.
    this.actors = new Map()
    this.actorGroup = new THREE.Group()
    this.scene.add(this.actorGroup)
    this.lastTime = null
    this.tmp = { m: new THREE.Matrix4(), q: new THREE.Quaternion(), s: new THREE.Vector3(), p: new THREE.Vector3(), c: new THREE.Color() }
    this.buildPools()
  }

  mat(key, hex, opts = {}) {
    if (!this.mats[key]) this.mats[key] = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.9, metalness: 0, ...opts })
    return this.mats[key]
  }

  resize(w, h, dpr) {
    this.renderer.setPixelRatio(Math.min(2, dpr))
    this.renderer.setSize(w, h, false)
  }

  // Match camera.js: same rotation, elevation, zoom and focus.
  syncCamera(cam) {
    const c = this.camera
    const k = cam.k
    c.left = -cam.vw / 2 / k
    c.right = cam.vw / 2 / k
    c.top = cam.vh / 2 / k
    c.bottom = -cam.vh / 2 / k
    const back = new THREE.Vector3(cam.sinT * cam.cosE, cam.sinE, cam.cosT * cam.cosE)
    const right = new THREE.Vector3(cam.cosT, 0, -cam.sinT)
    const up = new THREE.Vector3().crossVectors(back, right)
    const target = new THREE.Vector3(cam.fx, 0, cam.fy)
    c.position.copy(target).addScaledVector(back, 120)
    c.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, back))
    c.updateProjectionMatrix()
  }

  render(game, cam) {
    const { world } = game
    this.syncCamera(cam)
    // Keep the sun over the map (from the south-west, like the 2D shading).
    const cx = world.w / 2
    const cy = world.h / 2
    this.sun.position.set(cx - 14, 26, cy + 18)
    this.sun.target.position.set(cx, 0, cy)

    const mapSig = (terrainReady() ? 'T' : 'F') + world.tiles.map((t) => t.terrain[0] + (t.type === 'moat' ? 'm' : '')).join('')
    if (mapSig !== this.mapSig) {
      this.mapSig = mapSig
      this.buildTerrain(world)
    }
    const structSig = mapSig + (floraReady() ? 'L' : 'l') + (world.keep.doorHp > 0 ? 'D' : 'd') + world.tiles.map((t) => `${t.type}${t.hoard ? 'h' : ''}${t.rock ? 'r' : ''}${t.broken ? 'b' : ''}${t.plot || ''}`).join(',')
    if (structSig !== this.structSig) {
      this.structSig = structSig
      this.buildStructures(world)
    }
    // Firs show their needle star when seen from straight above.
    const above = cam.sinE > 0.86
    if (this.pineMats && above !== this.pineAbove) {
      this.pineAbove = above
      for (const m of this.pineMats) {
        m.map = above ? m.userData.top : m.userData.side
        m.needsUpdate = true
      }
    }
    this.drawUnits(game)
    this.renderer.render(this.scene, this.camera)
  }

  // ---- geometry helpers (game coordinates) ----------------------------------

  begin() {
    this.parts = {}
  }

  add(key, geo) {
    ;(this.parts[key] ||= []).push(geo.index ? geo.toNonIndexed() : geo)
  }

  box(key, x0, y0, z0, x1, y1, z1) {
    const g = new THREE.BoxGeometry(x1 - x0, z1 - z0, y1 - y0)
    g.translate((x0 + x1) / 2, (z0 + z1) / 2, (y0 + y1) / 2)
    this.add(key, g)
  }

  // Box whose bottom and top may slope: z0 and z1 are heights or functions
  // (x, y) => height evaluated at each corner.
  slab(key, x0, y0, x1, y1, z0, z1) {
    const xs = [x0, x1, x1, x0]
    const ys = [y0, y0, y1, y1]
    const b = xs.map((x, k) => (typeof z0 === 'function' ? z0(x, ys[k]) : z0))
    const t = xs.map((x, k) => (typeof z1 === 'function' ? z1(x, ys[k]) : z1))
    // Corners as three.js points: bottom 0-3, top 4-7.
    const P = [...xs.map((x, k) => [x, b[k], ys[k]]), ...xs.map((x, k) => [x, t[k], ys[k]])]
    const quads = [
      [4, 5, 6, 7], // top (counter-clockwise seen from above)
      [0, 3, 2, 1], // bottom
      [0, 1, 5, 4], // north
      [1, 2, 6, 5], // east
      [2, 3, 7, 6], // south
      [3, 0, 4, 7], // west
    ]
    const pos = []
    for (const [a, bb, c, d] of quads) for (const v of [a, c, bb, a, d, c]) pos.push(...P[v])
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2))
    g.computeVertexNormals()
    this.add(key, g)
  }

  cyl(key, x, y, z0, z1, r, seg = 8, rTop = r) {
    const g = new THREE.CylinderGeometry(rTop, r, z1 - z0, seg)
    g.translate(x, (z0 + z1) / 2, y)
    this.add(key, g)
  }

  cone(key, x, y, z0, h, r, seg = 8) {
    const g = new THREE.ConeGeometry(r, h, seg)
    g.translate(x, z0 + h / 2, y)
    this.add(key, g)
  }

  // A rod from a to b (game [x, y, z] arrays).
  rod(key, a, b, r, seg = 5) {
    const A = new THREE.Vector3(a[0], a[2], a[1])
    const B = new THREE.Vector3(b[0], b[2], b[1])
    const dir = B.clone().sub(A)
    const g = new THREE.CylinderGeometry(r, r, dir.length(), seg)
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()))
    g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2)
    this.add(key, g)
  }

  finish(group, materials, { shadows = true } = {}) {
    for (const child of [...group.children]) {
      group.remove(child)
      child.geometry.dispose()
    }
    for (const [key, list] of Object.entries(this.parts)) {
      const merged = mergeGeometries(list, false)
      for (const g of list) g.dispose()
      if (!merged) continue
      if (materials[key].map) worldUVs(merged)
      const mesh = new THREE.Mesh(merged, materials[key])
      mesh.castShadow = shadows && !materials[key].transparent
      mesh.receiveShadow = true
      group.add(mesh)
    }
  }

  // ---- terrain ----------------------------------------------------------------

  buildTerrain(world) {
    const { w, h } = world
    const positions = []
    const colors = []
    const col = new THREE.Color()
    // A smooth heightfield on a half-tile lattice: tile centres at their
    // own level, edges and corners averaging the tiles that meet there.
    const GW = 2 * w + 1
    const GH = 2 * h + 1
    const level = new Float32Array(w * h)
    const tint = []
    for (let i = 0; i < w * h; i++) {
      const t = world.tiles[i]
      level[i] = groundLevel(world, i)
      const v = Math.floor(t.v * 4)
      const hex =
        t.type === 'moat' || t.terrain === 'water' ? C.bedDeep
        : t.terrain === 'shallows' ? C.bedShallow
        : t.terrain === 'marsh' ? C.marsh[v & 1]
        : t.terrain === 'hill' ? C.hill[v & 1]
        : C.grass[v]
      tint.push(new THREE.Color(hex))
    }
    const vh = new Float32Array(GW * GH)
    const vc = []
    for (let gy = 0; gy < GH; gy++)
      for (let gx = 0; gx < GW; gx++) {
        // Tiles touching this lattice point.
        const xs = gx % 2 ? [(gx - 1) / 2] : [gx / 2 - 1, gx / 2]
        const ys = gy % 2 ? [(gy - 1) / 2] : [gy / 2 - 1, gy / 2]
        let sum = 0
        let n = 0
        const c = new THREE.Color(0, 0, 0)
        for (const ty of ys)
          for (const tx of xs) {
            if (tx < 0 || ty < 0 || tx >= w || ty >= h) continue
            const i = ty * w + tx
            sum += level[i]
            c.r += tint[i].r
            c.g += tint[i].g
            c.b += tint[i].b
            n++
          }
        vh[gy * GW + gx] = n ? sum / n : 0
        vc.push(n ? c.multiplyScalar(1 / n) : c)
      }
    const index = []
    const L = (gx, gy) => gy * GW + gx
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const cx = 2 * x + 1
        const cy = 2 * y + 1
        const ring = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]].map(([dx, dy]) => L(cx + dx, cy + dy))
        const c = L(cx, cy)
        for (let k = 0; k < 8; k++) index.push(c, ring[(k + 1) % 8], ring[k])
      }
    // With painted ground the texture carries the colour; vertices stay white.
    const painted = terrainReady()
    const uvs = []
    for (let gy = 0; gy < GH; gy++)
      for (let gx = 0; gx < GW; gx++) {
        positions.push(gx / 2, vh[L(gx, gy)], gy / 2)
        uvs.push(gx / 2 / w, 1 - gy / 2 / h)
        const c = painted ? new THREE.Color(1, 1, 1) : vc[L(gx, gy)]
        colors.push(c.r, c.g, c.b)
      }
    // Skirt round the map edge so it reads as a slab of land.
    const skirt = (pts) => {
      for (let k = 0; k + 1 < pts.length; k++) {
        const [ax, ay] = pts[k]
        const [bx, by] = pts[k + 1]
        const a = positions.length / 3
        col.setHex(C.dirt)
        for (const [px, py, top] of [[ax, ay, true], [bx, by, true], [bx, by, false], [ax, ay, false]]) {
          positions.push(px / 2, top ? vh[L(px, py)] : -0.8, py / 2)
          colors.push(col.r, col.g, col.b)
          uvs.push(-1, -1) // off the painted ground: see skirt material below
        }
        index.push(a, a + 1, a + 2, a, a + 2, a + 3)
      }
    }
    const edge = (fn, n) => Array.from({ length: n }, (_, k) => fn(k))
    skirt(edge((k) => [k, 0], GW))
    skirt(edge((k) => [GW - 1, k], GH))
    skirt(edge((k) => [GW - 1 - k, GH - 1], GW))
    skirt(edge((k) => [0, GH - 1 - k], GH))
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(index)
    geo.computeVertexNormals()
    // The skirt is the last part of the index; draw it with its own plain
    // earth material so it doesn't sample the painted ground.
    const skirtStart = 8 * 3 * w * h
    geo.addGroup(0, skirtStart, 0)
    geo.addGroup(skirtStart, index.length - skirtStart, 1)
    for (const child of [...this.terrain.children]) {
      this.terrain.remove(child)
      child.geometry.dispose()
    }
    if (painted) {
      this.groundTex?.dispose()
      const tex = new THREE.CanvasTexture(paintTerrain(world, { water: false }))
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 8
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
      this.groundTex = tex
      this.mats.landPainted?.dispose()
      this.mats.landPainted = new THREE.MeshStandardMaterial({ map: tex, vertexColors: true, roughness: 1, metalness: 0 })
    }
    const top = painted ? this.mats.landPainted : this.mat('land', 0xffffff, { vertexColors: true, roughness: 1 })
    const land = new THREE.Mesh(geo, [top, this.mat('skirt', C.dirt, { roughness: 1 })])
    land.receiveShadow = true
    this.terrain.add(land)
    // One sheet of water over the whole map; land columns poke through it.
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      this.mat('water', C.water, { transparent: true, opacity: 0.78, roughness: 0.25, metalness: 0.05 }),
    )
    water.rotation.x = -Math.PI / 2
    water.position.set(w / 2, -0.07, h / 2)
    water.receiveShadow = true
    this.terrain.add(water)
  }

  // ---- structures and scenery -------------------------------------------------

  // A material whose colour is carried by a procedural texture. The tint is
  // brightened so the textured average matches the flat colour it replaces.
  texMat(key, hex, tex) {
    if (!this.mats[key]) {
      const src = tex === 'wood' ? woodTexture() : stoneTexture()
      this.texCache ||= {}
      if (!this.texCache[tex]) {
        const t = new THREE.CanvasTexture(src)
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 4
        const b = new THREE.CanvasTexture(src)
        b.wrapS = b.wrapT = THREE.RepeatWrapping
        this.texCache[tex] = { map: t, bump: b }
      }
      const { map, bump } = this.texCache[tex]
      const color = new THREE.Color(hex)
      const lift = 255 / TEXTURE_LUM[tex]
      color.setRGB(Math.min(1, color.r * lift), Math.min(1, color.g * lift), Math.min(1, color.b * lift))
      this.mats[key] = new THREE.MeshStandardMaterial({ color, map, bumpMap: bump, bumpScale: 1.5, roughness: 0.92, metalness: 0 })
    }
    return this.mats[key]
  }

  // A material showing one of the bundled photo textures (rock, bark).
  photoMat(key, tex) {
    if (!this.mats[key]) {
      const t = new THREE.TextureLoader().load(FLORA_URLS[tex])
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 4
      // The lichen photo is much darker than the others; lift it.
      const color = new THREE.Color(1, 1, 1).multiplyScalar(tex === 'rockLichen' ? 1.7 : tex === 'rockMoss' ? 1.15 : 1)
      this.mats[key] = new THREE.MeshStandardMaterial({ map: t, color, roughness: 0.95, metalness: 0 })
    }
    return this.mats[key]
  }

  materials() {
    return {
      stone: this.texMat('stone', C.stone, 'stone'),
      stoneDark: this.texMat('stoneDark', C.stoneDark, 'stone'),
      keep: this.texMat('keep', C.keep, 'stone'),
      wood: this.texMat('wood', C.wood, 'wood'),
      woodLight: this.mat('woodLight', C.woodLight),
      door: this.mat('door', C.door),
      roof: this.mat('roof', C.roof),
      plaster: this.mat('plaster', C.plaster),
      rock: this.photoMat('rock', 'rock'),
      rockLichen: this.photoMat('rockLichen', 'rockLichen'),
      rockMoss: this.photoMat('rockMoss', 'rockMoss'),
      moss: this.mat('moss', C.moss, { flatShading: true }),
      trunk: this.mat('trunk', C.trunk),
      bark: this.photoMat('bark', 'bark'),
      barkPine: this.photoMat('barkPine', 'barkPine'),
      canopyShadow: this.mat('canopyShadow', 0x000000, { colorWrite: false, depthWrite: false }),
      pine: this.mat('pine', C.pine, { flatShading: true }),
      leaf: this.mat('leaf', C.leaf, { flatShading: true }),
      soil: this.mat('soil', C.soil),
      crop: this.mat('crop', C.crop),
      sprout: this.mat('sprout', C.sprout),
      awning: this.mat('awning', C.awning),
      awningAlt: this.mat('awningAlt', C.awningAlt),
      iron: this.mat('iron', C.iron, { metalness: 0.4, roughness: 0.6 }),
      banner: this.mat('banner', C.banner, { side: THREE.DoubleSide }),
      player: this.mat('player', C.player, { side: THREE.DoubleSide }),
      ghost: this.mat('ghost', 0xf2e2b0, { transparent: true, opacity: 0.32, depthWrite: false }),
      stake: this.mat('stake', 0xe9d9b0),
      hole: this.mat('hole', C.hole, { roughness: 1 }),
    }
  }

  connects(world, x, y, dx, dy) {
    const nx = x + dx
    const ny = y + dy
    return world.inBounds(nx, ny) && WALLISH.has(world.tiles[world.idx(nx, ny)].type)
  }

  // Merlons along a run from (ax, ay) to (bx, by) at height z.
  // `z` is a height or a function (x, y) => height.
  merlonRun(key, ax, ay, bx, by, z, n, s = 0.14, hgt = 0.18) {
    for (let k = 0; k < n; k++) {
      const f = n === 1 ? 0.5 : k / (n - 1)
      const x = ax + (bx - ax) * f
      const y = ay + (by - ay) * f
      const mz = typeof z === 'function' ? z(x, y) : z
      this.box(key, x - s / 2, y - s / 2, mz, x + s / 2, y + s / 2, mz + hgt)
    }
  }

  buildStructures(world) {
    this.begin()
    for (const child of [...this.foliage.children]) this.foliage.remove(child)
    this.pineMats = null
    this.pineAbove = null
    const k = world.keep
    for (let i = 0; i < world.tiles.length; i++) {
      const t = world.tiles[i]
      const x = i % world.w
      const y = (i / world.w) | 0
      const z = world.elev(i)
      // Upright blocks reach down past the lowest ground under them (or
      // sit on the rock they're bedded into) so slopes never show a gap.
      const foot = t.rock ? world.baseElev(i) : world.minGround(i) - 0.35
      if (t.rock) this.rockBase(x, y, z, foot, t.v)
      switch (t.type) {
        case 'palisade':
          this.palisade(world, x, y)
          break
        case 'wall':
          this.thinWall(world, x, y, z, foot, t.hoard)
          this.waterArch(world, i, x, y, STRUCTURES.wall.thin / 2)
          break
        case 'thick':
          this.thickWall(world, x, y, z, foot, t.hoard)
          this.waterArch(world, i, x, y, 0.5)
          break
        case 'gate':
        case 'gatehouse':
          this.gate(world, i, x, y, z, foot, t.hoard)
          break
        case 'tower':
          this.tower(world, x, y, z, foot, t.hoard)
          break
        case 'pikes':
          this.pikes(world, x, y, foot)
          break
        case 'stair':
          this.stair(world, i, x, y)
          break
        case 'trap':
          this.box('soil', x + 0.08, y + 0.08, z, x + 0.92, y + 0.92, z + 0.04)
          for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) this.cone('iron', x + 0.25 + a * 0.25, y + 0.25 + b * 0.25, z + 0.04, 0.16, 0.04, 4)
          break
        case 'tree':
          if (floraReady()) this.photoTree(world, x, y, treeSpec(t.v, x, y, t.terrain === 'hill'))
          else this.tree(x, y, z, t.v)
          break
        case 'rock':
          if (floraReady()) this.boulders(world, x, y, rockSpec(t.v, x, y))
          else this.rock(x, y, z, t.v)
          break
        case 'cottage':
          this.cottage(x, y, z, 'plaster', 'roof')
          break
        case 'farm':
          this.farm(x, y, z, t.v)
          break
        case 'market':
          this.market(x, y, z, false)
          break
        case 'plot':
          this.plot(x, y, z, t.plot)
          break
        case 'keep':
          if (x === k.x && y === k.y) this.keep(world)
          break
      }
    }
    for (const s of world.spawns) this.spawnFlag(s.x + 0.5, s.y + 0.5)
    this.finish(this.structures, this.materials())
  }

  rockBase(x, y, z, top, v) {
    const g = new THREE.DodecahedronGeometry(0.62, 0)
    g.scale(1, (top - z + 0.15) / 1.0, 0.9)
    g.rotateY(v * 6)
    g.translate(x + 0.5, z + (top - z) * 0.45, y + 0.5)
    this.add('rock', g)
  }

  rock(x, y, z, v) {
    const g = new THREE.DodecahedronGeometry(0.42, 0)
    g.scale(1, 0.75 + v * 0.4, 0.85)
    g.rotateY(v * 9)
    g.translate(x + 0.5, z + 0.22 + v * 0.1, y + 0.5)
    this.add('rock', g)
    const m = new THREE.DodecahedronGeometry(0.2, 0)
    m.translate(x + 0.5 + (v - 0.5) * 0.3, z + 0.45 + v * 0.2, y + 0.45)
    this.add('moss', m)
  }

  // A lumpy boulder: an icosphere pushed in and out by smooth noise,
  // squashed, turned and sunk a little into the ground.
  boulder(key, x, y, z, size, height, seed) {
    const ico = new THREE.IcosahedronGeometry(1, 2)
    ico.deleteAttribute('normal')
    ico.deleteAttribute('uv')
    const g = mergeVertices(ico)
    const p = g.attributes.position
    const a = seed * 40
    for (let i = 0; i < p.count; i++) {
      const vx = p.getX(i)
      const vy = p.getY(i)
      const vz = p.getZ(i)
      const n =
        Math.sin(vx * 2.3 + a) * Math.sin(vy * 2.9 + a * 1.3) * Math.sin(vz * 2.1 + a * 0.7) * 0.28 +
        Math.sin(vx * 5.1 + a * 2) * Math.sin(vy * 4.7) * Math.sin(vz * 5.3 + a) * 0.08
      const f = 1 + n
      p.setXYZ(i, vx * f, vy * f * (vy < 0 ? 0.6 : 1), vz * f)
    }
    g.computeVertexNormals()
    // Placeholder UVs (merged geometries need matching attributes); world
    // UVs are worked out after the merge.
    g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(p.count * 2), 2))
    g.scale(size / 2, height * 0.75, (size / 2) * (0.75 + (seed % 0.3)))
    g.rotateY(seed * 17)
    g.translate(x, z + height * 0.55, y)
    this.add(key, g)
  }

  boulders(world, x, y, list) {
    const keys = ['rock', 'rockLichen', 'rockMoss']
    for (const r of list) {
      const px = x + r.dx
      const py = y + r.dy
      this.boulder(keys[r.variant % 3], px, py, world.heightAt(px, py), r.size, r.height, r.seed)
    }
  }

  // A tree with a bark trunk and leaf-clump sprites (or fir tiers).
  photoTree(world, x, y, spec) {
    const sp = floraSprites()
    const bx = x + spec.cx
    const by = y + spec.cy
    const z = world.heightAt(bx, by)
    const top = spec.clumps[spec.species === 'pine' ? spec.clumps.length - 1 : 0]
    this.rod(spec.species === 'pine' ? 'barkPine' : 'bark', [bx, by, z - 0.1], [bx + top.dx * 0.5, by + top.dy * 0.5, z + spec.trunk], spec.trunkR, 7)
    // An invisible blob that casts the canopy's shadow.
    const blob = new THREE.IcosahedronGeometry(1, 1)
    blob.scale(spec.radius * 0.85, (spec.height - spec.trunk) * 0.55, spec.radius * 0.85)
    blob.translate(bx, z + (spec.height + spec.trunk) / 2, by)
    this.add('canopyShadow', blob)
    this.spriteMats ||= {}
    const mat = (name, n) => {
      const id = `${name}${n}`
      if (!this.spriteMats[id]) {
        const tex = (c) => {
          const t = new THREE.CanvasTexture(c)
          t.colorSpace = THREE.SRGBColorSpace
          return t
        }
        const m = new THREE.SpriteMaterial({ map: tex(name === 'pine' ? sp.pineSide[n] : sp[name][n]), alphaTest: 0.45, transparent: false, color: 0xe6e6e6 })
        if (name === 'pine') m.userData = { side: m.map, top: tex(sp.pineTop[n]) }
        this.spriteMats[id] = m
      }
      return this.spriteMats[id]
    }
    if (spec.species === 'pine') {
      for (const c of spec.clumps) {
        const s = new THREE.Sprite(mat('pine', c.variant))
        s.scale.set(c.size, c.size * 0.75, 1)
        s.position.set(bx + c.dx, z + c.dz + c.size * 0.12, by + c.dy)
        this.foliage.add(s)
      }
      this.pineMats = [0, 1, 2].map((n) => mat('pine', n))
      return
    }
    for (const c of spec.clumps) {
      const s = new THREE.Sprite(mat(spec.species, c.variant))
      s.scale.set(c.size, c.size, 1)
      s.position.set(bx + c.dx, z + c.dz, by + c.dy)
      this.foliage.add(s)
    }
  }

  tree(x, y, z, v) {
    const cx = x + 0.5 + (v - 0.5) * 0.25
    const cy = y + 0.5 + (((v * 7) % 1) - 0.5) * 0.25
    this.cyl('trunk', cx, cy, z, z + 0.45, 0.07, 6)
    if (v < 0.55) {
      // Pine: stacked cones.
      this.cone('pine', cx, cy, z + 0.3, 0.7, 0.42, 7)
      this.cone('pine', cx, cy, z + 0.65, 0.6, 0.32, 7)
      this.cone('pine', cx, cy, z + 0.95, 0.5, 0.22, 7)
    } else {
      const g = new THREE.IcosahedronGeometry(0.42, 0)
      g.translate(cx, z + 0.9, cy)
      this.add('leaf', g)
      const g2 = new THREE.IcosahedronGeometry(0.28, 0)
      g2.translate(cx + 0.15, z + 1.2, cy - 0.1)
      this.add('leaf', g2)
    }
  }

  // Wooden palisade: a row of sharpened logs along each connected arm.
  palisade(world, x, y) {
    const cx = x + 0.5
    const cy = y + 0.5
    const arms = [[0, -1], [1, 0], [0, 1], [-1, 0]].filter(([dx, dy]) => this.connects(world, x, y, dx, dy))
    const log = (lx, ly) => {
      const z = world.heightAt(lx, ly)
      this.cyl('wood', lx, ly, z - 0.2, z + 0.75, 0.06, 6)
      this.cone('woodLight', lx, ly, z + 0.75, 0.16, 0.06, 6)
    }
    log(cx, cy)
    for (const [dx, dy] of arms) for (const f of [0.15, 0.3, 0.45]) log(cx + dx * f, cy + dy * f)
  }

  thinWall(world, x, y, z, foot, hoard) {
    const d = STRUCTURES.wall
    const hw = d.thin / 2
    const cx = x + 0.5
    const cy = y + 0.5
    // The top follows the ground along the wall's centre line.
    const top = (px, py) => (Math.abs(px - cx) >= Math.abs(py - cy) ? world.heightAt(px, cy) : world.heightAt(cx, py)) + d.height
    this.slab('stone', cx - hw, cy - hw, cx + hw, cy + hw, foot, top)
    const arms = [[0, -1], [1, 0], [0, 1], [-1, 0]].filter(([dx, dy]) => this.connects(world, x, y, dx, dy))
    for (const [dx, dy] of arms) {
      const x0 = dx ? (dx > 0 ? cx + hw : x) : cx - hw
      const x1 = dx ? (dx > 0 ? x + 1 : cx - hw) : cx + hw
      const y0 = dy ? (dy > 0 ? cy + hw : y) : cy - hw
      const y1 = dy ? (dy > 0 ? y + 1 : cy - hw) : cy + hw
      this.slab('stone', x0, y0, x1, y1, foot, top)
      // Battlements (or wooden hoarding) along both sides of the walkway.
      const key = hoard ? 'wood' : 'stoneDark'
      const boards = (px, py) => top(px, py) + 0.3
      if (dx) {
        for (const sy of [cy - hw + 0.07, cy + hw - 0.07]) {
          if (hoard) this.slab(key, x0, sy - 0.04, x1, sy + 0.04, top, boards)
          else this.merlonRun(key, x0 + 0.08, sy, x1 - 0.08, sy, top, 2)
        }
      } else {
        for (const sx of [cx - hw + 0.07, cx + hw - 0.07]) {
          if (hoard) this.slab(key, sx - 0.04, y0, sx + 0.04, y1, top, boards)
          else this.merlonRun(key, sx, y0 + 0.08, sx, y1 - 0.08, top, 2)
        }
      }
    }
    if (!arms.length) this.merlonRun(hoard ? 'wood' : 'stoneDark', cx - hw + 0.07, cy - hw + 0.07, cx + hw - 0.07, cy + hw - 0.07, top, 2)
  }

  thickWall(world, x, y, z, foot, hoard) {
    const top = (px, py) => world.heightAt(px, py) + STRUCTURES.thick.height
    this.slab('stone', x, y, x + 1, y + 1, foot, top)
    this.slab('stoneDark', x + 0.25, y + 0.25, x + 0.75, y + 0.75, top, (px, py) => top(px, py) + 0.01)
    const key = hoard ? 'wood' : 'stoneDark'
    const edges = [
      [[0, -1], x + 0.08, y + 0.08, x + 0.92, y + 0.08],
      [[1, 0], x + 0.92, y + 0.08, x + 0.92, y + 0.92],
      [[0, 1], x + 0.08, y + 0.92, x + 0.92, y + 0.92],
      [[-1, 0], x + 0.08, y + 0.08, x + 0.08, y + 0.92],
    ]
    for (const [[dx, dy], ax, ay, bx, by] of edges) {
      if (this.connects(world, x, y, dx, dy)) continue
      if (hoard) this.slab(key, Math.min(ax, bx) - 0.05, Math.min(ay, by) - 0.05, Math.max(ax, bx) + 0.05, Math.max(ay, by) + 0.05, top, (px, py) => top(px, py) + 0.32)
      else this.merlonRun(key, ax, ay, bx, by, top, 3, 0.16, 0.22)
    }
  }

  // Gates and gatehouses. Their passage is a real opening; a broken gate
  // keeps its stonework and loses only the door, left in splinters.
  gate(world, i, x, y, z, foot, hoard) {
    const t = world.tiles[i]
    const big = t.type === 'gatehouse'
    const h = z + STRUCTURES[t.type].height
    const alongX = this.connects(world, x, y, 1, 0) || this.connects(world, x, y, -1, 0) || !(this.connects(world, x, y, 0, 1) || this.connects(world, x, y, 0, -1))
    // Work in the gate's frame: u along the wall, v through the passage.
    const B = (key, u0, v0, zz0, u1, v1, zz1) => (alongX ? this.box(key, x + u0, y + v0, zz0, x + u1, y + v1, zz1) : this.box(key, x + v0, y + u0, zz0, x + v1, y + u1, zz1))
    const at = (u, v) => (alongX ? [x + u, y + v] : [x + v, y + u])
    const arch = z + (big ? 1.15 : 0.85)
    const u0 = big ? 0.36 : 0.3
    const u1 = big ? 0.64 : 0.7
    const v0 = big ? 0.1 : 0.1
    const v1 = big ? 0.9 : 0.9
    B('stone', big ? 0.06 : 0, v0, foot, u0, v1, h)
    B('stone', u1, v0, foot, big ? 0.94 : 1, v1, h)
    B('stone', u0, v0, arch, u1, v1, h)
    if (!t.broken) B('door', u0, 0.45, foot, u1, 0.55, arch)
    else this.splinters(at, z, i)
    if (big) {
      // Four round turrets, one at each corner of the gatehouse, rising
      // over the passage roof, and a portcullis in each arch.
      const top = h + 0.4
      for (const tu of [0.14, 0.86])
        for (const tv of [0.2, 0.8]) {
          const [px, py] = at(tu, tv)
          this.cyl('stone', px, py, foot, top, 0.22, 12)
          this.cyl('stoneDark', px, py, top - 0.08, top, 0.23, 12)
          if (hoard) this.cone('roof', px, py, top, 0.4, 0.27, 12)
          else
            for (let a = 0; a < 5; a++) {
              const ang = (a / 5) * Math.PI * 2 + tu * 3
              const mx = px + Math.cos(ang) * 0.17
              const my = py + Math.sin(ang) * 0.17
              this.box('stoneDark', mx - 0.05, my - 0.05, top, mx + 0.05, my + 0.05, top + 0.16)
            }
        }
      for (const pv of [v0 + 0.03, v1 - 0.03]) {
        const low = t.broken ? arch - 0.28 : foot
        for (let k = 1; k < 5; k++) {
          const u = u0 + ((u1 - u0) * k) / 5
          B('iron', u - 0.012, pv - 0.012, low, u + 0.012, pv + 0.012, arch)
        }
        for (let zz = Math.max(low, z) + 0.18; zz < arch - 0.05; zz += 0.26) B('iron', u0, pv - 0.012, zz, u1, pv + 0.012, zz + 0.025)
      }
      const key = hoard ? 'wood' : 'stoneDark'
      for (const sv of [v0 + 0.06, v1 - 0.06]) {
        const [ax, ay] = at(0.3, sv)
        const [bx, by] = at(0.7, sv)
        if (hoard) B('wood', 0.3, sv - 0.03, h, 0.7, sv + 0.03, h + 0.3)
        else this.merlonRun(key, ax, ay, bx, by, h, 3)
      }
      return
    }
    if (hoard) for (const sv of [0.12, 0.84]) B('wood', 0, sv, h, 1, sv + 0.05, h + 0.3)
    else
      for (const sv of [0.18, 0.82]) {
        const [ax, ay] = at(0.1, sv)
        const [bx, by] = at(0.9, sv)
        this.merlonRun('stoneDark', ax, ay, bx, by, h, 3)
      }
  }

  // Planks of a smashed door strewn through the gateway.
  splinters(at, z, i) {
    const ang = [0.4, -0.7, 1.3, 2.2]
    const spots = [[0.42, 0.3], [0.58, 0.62], [0.47, 0.78], [0.55, 0.22]]
    for (let k = 0; k < 4; k++) {
      const [px, py] = at(...spots[k])
      const a = ang[k] + i
      const dx = Math.cos(a) * 0.16
      const dy = Math.sin(a) * 0.16
      this.rod('door', [px - dx, py - dy, z + 0.03], [px + dx, py + dy, z + 0.05], 0.035, 4)
    }
  }

  // Where a wall stands in water, an arch at its foot lets the water
  // through, shut by an iron grate running down into the water.
  waterArch(world, i, x, y, hw) {
    const axis = world.waterArch(i)
    if (!axis) return
    const cx = x + 0.5
    const cy = y + 0.5
    const zw = world.heightAt(cx, cy)
    const B = (key, u0, n0, zz0, u1, n1, zz1) => (axis === 'x' ? this.box(key, x + u0, cy + n0, zz0, x + u1, cy + n1, zz1) : this.box(key, cx + n0, y + u0, zz0, cx + n1, y + u1, zz1))
    const r = 0.26
    const spring = zw + 0.32
    for (const s of [-1, 1]) {
      const n0 = s * hw - 0.012
      const n1 = s * hw + 0.012
      // The dark opening, its round head built from narrowing courses.
      B('hole', 0.5 - r, n0, zw - 0.3, 0.5 + r, n1, spring)
      for (let k = 0; k < 4; k++) {
        const z0 = spring + (r * k) / 4
        const half = Math.sqrt(r * r - ((r * (k + 0.5)) / 4) ** 2)
        B('hole', 0.5 - half, n0, z0, 0.5 + half, n1, z0 + r / 4)
      }
      // The grate, standing just proud of the face.
      const g0 = s * (hw + 0.03) - 0.014
      const g1 = s * (hw + 0.03) + 0.014
      for (let k = 1; k < 6; k++) {
        const u = 0.5 - r + (2 * r * k) / 6
        const top = spring + Math.sqrt(Math.max(0, r * r - (u - 0.5) ** 2))
        B('iron', u - 0.014, g0, zw - 0.35, u + 0.014, g1, top)
      }
      for (const zz of [zw + 0.16, spring + 0.08]) {
        const half = Math.sqrt(Math.max(0, r * r - Math.max(0, zz - spring) ** 2))
        B('iron', 0.5 - half, g0, zz, 0.5 + half, g1, zz + 0.03)
      }
    }
  }


  // Round tower with a ring of merlons (or a wooden hoarding ring).
  tower(world, x, y, z, foot, hoard) {
    const cx = x + 0.5
    const cy = y + 0.5
    const top = z + STRUCTURES.tower.height
    // Carry each connecting wall right into the tower so the curtain meets
    // the drum without a gap at the tile edge.
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      if (!this.connects(world, x, y, dx, dy)) continue
      const n = world.idx(x + dx, y + dy)
      const type = world.tiles[n].type
      if (type === 'tower' || type === 'keep') continue
      // Meet the neighbour's top where it touches this tile's edge.
      const H = STRUCTURES[type].height
      const hgt = STRUCTURES[type].gate
        ? Math.min(world.elev(n) + H, top)
        : (px, py) => Math.min(top, (dx ? world.heightAt(px, cy) : world.heightAt(cx, py)) + H)
      if (type === 'palisade') {
        for (const f of [0.3, 0.45]) {
          this.cyl('wood', cx + dx * f, cy + dy * f, z, z + 0.75, 0.06, 6)
          this.cone('woodLight', cx + dx * f, cy + dy * f, z + 0.75, 0.16, 0.06, 6)
        }
        continue
      }
      const hw = type === 'thick' ? 0.5 : STRUCTURES[type].gate ? 0.4 : STRUCTURES.wall.thin / 2
      const x0 = dx ? (dx > 0 ? cx : x) : cx - hw
      const x1 = dx ? (dx > 0 ? x + 1 : cx) : cx + hw
      const y0 = dy ? (dy > 0 ? cy : y) : cy - hw
      const y1 = dy ? (dy > 0 ? y + 1 : cy) : cy + hw
      this.slab('stone', x0, y0, x1, y1, foot, hgt)
    }
    this.cyl('stone', cx, cy, foot, top, 0.47, 14, 0.44)
    this.cyl('stoneDark', cx, cy, top - 0.12, top, 0.48, 14)
    if (hoard) {
      this.cyl('wood', cx, cy, top, top + 0.34, 0.5, 14)
      this.cone('roof', cx, cy, top + 0.34, 0.5, 0.56, 14)
    } else {
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2
        const mx = cx + Math.cos(ang) * 0.4
        const my = cy + Math.sin(ang) * 0.4
        this.box('stoneDark', mx - 0.08, my - 0.08, top, mx + 0.08, my + 0.08, top + 0.2)
      }
    }
  }

  // Stone steps rising to the rampart the stair is built against.
  stair(world, i, x, y) {
    const f = world.stairFace(i)
    const cx = x + 0.5
    const cy = y + 0.5
    let dx = 0
    let dy = 1
    let top = world.elev(i) + 0.4
    if (f >= 0) {
      dx = (f % world.w) - x
      dy = ((f / world.w) | 0) - y
      top = world.surfaceAt(f, cx + dx * 0.5, cy + dy * 0.5)
    }
    const n = 4
    const hw = 0.3
    for (let k = 0; k < n; k++) {
      const a = -0.5 + k / n
      const b = -0.5 + (k + 1) / n
      const x0 = dx ? cx + Math.min(a * dx, b * dx) : cx - hw
      const x1 = dx ? cx + Math.max(a * dx, b * dx) : cx + hw
      const y0 = dy ? cy + Math.min(a * dy, b * dy) : cy - hw
      const y1 = dy ? cy + Math.max(a * dy, b * dy) : cy + hw
      const g = world.heightAt((x0 + x1) / 2, (y0 + y1) / 2)
      this.box('stone', x0, y0, g - 0.3, x1, y1, g + (top - g) * ((k + 1) / n))
    }
  }

  pikes(world, x, y, z) {
    const alongX = this.connects(world, x, y, 1, 0) || this.connects(world, x, y, -1, 0) ||
      world.tiles[world.idx(Math.min(world.w - 1, x + 1), y)].type === 'pikes' ||
      world.tiles[world.idx(Math.max(0, x - 1), y)].type === 'pikes'
    const cx = x + 0.5
    const cy = y + 0.5
    const [ax, ay] = alongX ? [1, 0] : [0, 1]
    const [px, py] = [-ay, ax]
    this.rod('trunk', [cx - ax * 0.5, cy - ay * 0.5, z + 0.26], [cx + ax * 0.5, cy + ay * 0.5, z + 0.26], 0.06, 6)
    for (const t of [-0.33, 0, 0.33]) {
      const bx = cx + ax * t
      const by = cy + ay * t
      for (const dir of [1, -1]) {
        const a = [bx - px * 0.36 * dir, by - py * 0.36 * dir, z]
        const m = [bx + px * 0.2 * dir, by + py * 0.2 * dir, z + 0.42]
        const b = [bx + px * 0.42 * dir, by + py * 0.42 * dir, z + 0.62]
        this.rod('wood', a, m, 0.035)
        this.rod('stake', m, b, 0.03)
      }
    }
  }

  // Gable-roofed cottage: walls, a triangular-prism roof, a chimney.
  cottage(x, y, z, wallKey, roofKey) {
    this.box(wallKey, x + 0.18, y + 0.24, z, x + 0.82, y + 0.76, z + 0.44)
    // Gable roof: a triangle extruded along the length of the house.
    const tri = new THREE.Shape()
    tri.moveTo(-0.33, 0)
    tri.lineTo(0.33, 0)
    tri.lineTo(0, 0.36)
    tri.closePath()
    const roof = new THREE.ExtrudeGeometry(tri, { depth: 0.76, bevelEnabled: false })
    roof.rotateY(Math.PI / 2) // extrusion runs along X
    roof.translate(x + 0.12, z + 0.44, y + 0.5)
    this.add(roofKey, roof)
    if (wallKey !== 'ghost') this.box('stoneDark', x + 0.66, y + 0.32, z + 0.5, x + 0.76, y + 0.42, z + 0.95)
  }

  farm(x, y, z, v) {
    this.box('soil', x + 0.04, y + 0.04, z, x + 0.96, y + 0.96, z + 0.05)
    const key = v > 0.5 ? 'crop' : 'sprout'
    for (let r = 0; r < 4; r++) {
      const yy = y + 0.17 + r * 0.22
      this.box(key, x + 0.1, yy - 0.05, z + 0.05, x + 0.9, yy + 0.05, z + 0.18)
    }
  }

  market(x, y, z, ghost) {
    const wood = ghost ? 'ghost' : 'wood'
    this.box(wood, x + 0.15, y + 0.3, z, x + 0.85, y + 0.7, z + 0.35)
    for (const [px, py] of [[0.12, 0.2], [0.88, 0.2], [0.12, 0.8], [0.88, 0.8]]) this.cyl(wood, x + px, y + py, z, z + 0.85, 0.03, 5)
    for (let s = 0; s < 5; s++) {
      const a = x + 0.08 + s * 0.168
      const g = new THREE.BoxGeometry(0.168, 0.03, 0.78)
      g.rotateX(-0.28)
      g.translate(a + 0.084, z + 0.86, y + 0.5)
      this.add(ghost ? 'ghost' : s % 2 ? 'awningAlt' : 'awning', g)
    }
  }

  plot(x, y, z, kind) {
    for (const [px, py] of [[0.08, 0.08], [0.92, 0.08], [0.92, 0.92], [0.08, 0.92]]) this.cyl('stake', x + px, y + py, z, z + 0.25, 0.025, 4)
    if (kind === 'cottage') this.cottage(x, y, z, 'ghost', 'ghost')
    else if (kind === 'market') this.market(x, y, z, true)
    else this.box('ghost', x + 0.06, y + 0.06, z, x + 0.94, y + 0.94, z + 0.12)
  }

  keep(world) {
    const k = world.keep
    const h = KEEP.height
    this.box('keep', k.x, k.y, 0, k.x + 3, k.y + 3, h)
    this.box('stoneDark', k.x + 0.35, k.y + 0.35, h, k.x + 2.65, k.y + 2.65, h + 0.02)
    // Battlements all round.
    const e = 0.1
    this.merlonRun('stoneDark', k.x + e, k.y + e, k.x + 3 - e, k.y + e, h, 8, 0.18, 0.24)
    this.merlonRun('stoneDark', k.x + e, k.y + 3 - e, k.x + 3 - e, k.y + 3 - e, h, 8, 0.18, 0.24)
    this.merlonRun('stoneDark', k.x + e, k.y + e, k.x + e, k.y + 3 - e, h, 8, 0.18, 0.24)
    this.merlonRun('stoneDark', k.x + 3 - e, k.y + e, k.x + 3 - e, k.y + 3 - e, h, 8, 0.18, 0.24)
    // Corner turrets.
    for (const [tx, ty] of [[k.x, k.y], [k.x + 3, k.y], [k.x, k.y + 3], [k.x + 3, k.y + 3]]) {
      this.cyl('keep', tx, ty, 0, h + 0.5, 0.32, 10)
      this.cone('roof', tx, ty, h + 0.5, 0.55, 0.38, 10)
    }
    // The door in the middle of the south face; a dark hole once broken.
    const dx = k.x + 1.5
    const dy = k.y + 3
    if (k.doorHp > 0) {
      this.box('door', dx - 0.22, dy - 0.02, 0, dx + 0.22, dy + 0.04, 0.8)
      this.cyl('door', dx, dy + 0.01, 0.62, 0.68, 0.22, 10)
      for (const bz of [0.22, 0.55]) this.box('iron', dx - 0.23, dy + 0.03, bz, dx + 0.23, dy + 0.05, bz + 0.04)
    } else {
      this.box('hole', dx - 0.22, dy - 0.02, 0, dx + 0.22, dy + 0.02, 0.85)
      this.rod('door', [dx - 0.3, dy + 0.25, 0.02], [dx - 0.05, dy + 0.4, 0.05], 0.03)
      this.rod('door', [dx + 0.1, dy + 0.3, 0.02], [dx + 0.35, dy + 0.15, 0.04], 0.03)
    }
    // Flag.
    const fx = k.x + 1.5
    const fy = k.y + 1.5
    this.cyl('trunk', fx, fy, h, h + 1.4, 0.03, 5)
    const flag = new THREE.PlaneGeometry(0.7, 0.4)
    flag.translate(fx + 0.35, h + 1.2, fy)
    this.add('player', flag)
  }

  spawnFlag(x, y) {
    this.cyl('trunk', x, y, 0, 1.6, 0.03, 5)
    const flag = new THREE.PlaneGeometry(0.55, 0.32)
    flag.translate(x + 0.28, 1.42, y)
    this.add('banner', flag)
  }

  // ---- units (instanced, rebuilt every frame) ----------------------------------

  buildPools() {
    const pool = (name, geo, max, opts = {}) => {
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, ...opts })
      const mesh = new THREE.InstancedMesh(geo, material, max)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.count = 0
      mesh.frustumCulled = false
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      this.scene.add(mesh)
      this.pools[name] = { mesh, n: 0, max }
    }
    pool('body', new THREE.CapsuleGeometry(1, 1, 3, 8), 600) // scaled per unit
    pool('head', new THREE.SphereGeometry(1, 10, 8), 600)
    pool('rod', new THREE.CylinderGeometry(1, 1, 1, 5), 900) // weapons, arrows, catapult arms
    pool('box', new THREE.BoxGeometry(1, 1, 1), 200) // rams and catapults
    pool('ball', new THREE.SphereGeometry(1, 8, 6), 200) // boulders, ram heads, wheels
    pool('disc', new THREE.CylinderGeometry(1, 1, 1, 10), 200) // shields
    // Soft round shadows under the troop models (cheaper than casting).
    const blob = document.createElement('canvas')
    blob.width = blob.height = 64
    const bg = blob.getContext('2d')
    const grad = bg.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(0,0,0,0.55)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    bg.fillStyle = grad
    bg.fillRect(0, 0, 64, 64)
    const blobGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)
    const blobMesh = new THREE.InstancedMesh(blobGeo, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(blob), transparent: true, depthWrite: false }), 400)
    blobMesh.count = 0
    blobMesh.frustumCulled = false
    blobMesh.renderOrder = 1
    blobMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.scene.add(blobMesh)
    this.pools.blob = { mesh: blobMesh, n: 0, max: 400 }
  }

  put(name, pos, quat, scale, hex) {
    const p = this.pools[name]
    if (p.n >= p.max) return
    const { m, c } = this.tmp
    // Units are drawn at UNIT_SCALE about their own position.
    const a = this.anchor
    if (a) {
      pos = pos.clone().sub(a).multiplyScalar(UNIT_SCALE).add(a)
      scale = scale.clone().multiplyScalar(UNIT_SCALE)
    }
    m.compose(pos, quat, scale)
    p.mesh.setMatrixAt(p.n, m)
    p.mesh.setColorAt(p.n, c.setHex(hex))
    p.n++
  }

  // A rod between two points (game [x, y, z]).
  putRod(a, b, r, hex) {
    const A = new THREE.Vector3(a[0], a[2], a[1])
    const B = new THREE.Vector3(b[0], b[2], b[1])
    const dir = B.clone().sub(A)
    const len = dir.length() || 0.001
    this.put('rod', A.add(B).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(UP, dir.divideScalar(len)), new THREE.Vector3(r, len, r), hex)
  }

  // Upright figure: capsule body and a head.
  figure(x, y, z, r, h, body, head) {
    const q = new THREE.Quaternion()
    this.put('body', new THREE.Vector3(x, z + h / 2, y), q, new THREE.Vector3(r, h / 3, r), body)
    this.put('head', new THREE.Vector3(x, z + h + r * 0.45, y), q, new THREE.Vector3(r * 0.6, r * 0.6, r * 0.6), head)
  }

  // Place (creating if new) the animated model for a unit. `key` is unique
  // per figure; `unit` is the game object, watched for shots and death.
  actor(id, look, unit, x, y, z, heading, { fighting = false, flash = false, height } = {}) {
    const key = `${look}:${id}`
    let a = this.actors.get(key)
    // Ids restart with a new game: a different unit under an old key.
    if (a && a.unit !== unit) {
      a.actor.dispose()
      this.actors.delete(key)
      a = null
    }
    if (!a) {
      a = { actor: new Actor(look, height), px: x, py: y, cd: unit.cd ?? 0, unit, slot: this.actors.size }
      this.actorGroup.add(a.actor.object)
      this.actors.set(key, a)
    }
    this.seen.add(key)
    const dt = this.dt
    const moving = dt > 0 ? Math.hypot(x - a.px, y - a.py) / dt / UNIT_SCALE : 0
    a.px = x
    a.py = y
    const o = a.actor.object
    o.position.set(x, z, y)
    const r = (height ?? 0.62) * 0.75 * UNIT_SCALE
    const saved = this.anchor
    this.anchor = null
    this.put('blob', new THREE.Vector3(x, z + 0.02, y), new THREE.Quaternion(), new THREE.Vector3(r, 1, r), 0xffffff)
    this.anchor = saved
    o.scale.setScalar(UNIT_SCALE)
    a.actor.face(heading)
    // A shot loosed: the cooldown jumped back up.
    if (unit.cd !== undefined) {
      if (unit.cd > a.cd + 0.05) a.actor.strike()
      a.cd = unit.cd
    }
    a.actor.flash(flash)
    // With a crowd on screen, pose each figure every other frame.
    const skip = this.actors.size > 50 && (this.frameNo + a.slot) % 2 === 1
    a.actor.update(dt, { moving, fighting, skip })
  }

  // Models whose unit is gone: the dead fall and fade, the rest vanish.
  sweepActors() {
    for (const [key, a] of this.actors) {
      if (this.seen.has(key)) continue
      if (a.dying === undefined && (a.unit.hp ?? 1) <= 0 && this.dt > 0) a.dying = 1.6
      if (a.dying > 0) {
        a.dying -= this.dt
        a.actor.flash(false)
        a.actor.update(this.dt, { dead: true })
        if (a.dying < 0.4) a.actor.object.position.y -= this.dt * 0.25
        if (a.dying > 0) continue
      }
      a.actor.dispose()
      this.actors.delete(key)
    }
  }

  drawUnits(game) {
    for (const p of Object.values(this.pools)) p.n = 0
    const t = game.time
    this.dt = this.lastTime === null ? 0 : Math.min(0.1, Math.max(0, t - this.lastTime))
    this.lastTime = t
    this.frameNo = (this.frameNo || 0) + 1
    this.seen = new Set()
    const models = unitsReady()
    const yaw = (heading) => new THREE.Quaternion().setFromAxisAngle(UP, -heading)

    for (const e of game.enemies) {
      this.anchor = new THREE.Vector3(e.x, e.z, e.y)
      const hit = e.flash > 0
      const bob = Math.abs(Math.sin(e.walk)) * 0.05
      if (e.type === 'ram') {
        const col = hit ? 0xffffff : C.ram
        this.put('box', new THREE.Vector3(e.x, e.z + 0.26, e.y), yaw(e.heading), new THREE.Vector3(0.9, 0.34, 0.5), col)
        this.put('box', new THREE.Vector3(e.x, e.z + 0.5, e.y), yaw(e.heading), new THREE.Vector3(0.8, 0.12, 0.56), 0x5a3e24)
        const push = e.attacking ? Math.abs(Math.sin(e.walk)) * 0.12 : 0
        this.put('ball', new THREE.Vector3(e.x + Math.cos(e.heading) * (0.48 + push), e.z + 0.26, e.y + Math.sin(e.heading) * (0.48 + push)), new THREE.Quaternion(), new THREE.Vector3(0.12, 0.12, 0.12), C.iron)
        continue
      }
      if (e.type === 'catapult') {
        this.catapult(e, t, hit)
        continue
      }
      if (e.type === 'ladder') {
        // Two raiders with a ladder on their shoulders.
        const hx = Math.cos(e.heading)
        const hy = Math.sin(e.heading)
        for (const [o, ph] of [[0.24, 0], [-0.24, Math.PI]]) {
          if (models) {
            this.actor(`${e.id}:${o}`, 'raider', e, e.x + hx * o, e.y + hy * o, e.z, e.heading, { flash: hit, height: 0.56 })
            continue
          }
          const b = Math.abs(Math.sin(e.walk + ph)) * 0.05
          this.figure(e.x + hx * o, e.y + hy * o, e.z + b, 0.15, 0.46, hit ? 0xffffff : C.raider, C.skin)
        }
        const lift = Math.min(1, e.raising / 1.2) * 0.9
        this.ladder([e.x - hx * 0.5, e.y - hy * 0.5, e.z + 0.52], [e.x + hx * 0.5, e.y + hy * 0.5, e.z + 0.52 + lift])
        continue
      }
      if (models) {
        this.actor(e.id, e.type, e, e.x, e.y, e.z, e.heading, { fighting: e.attacking && e.type !== 'bowman', flash: hit })
        continue
      }
      const big = e.type === 'brute'
      const h = big ? 0.6 : 0.48
      const body = hit ? 0xffffff : C[e.type]
      this.figure(e.x, e.y, e.z + bob, (e.r / UNIT_SCALE) * 0.8, h, body, big ? C.helmet : e.type === 'bowman' ? 0x33442a : C.skin)
      const swing = e.attacking ? Math.sin(e.walk * 2) * 0.5 : 0
      const reach = big ? 0.42 : 0.34
      const hz = e.z + h * 0.6 + bob
      if (e.type === 'bowman') this.bow(e.x, e.y, e.z, e.heading, 0x3b2a18)
      else this.putRod([e.x, e.y, hz], [e.x + Math.cos(e.heading + swing) * reach, e.y + Math.sin(e.heading + swing) * reach, hz + 0.1 + swing * 0.15], 0.025, big ? 0x3b3b3b : 0xd0d0d0)
    }

    // Barred gates: a beam across the door, both faces.
    for (const i of game.gateLocks.keys()) {
      const w = game.world
      if (w.tiles[i].broken) continue
      const x = (i % w.w) + 0.5
      const y = ((i / w.w) | 0) + 0.5
      const alongX = this.connects(w, x - 0.5, y - 0.5, 1, 0) || this.connects(w, x - 0.5, y - 0.5, -1, 0) || !(this.connects(w, x - 0.5, y - 0.5, 0, 1) || this.connects(w, x - 0.5, y - 0.5, 0, -1))
      const z = w.minGround(i) + 0.45
      this.put('box', new THREE.Vector3(x, z, y), new THREE.Quaternion(), alongX ? new THREE.Vector3(0.5, 0.09, 0.2) : new THREE.Vector3(0.2, 0.09, 0.5), 0x4a4038)
    }
    this.anchor = null
    for (const l of game.ladders) {
      const g = game.ladderGeom(l)
      this.ladder([g.fx, g.fy, g.fz], [g.tx, g.ty, g.tz])
    }
    for (const f of game.fallen) {
      const z = game.world.heightAt(f.x, f.y) + 0.04
      const [dx, dy] = f.dir
      this.ladder([f.x + dx * 0.55, f.y + dy * 0.55, z], [f.x - dx * 0.55, f.y - dy * 0.55, z])
    }
    // Oil cauldrons and rock buckets on the walls; earth thrown into moats.
    const w = game.world
    for (let i = 0; i < w.tiles.length; i++) {
      const t = w.tiles[i]
      if (!t.oil && !t.rocks && !(t.type === 'moat' && t.fill > 0)) continue
      const cx = (i % w.w) + 0.5
      const cy = ((i / w.w) | 0) + 0.5
      const q = new THREE.Quaternion()
      if (t.type === 'moat') {
        const f = Math.min(1, t.fill / MOAT.fill)
        this.put('disc', new THREE.Vector3(cx, -0.06, cy), q, new THREE.Vector3(0.15 + f * 0.35, 0.03, 0.15 + f * 0.35), 0x68523a)
        continue
      }
      if (t.oil) {
        const z = w.surfaceAt(i, cx - 0.18, cy - 0.12)
        this.put('disc', new THREE.Vector3(cx - 0.18, z + 0.09, cy - 0.12), q, new THREE.Vector3(0.12, 0.18, 0.12), 0x36322e)
        if (!t.oilUsed) this.put('disc', new THREE.Vector3(cx - 0.18, z + 0.185, cy - 0.12), q, new THREE.Vector3(0.1, 0.01, 0.1), 0x96601a)
      }
      if (t.rocks) {
        const z = w.surfaceAt(i, cx + 0.16, cy + 0.12)
        this.put('box', new THREE.Vector3(cx + 0.17, z + 0.07, cy + 0.13), q, new THREE.Vector3(0.24, 0.14, 0.24), 0x70502e)
        if (!t.rocksUsed)
          for (const [ox, oy] of [[0.11, 0.08], [0.21, 0.1], [0.15, 0.18]]) this.put('ball', new THREE.Vector3(cx + ox, z + 0.18, cy + oy), q, new THREE.Vector3(0.05, 0.05, 0.05), 0x8d877c)
      }
    }
    // The lord on the keep roof, crowned.
    const k = game.world.keep
    const lx = k.x + 2.35
    const ly = k.y + 2.3
    const lz = KEEP.height
    this.anchor = new THREE.Vector3(lx, lz, ly)
    const struck = k.inside > 0 && Math.sin(t * 20) > 0.6
    if (models) {
      this.actor('lord', 'lord', k, lx, ly, lz, Math.PI * 0.75, { fighting: k.inside > 0, flash: struck })
      this.put('disc', new THREE.Vector3(lx, lz + 0.62 * UNIT_SCALE, ly), new THREE.Quaternion(), new THREE.Vector3(0.06, 0.04, 0.06), C.crown)
    } else {
      this.figure(lx, ly, lz, 0.13, 0.36, struck ? 0xffffff : C.lord, C.skin)
      this.put('disc', new THREE.Vector3(lx, lz + 0.5, ly), new THREE.Quaternion(), new THREE.Vector3(0.07, 0.05, 0.07), C.crown)
    }

    for (const a of game.archers) {
      if (models) {
        this.actor(a.id, 'archer', a, a.x, a.y, a.z, a.heading, { flash: a.flash > 0 })
        continue
      }
      this.anchor = new THREE.Vector3(a.x, a.z, a.y)
      const walking = a.path.length > 0
      const bob = walking ? Math.abs(Math.sin(t * 12 + a.id)) * 0.04 : 0
      this.figure(a.x, a.y, a.z + bob, 0.11, 0.3, a.flash > 0 ? 0xffffff : C.player, C.skin)
      this.bow(a.x, a.y, a.z + bob, a.heading, 0x6b4423)
    }

    for (const s of game.swordsmen) {
      if (models) {
        this.actor(s.id, 'swordsman', s, s.x, s.y, s.z, s.heading, { fighting: s.fighting, flash: s.flash > 0 })
        continue
      }
      this.anchor = new THREE.Vector3(s.x, s.z, s.y)
      const bob = Math.abs(Math.sin(s.walk)) * 0.04
      this.figure(s.x, s.y, s.z + bob, (s.r / UNIT_SCALE) * 0.8, 0.48, s.flash > 0 ? 0xffffff : C.player, C.helmet)
      const h = s.heading
      const swing = s.fighting ? Math.sin(s.walk * 2) * 0.6 : 0.3
      const hz = s.z + 0.32 + bob
      this.putRod([s.x + Math.cos(h + 1.2) * 0.12, s.y + Math.sin(h + 1.2) * 0.12, hz], [s.x + Math.cos(h + swing) * 0.42, s.y + Math.sin(h + swing) * 0.42, hz + 0.12], 0.022, 0xdfe4ea)
      // Shield on the left arm, facing out.
      const sx = s.x + Math.cos(h - 1.1) * 0.17
      const sy = s.y + Math.sin(h - 1.1) * 0.17
      const q = new THREE.Quaternion().setFromUnitVectors(UP, new THREE.Vector3(Math.cos(h - 1.1), 0, Math.sin(h - 1.1)))
      this.put('disc', new THREE.Vector3(sx, s.z + 0.3 + bob, sy), q, new THREE.Vector3(0.12, 0.03, 0.12), C.shield)
    }

    this.anchor = null
    this.sweepActors()
    for (const p of game.projectiles) {
      if (p.kind === 'boulder') {
        this.put('ball', new THREE.Vector3(p.x, p.z, p.y), new THREE.Quaternion(), new THREE.Vector3(0.14, 0.14, 0.14), C.boulder)
        continue
      }
      const dx = p.x - p.px
      const dy = p.y - p.py
      const dz = p.z - p.pz
      const l = Math.hypot(dx, dy, dz) || 1
      this.putRod([p.x - (dx / l) * 0.35, p.y - (dy / l) * 0.35, p.z - (dz / l) * 0.35], [p.x, p.y, p.z], 0.015, p.hostile ? C.arrowHostile : C.arrow)
    }

    for (const p of Object.values(this.pools)) {
      p.mesh.count = p.n
      p.mesh.instanceMatrix.needsUpdate = true
      if (p.mesh.instanceColor) p.mesh.instanceColor.needsUpdate = true
    }
  }

  // Two rails and rungs between game points a and b.
  ladder(a, b) {
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    const px = (-dy / len) * 0.13
    const py = (dx / len) * 0.13
    this.putRod([a[0] - px, a[1] - py, a[2]], [b[0] - px, b[1] - py, b[2]], 0.025, C.ladder)
    this.putRod([a[0] + px, a[1] + py, a[2]], [b[0] + px, b[1] + py, b[2]], 0.025, C.ladder)
    for (let r = 1; r < 6; r++) {
      const f = r / 6
      const x = a[0] + dx * f
      const y = a[1] + dy * f
      const z = a[2] + (b[2] - a[2]) * f
      this.putRod([x - px, y - py, z], [x + px, y + py, z], 0.018, 0x7a5a34)
    }
  }

  bow(x, y, z, heading, hex) {
    const bx = x + Math.cos(heading) * 0.18
    const by = y + Math.sin(heading) * 0.18
    const px = -Math.sin(heading) * 0.13
    const py = Math.cos(heading) * 0.13
    this.putRod([bx - px, by - py, z + 0.18], [bx + px, by + py, z + 0.48], 0.015, hex)
  }

  catapult(e, time, hit) {
    const col = hit ? 0xffffff : C.catapult
    const c = Math.cos(e.heading)
    const s = Math.sin(e.heading)
    const z = e.z
    this.put('box', new THREE.Vector3(e.x, z + 0.17, e.y), new THREE.Quaternion().setFromAxisAngle(UP, -e.heading), new THREE.Vector3(0.84, 0.16, 0.5), col)
    for (const [l, w] of [[0.3, 0.27], [0.3, -0.27], [-0.3, 0.27], [-0.3, -0.27]])
      this.put('ball', new THREE.Vector3(e.x + c * l - s * w, z + 0.1, e.y + s * l + c * w), new THREE.Quaternion(), new THREE.Vector3(0.1, 0.1, 0.1), 0x3a2a1a)
    const pz = z + 0.7
    const px = -s * 0.2
    const py = c * 0.2
    this.putRod([e.x + px, e.y + py, z + 0.25], [e.x, e.y, pz], 0.03, 0x5a3e28)
    this.putRod([e.x - px, e.y - py, z + 0.25], [e.x, e.y, pz], 0.03, 0x5a3e28)
    const since = time - e.fired
    const fwd = since < 0.18 ? since / 0.18 : Math.max(0, 1 - (since - 0.18) / 1.8)
    const ang = -0.45 + fwd * 1.9
    const ex = e.x - c * Math.cos(ang) * 0.7
    const ey = e.y - s * Math.cos(ang) * 0.7
    const ez = pz + Math.sin(ang) * 0.7
    this.putRod([e.x + c * 0.18, e.y + s * 0.18, pz - Math.sin(ang) * 0.18], [ex, ey, ez], 0.035, col)
    this.put('ball', new THREE.Vector3(ex, ez + 0.05, ey), new THREE.Quaternion(), new THREE.Vector3(0.1, 0.1, 0.1), since > 1.2 ? C.boulder : 0x4a3626)
  }

  dispose() {
    this.renderer.dispose()
  }
}
