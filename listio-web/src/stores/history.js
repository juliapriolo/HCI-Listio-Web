import { defineStore } from 'pinia'

const STORAGE_KEY = 'listio:history'

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function writeLocal(val) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  } catch (e) {
    console.error('Failed to persist history', e)
  }
}

export const useHistoryStore = defineStore('history', {
  state: () => ({
    events: [],
    _persistTimer: null,
    settings: { maxEvents: 2000, maxAgeDays: 90 }
  }),

  getters: {
    getAll: (state) => () => state.events,
    getByType: (state) => (type) => state.events.filter(e => e.type === type),
    getByResource: (state) => (resource) => state.events.filter(e => e.resource === resource),
    getByList: (state) => (listId) => state.events.filter(e => String(e.listId) === String(listId)),
    getSince: (state) => (ts) => state.events.filter(e => e.ts >= ts)
  },

  actions: {
    init() {
      this.events = readLocal()
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', (ev) => {
          if (!ev.key) return
          if (ev.key === STORAGE_KEY) {
            try { this.events = ev.newValue ? JSON.parse(ev.newValue) : [] } catch (e) {  }
          }
        })
      }
      this.prune()
    },

    _schedulePersist() {
      if (this._persistTimer) return
      this._persistTimer = setTimeout(() => {
        this._persistTimer = null
        writeLocal(this.events)
      }, 300)
    },

    _persistNow() {
      if (this._persistTimer) { clearTimeout(this._persistTimer); this._persistTimer = null }
      writeLocal(this.events)
    },

    recordEvent(type, resource, resourceId = null, data = null, opts = {}) {
      
      const now = Date.now()
      const recentDuplicateThreshold = 5000 
      
      const isDuplicate = this.events.some(ev => {
        
        if (now - ev.ts > recentDuplicateThreshold) return false
        
        
        if (ev.type !== String(type)) return false
        if (ev.resource !== resource) return false
        if (String(ev.resourceId) !== String(resourceId)) return false
        
        
        if (type === 'list.delete' && ev.data?.name !== data?.name) return false
        
        return true
      })
      
      if (isDuplicate) {
        console.warn('⚠️ Evento duplicado detectado y bloqueado:', { type, resource, resourceId, data })
        return null
      }
      
      const ev = {
        id: makeId(),
        ts: now,
        type: String(type),
        resource: resource || null,
        resourceId: resourceId !== undefined ? resourceId : null,
        listId: opts.listId ?? null,
        userId: opts.userId ?? null,
        data: data ?? null,
        meta: opts.meta || {},
        synced: !!opts.synced
      }
      
      console.log('✅ Registrando evento en historial:', { type, resource, resourceId, name: data?.name })
      this.events.unshift(ev)
      this.prune()
      this._schedulePersist()
      return ev
    },

    markSynced(eventId, serverInfo = {}) {
      const idx = this.events.findIndex(e => e.id === eventId)
      if (idx === -1) return false
      this.events[idx].synced = true
      this.events[idx].meta = { ...this.events[idx].meta, server: serverInfo }
      this._schedulePersist()
      return true
    },

    prune({ maxEvents = this.settings.maxEvents, maxAgeDays = this.settings.maxAgeDays } = {}) {
      const cutoff = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000)
      if (maxAgeDays > 0) this.events = this.events.filter(e => !e.ts || e.ts >= cutoff)
      if (maxEvents > 0 && this.events.length > maxEvents) this.events = this.events.slice(0, maxEvents)
      this._schedulePersist()
    },

    clear() {
      this.events = []
      this._persistNow()
    },

    exportJSON() {
      try { return JSON.stringify(this.events, null, 2) } catch (e) { return '[]' }
    },

    exportCSV() {
      const header = ['id', 'ts', 'type', 'resource', 'resourceId', 'listId', 'userId', 'meta']
      const lines = [header.join(',')]
      for (const e of this.events) {
        const row = [
          (e.id || ''),
          (e.ts || ''),
          (e.type || ''),
          (e.resource || ''),
          (e.resourceId !== undefined && e.resourceId !== null) ? String(e.resourceId) : '',
          (e.listId !== undefined && e.listId !== null) ? String(e.listId) : '',
          (e.userId !== undefined && e.userId !== null) ? String(e.userId) : '',
          JSON.stringify(e.meta || {})
        ]
        lines.push(row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      }
      return lines.join('\n')
    },

    async syncToServer() {
      
      return { ok: false, reason: 'not_implemented' }
    }
  }
})

export default useHistoryStore