



export async function bootstrapStores(pinia) {
  console.log('🚀 Iniciando bootstrap de stores...')
  
  
  const { useUserStore } = await import('./user')
  const { useListsStore } = await import('./lists')
  const { useProductStore } = await import('./products')
  const { usePantryStore } = await import('./pantry')
  const { useCategoryStore } = await import('./category')

  const userStore = useUserStore(pinia)
  userStore.load()
  
  console.log('👤 Usuario cargado:', userStore.token ? 'Con token' : 'Sin token')

  
  const categoryStore = useCategoryStore(pinia)
  
  
  const listsStore = useListsStore(pinia)

  
  if (userStore.token) {
    try {
      await userStore.fetchProfile()
      console.log('✅ Perfil de usuario cargado')
    } catch (err) {
      console.error('❌ Error al cargar perfil:', err)
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn('⚠️ Token inválido, limpiando sesión')
        userStore.clearProfile()
      }
    }
    
    
    
    try {
      console.log('🏷️ Inicializando categorías...')
      await categoryStore.init()
      console.log('✅ Categorías inicializadas:', categoryStore.categories.length)
      console.log('📊 IDs de categorías:', categoryStore.categories.slice(0, 3).map(c => `${c.name}:${c.id}`))
    } catch (err) {
      console.error('❌ Error al inicializar categorías:', err)
      
      categoryStore.load()
      console.log('📦 Usando categorías de localStorage:', categoryStore.categories.length)
    }
    
    
    try {
      console.log('📋 Recargando listas...')
      listsStore.reload()
      console.log('✅ Listas recargadas')
    } catch (err) {
      console.error('❌ Error al recargar listas:', err)
      listsStore.load()
    }
  } else {
    
    console.log('📦 Sin sesión, cargando categorías de localStorage...')
    categoryStore.load()
    
    listsStore.load()
  }

  const productsStore = useProductStore(pinia)
  productsStore.load && productsStore.load()

  const pantryStore = usePantryStore(pinia)
  pantryStore.load && pantryStore.load()

  
  

  
  
  
  try {
    const MIGRATION_KEY = 'listio:migrated:list-items:v1'
    if (!localStorage.getItem(MIGRATION_KEY)) {
      const { useListItemsStore } = await import('./listItems')
      const listItemsStore = useListItemsStore(pinia)

      
      let migrated = false
      for (const l of listsStore.lists.slice()) {
        if (l && Array.isArray(l.items) && l.items.length > 0) {
          listItemsStore.listId = l.id
          listItemsStore.setItems(l.items)
          
          delete l.items
          migrated = true
        }
      }

      if (migrated) {
        
        listsStore.save && listsStore.save()
      }

      
      localStorage.setItem(MIGRATION_KEY, '1')
    }
  } catch (e) {
    
    console.warn('List-items migration failed (continuing):', e)
  }
}

export default bootstrapStores
