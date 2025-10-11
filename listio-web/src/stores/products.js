import { defineStore } from 'pinia'
import { productsApi } from '@/api/products'

const STORAGE_KEY = 'listio:products'

function mapProduct(data) {
  if (!data) return null
  return {
    id: data.id,
    name: data.name,
    metadata: data.metadata || {},
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
  }),

  getters: {
    getById: (state) => (id) => state.products.find((p) => p.id === id),
  },

  actions: {
    // --- LOCAL ---
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        this.products = raw ? JSON.parse(raw) : []
      } catch (e) {
        console.error('Error cargando productos de localStorage:', e)
        this.products = []
      }
    },

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products))
      } catch (e) {
        console.error('Error guardando productos en localStorage:', e)
      }
    },

    addLocal(product) {
      this.products.unshift(product)
      this.save()
    },

    updateLocal(id, patch) {
      const idx = this.products.findIndex((p) => p.id === id)
      if (idx === -1) return

      const current = this.products[idx] || {}
      const merged = { ...current, ...(patch || {}) }

      this.products.splice(idx, 1, merged)
      this.save()
    },

    deleteLocal(id) {
      const idx = this.products.findIndex((p) => p.id === id)
      if (idx > -1) {
        this.products.splice(idx, 1)
        this.save()
      }
    },

    // --- REMOTO ---
    async fetchRemote(params = {}) {
      try {
        const data = await productsApi.getAll(params)
        const items = Array.isArray(data) ? data : (data?.data ?? data?.items ?? [])
        this.products = Array.isArray(items) ? items.map(mapProduct) : []
        this.save()
        return { items: this.products }
      } catch (e) {
        console.error('Error al obtener productos del backend:', e)
        if (this.products.length === 0) {
          this.load()
        }
        throw e
      }
    },

    async createRemote(payload) {
      try {
        const created = await productsApi.add(payload)
        const createdData = created?.data ?? created
        if (createdData && createdData.id) {
          this.addLocal(mapProduct(createdData))
        } else {
          await this.fetchRemote()
        }
        return created
      } catch (e) {
        console.error('Error al crear producto:', e)
        throw e
      }
    },

    async updateRemote(id, patch) {
      try {
        const updated = await productsApi.update(id, patch)
        const updatedData = updated?.data ?? updated

        if (updatedData && updatedData.id) {
          this.updateLocal(id, mapProduct(updatedData))
        } else {
          this.updateLocal(id, patch)
        }

        return updated
      } catch (e) {
        console.error('Error al actualizar producto:', e)
        throw e
      }
    },

    async deleteRemote(id) {
      try {
        await productsApi.remove(id)
        this.deleteLocal(id)
      } catch (e) {
        console.error('Error al eliminar producto:', e)
        throw e
      }
    },

    // --- búsquedas ---
    async searchRemote(query, params = {}) {
      try {
        const data = await productsApi.search(query, params)
        const items = Array.isArray(data) ? data : (data?.data ?? data?.items ?? [])
        return Array.isArray(items) ? items.map(mapProduct) : []
      } catch (e) {
        console.error('Error al buscar productos:', e)
        return this.searchLocal(query)
      }
    },

    searchLocal(query) {
      if (!query) return this.products
      const q = query.toLowerCase()
      return this.products.filter(product => 
        product.name.toLowerCase().includes(q) ||
        (product.metadata?.description || '').toLowerCase().includes(q)
      )
    },

    // --- INIT ---
    async init() {
      this.load()
      try {
        await this.fetchRemote()
      } catch (e) {
        console.warn('No se pudo conectar con el servidor, usando datos locales')
        if (this.products.length === 0) {
          this.products = []
        }
      }
    },
  },
})