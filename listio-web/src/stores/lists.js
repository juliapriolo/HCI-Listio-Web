import { defineStore } from 'pinia'

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
  }
})
