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
    deletedProducts: [], 
  }),

  getters: {
    getById: (state) => (id) => state.products.find((p) => p.id === id),
    
    getByIdIncludingDeleted: (state) => (id) => {
      return state.products.find((p) => p.id === id) || 
             state.deletedProducts.find((p) => p.id === id)
    },
    
    getByName: (state) => (name) => {
      const lowerName = name.toLowerCase()
      return state.products.find((p) => p.name.toLowerCase() === lowerName) ||
             state.deletedProducts.find((p) => p.name.toLowerCase() === lowerName)
    },
  },

  actions: {
    
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const data = raw ? JSON.parse(raw) : { products: [], deletedProducts: [] }
        
        
        if (Array.isArray(data)) {
          this.products = data
          this.deletedProducts = []
        } else {
          this.products = data.products || []
          this.deletedProducts = data.deletedProducts || []
        }
      } catch (e) {
        console.error('Error cargando productos de localStorage:', e)
        this.products = []
        this.deletedProducts = []
      }
    },

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          products: this.products,
          deletedProducts: this.deletedProducts
        }))
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
        
        const product = this.products.splice(idx, 1)[0]
        this.deletedProducts.push(product)
        this.save()
      }
    },

    
    restoreProduct(id) {
      const idx = this.deletedProducts.findIndex((p) => p.id === id)
      if (idx > -1) {
        const product = this.deletedProducts.splice(idx, 1)[0]
        this.products.push(product)
        this.save()
        return product
      }
      return null
    },

    
    async cleanupDeletedProducts() {
      try {
        const { useHistoryStore } = await import('@/stores/history')
        const history = useHistoryStore()
        
        
        this.deletedProducts = this.deletedProducts.filter(product => {
          const hasReferences = history.events.some(ev => 
            ev.data?.productId === product.id || 
            ev.resourceId === product.id
          )
          return hasReferences
        })
        this.save()
      } catch (e) {
        console.warn('No se pudo limpiar productos eliminados:', e)
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
        // Verificar si el producto ya existe en deletedProducts
        const existingDeleted = this.getByName(payload.name)
        
        if (existingDeleted && this.deletedProducts.find(p => p.id === existingDeleted.id)) {
          // Restaurar el producto eliminado en lugar de crear uno nuevo
          console.log('Restaurando producto eliminado:', existingDeleted.name)
          this.restoreProduct(existingDeleted.id)
          
          // Actualizar con los nuevos datos si es necesario
          if (payload.category?.id !== existingDeleted.category?.id || 
              payload.metadata?.description !== existingDeleted.metadata?.description) {
            await this.updateRemote(existingDeleted.id, payload)
          }
          
          // Note: No need to record product restoration in history - history is only for deleted items
          
          return existingDeleted
        }
        
        // Intentar crear el producto
        try {
          const created = await productsApi.add(payload)
          if (created && created.id) {
            this.addLocal(mapProduct(created))
            // Note: No need to record product creation in history - history is only for deleted items
          }
          return created
        } catch (apiError) {
          // Si el error es que el producto ya existe, intentar recuperarlo
          if (apiError.message?.includes('already exists') || 
              apiError.response?.data?.message?.includes('already exists') ||
              apiError.response?.status === 409) {
            
            console.log('Producto ya existe en el servidor, intentando recuperarlo...')
            
            
            try {
              const allProductsResponse = await productsApi.getAll({ includeDeleted: true })
              const allProducts = Array.isArray(allProductsResponse.data) ? allProductsResponse.data : []
              const existingProduct = allProducts
                .map(mapProduct)
                .filter(Boolean)
                .find(p => p.name.toLowerCase() === payload.name.toLowerCase())
              
              if (existingProduct) {
                console.log('Producto encontrado:', existingProduct)
                
                if (!this.getById(existingProduct.id)) {
                  this.addLocal(existingProduct)
                }
                
                
                try {
                  return await this.updateRemote(existingProduct.id, payload)
                } catch (updateError) {
                  
                  console.warn('No se pudo actualizar el producto existente:', updateError)
                  return existingProduct
                }
              }
            } catch (searchError) {
              console.warn('Error al buscar productos con includeDeleted:', searchError)
            }
            
            
            try {
              const searchResults = await this.searchRemote(payload.name)
              const existingProduct = searchResults.find(p => 
                p.name.toLowerCase() === payload.name.toLowerCase()
              )
              
              if (existingProduct) {
                console.log('Producto encontrado en búsqueda:', existingProduct)
                if (!this.getById(existingProduct.id)) {
                  this.addLocal(existingProduct)
                }
                
                try {
                  return await this.updateRemote(existingProduct.id, payload)
                } catch (updateError) {
                  console.warn('No se pudo actualizar el producto existente:', updateError)
                  return existingProduct
                }
              }
            } catch (searchError) {
              console.warn('Error al buscar producto:', searchError)
            }
            
            
            
            const error = new Error(
              `El producto "${payload.name}" ya existe en el sistema pero está eliminado. ` +
              `Por favor, use un nombre diferente o contacte al administrador para restaurar el producto.`
            )
            error.code = 'PRODUCT_EXISTS_BUT_DELETED'
            throw error
          }
          
          
          throw apiError
        }
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
          
        }
        return updated
      } catch (e) {
        console.error('Error al actualizar producto:', e)
        throw e
      }
    },

    async deleteRemote(id) {
      try {
        
        const product = this.getById(id)
        
        if (!product) {
          throw new Error('Producto no encontrado')
        }
        
        
        const references = await this.getProductReferences(id)
        
        
        return {
          product,
          references,
          needsConfirmation: references.length > 0
        }
      } catch (e) {
        console.error('Error al verificar referencias del producto:', e)
        throw e
      }
    },

    
    async getProductReferences(productId) {
      try {
        const { useListsStore } = await import('@/stores/lists')
        const { useListItemsStore } = await import('@/stores/listItems')
        
        const listsStore = useListsStore()
        const references = []
        
        
        for (const list of listsStore.lists) {
          const listItemsStore = useListItemsStore()
          await listItemsStore.load(list.id)
          
          const itemsWithProduct = listItemsStore.items.filter(item => 
            item.name === this.getById(productId)?.name ||
            item.productId === productId
          )
          
          if (itemsWithProduct.length > 0) {
            references.push({
              listId: list.id,
              listName: list.name,
              items: itemsWithProduct
            })
          }
        }
        
        return references
      } catch (e) {
        console.warn('Error al obtener referencias del producto:', e)
        return []
      }
    },

    
    async forceDeleteRemote(id, deleteReferences = false) {
      try {
        const product = this.getById(id)
        
        if (!product) {
          throw new Error('Producto no encontrado')
        }
        
        console.log(`🗑️ Eliminando producto ${product.name} (ID: ${id})`, { deleteReferences })
        
        
        if (deleteReferences) {
          const { useListItemsStore } = await import('@/stores/listItems')
          const references = await this.getProductReferences(id)
          
          console.log(`📋 Eliminando ${references.length} referencias en listas`)
          
          for (const ref of references) {
            const listItemsStore = useListItemsStore()
            await listItemsStore.load(ref.listId)
            
            console.log(`  - Lista "${ref.listName}": ${ref.items.length} ítems`)
            
            
            for (const item of ref.items) {
              console.log(`    ✓ Eliminando ítem: ${item.name}`)
              listItemsStore.deleteItem(item.id, { remote: false })
            }
          }
        }
        
        
        console.log(`🌐 Llamando a API para eliminar producto ${id}`)
        await productsApi.remove(id)
        console.log(`✅ Producto eliminado del backend`)
        
        
        const idx = this.products.findIndex((p) => p.id === id)
        if (idx > -1) {
          this.products.splice(idx, 1)
          this.save()
          console.log(`✅ Producto eliminado localmente`)
        }
        
        
        try {
          const { useHistoryStore } = await import('@/stores/history')
          const history = useHistoryStore()
          history.recordEvent('product.delete', 'product', id, { 
            name: product.name,
            category: product.category?.name,
            metadata: product.metadata,
            deletedReferences: deleteReferences
          }, { meta: { source: 'remote' } })
        } catch (e) { 
          console.warn('Error al registrar en historial:', e)
        }
        
        console.log(`✅ Eliminación completa del producto ${product.name}`)
        return { success: true }
      } catch (e) {
        console.error('❌ Error al eliminar producto:', e)
        throw e
      }
    },

    
    async deleteAllProductsDebug() {
      try {
        console.log('🚨 DEBUG: Iniciando eliminación de TODOS los productos')
        const productIds = [...this.products.map(p => p.id)]
        console.log(`📊 Total de productos a eliminar: ${productIds.length}`)
        
        let deleted = 0
        let failed = 0
        
        for (const id of productIds) {
          try {
            console.log(`  🗑️ Eliminando producto ID: ${id}`)
            await productsApi.remove(id)
            deleted++
            console.log(`    ✅ Eliminado (${deleted}/${productIds.length})`)
          } catch (e) {
            failed++
            console.warn(`    ❌ Error al eliminar producto ${id}:`, e.message)
          }
        }
        
        this.products = []
        this.deletedProducts = []
        this.save()
        
        console.log(`✅ DEBUG: Eliminación completada`)
        console.log(`   - Eliminados: ${deleted}`)
        console.log(`   - Fallidos: ${failed}`)
        console.log(`   - Arrays locales limpiados`)
        
        return { success: true, deleted, failed, total: productIds.length }
      } catch (e) {
        console.error('❌ Error al eliminar todos los productos:', e)
        throw e
      }
    },

    
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