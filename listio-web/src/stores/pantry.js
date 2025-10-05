import { defineStore } from 'pinia'

const STORAGE_KEY = 'listio:pantry'

export const usePantryStore = defineStore('pantry', {
  state: () => ({
    items: []
  }),
  getters: {
    byId: (state) => (id) => state.items.find(i => i.id === id)
  },
  actions: {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        this.items = raw ? JSON.parse(raw) : []
      } catch (e) {
        console.error('Failed to load pantry', e)
        this.items = []
      }
    },
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
      } catch (e) {
        console.error('Failed to save pantry', e)
      }
    },
    seed(sample) {
      this.items = sample
      this.save()
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
    }
  }
})
