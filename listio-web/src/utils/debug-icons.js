/**
 * Script de debug para diagnóstico de iconos
 * 
 * Ejecutar en la consola del navegador:
 * import('/src/utils/debug-icons.js').then(m => m.debugIcons())
 */

export function debugIcons() {
  console.log('🔍 === DEBUG DE ICONOS ===\n')
  
  // 1. Estado del localStorage
  console.log('📦 1. LOCALSTORAGE')
  console.log('   Bandera defaults:', localStorage.getItem('listio:defaults-created:v1'))
  
  const categoriesRaw = localStorage.getItem('listio:categories')
  if (categoriesRaw) {
    const categories = JSON.parse(categoriesRaw)
    console.log(`   Categorías guardadas: ${categories.length}`)
    console.table(categories.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon || c.metadata?.icon || 'N/A',
      hasMetadata: !!c.metadata
    })))
  } else {
    console.log('   ❌ No hay categorías en localStorage')
  }
  
  // 2. Estado del Pinia Store
  console.log('\n🏪 2. PINIA STORE')
  // Acceder al store usando el patrón de Pinia
  const app = document.querySelector('#app').__VUE_APP__
  if (app) {
    const pinia = app.config.globalProperties.$pinia
    const stores = pinia._s
    
    const categoryStore = Array.from(stores.values()).find(s => s.$id === 'category')
    
    if (categoryStore) {
      console.log(`   Categorías en store: ${categoryStore.categories?.length || 0}`)
      if (categoryStore.categories?.length > 0) {
        console.table(categoryStore.categories.map(c => ({
          id: c.id,
          name: c.name,
          icon: c.icon || c.metadata?.icon || 'N/A',
          color: c.color || c.metadata?.color || 'N/A'
        })))
      }
      
      // Test getter
      console.log('\n   🧪 Test de getters:')
      const testIds = [1, 2, 'cat-fruits', 123]
      testIds.forEach(id => {
        const icon = categoryStore.getIconById(id)
        const color = categoryStore.getColorById(id)
        console.log(`      ID ${id}: icon="${icon}", color="${color}"`)
      })
    } else {
      console.log('   ❌ No se encontró categoryStore')
    }
    
    // Check list items
    const listItemsStore = Array.from(stores.values()).find(s => s.$id === 'listItems')
    if (listItemsStore && listItemsStore.items?.length > 0) {
      console.log(`\n📝 3. ITEMS DE LISTA (primeros 5)`)
      const sample = listItemsStore.items.slice(0, 5)
      console.table(sample.map(item => ({
        name: item.name,
        categoryId: item.categoryId,
        categoryName: item.categoryName || item.product?.category?.name || 'N/A'
      })))
    }
  } else {
    console.log('   ❌ No se pudo acceder a la app Vue')
  }
  
  // 3. Verificar productos
  console.log('\n📦 4. PRODUCTOS (si hay)')
  const productsRaw = localStorage.getItem('listio:products')
  if (productsRaw) {
    const products = JSON.parse(productsRaw)
    if (products.length > 0) {
      console.log(`   Total productos: ${products.length}`)
      const sample = products.slice(0, 3)
      console.table(sample.map(p => ({
        name: p.name,
        categoryId: p.category?.id || p.categoryId || 'N/A',
        categoryName: p.category?.name || 'N/A'
      })))
    }
  }
  
  console.log('\n✅ === FIN DEBUG ===')
  console.log('\n💡 TIP: Si los IDs de categorías en items no coinciden con los IDs en el store,')
  console.log('   ese es el problema. Las categorías deben tener IDs numéricos del servidor.')
}

// Exportar también versión async
export async function debugIconsAsync() {
  await new Promise(resolve => setTimeout(resolve, 100))
  debugIcons()
}

export default debugIcons
