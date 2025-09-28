<template>
  <div class="pantry-page">
    <v-container>
      <!-- Page Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Despensa
        </h1>
        
        <v-btn
          icon="mdi-plus"
          variant="elevated"
          color="success"
          @click="openAddItemDialog"
        />
      </div>

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
import { ref, computed } from 'vue'
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

// Sample pantry data
const pantryItems = ref([
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
])

// Computed properties
const filteredPantryItems = computed(() => {
  if (selectedCategory.value === 'all') return pantryItems.value
  
  return pantryItems.value.filter(item => item.status === selectedCategory.value)
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

const deleteItem = (item) => {
  const index = pantryItems.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    pantryItems.value.splice(index, 1)
  }
}

const addQuantity = (item) => {
  const index = pantryItems.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    pantryItems.value[index].quantity += 1
    updateItemStatus(pantryItems.value[index])
  }
}

const removeQuantity = (item) => {
  const index = pantryItems.value.findIndex(i => i.id === item.id)
  if (index > -1 && pantryItems.value[index].quantity > 0) {
    pantryItems.value[index].quantity -= 1
    updateItemStatus(pantryItems.value[index])
  }
}

const updateItemStatus = (item) => {
  // Update status based on quantity and expiry date
  const today = new Date()
  const expiry = item.expiryDate ? new Date(item.expiryDate) : null
  const daysUntilExpiry = expiry ? Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)) : null
  
  if (daysUntilExpiry !== null && daysUntilExpiry < 0) {
    item.status = 'expired'
  } else if (item.quantity <= 1) {
    item.status = 'low'
  } else {
    item.status = 'available'
  }
}

const saveItem = (formData) => {
  const itemData = {
    ...formData,
    quantity: parseFloat(formData.quantity) || 0,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=100&h=100&fit=crop'
  }
  
  if (editingItem.value) {
    // Update existing item
    const index = pantryItems.value.findIndex(i => i.id === editingItem.value.id)
    if (index > -1) {
      pantryItems.value[index] = { ...pantryItems.value[index], ...itemData }
      updateItemStatus(pantryItems.value[index])
    }
  } else {
    // Add new item
    itemData.id = Date.now()
    updateItemStatus(itemData)
    pantryItems.value.push(itemData)
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