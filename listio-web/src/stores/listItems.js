// src/stores/listItems.js
import { defineStore } from 'pinia'
import listItemsApi from '@/api/listItems'

const STORAGE_PREFIX = 'listio:list-items:' // key will be STORAGE_PREFIX + listId

function mapListItem(data) {
  if (!data) return null
  
  // Si el servidor devuelve el producto anidado, extraer el nombre
  if (data.product && data.product.name) {
    return {
      id: data.id,
      name: data.product.name,
      quantity: data.quantity || 1,
      unit: data.unit || 'unidad',
      purchased: data.purchased || false,
      metadata: data.metadata || {},
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      product: data.product // Mantener referencia al producto completo
    }
  }
  
  // Si ya tiene el nombre directamente, devolverlo tal como está
  return {
    id: data.id,
    name: data.name || 'Item sin nombre',
    quantity: data.quantity || 1,
    unit: data.unit || 'unidad',
    purchased: data.purchased || false,
    metadata: data.metadata || {},
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    product: data.product
  }
}

export const useListItemsStore = defineStore('listItems', {
  state: () => ({ listId: null, items: [], _listening: false, _boundStorageHandler: null, _outboxInterval: null }),
  actions: {
    // Debounced storage event handler to avoid frequent reloads
    _onStorageEventRaw(e) {
      if (!e.key) return
      if (!this.listId) return
      const expectedKey = STORAGE_PREFIX + String(this.listId)
      if (e.key === expectedKey) {
        try {
          const payload = e.newValue ? JSON.parse(e.newValue) : []
          this._onStorageEventDebounced(payload)
        } catch (err) {
          console.warn('Failed to parse storage event newValue for list items', err)
        }
      }
    },

    _onStorageEventDebounced: (function () {
      let timer = null
      return function (payload) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          this.items = payload || []
          timer = null
        }, 250) // 250ms debounce window
      }
    })(),

    startListening() {
      if (typeof window === 'undefined' || this._listening) return
      this._boundStorageHandler = this._onStorageEventRaw.bind(this)
      window.addEventListener('storage', this._boundStorageHandler)
      this._listening = true
    },

    stopListening() {
      if (typeof window === 'undefined' || !this._listening) return
      try {
        window.removeEventListener('storage', this._boundStorageHandler)
      } catch (e) {
        // ignore
      }
      this._boundStorageHandler = null
      this._listening = false
      this._stopOutboxProcessor()
    },

    load(listId) {
      // stop listening for previous id
      if (this._listening) this.stopListening()

      this.listId = listId || null
      if (!listId) { this.items = []; return }
      try {
        const raw = localStorage.getItem(STORAGE_PREFIX + listId)
        this.items = raw ? JSON.parse(raw) : []
      } catch (e) {
        console.error('Failed to load list items', e)
        this.items = []
      }

      // start cross-tab listening for this list key
      this.startListening()

      // begin processing outbox in background (non-blocking)
      // Commented out to prevent constant API calls
      // this._startOutboxProcessor()
    },

    save() {
      if (!this.listId) return
      try { localStorage.setItem(STORAGE_PREFIX + this.listId, JSON.stringify(this.items)) }
      catch (e) { console.error('Failed to save list items', e) }
    },

    // optimistic operations: update local state, persist, enqueue remote op
    addItem(item, { remote = true } = {}) {
      const newItem = { id: Date.now(), ...item }
      this.items.unshift(newItem)
      this.save()
      // Note: No need to record item creation in history - history is only for deleted items
      // Commented out to prevent constant API calls
      // if (remote && this.listId) this._enqueueOutbox({ op: 'create', listId: this.listId, payload: newItem })
      return newItem
    },

    updateItem(id, patch, { remote = true } = {}) {
      const idx = this.items.findIndex(i => i.id === id)
      if (idx > -1) {
        this.items[idx] = { ...this.items[idx], ...patch }
        this.save()
        // Note: No need to record item updates in history - history is only for deleted items
        // Commented out to prevent constant API calls
        // if (remote && this.listId) this._enqueueOutbox({ op: 'update', listId: this.listId, itemId: id, payload: patch })
      }
    },

    deleteItem(id, { remote = true } = {}) {
      const idx = this.items.findIndex(i => i.id === id)
      if (idx > -1) {
        // Capture item data before deletion
        const deletedItem = this.items[idx]
        
        // Get list name synchronously
        let listName = 'Lista desconocida'
        try {
          // Dynamic import is async, but we can access the store if it's already loaded
          const listsModule = require('@/stores/lists')
          if (listsModule && listsModule.useListsStore) {
            const listsStore = listsModule.useListsStore()
            const list = listsStore.getById(this.listId)
            if (list) {
              listName = list.name
            }
          }
        } catch (e) { 
          // Fallback to async if sync fails
          console.warn('Could not get list name synchronously')
        }
        
        this.items.splice(idx, 1)
        this.save()
        
        // Record history event with complete item details
        import('@/stores/history').then(mod => {
          try {
            const history = mod.useHistoryStore()
            
            // If we didn't get the list name yet, try again
            if (listName === 'Lista desconocida') {
              import('@/stores/lists').then(listsModule => {
                const listsStore = listsModule.useListsStore()
                const list = listsStore.getById(this.listId)
                listName = list?.name || `Lista #${this.listId}`
                
                history.recordEvent('listItem.delete', 'listItem', id, {
                  name: deletedItem.name || 'Producto sin nombre',
                  quantity: deletedItem.quantity,
                  unit: deletedItem.unit,
                  checked: deletedItem.checked,
                  listName: listName,
                  listId: this.listId
                }, { listId: this.listId, meta: { source: remote ? 'outbox' : 'local' } })
              }).catch(() => {
                // Last fallback
                history.recordEvent('listItem.delete', 'listItem', id, {
                  name: deletedItem.name || 'Producto sin nombre',
                  quantity: deletedItem.quantity,
                  unit: deletedItem.unit,
                  checked: deletedItem.checked,
                  listName: `Lista #${this.listId}`,
                  listId: this.listId
                }, { listId: this.listId, meta: { source: remote ? 'outbox' : 'local' } })
              })
            } else {
              // We have the list name, record immediately
              history.recordEvent('listItem.delete', 'listItem', id, {
                name: deletedItem.name || 'Producto sin nombre',
                quantity: deletedItem.quantity,
                unit: deletedItem.unit,
                checked: deletedItem.checked,
                listName: listName,
                listId: this.listId
              }, { listId: this.listId, meta: { source: remote ? 'outbox' : 'local' } })
            }
          } catch (e) { 
            console.warn('Error al registrar eliminación de item en historial:', e)
          }
        }).catch(() => {})
        // Commented out to prevent constant API calls
        // if (remote && this.listId) this._enqueueOutbox({ op: 'delete', listId: this.listId, itemId: id })
      }
    },

    deleteAll(listId) { const id = listId || this.listId; if (!id) return; try { localStorage.removeItem(STORAGE_PREFIX + id); if (id === this.listId) this.items = [] } catch (e) { console.error('Failed to delete list items', e) } },

    setItems(itemsArray) { this.items = itemsArray || []; this.save() },

    /* Outbox (optimistic sync and offline queue)
     * Stored under localStorage key 'listio:list-items-outbox' as an array of operations.
     */
    _outboxKey() { return 'listio:list-items-outbox' },

    _readOutbox() {
      try { const raw = localStorage.getItem(this._outboxKey()); return raw ? JSON.parse(raw) : [] } catch (e) { return [] }
    },

    _writeOutbox(out) {
      try { localStorage.setItem(this._outboxKey(), JSON.stringify(out)) } catch (e) { console.error('Failed to write outbox', e) }
    },

    _enqueueOutbox(entry) {
      const out = this._readOutbox()
      out.push({ id: Date.now() + Math.random(), ts: Date.now(), ...entry })
      this._writeOutbox(out)
    },

    _startOutboxProcessor() {
      // spawn a background worker that processes the outbox every few seconds
      if (this._outboxInterval) return
      this._outboxInterval = setInterval(() => this.processOutbox().catch(err => { /* swallow */ }), 2000)
    },

    _stopOutboxProcessor() {
      if (this._outboxInterval) { clearInterval(this._outboxInterval); this._outboxInterval = null }
    },

    async processOutbox() {
      const out = this._readOutbox()
      if (!out || out.length === 0) return

      // process sequentially; stop if any operation fails (will retry later)
      while (out.length) {
        const entry = out[0]
        try {
          if (entry.op === 'create') {
            // send create to server (server may return real id)
            const serverItem = await listItemsApi.create(entry.listId, entry.payload)
            // if server returned an id different than local, update local item id mapping
            if (serverItem && serverItem.id && serverItem.id !== entry.payload.id) {
              // replace local id in items
              const idx = this.items.findIndex(i => i.id === entry.payload.id)
              if (idx > -1) this.items[idx] = { ...this.items[idx], ...serverItem }
              this.save()
            }
          } else if (entry.op === 'update') {
            await listItemsApi.update(entry.listId, entry.itemId, entry.payload)
          } else if (entry.op === 'delete') {
            await listItemsApi.delete(entry.listId, entry.itemId)
          }

          // success -> remove processed entry and continue
          out.shift()
          this._writeOutbox(out)
        } catch (e) {
          // network error or server error: stop processing now and retry later
          // leave outbox intact for next attempt
          console.warn('Outbox processing stopped due to error (will retry):', e.message || e)
          break
        }
      }
    },

    // move item from one list to another with local updates and queued remote ops
    async moveItem(fromListId, toListId, itemId) {
      if (!fromListId || !toListId || !itemId) throw new Error('fromListId, toListId and itemId required')

      // load source and destination stores (use dynamic import to avoid cycles)
      const { useListItemsStore } = await import('@/stores/listItems')
      const src = useListItemsStore()
      const dest = useListItemsStore()

      // ensure both loaded
      src.load(fromListId)
      dest.load(toListId)

      const idx = src.items.findIndex(i => i.id === itemId)
      if (idx === -1) return false
      const [item] = src.items.splice(idx, 1)
      src.save()

      dest.items.unshift(item)
      dest.save()

      // enqueue remote ops: delete on source and create on dest
      // Commented out to prevent constant API calls
      // src._enqueueOutbox({ op: 'delete', listId: fromListId, itemId })
      // dest._enqueueOutbox({ op: 'create', listId: toListId, payload: item })

      return true
    },

    // Remote-aware methods
    async fetchRemote(params) {
      if (!this.listId) throw new Error('listId required')
      const data = await listItemsApi.getAll(this.listId, params)
      // expect array or envelope
      const items = Array.isArray(data) ? data : data?.data || data?.items || []
      if (Array.isArray(items)) {
        const mappedItems = items.map(mapListItem).filter(Boolean)
        if (this.items && this.items.length > 0) {
          // Merge por id, preservando elementos locales que aún no están en servidor
          const byId = new Map(mappedItems.map(i => [i.id, i]))
          const merged = [
            ...this.items.filter(i => i && i.id && !byId.has(i.id)),
            ...mappedItems
          ]
          this.setItems(merged)
        } else {
          this.setItems(mappedItems)
        }
      }
      return items
    },

    async createRemote(payload) {
      if (!this.listId) throw new Error('listId required')
      const created = await listItemsApi.create(this.listId, payload)
      if (created && created.id) {
        const mappedItem = mapListItem(created)
        if (mappedItem) {
          // Evitar duplicado si ya hay un ítem optimista con el mismo nombre/cantidad/unidad
          const idx = this.items.findIndex(i => !i.product?.id && i.name === (mappedItem.name || mappedItem.product?.name) && i.quantity === mappedItem.quantity && i.unit === mappedItem.unit)
          if (idx > -1) {
            // Reemplazar el optimista por el real
            this.items[idx] = { ...mappedItem }
            this.save()
          } else {
            this.addItem(mappedItem)
          }
        }
      }
      return created
    },

    async updateRemote(itemId, patch) {
      if (!this.listId) throw new Error('listId required')
      const updated = await listItemsApi.update(this.listId, itemId, patch)
      if (updated && updated.id) {
        const mappedItem = mapListItem(updated)
        if (mappedItem) this.updateItem(updated.id, mappedItem)
      }
      return updated
    },

    async markAsPurchasedRemote(itemId, purchased) {
      if (!this.listId) throw new Error('listId required')
      const payload = { purchased }
      const updated = await listItemsApi.markAsPurchased(this.listId, itemId, payload)
      if (updated && updated.id) {
        const mappedItem = mapListItem(updated)
        if (mappedItem) this.updateItem(updated.id, mappedItem)
      }
      return updated
    },

    async deleteRemote(itemId) {
      if (!this.listId) throw new Error('listId required')
      await listItemsApi.delete(this.listId, itemId)
      this.deleteItem(itemId)
    }
  }
})

export default useListItemsStore