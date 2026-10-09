// Animated character models for the troops on both sides: Quaternius' CC0
// RPG characters (converted by scripts/units/), with the clothing recoloured
// blue for the defenders and in drab greys and browns for the attackers.

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'

import warriorUrl from './units/warrior.glb'
import rangerUrl from './units/ranger.glb'
import rogueUrl from './units/rogue.glb'
import clericUrl from './units/cleric.glb'
import warriorBlue from './units/warrior_blue.jpg'
import warriorDrab from './units/warrior_drab.jpg'
import rangerBlue from './units/ranger_blue.jpg'
import rangerDrab from './units/ranger_drab.jpg'
import rogueDrab from './units/rogue_drab.jpg'
import clericBlue from './units/cleric_blue.jpg'
import swordTex from './units/sword.jpg'
import bowTex from './units/bow.jpg'
import daggerTex from './units/dagger.jpg'
import staffTex from './units/staff.jpg'

const MODEL_URLS = { warrior: warriorUrl, ranger: rangerUrl, rogue: rogueUrl, cleric: clericUrl }
const SKIN_URLS = {
  warrior_blue: warriorBlue,
  warrior_drab: warriorDrab,
  ranger_blue: rangerBlue,
  ranger_drab: rangerDrab,
  rogue_drab: rogueDrab,
  cleric_blue: clericBlue,
}
const WEAPON_URLS = { sword: swordTex, bow: bowTex, dagger: daggerTex, staff: staffTex }

// How each kind of unit looks. `height` is in tiles, before UNIT_SCALE.
export const LOOKS = {
  swordsman: { model: 'warrior', skin: 'warrior_blue', weapon: 'sword', height: 0.66 },
  archer: { model: 'ranger', skin: 'ranger_blue', weapon: 'bow', height: 0.6 },
  lord: { model: 'cleric', skin: 'cleric_blue', weapon: 'staff', height: 0.62 },
  raider: { model: 'rogue', skin: 'rogue_drab', weapon: 'dagger', height: 0.62 },
  brute: { model: 'warrior', skin: 'warrior_drab', weapon: 'sword', height: 0.8 },
  bowman: { model: 'ranger', skin: 'ranger_drab', weapon: 'bow', height: 0.6 },
}

let models = null
let atlases = null
let loading = null

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

// One texture per look: the recoloured body on the left half, the weapon in
// the top of the right half (the layout convert.html maps the UVs to).
function atlasCanvas(body, weapon) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const g = c.getContext('2d')
  g.drawImage(body, 0, 0, 256, 256)
  g.drawImage(weapon, 256, 0, 128, 128)
  return c
}

export function loadUnits() {
  if (loading) return loading
  const gltf = new GLTFLoader()
  loading = Promise.all([
    Promise.all(Object.entries(MODEL_URLS).map(async ([k, url]) => [k, await gltf.loadAsync(url)])),
    Promise.all(Object.entries(SKIN_URLS).map(async ([k, url]) => [k, await loadImage(url)])),
    Promise.all(Object.entries(WEAPON_URLS).map(async ([k, url]) => [k, await loadImage(url)])),
  ])
    .then(([m, skins, weapons]) => {
      const sk = Object.fromEntries(skins)
      const wp = Object.fromEntries(weapons)
      models = {}
      for (const [k, g] of m) {
        const root = g.scene
        // Measure the model standing idle so every look can be sized.
        const mixer = new THREE.AnimationMixer(root)
        const idle = g.animations.find((a) => a.name === 'idle')
        mixer.clipAction(idle).play()
        mixer.update(0)
        root.updateMatrixWorld(true)
        const box = new THREE.Box3()
        root.traverse((o) => {
          if (o.isSkinnedMesh) {
            o.computeBoundingBox()
            box.union(o.boundingBox.clone().applyMatrix4(o.matrixWorld))
          }
        })
        mixer.stopAllAction()
        models[k] = { root, clips: Object.fromEntries(g.animations.map((a) => [a.name, a])), height: box.max.y - box.min.y, foot: box.min.y }
      }
      atlases = {}
      for (const [id, look] of Object.entries(LOOKS)) atlases[id] = atlasCanvas(sk[look.skin], wp[look.weapon])
    })
    .catch(() => {
      models = null
    })
  return loading
}

export const unitsReady = () => !!models

// The texture canvas for a look (also used to bake the classic sprites).
export const lookAtlas = (id) => atlases?.[id]

const textures = {}
function lookTexture(id) {
  if (!textures[id]) {
    const t = new THREE.CanvasTexture(atlases[id])
    t.colorSpace = THREE.SRGBColorSpace
    textures[id] = t
  }
  return textures[id]
}

// A posable, animated copy of a look. `object` is placed with its feet at
// the origin, facing +x when `face(heading)` is called with 0, and scaled to
// `height` tiles.
export class Actor {
  constructor(id, height) {
    const look = LOOKS[id]
    const m = models[look.model]
    this.id = id
    this.object = new THREE.Group()
    this.body = cloneSkinned(m.root)
    const s = (height ?? look.height) / m.height
    this.body.scale.setScalar(s)
    this.body.position.y = -m.foot * s
    // A little of the texture glows through so the small figures don't sink
    // into shadow; a hit flashes it bright.
    const map = lookTexture(id)
    this.material = new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: 0x3a3a3a, roughness: 0.85, metalness: 0 })
    this.body.traverse((o) => {
      if (o.isSkinnedMesh) {
        o.material = this.material
        o.castShadow = false
        o.frustumCulled = false
      }
    })
    this.object.add(this.body)
    this.mixer = new THREE.AnimationMixer(this.body)
    this.actions = {}
    for (const [name, clip] of Object.entries(m.clips)) this.actions[name] = this.mixer.clipAction(clip)
    for (const name of ['attack', 'draw', 'death']) {
      const a = this.actions[name]
      if (!a) continue
      a.setLoop(THREE.LoopOnce)
      a.clampWhenFinished = true
    }
    this.state = null
    this.once = 0
    this.play('idle')
  }

  play(name, fade = 0.15) {
    if (this.state === name || !this.actions[name]) return
    const next = this.actions[name]
    next.reset().play()
    if (this.state) next.crossFadeFrom(this.actions[this.state], fade, false)
    this.state = name
  }

  // One swing or shot, then back to whatever the loop state is.
  strike() {
    this.play('attack', 0.08)
    this.once = this.actions.attack.getClip().duration
  }

  face(heading) {
    this.object.rotation.y = Math.PI / 2 - heading
  }

  // `moving` is the ground speed in tiles per second; `fighting` loops the
  // attack. Death plays out once.
  // `skip` defers the (costly) pose update to a later frame.
  update(dt, { moving = 0, fighting = false, dead = false, skip = false } = {}) {
    if (dead) this.play('death', 0.1)
    else if (this.once > 0) this.once -= dt
    else if (fighting) {
      this.play('attack', 0.1)
      if (this.actions.attack.time >= this.actions.attack.getClip().duration - 1e-3) this.actions.attack.reset().play()
    } else if (moving > 0.6) this.play('run')
    else if (moving > 0.05) this.play('walk')
    else this.play('idle', 0.25)
    // Match the stride to the ground speed (tiles per second at full size).
    if (this.state === 'walk') this.actions.walk.timeScale = Math.min(1.6, Math.max(0.6, moving / 0.4))
    if (this.state === 'run') this.actions.run.timeScale = Math.min(1.8, Math.max(0.8, moving / 1.1))
    this.pending = (this.pending || 0) + dt
    if (skip) return
    this.mixer.update(this.pending)
    this.pending = 0
  }

  flash(on) {
    this.material.emissive.setHex(on ? 0xd0d0d0 : 0x3a3a3a)
  }

  dispose() {
    this.mixer.stopAllAction()
    this.material.dispose()
    this.object.removeFromParent()
  }
}

// ---- sprites for the classic view -------------------------------------------
//
// Each look is drawn into a sheet from the same models: 8 facings across,
// and down the sheet the frames of each animation, seen from the classic
// isometric camera (30 degrees up). Baked once, in the background.

export const SPRITE = { cell: 72, world: 1.15, footY: 62, dirs: 8 }
export const SPRITE_ANIMS = { idle: 2, walk: 6, run: 6, attack: 6, death: 5 }
const ROWS = Object.values(SPRITE_ANIMS).reduce((a, b) => a + b, 0)
const ROW_OF = {}
{
  let r = 0
  for (const [k, n] of Object.entries(SPRITE_ANIMS)) {
    ROW_OF[k] = r
    r += n
  }
}

let sheets = null
let baking = null

export const spritesReady = () => !!sheets

export function bakeSprites() {
  if (baking) return baking
  baking = loadUnits().then(
    () =>
      new Promise((resolve) => {
        if (!models) return resolve()
        const { cell, world, footY, dirs } = SPRITE
        let gl
        try {
          gl = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true })
        } catch {
          return resolve()
        }
        gl.setPixelRatio(1)
        gl.setSize(cell, cell)
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.15
        gl.setClearColor(0x000000, 0)
        const scene = new THREE.Scene()
        scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x3a4a2a, 1.3))
        const sun = new THREE.DirectionalLight(0xfff0d8, 2.4)
        sun.position.set(-3, 5, 4)
        scene.add(sun)
        const px = world / cell
        const cam = new THREE.OrthographicCamera(-cell / 2 * px, cell / 2 * px, footY * px, -(cell - footY) * px, -10, 10)
        const elev = Math.PI / 6
        cam.position.set(0, Math.sin(elev), Math.cos(elev))
        cam.lookAt(0, 0, 0)
        const jobs = Object.keys(LOOKS)
        const out = {}
        let li = 0
        let actor = null
        let sheet = null
        let g = null
        // A few looks per frame so the game stays responsive.
        const step = () => {
          const t0 = performance.now()
          while (li < jobs.length && performance.now() - t0 < 12) {
            const id = jobs[li]
            sheet = document.createElement('canvas')
            sheet.width = cell * dirs
            sheet.height = cell * ROWS
            g = sheet.getContext('2d')
            actor = new Actor(id)
            actor.material.emissive.setHex(0x303030)
            scene.add(actor.object)
            for (const [anim, n] of Object.entries(SPRITE_ANIMS)) {
              const action = actor.actions[anim]
              const dur = action.getClip().duration
              actor.mixer.stopAllAction()
              action.reset().play()
              for (let f = 0; f < n; f++) {
                // Death holds its last frame; loops are sampled evenly.
                const time = anim === 'death' ? (dur * f) / (n - 1) : (dur * f) / n
                action.time = Math.min(time, dur - 1e-3)
                actor.mixer.update(0)
                for (let d = 0; d < dirs; d++) {
                  actor.face((d / dirs) * Math.PI * 2)
                  gl.render(scene, cam)
                  g.drawImage(gl.domElement, d * cell, (ROW_OF[anim] + f) * cell)
                }
              }
            }
            actor.dispose()
            out[id] = sheet
            li++
          }
          if (li < jobs.length) requestAnimationFrame(step)
          else {
            gl.dispose()
            gl.forceContextLoss?.()
            sheets = out
            resolve()
          }
        }
        requestAnimationFrame(step)
      }),
  )
  return baking
}

// Pick the frame to draw: which sheet, and the source rectangle in it.
// `dirAngle` is the facing in the camera's frame (0 = screen right, pi/2 =
// toward the viewer).
export function spriteFrame(id, anim, frame, dirAngle) {
  const sheet = sheets?.[id]
  if (!sheet) return null
  const { cell, dirs } = SPRITE
  const n = SPRITE_ANIMS[anim]
  const d = ((Math.round((dirAngle / (Math.PI * 2)) * dirs) % dirs) + dirs) % dirs
  const f = Math.min(n - 1, Math.max(0, frame))
  return { sheet, sx: d * cell, sy: (ROW_OF[anim] + f) * cell }
}

// Animation state for a sprite: what's playing and how far along. Mirrors
// Actor.update so both views move alike.
export class SpriteAnim {
  constructor() {
    this.anim = 'idle'
    this.t = 0
    this.once = 0
  }

  strike() {
    this.anim = 'attack'
    this.t = 0
    this.once = 0.8
  }

  update(dt, { moving = 0, fighting = false, dead = false } = {}) {
    let next
    if (dead) next = 'death'
    else if (this.once > 0) {
      this.once -= dt
      next = 'attack'
    } else if (fighting) next = 'attack'
    else if (moving > 0.6) next = 'run'
    else if (moving > 0.05) next = 'walk'
    else next = 'idle'
    if (next !== this.anim) {
      this.anim = next
      this.t = 0
    }
    // Cycle lengths in seconds, sped up to match the ground speed.
    const len = { idle: 3, walk: 1.25, run: 0.88, attack: 0.8, death: 1.1 }[this.anim]
    let rate = 1
    if (this.anim === 'walk') rate = Math.min(1.6, Math.max(0.6, moving / 0.4))
    if (this.anim === 'run') rate = Math.min(1.8, Math.max(0.8, moving / 1.1))
    this.t += (dt * rate) / len
    const n = SPRITE_ANIMS[this.anim]
    this.frame = this.anim === 'death' ? Math.min(n - 1, Math.floor(this.t * n)) : Math.floor((this.t % 1) * n)
  }
}
