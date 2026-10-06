import './styles.css'
import { Game } from './game.js'
import { Camera } from './camera.js'
import { Renderer } from './render.js'
import { Input } from './input.js'
import { Audio } from './audio.js'
import { STRUCTURES, ARCHER, SWORDSMAN, TOTAL_WAVES, waveComposition } from './config.js'

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
  swordsman: 'Swordsman',
  upgrade: 'Upgrade',
  trap: 'Spikes',
  demolish: 'Remove',
}
const TOOL_HINTS = {
  palisade: 'Cheap wood. Archers can\'t stand on it.',
  wall: 'Archers walk along connected stone.',
  thick: 'Very tough, holds 2 archers.',
  tower: 'Comes with an archer. Height adds range.',
  archer: 'Tap a wall, tower or the keep.',
  gate: 'Your troops walk through. Enemies must break it.',
  swordsman: 'Guards a spot and charges nearby enemies.',
  moat: 'Enemies wade through slowly.',
  pikes: 'Hurts anyone who attacks it.',
  trap: 'Hurts anyone who walks over it.',
}
// Toolbar groups; multi-tool groups open a flyout.
const GROUPS = [
  { id: 'look', tools: ['look'] },
  { id: 'walls', tools: ['palisade', 'wall', 'thick', 'gate'] },
  { id: 'defend', tools: ['tower', 'archer', 'swordsman'] },
  { id: 'obstacles', tools: ['moat', 'pikes', 'trap'] },
  { id: 'upgrade', tools: ['upgrade'] },
  { id: 'demolish', tools: ['demolish'] },
]
const KEYS = ['look', 'palisade', 'wall', 'thick', 'gate', 'tower', 'archer', 'swordsman', 'upgrade', 'demolish']
const PLACE_ON_RELEASE = new Set(['tower', 'archer', 'swordsman', 'gate'])
const costOf = (id) => (id === 'archer' ? ARCHER.cost : id === 'swordsman' ? SWORDSMAN.cost : STRUCTURES[id]?.cost)

const $ = (id) => document.getElementById(id)

const randomSeed = () => Math.floor(Math.random() * 1e9)
const game = new Game(randomSeed())
const camera = new Camera(game.world.w, game.world.h)
const canvas = $('game')
const renderer = new Renderer(canvas, camera)
const audio = new Audio()
// Handle for automated screenshot tests.
window.htk = { game, audio }
// Browsers only start audio from a user gesture.
window.addEventListener('pointerdown', () => audio.unlock(), { capture: true })

const ui = {
  tool: 'wall',
  buildTool: 'wall', // last build tool, restored after each wave
  groupChoice: { walls: 'wall', defend: 'tower', obstacles: 'moat' },
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
  } else if (tool === 'upgrade') {
    if (!game.place(i, 'upgrade') && game.upgradeInfo(i) && game.gold < game.upgradeInfo(i).cost) warnGold()
  } else if (STRUCTURES[tool]) {
    if (!game.place(i, tool) && game.world.canBuild(i, tool) && game.gold < costOf(tool)) warnGold()
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
  placeAt: (i) => {
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
  ui.tool = id
  if (id !== 'look' && id !== 'demolish') ui.buildTool = id
  for (const g of GROUPS) if (g.tools.length > 1 && g.tools.includes(id)) ui.groupChoice[g.id] = id
  ui.preview = null
  refreshHud()
}

$('menu-btn').innerHTML = ICONS.menu
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
    info.innerHTML = `<b>Wave ${n}</b> from ${gates}<br>${parts.join(' · ')}`
  }
  const hint = $('tool-hint')
  const upgrading = ui.tool === 'upgrade'
  hint.classList.toggle('hidden', !upgrading)
  if (upgrading && !hint.dataset.set) {
    hint.dataset.set = '1'
    const step = (a, b) => STRUCTURES[b].cost - STRUCTURES[a].cost
    hint.innerHTML = `<b>Upgrade</b>: tap or drag over walls<br>Palisade → stone ${step('palisade', 'wall')} · Stone → thick ${step('wall', 'thick')}<br>Damaged thick walls, towers, gates: repair`
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
    <li><b>Walls</b>: drag to paint. Wooden palisades are cheap; stone walls let archers walk along them; thick walls take a beating. Enemies walk around walls if they can, and break through the weakest point if they can't.</li>
    <li><b>Towers and archers</b>: drag to aim, release to place. Archers stand on walls, towers and the keep, and walk along connected stone to reach attackers. Height adds range: towers most, then thick walls and hills.</li>
    <li><b>Gates and swordsmen</b>: swordsmen guard the spot you place them and charge enemies that come close. They walk through gates; enemies have to break gates down. Send them out to kill catapults.</li>
    <li><b>Upgrade</b>: tap a palisade to make it stone, or stone to make it thick. Tap damaged thick walls, towers and gates to repair them.</li>
    <li><b>Moats, pikes and spikes</b>: moats slow anyone wading through, pikes hurt anyone attacking them, and spikes hurt anyone walking over them.</li>
    <li><b>Enemies</b>: raiders and brutes hack at walls, rams smash them, bowmen shoot your troops, and catapults throw boulders from beyond archer range.</li>
    <li><b>Terrain</b>: rivers and lakes block the way except at fords. Marsh and fords slow enemies down, and you can't build on them.</li>
    <li><b>Remove</b>: full refund between waves, half during an attack.</li>
  </ul>
  <p><b>Two fingers</b> pinch to zoom and drag to pan. In <b>3D</b>, twist two fingers to orbit around your castle.
  The camera tilts to 3D when a wave starts so you can watch it play out, and returns to 2D for building.</p>`

const CREDITS = `<p class="credits">Music: “Minstrel Guild” and “Heroic Age” by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0.</p>`

function showMenu() {
  const toggles = `<div class="toggles">
    <button id="music-toggle" class="${audio.musicOn ? 'on' : ''}">Music: ${audio.musicOn ? 'on' : 'off'}</button>
    <button id="sfx-toggle" class="${audio.sfxOn ? 'on' : ''}">Sound effects: ${audio.sfxOn ? 'on' : 'off'}</button>
  </div>`
  modal('Hold the Keep', toggles + HELP + CREDITS, [
    { label: 'New map', run: () => restart(randomSeed()) },
    { label: 'Restart', run: () => restart() },
    { label: 'Resume', primary: true },
  ])
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'music-toggle') audio.toggleMusic()
  else if (e.target.id === 'sfx-toggle') audio.toggleSfx()
  else return
  e.target.classList.toggle('on')
  e.target.textContent = e.target.id === 'music-toggle' ? `Music: ${audio.musicOn ? 'on' : 'off'}` : `Sound effects: ${audio.sfxOn ? 'on' : 'off'}`
  refreshSoundBtn()
})

function restart(seed) {
  game.reset(seed)
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
      banner(`Wave ${ev.wave} repelled!<small>+${ev.bonus} gold. Strengthen your defenses.</small>`, 3200)
      setView('top')
      audio.play('waveEnd')
      audio.setMusic('build')
      ui.tool = ui.buildTool
      ui.speed = 1
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
      modal('The keep has fallen', `<p>You held out until wave <b>${ev.wave}</b>.</p>`, [
        { label: 'Look around' },
        { label: 'Try again', primary: true, run: () => restart() },
      ])
    }
    refreshHud()
  }
  game.events.length = 0
}

// ---- keyboard (desktop testing) -----------------------------------------------

window.addEventListener('keydown', (e) => {
  const n = '1234567890'.indexOf(e.key)
  if (n >= 0) selectTool(KEYS[n])
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
