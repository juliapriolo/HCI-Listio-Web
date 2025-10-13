
import { defineStore } from 'pinia'
import listItemsApi from '@/api/listItems'

const STORAGE_PREFIX = 'listio:list-items:' 

function mapListItem(data) {
  if (!data) return null
  
  
  if (data.product && data.product.name) {
    return {
      id: data.id,
      name: data.product.name,
      categoryId: data.product.category?.id || null,
      categoryName: data.product.category?.name || null,
      quantity: data.quantity || 1,
      unit: data.unit || 'unidad',
      purchased: data.purchased || false,
      metadata: data.metadata || {},
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      product: data.product 
    }
  }
  
  
  return {
    id: data.id,
    name: data.name || 'Item sin nombre',
    categoryId: data.categoryId || data.product?.category?.id || null,
    categoryName: data.categoryName || data.product?.category?.name || null,
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
        }, 250) 
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
        
      }
      this._boundStorageHandler = null
      this._listening = false
      this._stopOutboxProcessor()
    },

    load(listId) {
      
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

      
      this.startListening()

      
      
      
    },

    save() {
      if (!this.listId) return
      try { localStorage.setItem(STORAGE_PREFIX + this.listId, JSON.stringify(this.items)) }
      catch (e) { console.error('Failed to save list items', e) }
    },

    
    addItem(item, { remote = true } = {}) {
      const newItem = { id: Date.now(), ...item }
      this.items.unshift(newItem)
      this.save()
      
      
      
      return newItem
    },

    updateItem(id, patch, { remote = true } = {}) {
      const idx = this.items.findIndex(i => i.id === id)
      if (idx > -1) {
        this.items[idx] = { ...this.items[idx], ...patch }
        this.save()
        
        
        
      }
    },

    deleteItem(id, { remote = true } = {}) {
      const idx = this.items.findIndex(i => i.id === id)
      if (idx > -1) {
        
        const deletedItem = this.items[idx]
        
        
        let listName = 'Lista desconocida'
        try {
          
          const listsModule = require('@/stores/lists')
          if (listsModule && listsModule.useListsStore) {
            const listsStore = listsModule.useListsStore()
            const list = listsStore.getById(this.listId)
            if (list) {
              listName = list.name
            }
          }
        } catch (e) { 
          
          console.warn('Could not get list name synchronously')
        }
        
        this.items.splice(idx, 1)
        this.save()
        
        
        import('@/stores/history').then(mod => {
          try {
            const history = mod.useHistoryStore()
            
            
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
        
        
      }
    },

    deleteAll(listId) { const id = listId || this.listId; if (!id) return; try { localStorage.removeItem(STORAGE_PREFIX + id); if (id === this.listId) this.items = [] } catch (e) { console.error('Failed to delete list items', e) } },

    setItems(itemsArray) { this.items = itemsArray || []; this.save() },

    
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
      
      if (this._outboxInterval) return
      this._outboxInterval = setInterval(() => this.processOutbox().catch(err => {  }), 2000)
    },

    _stopOutboxProcessor() {
      if (this._outboxInterval) { clearInterval(this._outboxInterval); this._outboxInterval = null }
    },

    async processOutbox() {
      const out = this._readOutbox()
      if (!out || out.length === 0) return

      
      while (out.length) {
        const entry = out[0]
        try {
          if (entry.op === 'create') {
            
            const serverItem = await listItemsApi.create(entry.listId, entry.payload)
            
            if (serverItem && serverItem.id && serverItem.id !== entry.payload.id) {
              
              const idx = this.items.findIndex(i => i.id === entry.payload.id)
              if (idx > -1) this.items[idx] = { ...this.items[idx], ...serverItem }
              this.save()
            }
          } else if (entry.op === 'update') {
            await listItemsApi.update(entry.listId, entry.itemId, entry.payload)
          } else if (entry.op === 'delete') {
            await listItemsApi.delete(entry.listId, entry.itemId)
          }

          
          out.shift()
          this._writeOutbox(out)
        } catch (e) {
          
          
          console.warn('Outbox processing stopped due to error (will retry):', e.message || e)
          break
        }
      }
    },

    
    async moveItem(fromListId, toListId, itemId) {
      if (!fromListId || !toListId || !itemId) throw new Error('fromListId, toListId and itemId required')

      
      const { useListItemsStore } = await import('@/stores/listItems')
      const src = useListItemsStore()
      const dest = useListItemsStore()

      
      src.load(fromListId)
      dest.load(toListId)

      const idx = src.items.findIndex(i => i.id === itemId)
      if (idx === -1) return false
      const [item] = src.items.splice(idx, 1)
      src.save()

      dest.items.unshift(item)
      dest.save()

      
      
      
      

      return true
    },

    
    async fetchRemote(params) {
      if (!this.listId) throw new Error('listId required')
      const data = await listItemsApi.getAll(this.listId, params)
      
      const items = Array.isArray(data) ? data : data?.data || data?.items || []
      if (Array.isArray(items)) {
        const mappedItems = items.map(mapListItem).filter(Boolean)
        if (this.items && this.items.length > 0) {
          
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
          
          const idx = this.items.findIndex(i => !i.product?.id && i.name === (mappedItem.name || mappedItem.product?.name) && i.quantity === mappedItem.quantity && i.unit === mappedItem.unit)
          if (idx > -1) {
            
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