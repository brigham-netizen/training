// Two kinds of saves:
//   progress: one castle in progress (autosaved between waves)
//   maps:     landscapes you liked, by name, to start fresh games on
// Stored in the player's private space in the artifact's database when
// the page runs on claude.ai (follows them across devices), otherwise in
// this browser's localStorage.

const LOCAL_PROGRESS = 'htk-progress'
const LOCAL_MAPS = 'htk-maps'

export class Saves {
  constructor() {
    this.db = null
    this.uid = null
    this.ready = this.init()
  }

  async init() {
    try {
      const claude = window.claude
      if (!claude?.use) return
      const [db, user] = await Promise.all([claude.use('db'), claude.use('user')])
      const uid = user ? await user.id() : null
      if (db && uid) {
        this.db = db
        this.uid = uid
      }
    } catch {
      // No database here: fall back to this browser.
    }
  }

  get where() {
    return this.db ? 'your account' : 'this browser'
  }

  // The player's private collection: data/users/<id>/...
  col() {
    return this.db.collection(`data/users/${this.uid}`)
  }

  async saveProgress(data) {
    await this.ready
    if (this.db) {
      await this.col().doc('progress').set({ kind: 'progress', json: JSON.stringify(data) })
      return true
    }
    return writeLocal(LOCAL_PROGRESS, data)
  }

  async loadProgress() {
    await this.ready
    try {
      if (this.db) {
        const snap = await this.col().doc('progress').get()
        return snap.exists ? JSON.parse(snap.data().json) : null
      }
      return readLocal(LOCAL_PROGRESS, null)
    } catch {
      return null
    }
  }

  async listMaps() {
    await this.ready
    try {
      if (this.db) {
        const snap = await this.col().where('kind', '==', 'map').get()
        return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.savedAt - a.savedAt)
      }
      return readLocal(LOCAL_MAPS, [])
    } catch {
      return []
    }
  }

  async saveMap(name, map) {
    await this.ready
    const entry = { kind: 'map', name, map, savedAt: Date.now() }
    if (this.db) {
      await this.col().doc(`map-${entry.savedAt}`).set(entry)
      return true
    }
    const maps = readLocal(LOCAL_MAPS, [])
    maps.unshift({ id: `map-${entry.savedAt}`, ...entry })
    return writeLocal(LOCAL_MAPS, maps)
  }

  async deleteMap(id) {
    await this.ready
    if (this.db) {
      await this.col().doc(id).delete()
      return true
    }
    return writeLocal(LOCAL_MAPS, readLocal(LOCAL_MAPS, []).filter((m) => m.id !== id))
  }
}

function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
