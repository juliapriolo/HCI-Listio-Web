import { defineStore } from 'pinia'
import { categoriesApi } from '@/api/category'

const STORAGE_KEY = 'listio:categories'

// Categorías por defecto con iconos de Material Design
const DEFAULT_CATEGORIES = [
  { id: 'cat-fruits', name: 'Frutas y Verduras', icon: 'mdi-carrot', color: '#4CAF50' },
  { id: 'cat-dairy', name: 'Lácteos', icon: 'mdi-cheese', color: '#FFC107' },
  { id: 'cat-meat', name: 'Carnes y Pescados', icon: 'mdi-food-steak', color: '#F44336' },
  { id: 'cat-bakery', name: 'Panadería', icon: 'mdi-baguette', color: '#FF9800' },
  { id: 'cat-beverages', name: 'Bebidas', icon: 'mdi-bottle-soda', color: '#2196F3' },
  { id: 'cat-snacks', name: 'Snacks y Dulces', icon: 'mdi-cookie', color: '#E91E63' },
  { id: 'cat-canned', name: 'Enlatados y Conservas', icon: 'mdi-food-drumstick', color: '#795548' },
  { id: 'cat-frozen', name: 'Congelados', icon: 'mdi-snowflake', color: '#00BCD4' },
  { id: 'cat-cleaning', name: 'Limpieza', icon: 'mdi-spray-bottle', color: '#9C27B0' },
  { id: 'cat-personal', name: 'Cuidado Personal', icon: 'mdi-hand-heart', color: '#FF5722' },
  { id: 'cat-baby', name: 'Bebé', icon: 'mdi-baby-bottle', color: '#FFEB3B' },
  { id: 'cat-pets', name: 'Mascotas', icon: 'mdi-paw', color: '#607D8B' },
  { id: 'cat-other', name: 'Otros', icon: 'mdi-cart', color: '#9E9E9E' }
]

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: []
  }),

  getters: {
    getById: (state) => (id) => state.categories.find(c => c.id === id),
    
    // Getter para obtener el icono de una categoría
    getIconById: (state) => (id) => {
      if (!id) return 'mdi-package-variant'
      
      // 1. Try to find by exact ID match in loaded categories (from server)
      const category = state.categories.find(c => c.id === id)
      if (category) {
        return category.icon || category.metadata?.icon || 'mdi-package-variant'
      }
      
      // 2. If ID looks like old default ID (cat-*), try to map by name
      if (typeof id === 'string' && id.startsWith('cat-')) {
        const defaultCat = DEFAULT_CATEGORIES.find(def => def.id === id)
        if (defaultCat) {
          // Find in server categories by name
          const serverCat = state.categories.find(c => 
            c.name?.toLowerCase() === defaultCat.name?.toLowerCase()
          )
          if (serverCat) {
            return serverCat.icon || serverCat.metadata?.icon || 'mdi-package-variant'
          }
        }
      }
      
      // 3. Last fallback
      return 'mdi-package-variant'
    },
    
    // Getter para obtener el color de una categoría
    getColorById: (state) => (id) => {
      if (!id) return '#9E9E9E'
      
      // 1. Try to find by exact ID match in loaded categories (from server)
      const category = state.categories.find(c => c.id === id)
      if (category) {
        return category.color || category.metadata?.color || '#9E9E9E'
      }
      
      // 2. If ID looks like old default ID (cat-*), try to map by name
      if (typeof id === 'string' && id.startsWith('cat-')) {
        const defaultCat = DEFAULT_CATEGORIES.find(def => def.id === id)
        if (defaultCat) {
          // Find in server categories by name
          const serverCat = state.categories.find(c => 
            c.name?.toLowerCase() === defaultCat.name?.toLowerCase()
          )
          if (serverCat) {
            return serverCat.color || serverCat.metadata?.color || '#9E9E9E'
          }
        }
      }
      
      // 3. Last fallback
      return '#9E9E9E'
    },
    
    // Helper to get category by name (useful for mapping server categories)
    getByName: (state) => (name) => state.categories.find(c => 
      c.name?.toLowerCase() === name?.toLowerCase()
    )
  },

  actions: {
    // --- LOCAL ---
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const storedCategories = raw ? JSON.parse(raw) : []
        
        // Merge default categories with stored ones
        // Keep user-created categories and ensure defaults are present
        const mergedCategories = [...DEFAULT_CATEGORIES]
        
        // Add stored categories that are not in defaults
        storedCategories.forEach(stored => {
          if (!DEFAULT_CATEGORIES.find(def => def.id === stored.id)) {
            mergedCategories.push(stored)
          }
        })
        
        this.categories = mergedCategories
        console.log('Categorías cargadas (incluyendo defaults):', this.categories.length)
      } catch (e) {
        console.error('Error cargando categorías de localStorage:', e)
        this.categories = [...DEFAULT_CATEGORIES]
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
        console.log('📥 Respuesta de categoriesApi.getAll:', data)

        if (Array.isArray(data)) {
          console.log('✅ Respuesta es array directo:', data.length, 'categorías')
          this.categories = data
          this.save()
          return { items: data }
        }

        const items = data?.data || data?.items || []
        console.log('✅ Respuesta es objeto, items extraídos:', items.length, 'categorías')
        this.categories = Array.isArray(items) ? items : []
        this.save()
        return { items: this.categories }
      } catch (e) {
        console.error('❌ Error al obtener categorías del backend:', e)
        throw e
      }
    },

    async createRemote(payload) {
      try {
        console.log('📤 Creando categoría con payload:', payload)
        const created = await categoriesApi.add(payload)
        console.log('📥 Categoría creada, respuesta:', created)
        
        if (created && created.id) {
          this.addLocal(created) 
        }
        return created
      } catch (e) {
        console.error('❌ Error al crear categoría:', e)
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
    // --- INIT sincrónico con API ---
    async init() {
      try {
        // 1️⃣ Cargar defaults + localStorage
        this.load()

        // 2️⃣ Intentar obtener datos actualizados de la API
        try {
          const remoteData = await this.fetchRemote()
          console.log('Categorías obtenidas del servidor:', remoteData.items.length)
          
          // 3️⃣ Check if default categories exist on server, create or update them
          for (const defaultCat of DEFAULT_CATEGORIES) {
            const existsOnServer = remoteData.items.find(remote => 
              remote.name?.toLowerCase() === defaultCat.name?.toLowerCase()
            )
            
            if (!existsOnServer) {
              // Create new category
              console.log(`📝 Creando categoría default en servidor: ${defaultCat.name}`)
              try {
                const newCategoryPayload = {
                  name: defaultCat.name,
                  metadata: {
                    icon: defaultCat.icon,
                    color: defaultCat.color,
                    isDefault: true
                  }
                }
                
                const createdCategory = await this.createRemote(newCategoryPayload)
                console.log(`✅ Categoría creada: ${createdCategory.name} (ID: ${createdCategory.id})`)
              } catch (createError) {
                console.error(`❌ Error creando categoría ${defaultCat.name}:`, createError)
              }
            } else {
              // Category exists, check if icon/color needs update
              const currentIcon = existsOnServer.icon || existsOnServer.metadata?.icon
              const currentColor = existsOnServer.color || existsOnServer.metadata?.color
              
              if (currentIcon !== defaultCat.icon || currentColor !== defaultCat.color) {
                console.log(`🔄 Actualizando iconos de categoría: ${defaultCat.name}`)
                console.log(`   Icono: ${currentIcon} → ${defaultCat.icon}`)
                console.log(`   Color: ${currentColor} → ${defaultCat.color}`)
                
                try {
                  const updatePayload = {
                    name: existsOnServer.name,
                    metadata: {
                      ...(existsOnServer.metadata || {}),
                      icon: defaultCat.icon,
                      color: defaultCat.color,
                      isDefault: true
                    }
                  }
                  
                  await this.updateRemote(existsOnServer.id, updatePayload)
                  console.log(`✅ Categoría actualizada: ${defaultCat.name}`)
                } catch (updateError) {
                  console.error(`❌ Error actualizando categoría ${defaultCat.name}:`, updateError)
                }
              } else {
                console.log(`✓ Categoría OK: ${defaultCat.name} (ID: ${existsOnServer.id})`)
              }
            }
          }
          
          // 4️⃣ Fetch again to get all categories with updated data
          const updatedData = await this.fetchRemote()
          
          // 5️⃣ Use server categories (they now include all defaults with updated icons)
          this.categories = updatedData.items
          this.save()
          
          console.log('✅ Categorías sincronizadas con API:', this.categories.length)
        } catch (apiError) {
          console.warn('⚠️ No se pudo conectar con la API, usando categorías locales:', apiError)
          // Categories are already loaded from load() which includes defaults
        }

      } catch (e) {
        console.error('❌ Error inicializando categorías:', e)
        // Ensure we at least have default categories
        this.categories = [...DEFAULT_CATEGORIES]
      }
    }
  }
})