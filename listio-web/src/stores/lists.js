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
    deleteList(id) {
      const idx = this.lists.findIndex(l => l.id === id)
      if (idx > -1) {
        this.lists.splice(idx, 1)
        this.save()
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
        }
        return created
      } catch (e) {
        console.error('Error in createRemote:', e)
        console.error('Error status:', e.status)
        console.error('Error data:', e.data)
        // Re-throw to let the caller handle the fallback
        throw e
      }
    },

    async updateRemote(id, patch) {
      try {
        const updated = await listsApi.update(id, patch)
        if (updated && updated.id) {
          this.updateList(id, updated)
        }
        return updated
      } catch (e) {
        throw e
      }
    },

    async deleteRemote(id) {
      try {
        await listsApi.delete(id)
        this.deleteList(id)
      } catch (e) {
        throw e
      }
    }
  }
})
