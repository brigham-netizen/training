import { TILE_PX } from './config.js'

// One orthographic camera that morphs between the two views:
//   top-down:  elevation 90deg, rotation 0   (heights collapse, grid is square)
//   isometric: elevation 30deg, rotation 45deg (+ free twist), walls stand up
// Animating both angles gives a smooth "camera tilt" between the modes.

const DEG = Math.PI / 180
const TOP = { elev: 90 * DEG, theta: 0 }
const ISO = { elev: 30 * DEG, theta: 45 * DEG }

export class Camera {
  constructor(mapW, mapH) {
    this.mapW = mapW
    this.mapH = mapH
    this.fx = mapW / 2 // world point at screen center
    this.fy = mapH / 2
    this.zoom = 1.2
    this.minZoom = 0.4
    this.maxZoom = 3.5
    this.mode = 'top'
    this.elev = TOP.elev
    this.theta = TOP.theta
    this.targetElev = TOP.elev
    this.targetTheta = TOP.theta
    this.vw = 1
    this.vh = 1
    this.sx = 0 // output of P()
    this.sy = 0
    this.updateTrig()
  }

  setViewport(w, h) {
    this.vw = w
    this.vh = h
  }

  setMode(mode) {
    if (mode === this.mode) return
    this.mode = mode
    if (mode === 'top') {
      // Unwind to the nearest full turn so the map returns north-up.
      this.targetTheta = Math.round(this.theta / (2 * Math.PI)) * 2 * Math.PI
      this.targetElev = TOP.elev
    } else {
      this.targetTheta = this.theta + ISO.theta
      this.targetElev = ISO.elev
    }
  }

  rotateBy(rad) {
    if (this.mode !== 'iso') return
    this.targetTheta += rad
  }

  // Applied directly (no easing) for finger twists.
  twist(rad) {
    if (this.mode !== 'iso') return
    this.theta += rad
    this.targetTheta += rad
  }

  get transitioning() {
    return Math.abs(this.elev - this.targetElev) > 0.002 || Math.abs(this.theta - this.targetTheta) > 0.002
  }

  update(dt) {
    const k = 1 - Math.exp(-dt * 7)
    this.elev += (this.targetElev - this.elev) * k
    this.theta += (this.targetTheta - this.theta) * k
    if (!this.transitioning) {
      this.elev = this.targetElev
      this.theta = this.targetTheta
    }
    this.updateTrig()
  }

  updateTrig() {
    this.cosT = Math.cos(this.theta)
    this.sinT = Math.sin(this.theta)
    this.sinE = Math.sin(this.elev)
    this.cosE = Math.cos(this.elev)
    this.k = TILE_PX * this.zoom
  }

  // 0 = flat top-down, 1 = fully isometric.
  get tilt() {
    return (TOP.elev - this.elev) / (TOP.elev - ISO.elev)
  }

  // Project world (x, y, height z) to screen; result in this.sx / this.sy.
  P(x, y, z = 0) {
    const dx = x - this.fx
    const dy = y - this.fy
    const rx = dx * this.cosT - dy * this.sinT
    const ry = dx * this.sinT + dy * this.cosT
    this.sx = this.vw / 2 + rx * this.k
    this.sy = this.vh / 2 + (ry * this.sinE - z * this.cosE) * this.k
  }

  // Painter's-order key: larger is nearer the viewer.
  depth(x, y) {
    return (x - this.fx) * this.sinT + (y - this.fy) * this.cosT
  }

  // Whether a vertical face with outward normal (nx, ny) faces the camera.
  faceVisible(nx, ny) {
    return this.cosE > 0.01 && nx * this.sinT + ny * this.cosT > 0.001
  }

  // Screen point to world point on the ground plane.
  unproject(sx, sy) {
    const rx = (sx - this.vw / 2) / this.k
    const ry = (sy - this.vh / 2) / this.k / this.sinE
    return {
      x: this.fx + rx * this.cosT + ry * this.sinT,
      y: this.fy - rx * this.sinT + ry * this.cosT,
    }
  }

  // Drag the world by a screen-space delta.
  panBy(dsx, dsy) {
    const a = this.unproject(0, 0)
    const b = this.unproject(dsx, dsy)
    this.fx -= b.x - a.x
    this.fy -= b.y - a.y
    this.clampFocus()
  }

  // Zoom keeping the world point under (sx, sy) fixed.
  zoomAt(factor, sx, sy) {
    const before = this.unproject(sx, sy)
    this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoom * factor))
    this.updateTrig()
    const after = this.unproject(sx, sy)
    this.fx += before.x - after.x
    this.fy += before.y - after.y
    this.clampFocus()
  }

  clampFocus() {
    this.fx = Math.min(this.mapW, Math.max(0, this.fx))
    this.fy = Math.min(this.mapH, Math.max(0, this.fy))
  }

  // Zoom so the whole map fits, with room for the toolbars.
  fit(padX = 160, padY = 90) {
    const zx = (this.vw - padX) / (this.mapW * TILE_PX)
    const zy = (this.vh - padY) / (this.mapH * TILE_PX)
    this.minZoom = Math.min(0.4, Math.min(zx, zy) * 0.8)
    return Math.min(zx, zy)
  }
}
