import { defineStore } from 'pinia'
import listsApi from '@/api/lists'

const STORAGE_KEY = 'listio:lists'

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
        const raw = localStorage.getItem(STORAGE_KEY)
        this.lists = raw ? JSON.parse(raw) : []
      } catch (e) {
        console.error('Failed to load lists from localStorage', e)
        this.lists = []
      }
    },
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lists))
      } catch (e) {
        console.error('Failed to save lists to localStorage', e)
      }
    },
    addList(list) {
      this.lists.unshift(list)
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
    }
    ,
    // Remote-aware methods (useful when backend is available)
    async fetchRemote(params) {
      try {
        const data = await listsApi.getAll(params)

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
        throw e
      }
    },

    async createRemote(payload) {
      try {
        const created = await listsApi.create(payload)
        // created might be the created resource; ensure it exists locally
        if (created && created.id) {
          this.addList(created)
        }
        return created
      } catch (e) {
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
