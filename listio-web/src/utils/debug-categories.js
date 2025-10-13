


export async function debugCategories() {
  console.log('🔍 === DIAGNÓSTICO DE CATEGORÍAS ===')
  
  
  const localCategories = localStorage.getItem('listio:categories')
  console.log('\n📦 LocalStorage (listio:categories):')
  if (localCategories) {
    const parsed = JSON.parse(localCategories)
    console.table(parsed.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon || c.metadata?.icon || 'N/A',
      color: c.color || c.metadata?.color || 'N/A'
    })))
  } else {
    console.log('   ❌ No hay categorías en localStorage')
  }
  
  
  const categoryStore = window.__PINIA_STORES__?.get('category')
  if (categoryStore) {
    console.log('\n🏪 Pinia Store (state.categories):')
    console.table(categoryStore.categories.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon || c.metadata?.icon || 'N/A',
      color: c.color || c.metadata?.color || 'N/A'
    })))
  }
  
  
  const token = localStorage.getItem('listio:token')
  if (token) {
    console.log('\n🌐 Servidor (API):')
    try {
      const response = await fetch('https://pantry.juliapriolo.workers.dev/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      console.log(`   Total: ${data.items?.length || 0} categorías`)
      console.table(data.items.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon || c.metadata?.icon || 'N/A',
        color: c.color || c.metadata?.color || 'N/A',
        metadata: JSON.stringify(c.metadata)
      })))
    } catch (error) {
      console.error('   ❌ Error consultando API:', error)
    }
  } else {
    console.log('   ⚠️ No hay token, no se puede consultar API')
  }
  
  
  console.log('\n📋 DEFAULT_CATEGORIES (código fuente):')
  const defaults = [
    { id: 'cat-fruits', name: 'Frutas y Verduras', icon: 'mdi-carrot', color: '#4CAF50' },
    { id: 'cat-dairy', name: 'Lácteos', icon: 'mdi-cheese', color: '#FFC107' },
    { id: 'cat-meat', name: 'Carnes y Pescados', icon: 'mdi-food-steak', color: '#F44336' },
    { id: 'cat-bakery', name: 'Panadería', icon: 'mdi-baguette', color: '#FF9800' },
    { id: 'cat-drinks', name: 'Bebidas', icon: 'mdi-bottle-soda', color: '#2196F3' },
    { id: 'cat-snacks', name: 'Snacks y Dulces', icon: 'mdi-cookie', color: '#9C27B0' },
    { id: 'cat-canned', name: 'Enlatados', icon: 'mdi-food-drumstick', color: '#795548' },
    { id: 'cat-frozen', name: 'Congelados', icon: 'mdi-snowflake', color: '#00BCD4' },
    { id: 'cat-cleaning', name: 'Limpieza', icon: 'mdi-spray-bottle', color: '#8BC34A' },
    { id: 'cat-personal', name: 'Cuidado Personal', icon: 'mdi-hand-heart', color: '#E91E63' },
    { id: 'cat-baby', name: 'Bebé', icon: 'mdi-baby-bottle', color: '#FFEB3B' },
    { id: 'cat-pets', name: 'Mascotas', icon: 'mdi-paw', color: '#FF5722' },
    { id: 'cat-other', name: 'Otros', icon: 'mdi-cart', color: '#607D8B' }
  ]
  console.table(defaults)
  
  console.log('\n✅ Diagnóstico completado')
}




