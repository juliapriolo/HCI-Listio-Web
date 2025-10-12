import { defineStore } from 'pinia'
import listsApi from '@/api/lists'

const BASE_STORAGE_KEY = 'listio:lists'

// Get user-specific storage key
function getStorageKey() {
  try {
    // Try to get user info from localStorage (most reliable)
    const userRaw = localStorage.getItem('listio:user')
    if (userRaw) {
      const userData = JSON.parse(userRaw)
      const userId = userData?.profile?.id
      if (userId) {
        console.log('Using user-specific storage key for user:', userId)
        return `${BASE_STORAGE_KEY}:${userId}`
      }
    }
  } catch (e) {
    console.warn('Could not get user ID for storage key:', e)
  }
  
  // Fallback to generic key if no user found
  console.log('Using generic storage key (no user logged in)')
  return BASE_STORAGE_KEY
}

export const useListsStore = defineStore('lists', {
  state: () => ({
    lists: []
  }),
  getters: {
    getById: (state) => (id) => state.lists.find(l => l.id === id)
  },
  actions: {
    load() {
      try {
        const storageKey = getStorageKey()
        console.log('Loading lists from localStorage with key:', storageKey)
        const raw = localStorage.getItem(storageKey)
        console.log('Raw localStorage data:', raw)
        this.lists = raw ? JSON.parse(raw) : []
        console.log('Loaded lists:', this.lists)
      } catch (e) {
        console.error('Failed to load lists from localStorage', e)
        this.lists = []
      }
    },
    save() {
      try {
        const storageKey = getStorageKey()
        console.log('Saving lists to localStorage with key:', storageKey, 'Data:', this.lists)
        localStorage.setItem(storageKey, JSON.stringify(this.lists))
        console.log('Lists saved successfully')
      } catch (e) {
        console.error('Failed to save lists to localStorage', e)
      }
    },
    addList(list) {
      console.log('Adding list:', list)
      this.lists.unshift(list)
      console.log('Lists after adding:', this.lists)
      this.save()
    },
    updateList(id, patch) {
      const idx = this.lists.findIndex(l => l.id === id)
      if (idx > -1) {
        this.lists[idx] = { ...this.lists[idx], ...patch }
        this.save()
      }
    },
    async deleteList(id, skipHistory = false) {
      const idx = this.lists.findIndex(l => l.id === id)
      if (idx > -1) {
        const deletedList = this.lists[idx]
        this.lists.splice(idx, 1)
        this.save()
        
        // Record in history only if not skipped (to avoid duplicates)
        if (!skipHistory) {
          try {
            // Get all items from this list before deleting
            let listItems = []
            try {
              const { useListItemsStore } = await import('@/stores/listItems')
              const listItemsStore = useListItemsStore()
              await listItemsStore.load(id)
              listItems = [...listItemsStore.items] // Create a copy
              console.log(`📦 Lista "${deletedList.name}" tiene ${listItems.length} productos`)
            } catch (e) {
              console.warn('No se pudieron cargar los productos de la lista:', e)
            }
            
            const { useHistoryStore } = await import('@/stores/history')
            const history = useHistoryStore()
            
            // Register the list deletion
            history.recordEvent('list.delete', 'list', id, {
              name: deletedList.name,
              description: deletedList.description,
              image: deletedList.image,
              itemCount: listItems.length, // Use actual items count
              recurring: deletedList.recurring,
              metadata: deletedList.metadata
            }, { 
              listId: id,
              meta: { source: 'local' } 
            })
            
            // Register each item deletion individually
            for (const item of listItems) {
              try {
                history.recordEvent('listItem.delete', 'listItem', item.id, {
                  name: item.name || 'Producto sin nombre',
                  quantity: item.quantity,
                  unit: item.unit,
                  product: item.product,
                  metadata: item.metadata
                }, { 
                  listId: id,
                  meta: { source: 'local' } 
                })
                console.log(`  ✓ Producto "${item.name}" registrado en historial local`)
              } catch (itemError) {
                console.warn(`Error al registrar producto "${item.name}" en historial:`, itemError)
              }
            }
          } catch (e) { 
            console.warn('Error al registrar en historial:', e)
          }
        }
      }
    },
    seed(sample) {
      // replace lists with sample and persist
      this.lists = sample
      this.save()
    },
    // Method to reload lists when user changes
    reload() {
      console.log('Reloading lists for current user...')
      this.load()
    },
    // Method to clear lists (useful for logout)
    clear() {
      console.log('Clearing lists...')
      this.lists = []
    },
    // Remote-aware methods (useful when backend is available)
    async fetchRemote(params) {
      try {
        console.log('Attempting to fetch from API...')
        const data = await listsApi.getAll(params)
        console.log('API fetch successful:', data)

        // If API returns a plain array, replace local lists
        if (Array.isArray(data)) {
          this.lists = data
          this.save()
          return { items: data, meta: null }
        }

        // Common envelope patterns: { data: [...], meta: { ... } } or { items: [...], meta: {...} }
        const items = data?.data || data?.items || null
        const meta = data?.meta || null

        if (Array.isArray(items)) {
          this.lists = items
          this.save()
          return { items, meta }
        }

        // Unknown format: return raw data but don't mutate local lists
        return { items: null, meta: null, raw: data }
      } catch (e) {
        console.warn('API fetch failed, will use local data')
        throw e
      }
    },

    async createRemote(payload) {
      try {
        console.log('Creating list with payload:', payload)
        const created = await listsApi.create(payload)
        console.log('API response:', created)
        // created might be the created resource; ensure it exists locally
        if (created && created.id) {
          this.addList(created)
          // Note: No need to record list creation in history - history is only for deleted lists
        }
        return created
      } catch (e) {
        console.error('Error in createRemote:', e)
        console.error('Error status:', e.status)
        console.error('Error data:', e.data)
        
        // Check if it's a 409 conflict error (list already exists)
        if (e.status === 409 || (e.data && (e.data.error === 'LIST_ALREADY_EXISTS' || e.data.message?.includes('already exists')))) {
          console.log('Lista ya existe, intentando buscar y restaurar...')
          
          // Try to fetch with includeDeleted flag
          try {
            const params = { name: payload.name, includeDeleted: true }
            const allLists = await listsApi.getAll(params)
            console.log('Búsqueda con includeDeleted:', allLists)
            
            const items = Array.isArray(allLists) ? allLists : (allLists?.data || allLists?.items || [])
            const existingList = items.find(list => 
              list.name?.toLowerCase() === payload.name?.toLowerCase()
            )
            
            if (existingList && existingList.id) {
              console.log('Lista encontrada, restaurando:', existingList)
              
              // Update the existing list to restore it and update its properties
              const updated = await listsApi.update(existingList.id, {
                ...payload,
                deleted: false, // Explicitly restore
                deletedAt: null
              })
              
              console.log('Lista restaurada exitosamente:', updated)
              
              // Add to local store
              if (updated && updated.id) {
                this.addList(updated)
                // Note: No need to record list restoration in history - history is only for deleted lists
              }
              
              return updated
            }
          } catch (searchError) {
            console.error('Error al buscar lista existente:', searchError)
          }
        }
        
        // Re-throw to let the caller handle the error
        throw e
      }
    },

    async updateRemote(id, patch) {
      try {
        const updated = await listsApi.update(id, patch)
        if (updated && updated.id) {
          this.updateList(id, updated)
          try {
            const { useHistoryStore } = await import('@/stores/history')
            const history = useHistoryStore()
            history.recordEvent('list.update', 'list', id, { patch }, { meta: { source: 'remote' } })
          } catch (e) { /* ignore */ }
        }
        return updated
      } catch (e) {
        throw e
      }
    },

    async deleteRemote(id) {
      try {
        console.log('🗑️ deleteRemote iniciado para lista ID:', id)
        
        // Get list data before deleting
        const listToDelete = this.lists.find(l => l.id === id)
        
        if (!listToDelete) {
          throw new Error('Lista no encontrada')
        }
        
        console.log('📋 Lista a eliminar:', listToDelete.name)
        
        // Get all items from this list before deleting
        let listItems = []
        try {
          const { useListItemsStore } = await import('@/stores/listItems')
          const listItemsStore = useListItemsStore()
          await listItemsStore.load(id)
          listItems = [...listItemsStore.items] // Create a copy
          
          console.log(`� Lista "${listToDelete.name}" tiene ${listItems.length} items`)
        } catch (e) {
          console.warn('No se pudieron cargar los items de la lista:', e)
        }
        
        // Delete from API
        console.log('🌐 Eliminando de API...')
        await listsApi.delete(id)
        console.log('✅ Eliminado de API exitosamente')
        
        // Delete locally (skip history to avoid duplicate)
        console.log('💾 Eliminando localmente (skipHistory=true)...')
        this.deleteList(id, true)
        console.log('✅ Eliminado localmente')
        
        // Register list deletion and all its items in history
        console.log('📝 Registrando lista y productos en historial...')
        try {
          const { useHistoryStore } = await import('@/stores/history')
          const history = useHistoryStore()
          
          // Register the list deletion
          const listResult = history.recordEvent('list.delete', 'list', id, {
            name: listToDelete.name || 'Lista sin nombre',
            description: listToDelete.description,
            image: listToDelete.image,
            itemCount: listItems.length, // Use actual items count
            recurring: listToDelete.recurring,
            metadata: listToDelete.metadata
          }, { 
            listId: id,
            meta: { source: 'remote' } 
          })
          
          if (listResult) {
            console.log(`✅ Lista "${listToDelete.name}" eliminada y registrada en historial con ID:`, listResult.id)
          } else {
            console.log(`⚠️ Evento duplicado bloqueado para lista "${listToDelete.name}"`)
          }
          
          // Register each item deletion individually
          console.log(`📦 Registrando ${listItems.length} productos en historial...`)
          for (const item of listItems) {
            try {
              const itemResult = history.recordEvent('listItem.delete', 'listItem', item.id, {
                name: item.name || 'Producto sin nombre',
                quantity: item.quantity,
                unit: item.unit,
                product: item.product,
                metadata: item.metadata
              }, { 
                listId: id,
                meta: { source: 'remote' } 
              })
              
              if (itemResult) {
                console.log(`  ✓ Producto "${item.name}" registrado en historial`)
              } else {
                console.log(`  ⚠️ Evento duplicado bloqueado para producto "${item.name}"`)
              }
            } catch (itemError) {
              console.warn(`Error al registrar producto "${item.name}" en historial:`, itemError)
            }
          }
          
        } catch (e) { 
          console.warn('Error al registrar en historial:', e)
        }
      } catch (e) {
        console.error('❌ Error al eliminar lista:', e)
        throw e
      }
    }
  }
})
