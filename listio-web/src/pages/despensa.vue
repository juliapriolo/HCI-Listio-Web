<template>
  <div class="pantry-page">
    <v-container>
      <!-- Page Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold text-grey-darken-3">
            Despensa
          </h1>
        </div>
        
        <div class="d-flex align-center gap-2">
          <v-btn
            icon="mdi-plus"
            variant="elevated"
            color="success"
            @click="openAddItemDialog"
          />
        </div>
      </div>


      <!-- Error Alert -->
      <v-alert
        v-if="pantryStore.error"
        type="warning"
        variant="tonal"
        closable
        @click:close="pantryStore.error = null"
        class="mb-4"
      >
        {{ pantryStore.error }}
      </v-alert>

      <!-- Categories Tabs -->
      <v-tabs
        v-model="selectedCategory"
        color="success"
        class="mb-6"
      >
        <v-tab value="all">Todos</v-tab>
        <v-tab value="available">Disponible</v-tab>
        <v-tab value="low">Poco Stock</v-tab>
        <v-tab value="expired">Por Vencer</v-tab>
      </v-tabs>

      <!-- Pantry Items Grid -->
      <v-row>
        <v-col
          v-for="item in filteredPantryItems"
          :key="item.id"
          cols="12"
          sm="6"
          md="4"
        >
          <PantryItemCard
            :item="item"
            @edit="editItem"
            @delete="deleteItem"
            @add-quantity="addQuantity"
            @remove-quantity="removeQuantity"
          />
        </v-col>
      </v-row>

      <!-- Empty State -->
      <EmptyState
        v-if="filteredPantryItems.length === 0"
        icon="mdi-archive-outline"
        title="Tu despensa está vacía"
        description="Comienza agregando productos a tu despensa"
        action-text="Agregar Producto"
        @action="openAddItemDialog"
      />
    </v-container>

    <!-- Add/Edit Item Dialog -->
    <NewItemDialog
      v-model="itemDialog"
      v-model:form-data="itemForm"
      :title="editingItem ? 'Editar Producto' : 'Agregar Producto'"
      :submit-text="editingItem ? 'Actualizar' : 'Agregar'"
      :fields="itemFields"
      @submit="saveItem"
      @cancel="itemDialog = false"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePantryStore } from '@/stores/pantry'
import PantryItemCard from '@/components/PantryItemCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import NewItemDialog from '@/components/NewItemDialog.vue'

// Reactive data
const selectedCategory = ref('all')
const itemDialog = ref(false)
const editingItem = ref(null)

// Form configuration for pantry items
const itemFields = [
  {
    key: 'name',
    label: 'Nombre del producto',
    type: 'text',
    required: true,
    autofocus: true
  },
  {
    key: 'category',
    label: 'Categoría',
    type: 'select',
    required: true,
    options: ['Granos', 'Lácteos', 'Aceites', 'Enlatados', 'Especias', 'Otros']
  },
  {
    key: 'quantity',
    label: 'Cantidad',
    type: 'number',
    required: true
  },
  {
    key: 'unit',
    label: 'Unidad',
    type: 'select',
    required: true,
    options: ['kg', 'L', 'unidad', 'gr', 'ml', 'paquete', 'lata']
  },
  {
    key: 'expiryDate',
    label: 'Fecha de vencimiento',
    type: 'date',
    required: false
  }
]

const itemForm = ref({
  name: '',
  category: '',
  quantity: '',
  unit: '',
  expiryDate: ''
})

// Use pantry store
const pantryStore = usePantryStore()

const samplePantries = [
  {
    id: 1,
    name: 'Despensa Principal',
    description: 'Mi despensa principal de casa',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Despensa de Emergencia',
    description: 'Productos para emergencias',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const samplePantry = [
  {
    id: 1,
    name: 'Arroz',
    category: 'Granos',
    quantity: 2,
    unit: 'kg',
    expiryDate: '2025-12-31',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=100&h=100&fit=crop'
  },
  {
    id: 2,
    name: 'Aceite de Oliva',
    category: 'Aceites',
    quantity: 1,
    unit: 'L',
    expiryDate: '2025-10-15',
    status: 'low',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&h=100&fit=crop'
  },
  {
    id: 3,
    name: 'Leche',
    category: 'Lácteos',
    quantity: 0.5,
    unit: 'L',
    expiryDate: '2025-09-30',
    status: 'expired',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop'
  }
]

// Computed properties
const filteredPantryItems = computed(() => {
  const items = pantryStore.items
  if (selectedCategory.value === 'all') return items
  
  return items.filter(item => item.status === selectedCategory.value)
})

// Methods
const openAddItemDialog = () => {
  editingItem.value = null
  itemForm.value = {
    name: '',
    category: '',
    quantity: '',
    unit: '',
    expiryDate: ''
  }
  itemDialog.value = true
}

const editItem = (item) => {
  editingItem.value = item
  itemForm.value = { ...item }
  itemDialog.value = true
}

const deleteItem = async (item) => {
  try {
    // Use first pantry ID or fallback to local delete
    const pantryId = pantryStore.pantries.length > 0 ? pantryStore.pantries[0].id : null
    if (pantryId) {
      await pantryStore.deleteItemRemote(pantryId, item.id)
    } else {
      pantryStore.deleteItem(item.id)
    }
  } catch (error) {
    console.error('Error deleting item:', error)
    // Fallback to local delete if API fails
    pantryStore.deleteItem(item.id)
  }
}

const addQuantity = async (item) => {
  const existing = pantryStore.byId(item.id)
  if (existing) {
    try {
      const pantryId = pantryStore.pantries.length > 0 ? pantryStore.pantries[0].id : null
      if (pantryId) {
        await pantryStore.updateItemRemote(pantryId, item.id, { quantity: existing.quantity + 1 })
      } else {
        pantryStore.updateItem(item.id, { quantity: existing.quantity + 1 })
      }
      updateItemStatus(pantryStore.byId(item.id))
    } catch (error) {
      console.error('Error updating quantity:', error)
      // Fallback to local update if API fails
      pantryStore.updateItem(item.id, { quantity: existing.quantity + 1 })
      updateItemStatus(pantryStore.byId(item.id))
    }
  }
}

const removeQuantity = async (item) => {
  const existing = pantryStore.byId(item.id)
  if (existing && existing.quantity > 0) {
    try {
      const pantryId = pantryStore.pantries.length > 0 ? pantryStore.pantries[0].id : null
      if (pantryId) {
        await pantryStore.updateItemRemote(pantryId, item.id, { quantity: existing.quantity - 1 })
      } else {
        pantryStore.updateItem(item.id, { quantity: existing.quantity - 1 })
      }
      updateItemStatus(pantryStore.byId(item.id))
    } catch (error) {
      console.error('Error updating quantity:', error)
      // Fallback to local update if API fails
      pantryStore.updateItem(item.id, { quantity: existing.quantity - 1 })
      updateItemStatus(pantryStore.byId(item.id))
    }
  }
}

const updateItemStatus = (item) => {
  // Update status based on quantity and expiry date
  const today = new Date()
  const expiry = item.expiryDate ? new Date(item.expiryDate) : null
  const daysUntilExpiry = expiry ? Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)) : null
  
  let newStatus = 'available'
  if (daysUntilExpiry !== null && daysUntilExpiry < 0) {
    newStatus = 'expired'
  } else if (item.quantity <= 1) {
    newStatus = 'low'
  } else {
    newStatus = 'available'
  }

  // Persist status change if the item exists in the store
  if (item && item.id && pantryStore.byId(item.id)) {
    pantryStore.updateItem(item.id, { status: newStatus })
  } else if (item) {
    // for transient/new objects, just set the property so callers can add it
    item.status = newStatus
  }
}

// Load persisted pantry and seed sample data on first run
onMounted(async () => {
  try {
    // Try to fetch pantries from API first
    await pantryStore.fetchPantriesRemote()
  } catch (error) {
    console.log('API not available, loading from localStorage')
    pantryStore.load()
  }
  
  // Seed sample data if no pantries exist
  if (!pantryStore.pantries || pantryStore.pantries.length === 0) {
    pantryStore.seed(samplePantries, samplePantry)
  }
  
  // Load items for the first pantry (if any)
  if (pantryStore.pantries.length > 0) {
    try {
      await pantryStore.fetchPantryItemsRemote(pantryStore.pantries[0].id)
    } catch (error) {
      console.log('API not available for items, using local data')
    }
  }
})

const saveItem = async (formData) => {
  const itemData = {
    ...formData,
    quantity: parseFloat(formData.quantity) || 0,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=100&h=100&fit=crop'
  }
  
  try {
    const pantryId = pantryStore.pantries.length > 0 ? pantryStore.pantries[0].id : null
    
    if (editingItem.value) {
      // Update existing item
      if (pantryId) {
        await pantryStore.updateItemRemote(pantryId, editingItem.value.id, itemData)
      } else {
        pantryStore.updateItem(editingItem.value.id, itemData)
      }
      updateItemStatus(pantryStore.byId(editingItem.value.id))
    } else {
      // Add new item
      itemData.id = Date.now()
      updateItemStatus(itemData)
      if (pantryId) {
        await pantryStore.createItemRemote(pantryId, itemData)
      } else {
        pantryStore.addItem(itemData)
      }
    }
  } catch (error) {
    console.error('Error saving item:', error)
    // Fallback to local operations if API fails
    if (editingItem.value) {
      pantryStore.updateItem(editingItem.value.id, itemData)
      updateItemStatus(pantryStore.byId(editingItem.value.id))
    } else {
      itemData.id = Date.now()
      updateItemStatus(itemData)
      pantryStore.addItem(itemData)
    }
  }
  
  itemDialog.value = false
}


</script>

<style scoped>
.pantry-page {
  padding-top: 2rem;
  padding-bottom: 2rem;
  min-height: calc(100vh - 80px);
  background-color: #fafafa;
}
</style>