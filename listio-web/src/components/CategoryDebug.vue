<template>
  <v-card class="ma-4" v-if="showDebug">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>🔍 Debug: Categorías</span>
      <v-btn icon size="small" @click="showDebug = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    
    <v-card-text>
      <v-btn @click="runDiagnostic" color="primary" class="mb-4">
        Ejecutar Diagnóstico
      </v-btn>
      
      <v-btn @click="forceUpdate" color="warning" class="mb-4 ml-2">
        Forzar Actualización
      </v-btn>
      
      <v-btn @click="clearLocalStorage" color="error" class="mb-4 ml-2">
        Limpiar localStorage
      </v-btn>
      
      <div v-if="diagnosticResult">
        <v-divider class="my-4"></v-divider>
        
        <h3>📋 DEFAULT_CATEGORIES (código)</h3>
        <v-simple-table dense class="mb-4">
          <template v-slot:default>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Icono</th>
                <th>Color</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in defaults" :key="cat.id">
                <td>{{ cat.name }}</td>
                <td><code>{{ cat.icon }}</code></td>
                <td>
                  <v-chip :color="cat.color" size="small">{{ cat.color }}</v-chip>
                </td>
                <td>
                  <v-icon :color="cat.color">{{ cat.icon }}</v-icon>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
        
        <h3>🏪 Store (state.categories)</h3>
        <v-simple-table dense class="mb-4">
          <template v-slot:default>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Icono</th>
                <th>Color</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in categoryStore.categories" :key="cat.id">
                <td><code>{{ cat.id }}</code></td>
                <td>{{ cat.name }}</td>
                <td><code>{{ cat.icon || cat.metadata?.icon || 'N/A' }}</code></td>
                <td>
                  <v-chip :color="cat.color || cat.metadata?.color" size="small">
                    {{ cat.color || cat.metadata?.color || 'N/A' }}
                  </v-chip>
                </td>
                <td>
                  <v-icon :color="cat.color || cat.metadata?.color">
                    {{ cat.icon || cat.metadata?.icon || 'mdi-help' }}
                  </v-icon>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
        
        <h3>🌐 Servidor (API)</h3>
        <div v-if="serverCategories.length > 0">
          <v-simple-table dense>
            <template v-slot:default>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Icono</th>
                  <th>Color</th>
                  <th>Preview</th>
                  <th>Metadata</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cat in serverCategories" :key="cat.id">
                  <td><code>{{ cat.id }}</code></td>
                  <td>{{ cat.name }}</td>
                  <td><code>{{ cat.icon || cat.metadata?.icon || 'N/A' }}</code></td>
                  <td>
                    <v-chip :color="cat.color || cat.metadata?.color" size="small">
                      {{ cat.color || cat.metadata?.color || 'N/A' }}
                    </v-chip>
                  </td>
                  <td>
                    <v-icon :color="cat.color || cat.metadata?.color">
                      {{ cat.icon || cat.metadata?.icon || 'mdi-help' }}
                    </v-icon>
                  </td>
                  <td><code>{{ JSON.stringify(cat.metadata) }}</code></td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
        <div v-else>
          <v-alert type="warning">No se pudo obtener categorías del servidor</v-alert>
        </div>
        
        <v-divider class="my-4"></v-divider>
        
        <h3>🔍 Análisis</h3>
        <v-alert v-for="(issue, i) in issues" :key="i" :type="issue.type" class="mb-2">
          {{ issue.message }}
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
  
  <!-- Botón flotante para mostrar debug -->
  <v-btn
    v-else
    fab
    fixed
    bottom
    right
    color="info"
    @click="showDebug = true"
    style="bottom: 80px; right: 16px;"
  >
    <v-icon>mdi-bug</v-icon>
  </v-btn>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { categoriesApi } from '@/api/category'

const categoryStore = useCategoryStore()
const showDebug = ref(false)
const diagnosticResult = ref(false)
const serverCategories = ref([])

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

const issues = computed(() => {
  const problems = []
  
  
  defaults.forEach(def => {
    const inStore = categoryStore.categories.find(c => 
      c.name?.toLowerCase() === def.name?.toLowerCase()
    )
    
    if (!inStore) {
      problems.push({
        type: 'warning',
        message: `❌ Categoría "${def.name}" no existe en el store`
      })
    } else {
      const storeIcon = inStore.icon || inStore.metadata?.icon
      const storeColor = inStore.color || inStore.metadata?.color
      
      if (storeIcon !== def.icon) {
        problems.push({
          type: 'error',
          message: `⚠️ "${def.name}": Icono incorrecto en store (esperado: ${def.icon}, actual: ${storeIcon})`
        })
      }
      
      if (storeColor !== def.color) {
        problems.push({
          type: 'warning',
          message: `⚠️ "${def.name}": Color incorrecto en store (esperado: ${def.color}, actual: ${storeColor})`
        })
      }
    }
  })
  
  
  defaults.forEach(def => {
    const inServer = serverCategories.value.find(c => 
      c.name?.toLowerCase() === def.name?.toLowerCase()
    )
    
    if (!inServer) {
      problems.push({
        type: 'warning',
        message: `❌ Categoría "${def.name}" no existe en el servidor`
      })
    } else {
      const serverIcon = inServer.icon || inServer.metadata?.icon
      const serverColor = inServer.color || inServer.metadata?.color
      
      if (serverIcon !== def.icon) {
        problems.push({
          type: 'error',
          message: `🌐 "${def.name}": Icono incorrecto en servidor (esperado: ${def.icon}, actual: ${serverIcon}) - ID: ${inServer.id}`
        })
      }
      
      if (serverColor !== def.color) {
        problems.push({
          type: 'warning',
          message: `🌐 "${def.name}": Color incorrecto en servidor (esperado: ${def.color}, actual: ${serverColor})`
        })
      }
    }
  })
  
  if (problems.length === 0) {
    problems.push({
      type: 'success',
      message: '✅ Todas las categorías están correctamente configuradas'
    })
  }
  
  return problems
})

async function runDiagnostic() {
  console.log('🔍 Ejecutando diagnóstico...')
  
  try {
    
    const response = await categoriesApi.getAll()
    serverCategories.value = response.items || []
    
    console.log('📊 Resultados:')
    console.log('  - Defaults:', defaults.length)
    console.log('  - Store:', categoryStore.categories.length)
    console.log('  - Servidor:', serverCategories.value.length)
    
    diagnosticResult.value = true
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error)
    serverCategories.value = []
    diagnosticResult.value = true
  }
}

async function forceUpdate() {
  console.log('🔄 Forzando actualización de categorías...')
  
  try {
    await categoryStore.init()
    await runDiagnostic()
    alert('✅ Actualización completada. Revisa los resultados abajo.')
  } catch (error) {
    console.error('❌ Error en actualización:', error)
    alert('❌ Error al actualizar: ' + error.message)
  }
}

function clearLocalStorage() {
  if (confirm('¿Seguro que quieres limpiar localStorage de categorías? Se volverán a crear al refrescar.')) {
    localStorage.removeItem('listio:categories')
    console.log('🗑️ localStorage limpiado')
    alert('✅ localStorage limpiado. Refresca la página.')
  }
}
</script>
