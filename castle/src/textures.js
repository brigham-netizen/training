// Procedural textures shared by both renderers. Each canvas covers one
// world unit (one tile) and tiles seamlessly.

const SIZE = 128

function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

function shade([r, g, b], f) {
  return `rgb(${Math.min(255, r * f) | 0},${Math.min(255, g * f) | 0},${Math.min(255, b * f) | 0})`
}

function speckle(g, rnd, n, base, lo, hi) {
  for (let k = 0; k < n; k++) {
    g.fillStyle = shade(base, lo + rnd() * (hi - lo))
    g.fillRect(rnd() * SIZE, rnd() * SIZE, 1 + rnd() * 2, 1 + rnd() * 2)
  }
}

const cache = {}

// Dressed stone in staggered courses with mortar joints.
export function stoneTexture() {
  if (cache.stone) return cache.stone
  const cv = document.createElement('canvas')
  cv.width = cv.height = SIZE
  const g = cv.getContext('2d')
  const rnd = rng(4242)
  const base = [190, 182, 164]
  g.fillStyle = shade(base, 0.62) // mortar
  g.fillRect(0, 0, SIZE, SIZE)
  const rows = 4
  const rh = SIZE / rows
  for (let r = 0; r < rows; r++) {
    let x = r % 2 ? -SIZE / 6 : 0
    while (x < SIZE) {
      const w = SIZE * (0.26 + rnd() * 0.16)
      const f = 0.86 + rnd() * 0.24
      // Draw each block (and its wrap-around copy) so the texture tiles.
      for (const ox of [0, SIZE]) {
        const bx = x - ox
        g.fillStyle = shade(base, f)
        g.fillRect(bx + 1.5, r * rh + 1.5, w - 3, rh - 3)
        // Lit top edge and shadowed bottom edge give each block some depth.
        g.fillStyle = shade(base, f * 1.12)
        g.fillRect(bx + 1.5, r * rh + 1.5, w - 3, 2)
        g.fillStyle = shade(base, f * 0.8)
        g.fillRect(bx + 1.5, r * rh + rh - 3.5, w - 3, 2)
      }
      x += w
    }
  }
  speckle(g, rnd, 420, base, 0.7, 1.15)
  cache.stone = cv
  return cv
}

// Irregular flagstones for wall walks and tower tops.
export function flagstoneTexture() {
  if (cache.flag) return cache.flag
  const cv = document.createElement('canvas')
  cv.width = cv.height = SIZE
  const g = cv.getContext('2d')
  const rnd = rng(777)
  const base = [184, 176, 158]
  g.fillStyle = shade(base, 0.6)
  g.fillRect(0, 0, SIZE, SIZE)
  const n = 3
  const cell = SIZE / n
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const f = 0.85 + rnd() * 0.25
      const j = () => (rnd() - 0.5) * 6
      g.fillStyle = shade(base, f)
      g.beginPath()
      g.moveTo(x * cell + 2 + j(), y * cell + 2 + j())
      g.lineTo((x + 1) * cell - 2 + j(), y * cell + 2 + j())
      g.lineTo((x + 1) * cell - 2 + j(), (y + 1) * cell - 2 + j())
      g.lineTo(x * cell + 2 + j(), (y + 1) * cell - 2 + j())
      g.closePath()
      g.fill()
    }
  speckle(g, rnd, 300, base, 0.72, 1.12)
  cache.flag = cv
  return cv
}

// Vertical wood grain with plank seams (palisades, hoardings).
export function woodTexture() {
  if (cache.wood) return cache.wood
  const cv = document.createElement('canvas')
  cv.width = cv.height = SIZE
  const g = cv.getContext('2d')
  const rnd = rng(99)
  const base = [150, 102, 58]
  const planks = 6
  const pw = SIZE / planks
  for (let p = 0; p < planks; p++) {
    const f = 0.85 + rnd() * 0.25
    g.fillStyle = shade(base, f)
    g.fillRect(p * pw, 0, pw, SIZE)
    for (let k = 0; k < 6; k++) {
      g.fillStyle = shade(base, f * (0.8 + rnd() * 0.15))
      g.fillRect(p * pw + rnd() * pw, 0, 1, SIZE)
    }
    g.fillStyle = shade(base, 0.55)
    g.fillRect(p * pw, 0, 1.5, SIZE)
  }
  cache.wood = cv
  return cv
}

export const TEXTURE_PX = SIZE
// Average brightness of each texture's base colour, so renderers can shade
// a textured face to match the flat colour it replaces.
export const TEXTURE_LUM = { stone: 182, flag: 176, wood: 108 }
