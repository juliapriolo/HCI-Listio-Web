import { defineStore } from 'pinia'
import { productsApi } from '@/api/products'

const STORAGE_KEY = 'listio:products'

function mapProduct(data) {
  if (!data) return null
  if (!data.category || !data.category.id) {
    console.warn(`Producto ${data.name} no tiene categoría válida`, data)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    metadata: data.metadata || {},
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    category: {
      id: data.category.id,
      name: data.category.name,
      metadata: data.category.metadata || {},
      createdAt: data.category.createdAt,
      updatedAt: data.category.updatedAt,
    },
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
      this.products.push(product)
      this.save()
    },

    updateLocal(id, patch) {
      const idx = this.products.findIndex((p) => p.id === id)
      if (idx > -1) {
        this.products[idx] = { ...this.products[idx], ...patch }
        this.save()
      }
    },

    deleteLocal(id) {
      const idx = this.products.findIndex((p) => p.id === id)
      if (idx > -1) {
        this.products.splice(idx, 1)
        this.save()
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

    // --- REMOTO ---
    async fetchRemote(params = {}) {
      try {
        const res = await productsApi.getAll(params)
    
        const items = Array.isArray(res.data) ? res.data : []
        this.products = items.map(mapProduct).filter(Boolean)
        this.save()
    
        return {
          items: this.products,
        }
      } catch (e) {
        console.error('Error al obtener productos del backend:', e)
        if (this.products.length === 0) this.load()
        throw e
      }
    },

    async createRemote(payload) {
      try {
        const created = await productsApi.add(payload)
        if (created && created.id) {
          this.addLocal(mapProduct(created))
          try {
            const { useHistoryStore } = await import('@/stores/history')
            const history = useHistoryStore()
            history.recordEvent('product.create', 'product', created.id, { name: created.name }, { meta: { source: 'remote' } })
          } catch (e) { /* ignore history errors */ }
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
        if (updated && updated.id) {
          this.updateLocal(id, mapProduct(updated))
          try {
            const { useHistoryStore } = await import('@/stores/history')
            const history = useHistoryStore()
            history.recordEvent('product.update', 'product', id, { patch }, { meta: { source: 'remote' } })
          } catch (e) { /* ignore */ }
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
        try {
          const { useHistoryStore } = await import('@/stores/history')
          const history = useHistoryStore()
          history.recordEvent('product.delete', 'product', id, null, { meta: { source: 'remote' } })
        } catch (e) { /* ignore */ }
      } catch (e) {
        console.error('Error al eliminar producto:', e)
        throw e
      }
    },

    // Buscar productos
    async searchRemote(query, params = {}) {
      try {
        const res = await productsApi.search(query, params)
        const items = Array.isArray(res.data) ? res.data : []
        return items.map(mapProduct).filter(Boolean)
      } catch (e) {
        console.error('Error al buscar productos:', e)
        return this.searchLocal(query)
      }
    },

    // --- INIT ---
    async init() {
      this.load()
      try {
        // Intentar cargar desde el servidor
        await this.fetchRemote()
      } catch (e) {
        console.warn('No se pudo conectar con el servidor, usando datos locales')
        // Si no hay productos locales, crear algunos de ejemplo
        if (this.products.length === 0) {
          this.products = []
        }
      }
    },
  },
})