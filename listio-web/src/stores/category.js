import { defineStore } from 'pinia'
import { categoriesApi } from '@/api/category'

const STORAGE_KEY = 'listio:categories'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: []
  }),

  getters: {
    getById: (state) => (id) => state.categories.find(c => c.id === id)
  },

  actions: {
    // --- LOCAL ---
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        this.categories = raw ? JSON.parse(raw) : []
      } catch (e) {
        console.error('Error cargando categorías de localStorage:', e)
        this.categories = []
      }
    },

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.categories))
      } catch (e) {
        console.error('Error guardando categorías en localStorage:', e)
      }
    },

    addLocal(category) {
      this.categories.unshift(category)
      this.save()
    },

    updateLocal(id, patch) {
      const idx = this.categories.findIndex(c => c.id === id)
      if (idx > -1) {
        this.categories[idx] = { ...this.categories[idx], ...patch }
        this.save()
      }
    },

    deleteLocal(id) {
      const idx = this.categories.findIndex(c => c.id === id)
      if (idx > -1) {
        this.categories.splice(idx, 1)
        this.save()
      }
    },

    // --- REMOTO ---
    async fetchRemote(params) {
      try {
        const data = await categoriesApi.getAll(params)

        if (Array.isArray(data)) {
          this.categories = data
          this.save()
          return { items: data }
        }

        const items = data?.data || data?.items || []
        this.categories = Array.isArray(items) ? items : []
        this.save()
        return { items }
      } catch (e) {
        console.error('Error al obtener categorías del backend:', e)
        throw e
      }
    },

    async createRemote(payload) {
      try {
        const created = await categoriesApi.add(payload)
        if (created && created.id) {
          this.addLocal(created) 
        }
        return created
      } catch (e) {
        console.error('Error al crear categoría:', e)
        throw e
      }
    },

    async updateRemote(id, patch) {
      try {
        const updated = await categoriesApi.update(id, patch)
        if (updated && updated.id) {
          this.updateLocal(id, updated)
        }
        return updated
      } catch (e) {
        console.error('Error al actualizar categoría:', e)
        throw e
      }
    },

    async deleteRemote(id) {
      try {
        await categoriesApi.remove(id)
        this.deleteLocal(id)
      } catch (e) {
        console.error('Error al eliminar categoría:', e)
        throw e
      }
    },

    // --- INIT ---
    async init() {
      this.load()
      if (!this.categories || this.categories.length === 0) {
        await this.fetchRemote()
      }
    }
  }
})