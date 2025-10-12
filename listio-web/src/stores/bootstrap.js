// src/stores/bootstrap.js
// Helper to load and initialize all Pinia stores at app startup.


export async function bootstrapStores(pinia) {
  console.log('🚀 Iniciando bootstrap de stores...')
  
  // Import stores lazily to avoid circular imports during module initialization
  const { useUserStore } = await import('./user')
  const { useListsStore } = await import('./lists')
  const { useProductStore } = await import('./products')
  const { usePantryStore } = await import('./pantry')
  const { useCategoryStore } = await import('./category')

  const userStore = useUserStore(pinia)
  userStore.load()
  
  console.log('👤 Usuario cargado:', userStore.token ? 'Con token' : 'Sin token')

  // Initialize category store early (needed for icons in lists and products)
  const categoryStore = useCategoryStore(pinia)
  
  // Load lists store
  const listsStore = useListsStore(pinia)

  // If user has a token, refresh profile (best-effort)
  if (userStore.token) {
    try {
      await userStore.fetchProfile()
      console.log('✅ Perfil de usuario cargado')
    } catch (err) {
      console.error('❌ Error al cargar perfil:', err)
      // If 401/403, token is invalid - clear it
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn('⚠️ Token inválido, limpiando sesión')
        userStore.clearProfile()
      }
    }
    
    // CRITICAL: Initialize categories FIRST (before lists)
    // This ensures category icons are loaded before list items are displayed
    try {
      console.log('🏷️ Inicializando categorías...')
      await categoryStore.init()
      console.log('✅ Categorías inicializadas:', categoryStore.categories.length)
      console.log('📊 IDs de categorías:', categoryStore.categories.slice(0, 3).map(c => `${c.name}:${c.id}`))
    } catch (err) {
      console.error('❌ Error al inicializar categorías:', err)
      // Fallback to localStorage
      categoryStore.load()
      console.log('📦 Usando categorías de localStorage:', categoryStore.categories.length)
    }
    
    // THEN reload lists (after categories are ready)
    try {
      console.log('📋 Recargando listas...')
      listsStore.reload()
      console.log('✅ Listas recargadas')
    } catch (err) {
      console.error('❌ Error al recargar listas:', err)
      listsStore.load()
    }
  } else {
    // No user logged in, load categories from localStorage
    console.log('📦 Sin sesión, cargando categorías de localStorage...')
    categoryStore.load()
    // Load lists normally (will use generic key)
    listsStore.load()
  }

  const productsStore = useProductStore(pinia)
  productsStore.load && productsStore.load()

  const pantryStore = usePantryStore(pinia)
  pantryStore.load && pantryStore.load()

  // Optional: seed defaults if needed — keep seeding responsibility near the UI
  // so the user has control over when sample data is created.

  // Migration: if lists were previously stored with embedded `items` arrays,
  // extract them into per-list storage managed by `listItems` store. This
  // runs once and is guarded by a migration flag in localStorage.
  try {
    const MIGRATION_KEY = 'listio:migrated:list-items:v1'
    if (!localStorage.getItem(MIGRATION_KEY)) {
      const { useListItemsStore } = await import('./listItems')
      const listItemsStore = useListItemsStore(pinia)

      // Move embedded items for each list into listio:list-items:<id>
      let migrated = false
      for (const l of listsStore.lists.slice()) {
        if (l && Array.isArray(l.items) && l.items.length > 0) {
          listItemsStore.listId = l.id
          listItemsStore.setItems(l.items)
          // remove embedded items from lists store
          delete l.items
          migrated = true
        }
      }

      if (migrated) {
        // persist cleaned lists array
        listsStore.save && listsStore.save()
      }

      // mark migration done (idempotent)
      localStorage.setItem(MIGRATION_KEY, '1')
    }
  } catch (e) {
    // Migration failures shouldn't block app startup
    console.warn('List-items migration failed (continuing):', e)
  }
}

export default bootstrapStores
