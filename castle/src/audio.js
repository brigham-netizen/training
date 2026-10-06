// Sound: synthesized effects (no files) plus two music tracks that
// crossfade between building and battle. Browsers only allow audio after
// a tap, so nothing plays until unlock() runs from a pointer event.

const MUSIC = {
  build: './music/minstrel.mp3',
  battle: './music/heroic.mp3',
}

// Minimum seconds between repeats of each effect so a volley of 30
// arrows doesn't turn into noise.
const THROTTLE = { bow: 0.07, hit: 0.06, clash: 0.12, build: 0.05, recruit: 0.1, crumble: 0.15, launch: 0.3, impact: 0.2, fall: 0.2 }

export class Audio {
  constructor() {
    this.ctx = null
    this.musicOn = true
    this.sfxOn = true
    this.tracks = {}
    this.want = 'build' // which track should be playing
    this.last = {}
    try {
      const saved = JSON.parse(localStorage.getItem('htk-audio') || '{}')
      if (saved.music === false) this.musicOn = false
      if (saved.sfx === false) this.sfxOn = false
    } catch {
      // Storage blocked: keep defaults.
    }
  }

  save() {
    try {
      localStorage.setItem('htk-audio', JSON.stringify({ music: this.musicOn, sfx: this.sfxOn }))
    } catch {
      // ignore
    }
  }

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume()
      return
    }
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    this.ctx = new AC()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.5
    this.master.connect(this.ctx.destination)
    // One second of white noise, reused by every noisy effect.
    const len = this.ctx.sampleRate
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const data = this.noise.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1

    for (const [key, src] of Object.entries(MUSIC)) {
      const el = new window.Audio(src)
      el.loop = true
      el.preload = 'auto'
      el.volume = 0
      this.tracks[key] = el
    }
    this.setMusic(this.want)
  }

  setMusic(which) {
    this.want = which
    if (!this.ctx || !this.musicOn) return
    const el = this.tracks[which]
    if (el && el.paused) el.play().catch(() => {})
  }

  toggleMusic() {
    this.musicOn = !this.musicOn
    if (!this.musicOn) for (const el of Object.values(this.tracks)) el.pause()
    else this.setMusic(this.want)
    this.save()
  }

  toggleSfx() {
    this.sfxOn = !this.sfxOn
    this.save()
  }

  // Called every frame: fade the wanted track up and the other down.
  update(dt) {
    for (const [key, el] of Object.entries(this.tracks)) {
      const target = this.musicOn && key === this.want ? 0.35 : 0
      el.volume = Math.max(0, Math.min(1, el.volume + Math.sign(target - el.volume) * Math.min(Math.abs(target - el.volume), dt * 0.4)))
      if (el.volume === 0 && !el.paused && key !== this.want) el.pause()
    }
  }

  play(name, gain = 1) {
    if (!this.ctx || !this.sfxOn) return
    const now = this.ctx.currentTime
    if (now - (this.last[name] || -1) < (THROTTLE[name] || 0)) return
    this.last[name] = now
    const fn = this[`fx_${name}`]
    if (fn) fn.call(this, now, gain)
  }

  // ---- building blocks ----------------------------------------------------

  env(t, attack, decay, peak) {
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
    g.connect(this.master)
    return g
  }

  tone(t, type, freq, dur, peak, endFreq) {
    const o = this.ctx.createOscillator()
    o.type = type
    o.frequency.setValueAtTime(freq, t)
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur)
    o.connect(this.env(t, 0.005, dur, peak))
    o.start(t)
    o.stop(t + dur + 0.05)
  }

  hiss(t, dur, peak, filterType, freq, q = 1, endFreq) {
    const src = this.ctx.createBufferSource()
    src.buffer = this.noise
    const f = this.ctx.createBiquadFilter()
    f.type = filterType
    f.frequency.setValueAtTime(freq, t)
    if (endFreq) f.frequency.exponentialRampToValueAtTime(endFreq, t + dur)
    f.Q.value = q
    src.connect(f)
    f.connect(this.env(t, 0.004, dur, peak))
    src.start(t, Math.random() * 0.5)
    src.stop(t + dur + 0.05)
  }

  // ---- effects ------------------------------------------------------------

  fx_bow(t, g) {
    this.tone(t, 'triangle', 420 + Math.random() * 80, 0.08, 0.12 * g, 180)
    this.hiss(t, 0.12, 0.08 * g, 'bandpass', 2400, 2, 900)
  }
  fx_hit(t, g) {
    this.tone(t, 'sine', 160, 0.08, 0.15 * g, 70)
  }
  fx_clash(t, g) {
    const f = 1800 + Math.random() * 900
    this.tone(t, 'square', f, 0.09, 0.05 * g, f * 0.7)
    this.tone(t, 'triangle', f * 1.5, 0.15, 0.04 * g)
  }
  fx_build(t, g) {
    this.tone(t, 'sine', 230 + Math.random() * 40, 0.07, 0.2 * g, 120)
    this.hiss(t, 0.05, 0.08 * g, 'lowpass', 1400)
  }
  fx_recruit(t, g) {
    this.tone(t, 'triangle', 520, 0.08, 0.1 * g)
    this.tone(t + 0.07, 'triangle', 780, 0.12, 0.1 * g)
  }
  fx_crumble(t, g) {
    this.hiss(t, 0.7, 0.35 * g, 'lowpass', 900, 0.7, 160)
    this.tone(t, 'sine', 90, 0.4, 0.25 * g, 40)
  }
  fx_launch(t, g) {
    this.tone(t, 'sine', 120, 0.2, 0.25 * g, 60)
    this.hiss(t + 0.05, 0.5, 0.12 * g, 'bandpass', 500, 1.5, 1600)
  }
  fx_impact(t, g) {
    this.tone(t, 'sine', 70, 0.5, 0.45 * g, 30)
    this.hiss(t, 0.45, 0.3 * g, 'lowpass', 700, 0.7, 120)
  }
  fx_fall(t, g) {
    this.tone(t, 'sawtooth', 300, 0.25, 0.05 * g, 120)
  }
  fx_horn(t, g) {
    // War horn: two rising notes through a soft filter.
    for (const [start, f, dur] of [[0, 146.8, 0.7], [0.55, 196, 1.1]]) {
      const o = this.ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.setValueAtTime(f * 0.94, t + start)
      o.frequency.linearRampToValueAtTime(f, t + start + 0.12)
      const lp = this.ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 900
      const e = this.ctx.createGain()
      e.gain.setValueAtTime(0.0001, t + start)
      e.gain.exponentialRampToValueAtTime(0.22 * g, t + start + 0.1)
      e.gain.setValueAtTime(0.22 * g, t + start + dur - 0.2)
      e.gain.exponentialRampToValueAtTime(0.0001, t + start + dur)
      o.connect(lp)
      lp.connect(e)
      e.connect(this.master)
      o.start(t + start)
      o.stop(t + start + dur + 0.05)
    }
  }
  fx_victory(t, g) {
    ;[392, 494, 587, 784].forEach((f, k) => this.tone(t + k * 0.16, 'triangle', f, 0.5, 0.15 * g))
  }
  fx_defeat(t, g) {
    ;[392, 330, 262, 196].forEach((f, k) => this.tone(t + k * 0.28, 'triangle', f, 0.6, 0.15 * g))
  }
  fx_waveEnd(t, g) {
    ;[523, 659, 784].forEach((f, k) => this.tone(t + k * 0.12, 'triangle', f, 0.35, 0.12 * g))
  }
}
