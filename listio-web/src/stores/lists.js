import { defineStore } from 'pinia'
import listsApi from '@/api/lists'

const BASE_STORAGE_KEY = 'listio:lists'


function getStorageKey() {
  try {
    
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
        
        
        if (!skipHistory) {
          try {
            
            let listItems = []
            try {
              const { useListItemsStore } = await import('@/stores/listItems')
              const listItemsStore = useListItemsStore()
              await listItemsStore.load(id)
              listItems = [...listItemsStore.items] 
              console.log(`📦 Lista "${deletedList.name}" tiene ${listItems.length} productos`)
            } catch (e) {
              console.warn('No se pudieron cargar los productos de la lista:', e)
            }
            
            const { useHistoryStore } = await import('@/stores/history')
            const history = useHistoryStore()
            
            
            history.recordEvent('list.delete', 'list', id, {
              name: deletedList.name,
              description: deletedList.description,
              image: deletedList.image,
              itemCount: listItems.length, 
              recurring: deletedList.recurring,
              metadata: deletedList.metadata
            }, { 
              listId: id,
              meta: { source: 'local' } 
            })
            
            
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
      
      this.lists = sample
      this.save()
    },
    
    reload() {
      console.log('Reloading lists for current user...')
      this.load()
    },
    
    clear() {
      console.log('Clearing lists...')
      this.lists = []
    },
    
    async fetchRemote(params) {
      try {
        console.log('Attempting to fetch from API...')
        const data = await listsApi.getAll(params)
        console.log('API fetch successful:', data)

        
        if (Array.isArray(data)) {
          this.lists = data
          this.save()
          return { items: data, meta: null }
        }

        
        const items = data?.data || data?.items || null
        const meta = data?.meta || null

        if (Array.isArray(items)) {
          this.lists = items
          this.save()
          return { items, meta }
        }

        
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
        
        if (created && created.id) {
          this.addList(created)
          
        }
        return created
      } catch (e) {
        console.error('Error in createRemote:', e)
        console.error('Error status:', e.status)
        console.error('Error data:', e.data)
        
        
        if (e.status === 409 || (e.data && (e.data.error === 'LIST_ALREADY_EXISTS' || e.data.message?.includes('already exists')))) {
          console.log('Lista ya existe, intentando buscar y restaurar...')
          
          
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
              
              
              const updated = await listsApi.update(existingList.id, {
                ...payload,
                deleted: false, 
                deletedAt: null
              })
              
              console.log('Lista restaurada exitosamente:', updated)
              
              
              if (updated && updated.id) {
                this.addList(updated)
                
              }
              
              return updated
            }
          } catch (searchError) {
            console.error('Error al buscar lista existente:', searchError)
          }
        }
        
        
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
          } catch (e) {  }
        }
        return updated
      } catch (e) {
        throw e
      }
    },

    async deleteRemote(id) {
      try {
        console.log('🗑️ deleteRemote iniciado para lista ID:', id)
        
        
        const listToDelete = this.lists.find(l => l.id === id)
        
        if (!listToDelete) {
          throw new Error('Lista no encontrada')
        }
        
        console.log('📋 Lista a eliminar:', listToDelete.name)
        
        
        let listItems = []
        try {
          const { useListItemsStore } = await import('@/stores/listItems')
          const listItemsStore = useListItemsStore()
          await listItemsStore.load(id)
          listItems = [...listItemsStore.items] 
          
          console.log(`� Lista "${listToDelete.name}" tiene ${listItems.length} items`)
        } catch (e) {
          console.warn('No se pudieron cargar los items de la lista:', e)
        }
        
        
        console.log('🌐 Eliminando de API...')
        await listsApi.delete(id)
        console.log('✅ Eliminado de API exitosamente')
        
        
        console.log('💾 Eliminando localmente (skipHistory=true)...')
        this.deleteList(id, true)
        console.log('✅ Eliminado localmente')
        
        
        console.log('📝 Registrando lista y productos en historial...')
        try {
          const { useHistoryStore } = await import('@/stores/history')
          const history = useHistoryStore()
          
          
          const listResult = history.recordEvent('list.delete', 'list', id, {
            name: listToDelete.name || 'Lista sin nombre',
            description: listToDelete.description,
            image: listToDelete.image,
            itemCount: listItems.length, 
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
