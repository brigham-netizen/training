// Trees and rocks shared by both renderers. Canopies are built from
// photographed leaves (ambientCG leaf sets) scattered into shaded clumps;
// rocks use photographed rock (Poly Haven). Every tree and rock gets its
// own seeded layout, so no two look stamped out.

import leavesUrl from './tex/leaves.webp'
import rockUrl from './tex/rock.jpg'
import rockMossUrl from './tex/rockMoss.jpg'
import rockLichenUrl from './tex/rockLichen.jpg'
import barkUrl from './tex/bark.jpg'
import barkPineUrl from './tex/barkPine.jpg'

export const FLORA_URLS = { rock: rockUrl, rockMoss: rockMossUrl, rockLichen: rockLichenUrl, bark: barkUrl, barkPine: barkPineUrl }
const ROCK_TEX = ['rock', 'rockLichen', 'rockMoss']

let flora = null
let loading = null

function rng(seed) {
  let s = Math.floor(Math.abs(seed) * 2147483) % 2147483647 || 7
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

const loadImage = (url) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })

export function loadFlora() {
  if (loading) return loading
  loading = Promise.all([loadImage(leavesUrl), ...ROCK_TEX.map((k) => loadImage(FLORA_URLS[k]))]).then(([leaves, ...rocks]) => {
    if (!leaves || rocks.some((r) => !r)) return
    const rockImgs = Object.fromEntries(ROCK_TEX.map((k, n) => [k, rocks[n]]))
    flora = {
      // Leaf atlas rows: 0 dark poplar, 1 beech, 2 light beech, 3 yellow.
      oak: Array.from({ length: 5 }, (_, n) => leafClump(leaves, [0, 0, 1], 0.02, 100 + n)),
      beech: Array.from({ length: 5 }, (_, n) => leafClump(leaves, [1, 2, 2], 0.035, 200 + n)),
      pineSide: Array.from({ length: 3 }, (_, n) => needleTier(300 + n)),
      pineTop: Array.from({ length: 3 }, (_, n) => needleStar(400 + n)),
      rocks: Array.from({ length: 9 }, (_, n) => rockSprite(rockImgs[ROCK_TEX[n % 3]], 500 + n, n % 3 === 2)),
    }
  })
  return loading
}

export function floraReady() {
  return !!flora
}

export function floraSprites() {
  return flora
}

// ---- sprite painting ----------------------------------------------------------

const LIGHT = (() => {
  const l = [-0.45, -0.7, 0.55]
  const n = Math.hypot(...l)
  return l.map((c) => c / n)
})()

// A round clump of leaves, lit from the upper left, darker underneath and
// inside, with a dark body behind so it never looks see-through.
function leafClump(atlas, rows, yellow, seed) {
  const S = 128
  const c = document.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d')
  const rnd = rng(seed)
  const body = g.createRadialGradient(S * 0.45, S * 0.42, S * 0.05, S / 2, S / 2, S * 0.4)
  body.addColorStop(0, 'rgba(46,70,30,0.95)')
  body.addColorStop(1, 'rgba(16,30,12,0.9)')
  g.fillStyle = body
  g.beginPath()
  g.arc(S / 2, S / 2, S * 0.36, 0, Math.PI * 2)
  g.fill()
  const leaves = []
  for (let n = 0; n < 330; n++) {
    // Points on a ball, a little flattened at the bottom.
    const a = rnd() * Math.PI * 2
    const r = Math.sqrt(rnd()) * 0.42
    const u = Math.cos(a) * r
    const v = Math.sin(a) * r * 0.95
    const w = Math.sqrt(Math.max(0, 0.18 - u * u - v * v))
    leaves.push({ u, v, w })
  }
  leaves.sort((p, q) => p.w - q.w)
  const tmp = document.createElement('canvas')
  tmp.width = tmp.height = 32
  const tg = tmp.getContext('2d')
  for (const { u, v, w } of leaves) {
    const nl = Math.hypot(u, v, w) || 1
    const diff = Math.max(0, (u * LIGHT[0] + v * LIGHT[1] + w * LIGHT[2]) / nl)
    const b = 0.42 + 0.78 * diff + (rnd() - 0.5) * 0.18
    const row = rnd() < yellow ? 3 : rows[Math.floor(rnd() * rows.length)]
    const col = Math.floor(rnd() * 6)
    tg.globalCompositeOperation = 'source-over'
    tg.clearRect(0, 0, 32, 32)
    tg.drawImage(atlas, col * 64, row * 64, 64, 64, 0, 0, 32, 32)
    tg.globalCompositeOperation = 'source-atop'
    tg.fillStyle = b < 1 ? `rgba(8,14,4,${(1 - b).toFixed(3)})` : `rgba(255,250,210,${((b - 1) * 0.7).toFixed(3)})`
    tg.fillRect(0, 0, 32, 32)
    const size = S * (0.13 + rnd() * 0.07)
    g.save()
    g.translate(S / 2 + u * S, S / 2 + v * S)
    g.rotate(rnd() * Math.PI * 2)
    g.drawImage(tmp, -size / 2, -size / 2, size, size)
    g.restore()
  }
  return c
}

// One drooping tier of a fir seen from the side: needles fanning down and
// out from the trunk, wider at the bottom.
function needleTier(seed) {
  const W = 128
  const H = 96
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  const rnd = rng(seed)
  g.fillStyle = 'rgba(12,28,18,0.96)'
  g.beginPath()
  g.moveTo(W / 2, 2)
  g.quadraticCurveTo(W * 0.6, H * 0.45, W * 0.9, H * 0.8)
  g.quadraticCurveTo(W / 2, H * 0.94, W * 0.1, H * 0.8)
  g.quadraticCurveTo(W * 0.4, H * 0.45, W / 2, 2)
  g.fill()
  g.lineCap = 'round'
  for (let n = 0; n < 900; n++) {
    const t = Math.sqrt(rnd())
    const side = rnd() < 0.5 ? -1 : 1
    const spread = t * 0.45 * (0.6 + rnd() * 0.4)
    const x = W / 2 + side * spread * W
    const y = 6 + t * H * 0.8 + (rnd() - 0.5) * 6
    const len = 4 + rnd() * 7
    const ang = Math.PI / 2 + side * (0.6 + rnd() * 0.6)
    const lit = 0.55 + (side < 0 ? 0.3 : -0.05) + (1 - t) * 0.25 + (rnd() - 0.5) * 0.3
    const gr = Math.round(44 + 62 * lit)
    g.strokeStyle = `rgb(${Math.round(gr * 0.4)},${gr},${Math.round(gr * 0.62)})`
    g.lineWidth = 1 + rnd()
    g.beginPath()
    g.moveTo(x, y)
    g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len)
    g.stroke()
  }
  return c
}

// A fir seen from directly above: a star of needle sprays.
function needleStar(seed) {
  const S = 128
  const c = document.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d')
  const rnd = rng(seed)
  g.fillStyle = 'rgba(14,32,20,0.95)'
  g.beginPath()
  for (let k = 0; k <= 16; k++) {
    const a = (k / 16) * Math.PI * 2
    const r = S * (k % 2 ? 0.34 : 0.45)
    if (k === 0) g.moveTo(S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r)
    else g.lineTo(S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r)
  }
  g.fill()
  g.lineCap = 'round'
  for (let n = 0; n < 1100; n++) {
    const a = rnd() * Math.PI * 2
    const r = Math.sqrt(rnd()) * S * 0.44
    const x = S / 2 + Math.cos(a) * r
    const y = S / 2 + Math.sin(a) * r
    const len = 4 + rnd() * 6
    const ang = a + (rnd() - 0.5) * 0.8
    const lit = 0.6 + 0.35 * -(Math.cos(a) * 0.5 + Math.sin(a) * 0.8) * (r / (S * 0.44)) + (1 - r / (S * 0.44)) * 0.2 + (rnd() - 0.5) * 0.3
    const gr = Math.round(44 + 62 * lit)
    g.strokeStyle = `rgb(${Math.round(gr * 0.4)},${gr},${Math.round(gr * 0.62)})`
    g.lineWidth = 1 + rnd()
    g.beginPath()
    g.moveTo(x, y)
    g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len)
    g.stroke()
  }
  return c
}

// A boulder: an irregular, faceted outline filled with photographed rock.
// Each facet runs from a ridge point near the top out to the outline and
// is lit by the way it faces, which gives a chiselled, solid look.
function rockSprite(tex, seed, mossy) {
  const W = 128
  const H = 104
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  const rnd = rng(seed)
  const N = 9 + Math.floor(rnd() * 3)
  const cx = W / 2
  const cy = H * 0.6
  const pts = []
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2 + (rnd() - 0.5) * 0.35
    const r = 0.8 + rnd() * 0.25
    const ry = Math.sin(a) < 0 ? 0.52 : 0.34
    pts.push([cx + Math.cos(a) * W * 0.45 * r, cy + Math.sin(a) * H * ry * r, a])
  }
  // Ridge: two points near the top, a little off centre.
  const ridge = [
    [cx - W * (0.06 + rnd() * 0.1), H * (0.22 + rnd() * 0.1)],
    [cx + W * (0.06 + rnd() * 0.12), H * (0.26 + rnd() * 0.1)],
  ]
  const outline = () => {
    g.beginPath()
    pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y)))
    g.closePath()
  }
  const pat = g.createPattern(tex, 'repeat')
  pat.setTransform(new DOMMatrix().translate(rnd() * 256, rnd() * 256).scale(0.5))
  outline()
  g.fillStyle = pat
  g.fill()
  g.save()
  outline()
  g.clip()
  // Even out the textures: lift dark ones toward a weathered grey.
  g.fillStyle = 'rgba(176,170,156,0.26)'
  g.fillRect(0, 0, W, H)
  // Facets: from the nearer ridge point to each outline edge.
  const light = Math.atan2(-0.75, -0.6) // up and to the left on screen
  for (let k = 0; k < N; k++) {
    const [x0, y0, a0] = pts[k]
    const [x1, y1, a1] = pts[(k + 1) % N]
    const mx = (x0 + x1) / 2
    const my = (y0 + y1) / 2
    const rp = Math.hypot(mx - ridge[0][0], my - ridge[0][1]) < Math.hypot(mx - ridge[1][0], my - ridge[1][1]) ? ridge[0] : ridge[1]
    let am = (a0 + a1) / 2
    if (Math.abs(a1 - a0) > Math.PI) am += Math.PI
    // Facets facing up catch more light; those facing the sun most of all.
    const up = Math.max(0, -Math.sin(am))
    const lit = 0.5 * Math.cos(am - light) + up * 0.35 + (rnd() - 0.5) * 0.2
    g.beginPath()
    g.moveTo(rp[0], rp[1])
    g.lineTo(x0, y0)
    g.lineTo(x1, y1)
    g.closePath()
    g.fillStyle = lit > 0 ? `rgba(255,246,226,${Math.min(0.4, lit * 0.45).toFixed(3)})` : `rgba(12,10,8,${Math.min(0.62, -lit * 0.75).toFixed(3)})`
    g.fill()
    g.strokeStyle = 'rgba(30,24,18,0.25)'
    g.lineWidth = 1
    g.stroke()
  }
  // The top plane between the ridge points.
  g.beginPath()
  g.moveTo(ridge[0][0], ridge[0][1])
  g.lineTo(ridge[1][0], ridge[1][1])
  g.lineTo(ridge[1][0] - W * 0.06, ridge[1][1] - H * 0.12)
  g.lineTo(ridge[0][0] - W * 0.04, ridge[0][1] - H * 0.1)
  g.closePath()
  g.fillStyle = 'rgba(255,246,226,0.22)'
  g.fill()
  if (mossy) {
    const m = g.createLinearGradient(0, 0, 0, H * 0.55)
    m.addColorStop(0, 'rgba(92,116,44,0.6)')
    m.addColorStop(1, 'rgba(92,116,44,0)')
    g.fillStyle = m
    g.fillRect(0, 0, W, H)
  }
  // Dark foot where it meets the ground.
  const foot = g.createLinearGradient(0, H * 0.72, 0, H)
  foot.addColorStop(0, 'rgba(0,0,0,0)')
  foot.addColorStop(1, 'rgba(8,6,4,0.6)')
  g.fillStyle = foot
  g.fillRect(0, 0, W, H)
  g.restore()
  outline()
  g.strokeStyle = 'rgba(20,16,10,0.55)'
  g.lineWidth = 1.5
  g.stroke()
  return c
}

// ---- layouts ----------------------------------------------------------------

// What grows on a tile: species, size and where each clump of foliage sits
// (offsets in tiles from the trunk base; dz up). `v` is the tile's random
// value; hills grow more firs.
export function treeSpec(v, x, y, onHill) {
  const rnd = rng(v * 1e6 + x * 131 + y * 977 + 1)
  const r0 = rnd()
  const species = r0 < (onHill ? 0.55 : 0.3) ? 'pine' : r0 < 0.7 ? 'oak' : 'beech'
  const scale = 0.78 + rnd() * 0.5
  const cx = 0.5 + (rnd() - 0.5) * 0.3
  const cy = 0.5 + (rnd() - 0.5) * 0.3
  const lean = [(rnd() - 0.5) * 0.12, (rnd() - 0.5) * 0.12]
  const clumps = []
  if (species === 'pine') {
    const tiers = 5 + Math.floor(rnd() * 2)
    const trunk = 0.16 * scale
    for (let k = 0; k < tiers; k++) {
      const f = k / (tiers - 1)
      clumps.push({
        dx: lean[0] * f,
        dy: lean[1] * f,
        dz: trunk + f * 1.15 * scale,
        size: (1.0 - f * 0.7) * scale * (0.92 + rnd() * 0.16),
        variant: Math.floor(rnd() * 3),
      })
    }
    return { species, cx, cy, trunk: trunk + 0.9 * scale, trunkR: 0.05 * scale, clumps, radius: 0.48 * scale, height: 1.55 * scale }
  }
  const trunk = (0.3 + rnd() * 0.14) * scale
  const n = 7 + Math.floor(rnd() * 4)
  const spread = 0.3 * scale
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + rnd() * 0.8
    const r = k === 0 ? 0 : spread * (0.55 + rnd() * 0.5)
    clumps.push({
      dx: lean[0] + Math.cos(a) * r,
      dy: lean[1] + Math.sin(a) * r,
      dz: trunk + 0.3 * scale + (k === 0 ? 0.32 * scale : rnd() * 0.28 * scale),
      size: (0.58 + rnd() * 0.24) * scale * (k === 0 ? 1.2 : 1),
      variant: Math.floor(rnd() * 5),
    })
  }
  return { species, cx, cy, trunk, trunkR: 0.06 * scale, clumps, radius: spread + 0.32 * scale, height: trunk + 0.95 * scale }
}

// A rock outcrop: a main boulder and a few smaller stones around it.
export function rockSpec(v, x, y) {
  const rnd = rng(v * 1e6 + x * 733 + y * 389 + 5)
  const tex = Math.floor(rnd() * 3)
  const out = [{ dx: 0.5 + (rnd() - 0.5) * 0.12, dy: 0.5 + (rnd() - 0.5) * 0.12, size: 0.62 + rnd() * 0.22, height: 0.3 + rnd() * 0.22, variant: tex + 3 * Math.floor(rnd() * 3), seed: rnd() }]
  const extra = Math.floor(rnd() * 4)
  for (let k = 0; k < extra; k++) {
    const a = rnd() * Math.PI * 2
    out.push({
      dx: 0.5 + Math.cos(a) * (0.3 + rnd() * 0.12),
      dy: 0.5 + Math.sin(a) * (0.3 + rnd() * 0.12),
      size: 0.16 + rnd() * 0.16,
      height: 0.1 + rnd() * 0.12,
      variant: tex + 3 * Math.floor(rnd() * 3),
      seed: rnd(),
    })
  }
  return out
}
