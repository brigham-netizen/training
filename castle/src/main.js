import './styles.css'
import { Game } from './game.js'
import { Camera } from './camera.js'
import { Renderer } from './render.js'
import { Renderer3D } from './render3d.js'
import { Input } from './input.js'
import { Audio, BUILD_TRACKS } from './audio.js'
import { Saves } from './saves.js'
import { STRUCTURES, ARCHER, SWORDSMAN, HOARDING, ROUGH_COST, TOTAL_WAVES, waveComposition } from './config.js'

const ICONS = {
  look: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3"/></svg>',
  wall: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="1"/><path d="M2 9.7h20M2 14.3h20M8 5v4.7M15 5v4.7M5 9.7v4.6M12 9.7v4.6M19 9.7v4.6M8 14.3V19M15 14.3V19"/></svg>',
  tower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 22V9h14v13zM5 9V3h3v2.5h2.5V3h3v2.5H16V3h3v6"/><path d="M10 22v-5a2 2 0 0 1 4 0v5"/></svg>',
  trap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2 20h20M4 20l2.5-9L9 20M9.5 20l2.5-12 2.5 12M15 20l2.5-9L20 20"/></svg>',
  demolish: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4c3 0 6 2 7 5-3-1.5-6-1.5-9 0M12 9l-9 9 3 3 9-9"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  rotate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg>',
  cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2l9 5v10l-9 5-9-5V7zM12 12l9-5M12 12L3 7M12 12v10"/></svg>',
  palisade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 21V8l2-3 2 3v13M10 21V8l2-3 2 3v13M16 21V8l2-3 2 3v13M2 15h20"/></svg>',
  thick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2 21V7h3V4h3v3h3V4h2v3h3V4h3v3h3v14z"/><path d="M2 12h20M2 16.5h20M8 12v4.5M16 12v4.5M12 16.5V21"/></svg>',
  archer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3c6 3 6 15 0 18M7 3v18M3 12h17M17 9l3 3-3 3"/></svg>',
  moat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>',
  pikes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 20L9 4M9 20L3 4M13 20l6-16M19 20L13 4M1 14h22"/></svg>',
  gate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2 21V5h3V3h3v2h8V3h3v2h3v16h-7v-6a3 3 0 0 0-6 0v6z"/><path d="M12 12v9"/></svg>',
  swordsman: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h7v7L9 22l-2-2L19 8M5 15l4 4M3 17l4 4"/></svg>',
  upgrade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16M7 21V11h10v10M12 3v10M8 7l4-4 4 4"/></svg>',
  soundOn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
  soundOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6"/></svg>',
  hoard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 21V13h18v8M3 13V7h3v6M9 13V7h3v6M15 13V7h3v6M21 13V7"/><path d="M2 7h20"/></svg>',
  orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V3M5 4h12l-3 4 3 4H5"/><path d="M14 16h7v5h-7z" stroke-dasharray="2 2"/></svg>',
  settle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 11l9-7 9 7M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
  fsOn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>',
  fsOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>',
  stair: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 21h18V4h-4v4.25h-4.5v4.25H8v4.25H3z"/></svg>',
  feedback: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M12 8v3M12 13.5v.01"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>',
}

const TOOL_LABELS = {
  look: 'Look',
  palisade: 'Palisade',
  wall: 'Stone wall',
  thick: 'Thick wall',
  tower: 'Tower',
  archer: 'Archer',
  moat: 'Moat',
  pikes: 'Pikes',
  gate: 'Gate',
  stair: 'Stairs',
  swordsman: 'Swordsman',
  upgrade: 'Upgrade',
  hoard: 'Hoarding',
  orders: 'Orders',
  settle: 'Village',
  trap: 'Spikes',
  demolish: 'Remove',
}
const TOOL_HINTS = {
  palisade: 'Cheap wood. Archers can\'t stand on it.',
  wall: 'Archers walk along connected stone.',
  thick: 'Very tough, holds 2 archers.',
  tower: 'Comes with an archer. Height adds range.',
  archer: 'Tap a wall, tower or the keep.',
  gate: 'Your troops walk through; enemies must break it. Drop one into a wall for the difference.',
  stair: 'Build against a wall, tower or keep so swordsmen can climb up.',
  swordsman: 'Guards a spot. Tap a wall or the keep to post one up top.',
  hoard: 'Wooden shields on a stone wall, gate or tower. Archers behind it are much safer.',
  orders: 'Tell swordsmen which area to cover.',
  upgrade: 'Palisade to stone, stone to thick; repairs damage.',
  settle: 'Build the houses and farms the village asks for.',
  moat: 'Enemies wade through slowly.',
  pikes: 'Hurts anyone who attacks it.',
  trap: 'Hurts anyone who walks over it.',
}
// Toolbar groups; multi-tool groups open a flyout.
const GROUPS = [
  { id: 'look', tools: ['look'] },
  { id: 'walls', tools: ['palisade', 'wall', 'thick', 'gate', 'stair', 'hoard'] },
  { id: 'defend', tools: ['tower', 'archer', 'swordsman', 'orders'] },
  { id: 'obstacles', tools: ['moat', 'pikes', 'trap'] },
  { id: 'improve', tools: ['settle', 'upgrade'] },
  { id: 'demolish', tools: ['demolish'] },
]
const KEYS = ['look', 'palisade', 'wall', 'thick', 'gate', 'tower', 'archer', 'swordsman', 'orders', 'settle']
const PLACE_ON_RELEASE = new Set(['tower', 'archer', 'swordsman', 'gate'])
const costOf = (id) =>
  id === 'archer' ? ARCHER.cost : id === 'swordsman' ? SWORDSMAN.cost : id === 'hoard' ? HOARDING.cost : STRUCTURES[id]?.cost

const $ = (id) => document.getElementById(id)

const randomSeed = () => Math.floor(Math.random() * 1e9)
let game = new Game(randomSeed())
const saves = new Saves()
const camera = new Camera(game.world.w, game.world.h)
const canvas = $('game')
const renderer = new Renderer(canvas, camera)
const canvas3d = $('game3d')
let renderer3d = null
// 'classic' (canvas drawing) or '3d' (WebGL preview).
let gfx = 'classic'
try {
  if (localStorage.getItem('htk-gfx') === '3d') gfx = '3d'
} catch {
  // ignore
}

function setGfx(mode) {
  if (mode === '3d' && !renderer3d) {
    try {
      renderer3d = new Renderer3D(canvas3d)
      renderer3d.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1)
    } catch {
      banner('3D isn\'t available on this device<small>Staying with the classic look</small>')
      mode = 'classic'
    }
  }
  gfx = mode
  canvas3d.classList.toggle('hidden', gfx !== '3d')
  try {
    localStorage.setItem('htk-gfx', gfx)
  } catch {
    // ignore
  }
}
const audio = new Audio()
// Handle for automated screenshot tests.
// Installed from a real web address (not embedded in a page): cache the
// game so it opens offline from the home screen.
if ('serviceWorker' in navigator && location.protocol === 'https:' && window.top === window) {
  navigator.serviceWorker.register('./sw.js').catch(() => {})
}

window.htk = { game, audio, camera, setGfx: (m) => setGfx(m) }
// Browsers only start audio from a user gesture, and they disagree on
// which events count, so try on all of them.
for (const type of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'])
  window.addEventListener(type, () => audio.unlock(), { capture: true, passive: true })

const ui = {
  tool: 'wall',
  buildTool: 'wall', // last build tool, restored after each wave
  groupChoice: { walls: 'wall', defend: 'tower', obstacles: 'moat', improve: 'settle' },
  orders: { selected: new Set(), box: null, start: null, active: false },
  preview: null,
  showGrid: true,
  speed: 1,
  paused: false,
}

// ---- input ------------------------------------------------------------------

function worldToTile(x, y) {
  if (x < 0 || y < 0 || x >= game.world.w || y >= game.world.h) return -1
  return game.world.idx(Math.floor(x), Math.floor(y))
}

// Tiles on a 4-connected line from a to b, so painted walls never touch
// only at corners (enemies could slip through a diagonal gap).
function lineTiles(a, b) {
  const w = game.world.w
  let x = a % w
  let y = (a / w) | 0
  const nx = Math.abs((b % w) - x)
  const ny = Math.abs(((b / w) | 0) - y)
  const sx = (b % w) > x ? 1 : -1
  const sy = ((b / w) | 0) > y ? 1 : -1
  const out = [a]
  for (let ix = 0, iy = 0; ix < nx || iy < ny; ) {
    if ((0.5 + ix) / nx < (0.5 + iy) / ny) {
      x += sx
      ix++
    } else {
      y += sy
      iy++
    }
    out.push(y * w + x)
  }
  return out
}

function tileRect(a, b) {
  const clampX = (v) => Math.max(0, Math.min(game.world.w - 1, Math.floor(v)))
  const clampY = (v) => Math.max(0, Math.min(game.world.h - 1, Math.floor(v)))
  return {
    x0: clampX(Math.min(a.x, b.x)), x1: clampX(Math.max(a.x, b.x)),
    y0: clampY(Math.min(a.y, b.y)), y1: clampY(Math.max(a.y, b.y)),
  }
}

function giveOrders(zone, post) {
  const ids = [...ui.orders.selected]
  if (game.orderSwordsmen(ids, zone, post)) {
    audio.play('recruit')
    banner(zone ? `${ids.length} ${ids.length === 1 ? 'swordsman' : 'swordsmen'} covering that area` : 'Holding that spot', 1400)
    ui.orders.selected = new Set()
  }
}

// Tapping a staked plot with any tool builds it, so the village never
// waits on finding the right tool.
function trySettle(i) {
  const t = game.world.tiles[i]
  if (!t || t.type !== 'plot' || ui.tool === 'demolish') return false
  const def = STRUCTURES[t.plot]
  if (!game.place(i, 'settle')) {
    if (game.gold < def.cost) warnGold()
  } else banner(`${def.label} built<small>+${def.income} gold after every wave</small>`, 1800)
  refreshHud()
  return true
}

let noGoldWarned = false
function paint(i) {
  const tool = ui.tool
  if (trySettle(i)) return
  if (tool === 'demolish') {
    game.demolish(i)
  } else if (tool === 'upgrade') {
    if (!game.place(i, 'upgrade') && game.upgradeInfo(i) && game.gold < game.upgradeInfo(i).cost) warnGold()
  } else if (tool === 'settle' || tool === 'hoard') {
    const t = game.world.tiles[i]
    const cost = tool === 'hoard' ? HOARDING.cost : STRUCTURES[t.plot]?.cost
    if (!game.place(i, tool) && cost && game.gold < cost) warnGold()
  } else if (STRUCTURES[tool]) {
    const over = game.layOverCost(i, tool)
    const need = over ?? (game.world.canBuild(i, tool) ? game.costAt(i, tool) : null)
    if (!game.place(i, tool) && need !== null && game.gold < need) warnGold()
  }
  refreshHud()
}

function warnGold() {
  if (noGoldWarned) return
  noGoldWarned = true
  const pill = document.querySelector('.pill.gold')
  pill.classList.remove('flash')
  void pill.offsetWidth
  pill.classList.add('flash')
}

new Input(canvas, camera, {
  tool: () => ui.tool,
  worldToTile,
  lineTiles,
  paint,
  strokeEnd: () => {
    noGoldWarned = false
  },
  placeOnRelease: (tool) => PLACE_ON_RELEASE.has(tool),
  boxTool: (tool) => tool === 'orders',
  boxStart: (p) => {
    ui.orders.start = p
    ui.orders.box = tileRect(p, p)
  },
  boxMove: (p) => {
    if (ui.orders.start) ui.orders.box = tileRect(ui.orders.start, p)
  },
  boxCancel: () => {
    ui.orders.box = ui.orders.start = null
  },
  boxEnd: (p, tap) => {
    const o = ui.orders
    const rect = o.start ? tileRect(o.start, p) : null
    o.box = o.start = null
    if (tap) {
      const near = game.swordsmen.filter((s) => Math.hypot(s.x - p.x, s.y - p.y) < 0.8)
      if (near.length) o.selected = new Set(near.map((s) => s.id))
      else if (o.selected.size) giveOrders(null, worldToTile(p.x, p.y))
    } else if (rect) {
      if (!o.selected.size) {
        // Box-select everyone inside.
        const inside = game.swordsmen.filter((s) => s.x >= rect.x0 && s.x <= rect.x1 + 1 && s.y >= rect.y0 && s.y <= rect.y1 + 1)
        o.selected = new Set(inside.map((s) => s.id))
      } else giveOrders(rect, null)
    }
    refreshHud(true)
  },
  tapTile: (i) => {
    if (i >= 0) trySettle(i)
  },
  placeAt: (i) => {
    if (trySettle(i)) return
    if (!game.place(i, ui.tool) && game.gold < costOf(ui.tool)) warnGold()
    noGoldWarned = false
    refreshHud()
  },
  preview: (i) => {
    if (i == null || i < 0) ui.preview = null
    else {
      const type = ui.tool
      const ok = type === 'demolish' ? !!STRUCTURES[game.world.tiles[i].type] : type !== 'look' && game.canPlace(i, type)
      ui.preview = { i, ok, type }
    }
  },
})

// ---- HUD ----------------------------------------------------------------------

const toolbar = $('toolbar')
const flyout = $('flyout')
const toolFace = (id) => {
  const cost = costOf(id)
  return `${ICONS[id]}<span>${cost ? `<span class="cost">${cost}</span>` : TOOL_LABELS[id]}</span>`
}
for (const g of GROUPS) {
  const b = document.createElement('button')
  b.className = g.tools.length > 1 ? 'tool group' : 'tool'
  b.dataset.group = g.id
  b.addEventListener('click', () => {
    const current = ui.groupChoice[g.id] || g.tools[0]
    if (g.tools.length > 1 && ui.tool === current && !flyout.classList.contains('hidden')) closeFlyout()
    else {
      selectTool(current)
      if (g.tools.length > 1) openFlyout(g, b)
      else closeFlyout()
    }
  })
  toolbar.appendChild(b)
}

function openFlyout(g, anchor) {
  flyout.innerHTML = ''
  for (const id of g.tools) {
    const b = document.createElement('button')
    b.className = 'tool wide' + (id === ui.tool ? ' active' : '')
    if (costOf(id) > game.gold) b.classList.add('poor')
    b.innerHTML = `${ICONS[id]}<span class="tl"><b>${TOOL_LABELS[id]}</b><span class="cost">${costOf(id)}</span><small>${TOOL_HINTS[id]}</small></span>`
    b.addEventListener('click', () => {
      ui.groupChoice[g.id] = id
      selectTool(id)
      closeFlyout()
    })
    flyout.appendChild(b)
  }
  const r = anchor.getBoundingClientRect()
  flyout.style.left = `${r.right + 8}px`
  flyout.classList.remove('hidden')
  // Align with the button, but keep the whole flyout on screen.
  const h = flyout.offsetHeight
  flyout.style.top = `${Math.max(8, Math.min(window.innerHeight - h - 8, r.top + r.height / 2 - h / 2))}px`
}

function closeFlyout() {
  flyout.classList.add('hidden')
}
canvas.addEventListener('pointerdown', closeFlyout)

function selectTool(id) {
  if (id !== 'orders') ui.orders.selected = new Set()
  ui.tool = id
  if (id !== 'look' && id !== 'demolish') ui.buildTool = id
  for (const g of GROUPS) if (g.tools.length > 1 && g.tools.includes(id)) ui.groupChoice[g.id] = id
  ui.preview = null
  refreshHud()
}

$('menu-btn').innerHTML = ICONS.menu
$('feedback-btn').innerHTML = ICONS.feedback
$('feedback-btn').addEventListener('click', () => captureScreen((blob) => showFeedback(blob)))
const soundBtn = $('sound-btn')
function refreshSoundBtn() {
  const on = audio.musicOn || audio.sfxOn
  soundBtn.innerHTML = on ? ICONS.soundOn : ICONS.soundOff
  soundBtn.setAttribute('aria-label', on ? 'Mute' : 'Unmute')
}
soundBtn.addEventListener('click', () => {
  // One tap mutes everything; the next restores both.
  const on = audio.musicOn || audio.sfxOn
  if (on === audio.musicOn) audio.toggleMusic()
  if (on === audio.sfxOn) audio.toggleSfx()
  refreshSoundBtn()
})
refreshSoundBtn()

// Full screen where the browser allows it (desktop, Android). iPhone
// doesn't let web pages go full screen; there the answer is adding the
// game to the home screen from its own site.
const fsBtn = $('fs-btn')
const fsEnabled = document.fullscreenEnabled || document.webkitFullscreenEnabled
const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement
function refreshFsBtn() {
  fsBtn.innerHTML = fsElement() ? ICONS.fsOff : ICONS.fsOn
  fsBtn.setAttribute('aria-label', fsElement() ? 'Leave full screen' : 'Full screen')
}
if (fsEnabled) {
  fsBtn.classList.remove('hidden')
  refreshFsBtn()
  fsBtn.addEventListener('click', async () => {
    try {
      if (fsElement()) {
        await (document.exitFullscreen || document.webkitExitFullscreen).call(document)
      } else {
        const el = document.documentElement
        await (el.requestFullscreen || el.webkitRequestFullscreen).call(el, { navigationUI: 'hide' })
        // Phones: keep it sideways while full screen.
        await screen.orientation?.lock?.('landscape').catch(() => {})
      }
    } catch {
      banner('Full screen isn\'t available here<small>Open the game in its own browser tab instead</small>')
    }
  })
  document.addEventListener('fullscreenchange', () => {
    refreshFsBtn()
    setTimeout(resize, 50)
  })
  document.addEventListener('webkitfullscreenchange', refreshFsBtn)
}
$('rotate-btn').innerHTML = ICONS.rotate
$('wave-total').textContent = TOTAL_WAVES

$('view-btn').addEventListener('click', () => setView(camera.mode === 'top' ? 'iso' : 'top'))
$('rotate-btn').addEventListener('click', () => camera.rotateBy(Math.PI / 2))
$('speed-btn').addEventListener('click', () => {
  ui.speed = ui.speed === 1 ? 2 : ui.speed === 2 ? 3 : 1
  refreshHud()
})
$('start-btn').addEventListener('click', startWave)

// Each wave starts from a saved checkpoint, so a lost wave can be retried.
function startWave() {
  if (game.phase !== 'build') return
  autosave()
  game.startWave()
}

function autosave() {
  if (game.phase !== 'build') return
  saves.saveProgress(game.serialize()).catch(() => {})
}
$('menu-btn').addEventListener('click', () => showMenu())

function setView(mode) {
  camera.setMode(mode)
  refreshHud()
}

function refreshHud() {
  $('gold').textContent = Math.floor(game.gold)
  $('wave').textContent = Math.min(TOTAL_WAVES, game.wave + 1)
  const frac = game.world.keep.hp / game.world.keep.maxHp
  const fill = $('keep-fill')
  fill.style.width = `${frac * 100}%`
  fill.style.background =
    frac > 0.5 ? 'linear-gradient(#7fdc63,#4c9c3a)' : frac > 0.25 ? 'linear-gradient(#f0d060,#b8922a)' : 'linear-gradient(#ef6a4c,#a8301c)'

  $('archers').textContent = game.archers.length
  for (const b of toolbar.children) {
    const g = GROUPS.find((g) => g.id === b.dataset.group)
    const id = ui.groupChoice[g.id] || g.tools[0]
    if (b.dataset.face !== id) {
      b.dataset.face = id
      b.innerHTML = toolFace(id)
      b.title = TOOL_LABELS[id]
      b.setAttribute('aria-label', TOOL_LABELS[id])
    }
    b.classList.toggle('active', g.tools.includes(ui.tool))
    const cost = costOf(id)
    b.classList.toggle('poor', !!cost && game.gold < cost)
  }

  const iso = camera.mode === 'iso'
  const vb = $('view-btn')
  if (vb.dataset.mode !== camera.mode) {
    vb.dataset.mode = camera.mode
    vb.classList.toggle('iso', iso)
    // The button shows the view you will switch to.
    vb.innerHTML = iso ? `${ICONS.grid}<span>2D</span>` : `${ICONS.cube}<span>3D</span>`
  }
  $('rotate-btn').classList.toggle('hidden', !iso)

  const building = game.phase === 'build'
  $('start-btn').classList.toggle('hidden', !building)
  $('speed-btn').classList.toggle('hidden', game.phase !== 'attack')
  if ($('speed-btn').textContent !== `${ui.speed}×`) $('speed-btn').textContent = `${ui.speed}×`
  const info = $('next-info')
  info.classList.toggle('hidden', !building)
  if (building) {
    const n = game.wave + 1
    const c = waveComposition(n)
    const parts = [`${c.raider} raiders`]
    if (c.brute) parts.push(`${c.brute} brutes`)
    if (c.ram) parts.push(`${c.ram} rams`)
    const gates = game.activeSpawns(n).map((s) => s.name).join(', ')
    if (c.bowman) parts.push(`${c.bowman} bowmen`)
    if (c.catapult) parts.push(`${c.catapult} catapult${c.catapult > 1 ? 's' : ''}`)
    const income = game.income()
    info.innerHTML = `<b>Wave ${n}</b> from ${gates}<br>${parts.join(' · ')}${income ? `<br>Village: +${income} gold per wave` : ''}`
  }
  ui.orders.active = ui.tool === 'orders'
  const hint = $('tool-hint')
  const text = toolHint()
  hint.classList.toggle('hidden', !text)
  if (text && hint.innerHTML !== text) hint.innerHTML = text
  ui.showGrid = building || ui.tool !== 'look'
}

function toolHint() {
  const step = (a, b) => STRUCTURES[b].cost - STRUCTURES[a].cost
  switch (ui.tool) {
    case 'upgrade':
      return `<b>Upgrade</b>: tap or drag over walls<br>Palisade → stone ${step('palisade', 'wall')} · Stone → thick ${step('wall', 'thick')}<br>Damaged thick walls, towers, gates: repair`
    case 'settle': {
      const plots = game.world.tiles.filter((t) => t.type === 'plot').length
      return `<b>Village</b>: tap a staked plot to build it<br>Cottage ${STRUCTURES.cottage.cost} (+${STRUCTURES.cottage.income}) · Farm ${STRUCTURES.farm.cost} (+${STRUCTURES.farm.income}) · Market ${STRUCTURES.market.cost} (+${STRUCTURES.market.income})<br>${plots ? `${plots} plot${plots > 1 ? 's' : ''} waiting` : 'New plots appear after each wave'}`
    }
    case 'hoard':
      return `<b>Hoarding</b> (${HOARDING.cost}): tap stone walls, gates, towers<br>Archers behind it take ${Math.round(HOARDING.cover * 100)}% of arrow damage`
    case 'orders': {
      const n = ui.orders.selected.size
      if (!n) return '<b>Orders</b>: tap a swordsman, or drag a box around several, to select'
      return `<b>${n} selected</b>: drag over the area to cover,<br>or tap a spot to hold`
    }
    default:
      if (game.world.isRough(ui.tool) && game.phase === 'build') {
        const r = ROUGH_COST
        const over = ui.tool === 'wall' || ui.tool === 'thick' ? '<br>Paint over a weaker wall to upgrade it for the difference' : ''
        return `<b>${TOOL_LABELS[ui.tool]}</b> goes through anything, at a price<br>Marsh ×${r.marsh} · Ford ×${r.shallows} · Water ×${r.water} · Trees ×${r.tree} · Rocks ×${r.rock}${over}`
      }
      return ''
  }
}

let bannerTimer = 0
function banner(html, ms = 2600) {
  const el = $('banner')
  el.innerHTML = html
  el.classList.add('show')
  clearTimeout(bannerTimer)
  bannerTimer = setTimeout(() => el.classList.remove('show'), ms)
}

function modal(title, bodyHtml, actions) {
  $('modal-title').textContent = title
  $('modal-body').innerHTML = bodyHtml
  const box = $('modal-actions')
  box.innerHTML = ''
  for (const a of actions) {
    const b = document.createElement('button')
    b.textContent = a.label
    if (a.primary) b.className = 'go'
    b.addEventListener('click', () => {
      $('modal').classList.add('hidden')
      ui.paused = false
      a.run?.()
    })
    box.appendChild(b)
  }
  $('modal').classList.remove('hidden')
  ui.paused = true
}

const HELP = `
  <p>Raiders march on your keep from the red banners to kill your lord. Build a castle that holds.</p>
  <ul>
    <li><b>Walls</b>: drag to paint. Wooden palisades are cheap; stone walls let archers walk along them; thick walls take a beating. Enemies walk around walls if they can. Soldiers on foot can't break stone: they hack through gates and wood, or climb over with ladders.</li>
    <li><b>Towers and archers</b>: drag to aim, release to place. Archers stand on walls, towers and the keep, and walk along connected stone to reach attackers. Height adds range: towers most, then thick walls and hills.</li>
    <li><b>Gates and swordsmen</b>: swordsmen guard the spot you place them and charge enemies that come close. They walk through gates, which are barred while attackers are at them; enemies have to break gates down. Send them out to kill catapults. Drop a gate into an existing wall for the difference in price.</li>
    <li><b>Stairs</b>: build them against a wall, tower or the keep and swordsmen can climb up to fight raiders coming over on ladders. Post swordsmen on the keep (it has its own stairs inside the door) to guard your lord.</li>
    <li><b>Upgrade</b>: tap a palisade to make it stone, or stone to make it thick. Tap damaged thick walls, towers and gates to repair them.</li>
    <li><b>Moats, pikes and spikes</b>: moats slow anyone wading through, pikes hurt anyone attacking them, and spikes hurt anyone walking over them.</li>
    <li><b>Enemies</b>: raiders and brutes hack at gates, palisades and pikes. Pairs of raiders carry <b>ladders</b> to stone walls and climb over; archers on or next to that wall push the ladder off. Rams smash gates and stone, bowmen shoot your troops, and catapults throw boulders from beyond archer range.</li>
    <li><b>The keep and your lord</b>: attackers who reach the keep batter its door, then fight their way up to your lord. His guard fights back, but a crowd will kill him. Masons mend the door after every wave.</li>
    <li><b>Terrain</b>: rivers and lakes block the way except at fords; marsh and fords slow enemies down. Walls, gates, towers and pikes can be built across marsh, water, trees and rocks, but cost more there.</li>
    <li><b>Village</b>: after each wave the village stakes out plots where it feels safe. Tap a plot to build it; it pays gold after every wave.</li>
    <li><b>Remove</b>: full refund between waves, half during an attack.</li>
  </ul>
  <p><b>Two fingers</b> pinch to zoom and drag to pan. In <b>3D</b>, twist two fingers to orbit around your castle.
  The camera tilts to 3D when a wave starts so you can watch it play out, and returns to 2D for building.</p>`

const CREDITS = `<p class="credits">Music: “Castle Chamber” by brigham773. “Minstrel Guild” and “Heroic Age” by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0.</p>`

// ---- feedback ---------------------------------------------------------------

let pendingCapture = null
function captureScreen(cb) {
  pendingCapture = cb
}

const REPO_ISSUES = 'https://github.com/brigham-netizen/training/issues/new'
let fbDraft = { kind: 'bug', text: '', name: '' }
try {
  fbDraft.name = localStorage.getItem('htk-name') || ''
} catch {
  // ignore
}

function reportText(kind, text, name) {
  const w = game.phase === 'won' ? game.wave : game.nextWave
  const lines = [
    `Hold the Keep: ${kind === 'bug' ? 'bug report' : 'idea'}`,
    '',
    text.trim() || '(no description)',
    '',
    name.trim() ? `From: ${name.trim()}` : null,
    `Build ${__BUILD__} · map ${game.seed} · wave ${w}/${TOTAL_WAVES} (${game.phase}) · ${game.gold} gold`,
    `${gfx === '3d' ? '3D' : 'Classic'} graphics · ${window.innerWidth}×${window.innerHeight} · ${navigator.userAgent}`,
  ]
  return lines.filter((l) => l !== null).join('\n')
}

function showFeedback(shot) {
  const k = fbDraft.kind
  modal('Send feedback', `
    <div class="toggles fb-kind">
      <button data-kind="bug" class="${k === 'bug' ? 'on' : ''}">Something's wrong</button>
      <button data-kind="idea" class="${k === 'idea' ? 'on' : ''}">I have an idea</button>
    </div>
    <textarea id="fb-text" class="fb-text" rows="3" maxlength="2000" placeholder="What happened, or what would make it better?">${escapeHtml(fbDraft.text)}</textarea>
    <div class="fb-row">
      <input id="fb-name" maxlength="40" placeholder="Your name (optional)" value="${escapeHtml(fbDraft.name)}" />
      ${shot ? '<label class="fb-check"><input type="checkbox" id="fb-shot" checked /> Screenshot</label>' : ''}
    </div>
    <p class="save-note fb-note">Includes the map number, wave and device so it can be replayed.</p>`, [
    { label: 'Cancel', run: readDraft },
    { label: 'Post on GitHub', run: () => sendFeedback(shot, 'github') },
    { label: 'Send', primary: true, run: () => sendFeedback(shot, 'share') },
  ])
  for (const b of document.querySelectorAll('.fb-kind button'))
    b.addEventListener('click', () => {
      fbDraft.kind = b.dataset.kind
      for (const o of document.querySelectorAll('.fb-kind button')) o.classList.toggle('on', o === b)
    })
  $('fb-text').focus()
}

function readDraft() {
  fbDraft.text = $('fb-text')?.value ?? fbDraft.text
  fbDraft.name = $('fb-name')?.value ?? fbDraft.name
  try {
    localStorage.setItem('htk-name', fbDraft.name)
  } catch {
    // ignore
  }
}

async function sendFeedback(shot, how) {
  readDraft()
  const withShot = shot && $('fb-shot')?.checked !== false
  const text = reportText(fbDraft.kind, fbDraft.text, fbDraft.name)
  const title = `${fbDraft.kind === 'bug' ? 'Bug' : 'Idea'}: ${fbDraft.text.trim().split('\n')[0].slice(0, 60) || 'feedback'}`
  if (how === 'github') {
    window.open(`${REPO_ISSUES}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`, '_blank')
    fbDraft.text = ''
    return
  }
  // The phone's share sheet: text it, email it, whatever's handy.
  const data = { title: 'Hold the Keep feedback', text }
  if (withShot) {
    const file = new File([shot], 'hold-the-keep.jpg', { type: 'image/jpeg' })
    if (navigator.canShare?.({ files: [file] })) data.files = [file]
  }
  try {
    if (!navigator.share) throw new Error('no share')
    await navigator.share(data)
    fbDraft.text = ''
    banner('Thanks!<small>Your feedback is on its way.</small>', 2000)
  } catch (err) {
    if (err?.name === 'AbortError') return // they closed the share sheet
    try {
      await navigator.clipboard.writeText(text)
      fbDraft.text = ''
      banner('Copied to your clipboard<small>Paste it in a message to whoever sent you the game.</small>', 4200)
    } catch {
      modal('Send feedback', `<p>Copy this and send it to whoever sent you the game:</p><textarea class="fb-copy" rows="8" readonly>${escapeHtml(text)}</textarea>`, [{ label: 'Done', primary: true }])
    }
  }
}

function showMenu() {
  const toggles = `<div class="toggles">
    <button id="music-toggle" class="${audio.musicOn ? 'on' : ''}">Music: ${audio.musicOn ? 'on' : 'off'}</button>
    <button id="sfx-toggle" class="${audio.sfxOn ? 'on' : ''}">Sound effects: ${audio.sfxOn ? 'on' : 'off'}</button>
    <button id="build-track">Build music: ${BUILD_TRACKS[audio.buildTrack].label}</button>
    <button id="test-sound">Test sound</button>
    <button id="gfx-toggle" class="${gfx === '3d' ? 'on' : ''}">Graphics: ${gfx === '3d' ? '3D (preview)' : 'Classic'}</button>
    <button id="menu-feedback">Report a bug / suggest an idea</button>
  </div><p class="save-note" id="sound-note"></p>`
  const savesRow = `<div class="toggles">
    <button id="save-game">Save game</button>
    <button id="load-game">Load save</button>
    <button id="save-map">Save this map</button>
    <button id="my-maps">My maps</button>
  </div><p class="save-note" id="save-note">Saves are kept in ${saves.where}. The game also saves before every wave.</p>`
  modal('Hold the Keep', toggles + savesRow + HELP + CREDITS, [
    { label: 'New map', run: () => restart(randomSeed()) },
    { label: 'Restart', run: () => restart() },
    { label: 'Resume', primary: true },
  ])
}

const note = (text) => {
  const el = $('save-note')
  if (el) el.textContent = text
}

document.addEventListener('click', async (e) => {
  const id = e.target.id
  if (id === 'save-game') {
    if (game.phase !== 'build') return note('You can save between waves.')
    note('Saving…')
    const ok = await saves.saveProgress(game.serialize()).catch(() => false)
    return note(ok ? `Saved wave ${game.wave + 1} to ${saves.where}.` : 'Could not save. Try again in a moment.')
  }
  if (id === 'load-game') {
    const data = await saves.loadProgress()
    if (!data) return note('No saved game yet.')
    closeModal()
    loadGame(data)
    return
  }
  if (id === 'menu-feedback') {
    closeModal()
    captureScreen((blob) => showFeedback(blob))
    return
  }
  if (id === 'gfx-toggle') {
    setGfx(gfx === '3d' ? 'classic' : '3d')
    e.target.classList.toggle('on', gfx === '3d')
    e.target.textContent = `Graphics: ${gfx === '3d' ? '3D (preview)' : 'Classic'}`
    return
  }
  if (id === 'build-track') {
    audio.unlock()
    audio.nextBuildTrack()
    e.target.textContent = `Build music: ${BUILD_TRACKS[audio.buildTrack].label}`
    return
  }
  if (id === 'test-sound') {
    audio.unlock()
    audio.play('horn')
    setTimeout(() => {
      const el = $('sound-note')
      if (!el) return
      const music = audio.tracks.build
      const parts = []
      parts.push(audio.running ? 'Sound engine is running: you should hear a horn.' : 'This browser is blocking sound so far. Tap again; if it stays silent, check the volume and the silent switch.')
      if (!audio.musicOn) parts.push('Music is turned off.')
      else if (music?.error) parts.push('The music files could not be loaded here.')
      else if (music && !music.paused) parts.push('Music is playing.')
      else parts.push('Music is still loading.')
      el.textContent = parts.join(' ')
    }, 600)
    return
  }
  if (id === 'save-map') return showSaveMap()
  if (id === 'my-maps') return showMaps()
  if (id.startsWith('play-map-') || id.startsWith('del-map-')) return mapAction(e.target)
  if (e.target.id === 'music-toggle') audio.toggleMusic()
  else if (e.target.id === 'sfx-toggle') audio.toggleSfx()
  else return
  e.target.classList.toggle('on')
  e.target.textContent = e.target.id === 'music-toggle' ? `Music: ${audio.musicOn ? 'on' : 'off'}` : `Sound effects: ${audio.sfxOn ? 'on' : 'off'}`
  refreshSoundBtn()
})

function closeModal() {
  $('modal').classList.add('hidden')
  ui.paused = false
}

function loadGame(data) {
  try {
    game = Game.restore(data)
  } catch {
    banner('That save is from an older version and can\'t be loaded.')
    return
  }
  window.htk.game = game
  ui.orders.selected = new Set()
  ui.tool = ui.buildTool = 'wall'
  ui.speed = 1
  setView('top')
  audio.setMusic('build')
  banner(`Welcome back<small>Wave ${game.wave + 1} of ${TOTAL_WAVES}</small>`)
  refreshHud()
}

let mapsCache = []
function showSaveMap() {
  const count = mapsCache.length
  modal('Save this map', `<p>Keep this landscape to play again later. Only the land is saved, not your castle.</p>
    <label class="field">Name<input id="map-name" maxlength="32" value="Map ${count + 1}" /></label>`, [
    { label: 'Cancel' },
    {
      label: 'Save map',
      primary: true,
      run: async () => {
        const name = ($('map-name')?.value || '').trim() || `Map ${count + 1}`
        const ok = await saves.saveMap(name, game.world.snapshotMap()).catch(() => false)
        banner(ok ? `Saved “${name}”<small>Find it under My maps</small>` : 'Could not save the map. Try again in a moment.')
      },
    },
  ])
  // Read the name before the modal closes.
  const input = $('map-name')
  input?.addEventListener('keydown', (ev) => ev.key === 'Enter' && $('modal-actions').lastChild.click())
}

async function showMaps() {
  mapsCache = await saves.listMaps()
  const rows = mapsCache.length
    ? mapsCache.map((m) => `<div class="map-row"><span><b>${escapeHtml(m.name)}</b><small>${new Date(m.savedAt).toLocaleDateString()}</small></span>
        <button id="play-map-${m.id}" class="go">Play</button><button id="del-map-${m.id}">Delete</button></div>`).join('')
    : '<p>No saved maps yet. When you find a landscape you like, open the menu and tap <b>Save this map</b>.</p>'
  modal('My maps', `<div class="map-list">${rows}</div>`, [{ label: 'Close', primary: true }])
}

async function mapAction(btn) {
  const play = btn.id.startsWith('play-map-')
  const id = btn.id.replace(/^(play|del)-map-/, '')
  const entry = mapsCache.find((m) => m.id === id)
  if (!entry) return
  if (play) {
    closeModal()
    restart(Math.floor(Math.random() * 1e9), entry.map)
    banner(`Playing “${escapeHtml(entry.name)}”`)
    return
  }
  // Two taps to delete.
  if (btn.dataset.confirm !== '1') {
    btn.dataset.confirm = '1'
    btn.textContent = 'Tap again'
    return
  }
  await saves.deleteMap(id).catch(() => {})
  showMaps()
}

function listKinds(kinds) {
  const names = kinds.map((k) => `a ${STRUCTURES[k].label.toLowerCase()}`)
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

// No arguments: same land again. A seed alone: a brand new landscape.
function restart(seed, map) {
  if (seed === undefined) game.reset()
  else game.reset(seed, map || null)
  audio.setMusic('build')
  ui.tool = ui.buildTool = 'wall'
  ui.speed = 1
  setView('top')
  refreshHud()
}

function handleEvents() {
  for (const ev of game.events) {
    if (ev.type === 'waveStart') {
      banner(`Wave ${ev.wave} incoming!<small>from the ${ev.spawns.join(' & ')}</small>`)
      // Show off the castle while it's under siege.
      setView('iso')
      audio.play('horn')
      audio.setMusic('battle')
      ui.tool = 'look'
      closeFlyout()
    } else if (ev.type === 'waveEnd') {
      const village = ev.village ? ` and +${ev.village} from the village` : ''
      const plots = ev.plots?.length
        ? `<br>The village staked out ${listKinds(ev.plots)}. Tap a plot to build it.`
        : ''
      banner(`Wave ${ev.wave} repelled!<small>+${ev.bonus} gold${village}.${plots}</small>`, plots ? 5000 : 3400)
      autosave()
      setView('top')
      audio.play('waveEnd')
      audio.setMusic('build')
      ui.tool = ui.buildTool
      ui.speed = 1
    } else if (ev.type === 'doorBroken') {
      banner('The keep door is down!<small>Attackers are climbing to your lord.</small>', 2600)
    } else if (ev.type === 'won') {
      audio.play('victory')
      audio.setMusic('build')
      modal('Victory!', `<p>Your keep stood against all <b>${TOTAL_WAVES}</b> waves.</p>`, [
        { label: 'Keep looking' },
        { label: 'New map', primary: true, run: () => restart(randomSeed()) },
      ])
    } else if (ev.type === 'lost') {
      audio.play('defeat')
      audio.setMusic('build')
      modal('Your lord has fallen', `<p>You held out until wave <b>${ev.wave}</b>.</p>`, [
        { label: 'Look around' },
        { label: 'Start over', run: () => restart() },
        {
          label: 'Retry this wave',
          primary: true,
          run: async () => {
            const data = await saves.loadProgress()
            if (data) loadGame(data)
            else restart()
          },
        },
      ])
    }
    refreshHud()
  }
  game.events.length = 0
}

// ---- keyboard (desktop testing) -----------------------------------------------

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
  const n = '1234567890'.indexOf(e.key)
  if (n >= 0) selectTool(KEYS[n])
  else if (e.key === 'v') setView(camera.mode === 'top' ? 'iso' : 'top')
  else if (e.key === 'r') camera.rotateBy(Math.PI / 2)
  else if (e.key === ' ' && game.phase === 'build') {
    e.preventDefault()
    startWave()
  }
})

// ---- loop -------------------------------------------------------------------

function resize() {
  renderer.resize()
  renderer3d?.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1)
  const fit = camera.fit()
  if (!resize.done) {
    // Start zoomed in enough to build with a fingertip, centred on the keep.
    camera.zoom = Math.max(fit, Math.min(1.25, camera.vh / (12 * 32)))
    camera.updateTrig()
    resize.done = true
  }
}
window.addEventListener('resize', resize)
resize()
if (gfx === '3d') setGfx('3d')
refreshHud()

const STEP = 1 / 60
let acc = 0
let last = performance.now()
let hudTimer = 0
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000)
  last = now
  if (!ui.paused) {
    acc += dt * (game.phase === 'attack' ? ui.speed : 1)
    while (acc >= STEP) {
      game.update(STEP)
      acc -= STEP
    }
  }
  camera.update(dt)
  handleEvents()
  // Effects near the camera's focus play louder.
  for (const snd of game.sounds) {
    const d = Math.hypot(snd.x - camera.fx, snd.y - camera.fy)
    audio.play(snd.name, Math.max(0.25, 1 - d / 22))
  }
  game.sounds.length = 0
  audio.update(dt)
  hudTimer += dt
  if (hudTimer > 0.1) {
    hudTimer = 0
    refreshHud()
  }
  if (gfx === '3d' && renderer3d) {
    renderer3d.render(game, camera)
    renderer.renderOverlay(game, ui)
  } else renderer.render(game, ui)
  if (pendingCapture) {
    // Grab the frame now, while the WebGL buffer still holds it.
    const done = pendingCapture
    pendingCapture = null
    try {
      const scale = Math.min(1, 1280 / canvas.width)
      const out = document.createElement('canvas')
      out.width = Math.round(canvas.width * scale)
      out.height = Math.round(canvas.height * scale)
      const g = out.getContext('2d')
      if (gfx === '3d' && renderer3d) g.drawImage(canvas3d, 0, 0, out.width, out.height)
      g.drawImage(canvas, 0, 0, out.width, out.height)
      out.toBlob((b) => done(b), 'image/jpeg', 0.82)
    } catch {
      done(null)
    }
  }
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)

// First launch: explain the controls.
try {
  if (!localStorage.getItem('htk-seen-help')) {
    localStorage.setItem('htk-seen-help', '1')
    modal('Hold the Keep', HELP, [{ label: 'Start building', primary: true }])
  }

} catch {
  // Storage blocked (private mode): skip the intro.
}

// Offer to pick up a saved castle where it was left.
saves.loadProgress().then((data) => {
  if (!data || (data.wave === 0 && !data.types.some((t) => t && t !== 'keep'))) return
  if (!$('modal').classList.contains('hidden')) return
  modal('Welcome back', `<p>You have a castle in progress at <b>wave ${data.wave + 1}</b> of ${TOTAL_WAVES}.</p>`, [
    { label: 'New game' },
    { label: 'Continue', primary: true, run: () => loadGame(data) },
  ])
})
