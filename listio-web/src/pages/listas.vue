<template>
  <div class="lists-page">
    <!-- Page Header -->
    <v-container>
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Mis Listas
        </h1>
        
        <SearchBar
          v-model="searchQuery"
          placeholder="Buscar listas..."
        />
      </div>

      <!-- Shopping Lists Grid -->
      <div class="lists-grid mb-8">
        <ListCard
          v-for="list in filteredLists"
          :key="list.id"
          :list="list"
          @click="openList(list)"
          @edit="editList"
          @share="shareList"
          @delete="deleteList"
        />
      </div>

      <!-- Empty States -->
      <EmptyState
        v-if="filteredLists.length === 0 && !searchQuery"
        icon="mdi-format-list-bulleted"
        title="No tienes listas aún"
        description="Crea tu primera lista de compras"
        action-text="Crear Lista"
        @action="openNewListDialog"
      />

      <EmptyState
        v-else-if="filteredLists.length === 0 && searchQuery"
        icon="mdi-magnify"
        title="No se encontraron listas"
        description="Intenta con otros términos de búsqueda"
      />

      <!-- Pagination -->
      <div class="text-center mt-6" v-if="totalPages > 1">
        <span class="text-body-2 text-grey-darken-1">
          Frame {{ currentPage }}
        </span>
      </div>
    </v-container>

    <!-- Floating Action Button -->
    <v-btn
      color="success"
      size="large"
      icon
      class="new-list-fab"
      elevation="8"
      @click="openNewListDialog"
    >
      <v-icon size="24">mdi-plus</v-icon>
    </v-btn>

    <!-- New List Dialog -->
    <NewItemDialog
      v-model="newListDialog"
      v-model:form-data="newListForm"
      title="Nueva Lista"
      submit-text="Crear Lista"
      :fields="listFields"
      @submit="createNewList"
      @cancel="newListDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ListCard from '@/components/ListCard.vue'
import SearchBar from '@/components/SearchBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import NewItemDialog from '@/components/NewItemDialog.vue'

const router = useRouter()

// Reactive data
const searchQuery = ref('')
const newListDialog = ref(false)
const currentPage = ref(1)

// Form configuration for new list dialog
const listFields = [
  {
    key: 'name',
    label: 'Nombre de la lista',
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

const newListForm = ref({
  name: '',
  description: ''
})

// Sample data
const shoppingLists = ref([
  {
    id: 1,
    name: 'Supermercado',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    itemCount: 8,
    completedItems: 3,
    lastUpdated: new Date('2025-09-27')
  },
  {
    id: 2,
    name: 'Verdulería',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
    itemCount: 5,
    completedItems: 5,
    lastUpdated: new Date('2025-09-26')
  },
  {
    id: 3,
    name: 'Farmacia',
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=300&fit=crop',
    itemCount: 3,
    completedItems: 1,
    lastUpdated: new Date('2025-09-25')
  }
])

// Computed properties
const filteredLists = computed(() => {
  if (!searchQuery.value) return shoppingLists.value
  
  return shoppingLists.value.filter(list =>
    list.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredLists.value.length / 10)
})

// Methods
const openList = (list) => {
  // Navigate to list detail (to be implemented)
  // console.log('Opening list:', list.name)
  router.push("/mi-lista")
}

const editList = (list) => {
  console.log('Editing list:', list.name)
  // Open edit dialog or navigate to edit page
}

const shareList = (list) => {
  console.log('Sharing list:', list.name)
  // Implement share functionality
}

const deleteList = (list) => {
  const index = shoppingLists.value.findIndex(l => l.id === list.id)
  if (index > -1) {
    shoppingLists.value.splice(index, 1)
  }
}

const openNewListDialog = () => {
  newListDialog.value = true
}

const createNewList = (formData) => {
  const newList = {
    id: Date.now(),
    name: formData.name.trim(),
    description: formData.description?.trim() || '',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    itemCount: 0,
    completedItems: 0,
    lastUpdated: new Date()
  }
  
  shoppingLists.value.unshift(newList)
  newListDialog.value = false
  console.log('Created new list:', newList.name)
}

onMounted(() => {
  // Initialize component
})
</script>

<style scoped>
.lists-page {
  padding-top: 2rem;
  padding-bottom: 6rem;
  min-height: calc(100vh - 80px);
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

.new-list-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}
</style>
