// Painted ground shared by both renderers: photographic CC0 textures
// (ambientCG and Poly Haven) tiled across the map and blended into each
// other with soft edges, the way Stronghold paints its fields.

import grassUrl from './tex/grass.jpg'
import grassLightUrl from './tex/grassLight.jpg'
import meadowUrl from './tex/meadow.jpg'
import hillUrl from './tex/hill.jpg'
import marshUrl from './tex/marsh.jpg'
import earthUrl from './tex/earth.jpg'
import bedUrl from './tex/bed.jpg'
import cliffUrl from './tex/rock.jpg'

const URLS = { grass: grassUrl, grassLight: grassLightUrl, meadow: meadowUrl, hill: hillUrl, marsh: marshUrl, earth: earthUrl, bed: bedUrl, cliff: cliffUrl }

// Pixels per tile in the painted ground, and how many tiles one texture
// image spans before it repeats.
export const GROUND_PX = 64
const REPEAT_TILES = 2

let images = null
let loading = null

// Start loading the textures; resolves when they're ready to paint.
export function loadTerrain() {
  if (loading) return loading
  loading = Promise.all(
    Object.entries(URLS).map(
      ([name, url]) =>
        new Promise((resolve) => {
          const img = new Image()
          img.onload = () => resolve([name, img])
          img.onerror = () => resolve([name, null])
          img.src = url
        }),
    ),
  ).then((list) => {
    images = Object.fromEntries(list)
  })
  return loading
}

export function terrainReady() {
  return !!images && Object.values(images).every(Boolean)
}

function rng(seed) {
  let s = seed % 2147483647 || 1
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

// A mask canvas, 8 pixels per tile, opaque where `on(tile)`, with organic
// edges: the tile grid is smoothed into a field, roughened with noise, and
// cut with a soft threshold. `soft` widens the fade (in field units).
function tileMask(world, soft, on, seed = 1) {
  const R = 8
  const { w, h } = world
  const ind = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) ind[i] = on(world.tiles[i], i) ? 1 : 0
  const at = (x, y) => ind[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))]
  // Value noise on a half-tile grid.
  const rnd = rng(seed * 7919 + 17)
  const NW = w * 2 + 3
  const NH = h * 2 + 3
  const noise = new Float32Array(NW * NH)
  for (let k = 0; k < noise.length; k++) noise[k] = rnd() - 0.5
  const nAt = (x, y) => {
    const fx = x * 2 + 1
    const fy = y * 2 + 1
    const x0 = Math.floor(fx)
    const y0 = Math.floor(fy)
    const tx = fx - x0
    const ty = fy - y0
    const n = (a, b) => noise[b * NW + a]
    return (n(x0, y0) * (1 - tx) + n(x0 + 1, y0) * tx) * (1 - ty) + (n(x0, y0 + 1) * (1 - tx) + n(x0 + 1, y0 + 1) * tx) * ty
  }
  const c = document.createElement('canvas')
  c.width = w * R
  c.height = h * R
  const g = c.getContext('2d')
  const img = g.createImageData(c.width, c.height)
  for (let py = 0; py < c.height; py++)
    for (let px = 0; px < c.width; px++) {
      const x = (px + 0.5) / R
      const y = (py + 0.5) / R
      const u = x - 0.5
      const v = y - 0.5
      const x0 = Math.floor(u)
      const y0 = Math.floor(v)
      const tx = u - x0
      const ty = v - y0
      const f = (at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx) * (1 - ty) + (at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx) * ty
      const t = Math.min(1, Math.max(0, (f + nAt(x, y) * 0.45 - 0.5 + soft) / (2 * soft)))
      const a = t * t * (3 - 2 * t)
      const o = (py * c.width + px) * 4
      img.data[o] = img.data[o + 1] = img.data[o + 2] = 255
      img.data[o + 3] = a * 255
    }
  g.putImageData(img, 0, 0)
  return c
}

// Soft random blobs about `size` tiles across, opaque up to `amount`.
function noiseMask(world, size, amount, seed) {
  const rnd = rng(seed)
  const c = document.createElement('canvas')
  c.width = Math.ceil(world.w / size) + 2
  c.height = Math.ceil(world.h / size) + 2
  const g = c.getContext('2d')
  for (let y = 0; y < c.height; y++)
    for (let x = 0; x < c.width; x++) {
      const a = Math.max(0, rnd() * 1.6 - 0.6) * amount
      g.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`
      g.fillRect(x, y, 1, 1)
    }
  return c
}

// Sunlight on the slopes of hills, as a soft overlay: slopes facing the
// sun (from the south-west, as in render.js) lighten, the rest darken.
function hillShade(world) {
  const R = 8 // samples per tile
  const c = document.createElement('canvas')
  c.width = world.w * R
  c.height = world.h * R
  const g = c.getContext('2d')
  const img = g.createImageData(c.width, c.height)
  const sun = [-0.55 / Math.hypot(0.55, 0.83), 0.83 / Math.hypot(0.55, 0.83)]
  // Measure slope over most of a tile so the flat facets of the height
  // fan blend into one smooth surface.
  const e = 0.45
  for (let y = 0; y < c.height; y++)
    for (let x = 0; x < c.width; x++) {
      const px = (x + 0.5) / R
      const py = (y + 0.5) / R
      const dx = (world.heightAt(px + e, py) - world.heightAt(px - e, py)) / (2 * e)
      const dy = (world.heightAt(px, py + e) - world.heightAt(px, py - e)) / (2 * e)
      const n = Math.hypot(dx, dy, 1)
      const lit = ((-dx * sun[0] - dy * sun[1]) / n) * 1.1
      const o = (y * c.width + x) * 4
      if (lit >= 0) {
        img.data[o] = 255
        img.data[o + 1] = 246
        img.data[o + 2] = 214
        img.data[o + 3] = Math.min(255, lit * 0.45 * 255)
      } else {
        img.data[o] = 14
        img.data[o + 1] = 20
        img.data[o + 2] = 8
        img.data[o + 3] = Math.min(255, -lit * 0.8 * 255)
      }
    }
  g.putImageData(img, 0, 0)
  return c
}

// Paint the map's ground into a canvas, GROUND_PX pixels per tile.
// `water` tints rivers, lakes and moats (the 3D view has a real water
// surface instead); `shade` bakes in sunlight on hillsides (the 3D view
// lights its slopes for real).
export function paintTerrain(world, { water = true, shade = false } = {}) {
  const S = GROUND_PX
  const W = world.w * S
  const H = world.h * S
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const g = cv.getContext('2d')
  g.imageSmoothingEnabled = true
  const tmp = document.createElement('canvas')
  tmp.width = W
  tmp.height = H
  const tg = tmp.getContext('2d')
  tg.imageSmoothingEnabled = true

  const scale = (REPEAT_TILES * S) / 256
  const fillWith = (ctx, name) => {
    const p = ctx.createPattern(images[name], 'repeat')
    p.setTransform(new DOMMatrix().scale(scale))
    ctx.fillStyle = p
    ctx.fillRect(0, 0, W, H)
  }
  // Paint a texture through a mask (a canvas stretched over the map).
  const layer = (name, mask, alpha = 1, extra = null) => {
    tg.globalCompositeOperation = 'source-over'
    tg.globalAlpha = 1
    tg.clearRect(0, 0, W, H)
    if (name) fillWith(tg, name)
    else {
      tg.fillStyle = extra
      tg.fillRect(0, 0, W, H)
    }
    tg.globalCompositeOperation = 'destination-in'
    tg.drawImage(mask, 0, 0, W, H)
    g.globalAlpha = alpha
    g.drawImage(tmp, 0, 0)
    g.globalAlpha = 1
  }

  // Grass everywhere, broken up with patches of lighter grass and worn
  // meadow so the tiling never shows.
  fillWith(g, 'grass')
  layer('grassLight', noiseMask(world, 2.5, 0.75, 7), 1)
  layer('meadow', noiseMask(world, 1.6, 0.55, 19), 1)
  layer('grass', noiseMask(world, 4, 0.5, 31), 1)

  const terr = (name) => (t) => t.terrain === name && t.type !== 'moat'
  layer('hill', tileMask(world, 0.3, terr('hill'), 2), 0.9)
  layer('marsh', tileMask(world, 0.2, terr('marsh'), 3), 1)
  // Sandy beaches along the sea, bare rock up the mountains.
  layer('bed', tileMask(world, 0.25, (t) => t.terrain === 'beach' || t.terrain === 'water', 9), 1)
  layer('cliff', tileMask(world, 0.3, terr('mountain'), 10), 1)
  // River and lake beds, with a band of bare earth along the banks.
  const wet = (t) => t.terrain === 'water' || t.terrain === 'shallows'
  layer('earth', tileMask(world, 0.45, (t) => wet(t) || t.type === 'moat', 4), 0.8)
  layer('bed', tileMask(world, 0.12, wet, 5), 1)
  layer('earth', tileMask(world, 0.1, (t) => t.type === 'moat', 6), 1)

  if (water) {
    layer(null, tileMask(world, 0.12, terr('shallows'), 7), 0.62, 'rgb(48,116,138)')
    layer(null, tileMask(world, 0.15, terr('water'), 8), 0.9, 'rgb(30,84,128)')
    // Moats: dark water inside their earth bank.
    g.fillStyle = 'rgba(30,66,96,0.92)'
    for (let i = 0; i < world.tiles.length; i++) {
      if (world.tiles[i].type !== 'moat') continue
      const x = i % world.w
      const y = (i / world.w) | 0
      const open = (dx, dy) => {
        if (!world.inBounds(x + dx, y + dy)) return false
        const n = world.tiles[world.idx(x + dx, y + dy)]
        return n.type === 'moat' || wet(n)
      }
      const m = 0.14
      const x0 = open(-1, 0) ? x : x + m
      const y0 = open(0, -1) ? y : y + m
      const x1 = open(1, 0) ? x + 1 : x + 1 - m
      const y1 = open(0, 1) ? y + 1 : y + 1 - m
      g.fillRect(x0 * S, y0 * S, (x1 - x0) * S, (y1 - y0) * S)
    }
  }
  if (shade) g.drawImage(hillShade(world), 0, 0, W, H)
  return cv
}
