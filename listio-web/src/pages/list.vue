<template>
  <div class="lists-page">
    <!-- Page Header -->
    <v-container>
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Mi Lista: Supermercado
        </h1>
        
        <div class="header-actions">
          <v-btn
            icon
            variant="text"
            class="action-btn"
            size="large"
            @click="openFilterDialog"
          >
            <v-icon color="grey-darken-2">mdi-filter-outline</v-icon>
          </v-btn>

          <v-btn
            icon
            variant="text"
            class="action-btn"
            size="large"
            @click="openShareListDialog"
          >
            <v-icon color="grey-darken-2">mdi-export-variant</v-icon>
          </v-btn>

          <div class="search-wrapper">
            <SearchBar
              v-model="searchQuery"
              placeholder="Buscar productos..."
            />
          </div>
        </div>
      </div>

      <!-- Shopping List -->
      <div class="lists-grid mb-8">
        <div class="list">
          <ul class="list-items">
            <li v-for="item in filteredItems" :key="item.name">
              <div 
                class="list-row" 
                >
                <img src="/icons8-apple-64.png" alt="Manzana" class="category-logo" />

                <div>
                  <h3 class="item-descr">{{ item.name }}</h3>
                  <p class="text-caption text-grey-darken-2">{{ item.category }}</p>
                </div>

                <div class="item-buttons">
                  <v-checkbox
                    v-model="item.checked"
                    :ripple="false"
                    color="black"
                    base-color="black"
                    hide-details
                  />
                  <v-btn 
                    icon 
                    variant="plain"
                    style="background-color: transparent;"
                    @click="openEditDialog(item)"
                  >
                    <v-icon color="black">mdi-dots-horizontal</v-icon>
                  </v-btn>
                </div>
              </div>
              <v-divider thickness="2px"/>
            </li>
          </ul>
        </div>
      </div>

      <!-- Empty States -->
      <EmptyState
        v-if="filteredItems.length === 0 && !searchQuery"
        icon="mdi-format-list-bulleted"
        title="Lista vacía"
        description="Agrega tus primeros productos"
        action-text="Agregar producto"
        @action="openNewItemDialog"
      />

      <EmptyState
        v-else-if="filteredItems.length === 0 && searchQuery"
        icon="mdi-magnify"
        title="No se encontraron productos"
        description="Intenta con otros términos de búsqueda"
      />
    </v-container>

    <!-- Floating Action Button -->
    <v-btn
      color="success"
      size="large"
      icon
      class="new-item-fab"
      elevation="8"
      @click="openNewItemDialog"
    >
      <v-icon size="24">mdi-plus</v-icon>
    </v-btn>

    <!-- Dialogs -->
    <NewItemDialog
      v-model="newItemDialog"
      v-model:form-data="newItemForm"
      title="Agregar Item"
      submit-text="Confirmar"
      :fields="addItemFields"
      @submit="addItem"
      @cancel="newItemDialog = false"
    />

    <ItemMenuDialog
      v-model="itemMenuDialog"
      :item="selectedItem"
      :categories="categories"
      @update="updateItem"
      @delete="deleteItem"
      @cancel="itemMenuDialog = false"
    />

    <NewItemDialog
      v-model="shareListDialog"
      v-model:form-data="newItemForm"
      title="Compartir Lista"
      submit-text="Confirmar"
      :fields="shareListFields"
      @submit="shareList"
      @cancel="shareListDialog = false"
    />

    <FilterList
      v-model="filterDialog"
      :filters="filters"
      :categories="categories"
      @apply="applyFilters"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import NewItemDialog from '@/components/NewItemDialog.vue'
import ItemMenuDialog from '@/components/ItemMenuDialog.vue'

// Datos iniciales de ejemplo
const items = ref([
  { id: 1, name: "Manzanas", category: "Frutas", checked: true },
  { id: 2, name: "Pan", category: "Despensa", checked: true },
  { id: 3, name: "Leche", category: "Lácteos", checked: false },
  { id: 4, name: "Aceite", category: "Despensa", checked: false },
  { id: 5, name: "Yogur", category: "Lácteos", checked: false }
])

const searchQuery = ref('')
const newItemDialog = ref(false)
const itemMenuDialog = ref(false)
const selectedItem = ref(null)
const shareListDialog = ref(false)
const filterDialog = ref(false)

const newItemForm = ref({
  name: '',
  description: ''
})

const filters = ref({
  name: '',
  category: ''
})


const addItemFields = [
  {
    key: 'name',
    label: 'Producto',
    type: 'text',
    required: true,
    autofocus: true
  },
  {
    key: 'description',
    label: 'Descripción (opcional)',
    type: 'textarea',
    required: false
  }
]

const shareListFields = [
  {
    key: 'name',
    label: 'Destinatario',
    type: 'text',
    required: true,
    autofocus: true
  },
  {
    key: 'description',
    label: 'Descripción (opcional)',
    type: 'textarea',
    required: false
  }
]

// Computed
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  return items.value.filter(i =>
    i.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Métodos
const openNewItemDialog = () => {
  newItemForm.value = { name: '', description: '' }
  newItemDialog.value = true
}

const openEditDialog = (item) => {
  selectedItem.value = { ...item }
  itemMenuDialog.value = true
}

const openShareListDialog = () => {
  shareListDialog.value = true
}

const openFilterDialog = () => {
  filterDialog.value = true
}

const addItem = (formData) => {
  if (!formData.name) return
  items.value.push({
    id: Date.now(),
    name: formData.name,
    category: "Sin categoría",
    checked: false
  })
  newItemDialog.value = false
}

const updateItem = (updated) => {
  const index = items.value.findIndex(i => i.id === updated.id)
  if (index !== -1) {
    items.value[index] = { ...updated }
  }
  itemMenuDialog.value = false
}

const deleteItem = (item) => {
  items.value = items.value.filter(i => i.id !== item.id)
  itemMenuDialog.value = false
}

const shareList = (list) => {
  //TODO
  console.log("Shared")
}

const applyFilters = (appliedFilters) => {
  filters.value = { ...appliedFilters }
}
</script>

<style scoped>
.lists-page {
  padding-top: 2rem;
  padding-bottom: 6rem;
  height: calc(100vh - 80px);
  background-color: #fafafa;
}

.lists-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .lists-grid {
    max-width: 800px;
  }
}

.new-item-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.list {
  width: 100%;
  margin-top: 15px;
  border-radius: 8px;
}

.list-items {
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  overflow-y: auto;
  background-color: #c5eabd;
  border-radius: 8px;
}

.list-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 60px;
  margin-left: 30px;
  gap: 30px;
}

.item-descr {
  font-family: 'Arial';
  color: black;
  font-weight: lighter;
}

.item-buttons {
  display: flex;
  flex-direction: row;
  margin-left: auto;
  margin-right: 30px;
  align-items: center;
  justify-content: center;
  padding: 6px;
  gap: 30px;
}

.category-logo {
  width: 26px;
  height: auto;
}

.header-actions {
  display: flex;
  align-items:center;
}

.action-btn {
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content:center;
  transition: background-color 0.2s ease;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.search-wrapper {
  display: flex;
  align-items: center;
}

@media (max-width: 600px) {
  .search-wrapper {
    width: 160px;
  }
}
</style>