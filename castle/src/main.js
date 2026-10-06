import './styles.css'
import { Game } from './game.js'
import { Camera } from './camera.js'
import { Renderer } from './render.js'
import { Input } from './input.js'
import { STRUCTURES, TOTAL_WAVES, waveComposition } from './config.js'

const ICONS = {
  look: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3"/></svg>',
  wall: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="1"/><path d="M2 9.7h20M2 14.3h20M8 5v4.7M15 5v4.7M5 9.7v4.6M12 9.7v4.6M19 9.7v4.6M8 14.3V19M15 14.3V19"/></svg>',
  tower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 22V9h14v13zM5 9V3h3v2.5h2.5V3h3v2.5H16V3h3v6"/><path d="M10 22v-5a2 2 0 0 1 4 0v5"/></svg>',
  trap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2 20h20M4 20l2.5-9L9 20M9.5 20l2.5-12 2.5 12M15 20l2.5-9L20 20"/></svg>',
  demolish: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4c3 0 6 2 7 5-3-1.5-6-1.5-9 0M12 9l-9 9 3 3 9-9"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  rotate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg>',
  cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2l9 5v10l-9 5-9-5V7zM12 12l9-5M12 12L3 7M12 12v10"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>',
}

const TOOLS = [
  { id: 'look', label: 'Look', key: '1' },
  { id: 'wall', label: 'Wall', key: '2' },
  { id: 'tower', label: 'Tower', key: '3' },
  { id: 'trap', label: 'Spikes', key: '4' },
  { id: 'demolish', label: 'Remove', key: '5' },
]

const $ = (id) => document.getElementById(id)

const game = new Game()
const camera = new Camera(game.world.w, game.world.h)
const canvas = $('game')
const renderer = new Renderer(canvas, camera)

const ui = {
  tool: 'wall',
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

let noGoldWarned = false
function paint(i) {
  const tool = ui.tool
  if (tool === 'demolish') {
    game.demolish(i)
  } else if (tool === 'wall' || tool === 'trap') {
    if (!game.place(i, tool) && game.world.canBuild(i) && game.gold < STRUCTURES[tool].cost) warnGold()
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
  placeTower: (i) => {
    if (!game.place(i, 'tower') && game.gold < STRUCTURES.tower.cost) warnGold()
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
for (const t of TOOLS) {
  const b = document.createElement('button')
  b.className = 'tool'
  b.dataset.tool = t.id
  const cost = STRUCTURES[t.id]?.cost
  b.innerHTML = `${ICONS[t.id]}<span>${cost ? `<span class="cost">${cost}</span>` : t.label}</span>`
  b.setAttribute('aria-label', t.label)
  b.title = `${t.label} (${t.key})`
  b.addEventListener('click', () => selectTool(t.id))
  toolbar.appendChild(b)
}

function selectTool(id) {
  ui.tool = id
  ui.preview = null
  refreshHud()
}

$('menu-btn').innerHTML = ICONS.menu
$('rotate-btn').innerHTML = ICONS.rotate
$('wave-total').textContent = TOTAL_WAVES

$('view-btn').addEventListener('click', () => setView(camera.mode === 'top' ? 'iso' : 'top'))
$('rotate-btn').addEventListener('click', () => camera.rotateBy(Math.PI / 2))
$('speed-btn').addEventListener('click', () => {
  ui.speed = ui.speed === 1 ? 2 : ui.speed === 2 ? 3 : 1
  refreshHud()
})
$('start-btn').addEventListener('click', () => {
  if (game.phase === 'build') game.startWave()
})
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

  for (const b of toolbar.children) {
    const id = b.dataset.tool
    b.classList.toggle('active', id === ui.tool)
    const cost = STRUCTURES[id]?.cost
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
    info.innerHTML = `<b>Wave ${n}</b> from ${gates}<br>${parts.join(' · ')}`
  }
  ui.showGrid = building || ui.tool !== 'look'
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
  <p>Raiders march on your keep from the red banners. Build a castle that holds.</p>
  <ul>
    <li><b>Wall</b>: drag to paint walls. Enemies walk around them if they can, and break through the weakest point if they can't.</li>
    <li><b>Tower</b>: drag to aim, release to place. Archers shoot anything in the dashed range.</li>
    <li><b>Spikes</b>: hurt everything that walks over them. Funnel enemies across them.</li>
    <li><b>Remove</b>: full refund between waves, half during an attack.</li>
  </ul>
  <p><b>Two fingers</b> pinch to zoom and drag to pan. In <b>3D</b>, twist two fingers to orbit around your castle.
  The camera tilts to 3D when a wave starts so you can watch it play out, and returns to 2D for building.</p>`

function showMenu() {
  modal('Hold the Keep', HELP, [
    { label: 'Restart', run: restart },
    { label: 'Resume', primary: true },
  ])
}

function restart() {
  game.reset()
  ui.tool = 'wall'
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
      if (ui.tool !== 'look') ui.tool = 'look'
    } else if (ev.type === 'waveEnd') {
      banner(`Wave ${ev.wave} repelled!<small>+${ev.bonus} gold. Strengthen your defenses.</small>`, 3200)
      setView('top')
      ui.tool = 'wall'
      ui.speed = 1
    } else if (ev.type === 'won') {
      modal('Victory!', `<p>Your keep stood against all <b>${TOTAL_WAVES}</b> waves.</p>`, [
        { label: 'Keep looking' },
        { label: 'Play again', primary: true, run: restart },
      ])
    } else if (ev.type === 'lost') {
      modal('The keep has fallen', `<p>You held out until wave <b>${ev.wave}</b>.</p>`, [
        { label: 'Look around' },
        { label: 'Try again', primary: true, run: restart },
      ])
    }
    refreshHud()
  }
  game.events.length = 0
}

// ---- keyboard (desktop testing) -----------------------------------------------

window.addEventListener('keydown', (e) => {
  const t = TOOLS.find((t) => t.key === e.key)
  if (t) selectTool(t.id)
  else if (e.key === 'v') setView(camera.mode === 'top' ? 'iso' : 'top')
  else if (e.key === 'r') camera.rotateBy(Math.PI / 2)
  else if (e.key === ' ' && game.phase === 'build') {
    e.preventDefault()
    game.startWave()
  }
})

// ---- loop -------------------------------------------------------------------

function resize() {
  renderer.resize()
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
  hudTimer += dt
  if (hudTimer > 0.1) {
    hudTimer = 0
    refreshHud()
  }
  renderer.render(game, ui)
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
