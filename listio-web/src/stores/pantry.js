import { defineStore } from 'pinia'
import pantryApi from '@/api/pantry'

const STORAGE_KEY = 'listio:pantry'

export const usePantryStore = defineStore('pantry', {
  state: () => ({
    pantries: [], // Array of pantry objects
    currentPantryId: null, // Currently selected pantry ID
    items: [], // Items in the current pantry
    loading: false,
    error: null,
    lastSync: null
  }),
  getters: {
    currentPantry: (state) => state.pantries.find(p => p.id === state.currentPantryId),
    byId: (state) => (id) => state.items.find(i => i.id === id),
    byCategory: (state) => (category) => state.items.filter(i => i.category === category),
    byStatus: (state) => (status) => state.items.filter(i => i.status === status),
    expiredItems: (state) => state.items.filter(i => i.status === 'expired'),
    lowStockItems: (state) => state.items.filter(i => i.status === 'low'),
    availableItems: (state) => state.items.filter(i => i.status === 'available')
  },
  actions: {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const data = raw ? JSON.parse(raw) : { pantries: [], currentPantryId: null, items: [] }
        this.pantries = data.pantries || []
        this.currentPantryId = data.currentPantryId
        this.items = data.items || []
      } catch (e) {
        console.error('Failed to load pantry', e)
        this.pantries = []
        this.currentPantryId = null
        this.items = []
      }
    },
    save() {
      try {
        const data = {
          pantries: this.pantries,
          currentPantryId: this.currentPantryId,
          items: this.items
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (e) {
        console.error('Failed to save pantry', e)
      }
    },
    seed(samplePantries, sampleItems) {
      this.pantries = samplePantries || []
      this.currentPantryId = this.pantries.length > 0 ? this.pantries[0].id : null
      this.items = sampleItems || []
      this.save()
    },
    setCurrentPantry(pantryId) {
      this.currentPantryId = pantryId
      this.save()
    },
    addPantry(pantry) {
      this.pantries.unshift(pantry)
      if (!this.currentPantryId) {
        this.currentPantryId = pantry.id
      }
      this.save()
    },
    updatePantry(pantryId, patch) {
      const idx = this.pantries.findIndex(p => p.id === pantryId)
      if (idx > -1) {
        this.pantries[idx] = { ...this.pantries[idx], ...patch }
        this.save()
      }
    },
    deletePantry(pantryId) {
      const idx = this.pantries.findIndex(p => p.id === pantryId)
      if (idx > -1) {
        this.pantries.splice(idx, 1)
        if (this.currentPantryId === pantryId) {
          this.currentPantryId = this.pantries.length > 0 ? this.pantries[0].id : null
          this.items = []
        }
        this.save()
      }
    },
    addItem(item) {
      this.items.unshift(item)
      this.save()
    },
    updateItem(id, patch) {
      const idx = this.items.findIndex(i => i.id === id)
      if (idx > -1) {
        this.items[idx] = { ...this.items[idx], ...patch }
        this.save()
      }
    },
    deleteItem(id) {
      const idx = this.items.findIndex(i => i.id === id)
      if (idx > -1) {
        this.items.splice(idx, 1)
        this.save()
      }
    },

    // Remote API methods (commented until API is enabled)
    async fetchPantriesRemote(params = {}) {
      this.loading = true
      this.error = null
      
      try {
        const response = await pantryApi.getAllPantries(params)
        this.pantries = response.data || response
        this.lastSync = new Date().toISOString()
        this.save()
        
        console.log('Pantries fetched from API successfully')
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch pantries:', error)
        // Fallback to localStorage on error
        this.load()
      } finally {
        this.loading = false
      }
    },

    async fetchPantryItemsRemote(pantryId, params = {}) {
      this.loading = true
      this.error = null
      
      try {
        const response = await pantryApi.getPantryItemsPaginated(pantryId, params)
        this.items = response.data || response
        this.currentPantryId = pantryId
        this.lastSync = new Date().toISOString()
        this.save()
        
        console.log('Pantry items fetched from API successfully')
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch pantry items:', error)
        // Fallback to localStorage on error
        this.load()
      } finally {
        this.loading = false
      }
    },

    async createPantryRemote(pantryData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await pantryApi.createPantry(pantryData)
        const newPantry = response.data || response
        this.pantries.unshift(newPantry)
        this.save()
        
        console.log('Pantry created via API successfully')
        return newPantry
      } catch (error) {
        this.error = error.message
        console.error('Failed to create pantry:', error)
        
        // Fallback: add locally with proper structure
        const newPantry = {
          id: Date.now(),
          name: pantryData.name,
          metadata: pantryData.metadata || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        this.addPantry(newPantry)
        return newPantry
      } finally {
        this.loading = false
      }
    },

    async updatePantryRemote(pantryId, patch) {
      this.loading = true
      this.error = null
      
      try {
        const response = await pantryApi.updatePantry(pantryId, patch)
        const idx = this.pantries.findIndex(p => p.id === pantryId)
        if (idx > -1) {
          this.pantries[idx] = { ...this.pantries[idx], ...patch }
          this.save()
        }
        
        console.log('Pantry updated via API successfully')
        return patch
      } catch (error) {
        this.error = error.message
        console.error('Failed to update pantry:', error)
        
        // Fallback: update locally
        this.updatePantry(pantryId, patch)
        return patch
      } finally {
        this.loading = false
      }
    },

    async deletePantryRemote(pantryId) {
      this.loading = true
      this.error = null
      
      try {
        await pantryApi.deletePantry(pantryId)
        const idx = this.pantries.findIndex(p => p.id === pantryId)
        if (idx > -1) {
          this.pantries.splice(idx, 1)
          if (this.currentPantryId === pantryId) {
            this.currentPantryId = this.pantries.length > 0 ? this.pantries[0].id : null
            this.items = []
          }
          this.save()
        }
        
        console.log('Pantry deleted via API successfully')
      } catch (error) {
        this.error = error.message
        console.error('Failed to delete pantry:', error)
        
        // Fallback: delete locally
        this.deletePantry(pantryId)
      } finally {
        this.loading = false
      }
    },

    async createItemRemote(pantryId, itemData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await pantryApi.addPantryItem(pantryId, itemData)
        const newItem = response.data || response
        this.items.unshift(newItem)
        this.save()
        
        console.log('Pantry item created via API successfully')
        return newItem
      } catch (error) {
        this.error = error.message
        console.error('Failed to create pantry item:', error)
        
        // Fallback: add locally
        const newItem = {
          id: Date.now(),
          ...itemData,
          createdAt: new Date().toISOString()
        }
        this.addItem(newItem)
        return newItem
      } finally {
        this.loading = false
      }
    },

    async updateItemRemote(pantryId, itemId, patch) {
      this.loading = true
      this.error = null
      
      try {
        const response = await pantryApi.updatePantryItem(pantryId, itemId, patch)
        const idx = this.items.findIndex(i => i.id === itemId)
        if (idx > -1) {
          this.items[idx] = { ...this.items[idx], ...patch }
          this.save()
        }
        
        console.log('Pantry item updated via API successfully')
        return patch
      } catch (error) {
        this.error = error.message
        console.error('Failed to update pantry item:', error)
        
        // Fallback: update locally
        this.updateItem(itemId, patch)
        return patch
      } finally {
        this.loading = false
      }
    },

    async deleteItemRemote(pantryId, itemId) {
      this.loading = true
      this.error = null
      
      try {
        await pantryApi.deletePantryItem(pantryId, itemId)
        const idx = this.items.findIndex(i => i.id === itemId)
        if (idx > -1) {
          this.items.splice(idx, 1)
          this.save()
        }
        
        console.log('Pantry item deleted via API successfully')
      } catch (error) {
        this.error = error.message
        console.error('Failed to delete pantry item:', error)
        
        // Fallback: delete locally
        this.deleteItem(itemId)
      } finally {
        this.loading = false
      }
    },

    async sharePantryRemote(pantryId, email) {
      try {
        // TODO: Uncomment when API is enabled
        // const response = await pantryApi.sharePantry(pantryId, { email })
        // return response.data || response
        
        console.log('Pantry share API - commented out until API is enabled')
        return { success: true, message: 'Pantry shared successfully' }
      } catch (error) {
        console.error('Failed to share pantry:', error)
        throw error
      }
    },

    async getPantrySharesRemote(pantryId) {
      try {
        // TODO: Uncomment when API is enabled
        // const response = await pantryApi.getPantryShares(pantryId)
        // return response.data || response
        
        console.log('Pantry shares API - commented out until API is enabled')
        return []
      } catch (error) {
        console.error('Failed to get pantry shares:', error)
        throw error
      }
    },

    async revokePantryShareRemote(pantryId, userId) {
      try {
        // TODO: Uncomment when API is enabled
        // await pantryApi.revokePantryShare(pantryId, userId)
        
        console.log('Pantry share revoke API - commented out until API is enabled')
        return { success: true, message: 'Access revoked successfully' }
      } catch (error) {
        console.error('Failed to revoke pantry share:', error)
        throw error
      }
    },

    // Sync method to refresh data from API
    async sync() {
      await this.fetchPantriesRemote()
      if (this.currentPantryId) {
        await this.fetchPantryItemsRemote(this.currentPantryId)
      }
    }
  }
})
