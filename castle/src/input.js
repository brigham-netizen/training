// Touch + mouse input.
//   Look tool:   one finger pans.
//   Build tools: one finger paints (walls, moats, demolish...) or, for
//                towers and archers, aims and places on release.
//   Two fingers: pinch zoom + pan, twist rotates (3D view only).
// A build stroke only commits after a short move or a tap, so starting a
// pinch never drops a stray wall.

const TAP_SLOP = 8

export class Input {
  constructor(canvas, camera, handlers) {
    this.canvas = canvas
    this.cam = camera
    this.h = handlers // see main.js for the handler set
    this.pointers = new Map()
    this.mode = null // 'pan' | 'paint' | 'tower' | 'pinch' | 'pending'
    this.lastTile = -1

    canvas.addEventListener('pointerdown', (e) => this.down(e))
    canvas.addEventListener('pointermove', (e) => this.move(e))
    canvas.addEventListener('pointerup', (e) => this.up(e))
    canvas.addEventListener('pointercancel', (e) => this.up(e, true))
    canvas.addEventListener('contextmenu', (e) => e.preventDefault())
    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault()
        this.cam.zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY)
      },
      { passive: false },
    )
  }

  tileAt(sx, sy) {
    const p = this.cam.unproject(sx, sy)
    return this.h.worldToTile(p.x, p.y)
  }

  down(e) {
    this.canvas.setPointerCapture(e.pointerId)
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY })

    if (this.pointers.size === 2) {
      // Abandon any pending/one-finger action and start a pinch.
      if (this.mode === 'tower') this.h.preview(null)
      this.mode = 'pinch'
      this.pinch = this.pinchState()
      return
    }
    if (this.pointers.size > 2) return

    const tool = this.h.tool()
    const panButton = e.pointerType === 'mouse' && e.button !== 0
    if (tool === 'look' || panButton) {
      this.mode = 'pan'
    } else if (this.h.placeOnRelease(tool)) {
      this.mode = 'tower'
      this.lastTile = this.tileAt(e.clientX, e.clientY)
      this.h.preview(this.lastTile)
    } else {
      this.mode = 'pending'
      this.lastTile = -1
    }
  }

  move(e) {
    const p = this.pointers.get(e.pointerId)
    if (!p) {
      // Mouse hover: show where a tower would go.
      if (e.pointerType === 'mouse' && this.h.tool() !== 'look') this.h.preview(this.tileAt(e.clientX, e.clientY))
      return
    }
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    p.x = e.clientX
    p.y = e.clientY

    switch (this.mode) {
      case 'pan':
        this.cam.panBy(dx, dy)
        break
      case 'pending':
        if (Math.hypot(p.x - p.sx, p.y - p.sy) > TAP_SLOP) {
          this.mode = 'paint'
          this.paintTo(this.tileAt(p.sx, p.sy))
          this.paintTo(this.tileAt(p.x, p.y))
        }
        break
      case 'paint':
        this.paintTo(this.tileAt(p.x, p.y))
        break
      case 'tower': {
        const t = this.tileAt(p.x, p.y)
        if (t !== this.lastTile) {
          this.lastTile = t
          this.h.preview(t)
        }
        break
      }
      case 'pinch': {
        const now = this.pinchState()
        if (!now || !this.pinch) break
        this.cam.panBy(now.cx - this.pinch.cx, now.cy - this.pinch.cy)
        this.cam.zoomAt(now.dist / this.pinch.dist, now.cx, now.cy)
        let da = now.angle - this.pinch.angle
        if (da > Math.PI) da -= Math.PI * 2
        if (da < -Math.PI) da += Math.PI * 2
        this.cam.twist(da)
        this.pinch = now
        break
      }
    }
  }

  up(e, cancelled = false) {
    const p = this.pointers.get(e.pointerId)
    if (!p) return
    this.pointers.delete(e.pointerId)

    if (this.mode === 'pinch') {
      // Stay inert until every finger lifts so the remaining one doesn't paint.
      if (this.pointers.size === 0) this.mode = null
      else this.pinch = null
      return
    }
    if (!cancelled) {
      if (this.mode === 'pending') this.paintTo(this.tileAt(p.x, p.y))
      if (this.mode === 'tower' && this.lastTile >= 0) this.h.placeAt(this.lastTile)
    }
    if (this.mode === 'tower') this.h.preview(null)
    this.h.strokeEnd?.()
    this.mode = null
    this.lastTile = -1
  }

  pinchState() {
    const pts = [...this.pointers.values()]
    if (pts.length < 2) return null
    const [a, b] = pts
    return {
      cx: (a.x + b.x) / 2,
      cy: (a.y + b.y) / 2,
      dist: Math.max(10, Math.hypot(b.x - a.x, b.y - a.y)),
      angle: Math.atan2(b.y - a.y, b.x - a.x),
    }
  }

  // Paint every tile on the line from the previous tile so fast swipes
  // leave no gaps.
  paintTo(tile) {
    if (tile < 0) return
    if (this.lastTile < 0) {
      this.lastTile = tile
      this.h.paint(tile)
      return
    }
    if (tile === this.lastTile) return
    for (const t of this.h.lineTiles(this.lastTile, tile)) this.h.paint(t)
    this.lastTile = tile
  }
}
