// src/stores/bootstrap.js
// Helper to load and initialize all Pinia stores at app startup.


export async function bootstrapStores(pinia) {
  // Import stores lazily to avoid circular imports during module initialization
  const { useUserStore } = await import('./user')
  const { useListsStore } = await import('./lists')
  const { useProductsStore } = await import('./products')
  const { usePantryStore } = await import('./pantry')

  const userStore = useUserStore(pinia)
  userStore.load()

  // If user has a token, refresh profile (best-effort)
  if (userStore.token) {
    userStore.fetchProfile().catch((err) => {
      console.error('Failed to refresh user profile', err)
    })
  }

  // Load other stores so they are available on any route
  const listsStore = useListsStore(pinia)
  listsStore.load()

  const productsStore = useProductsStore(pinia)
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
