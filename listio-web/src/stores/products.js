import { defineStore } from 'pinia'

const STORAGE_KEY = 'listio:products'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: []
  }),
  getters: {
    byId: (state) => (id) => state.products.find(p => p.id === id)
  },
  actions: {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        this.products = raw ? JSON.parse(raw) : []
      } catch (e) {
        console.error('Failed to load products', e)
        this.products = []
      }
    },
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products))
      } catch (e) {
        console.error('Failed to save products', e)
      }
    },
    seed(sample) {
      this.products = sample
      this.save()
    },
    addProduct(product) {
      this.products.unshift(product)
      this.save()
    },
    updateProduct(id, patch) {
      const idx = this.products.findIndex(p => p.id === id)
      if (idx > -1) {
        this.products[idx] = { ...this.products[idx], ...patch }
        this.save()
      }
    },
    deleteProduct(id) {
      const idx = this.products.findIndex(p => p.id === id)
      if (idx > -1) {
        this.products.splice(idx, 1)
        this.save()
      }
    }
  }
})
