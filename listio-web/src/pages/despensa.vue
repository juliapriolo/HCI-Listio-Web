<template>
  <div class="pantry-page">
    <v-container>
      <!-- Page Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          {{ currentView === 'categories' ? 'Despensa' : selectedCategory?.name || 'Productos' }}
        </h1>
        
        <div class="header-actions">
          <div class="search-wrapper">
            <SearchBar
              v-model="searchQuery"
              :placeholder="currentView === 'categories' ? 'Buscar categorías...' : 'Buscar productos...'"
            />
          </div>
          
          <!-- Filter and Share buttons (only in products view) -->
          <template v-if="currentView === 'products'">
            <v-btn
              icon="mdi-filter-outline"
              variant="text"
              class="action-btn"
              size="large"
              @click="openFilterDialog"
            >
              <v-icon color="grey-darken-2">mdi-filter-outline</v-icon>
            </v-btn>

            <v-btn
              icon="mdi-export-variant"
              variant="text"
              class="action-btn"
              size="large"
              @click="openShareDialog"
            >
              <v-icon color="grey-darken-2">mdi-export-variant</v-icon>
            </v-btn>
          </template>
        </div>
      </div>

      <!-- Back Button (only in products view) -->
      <div v-if="currentView === 'products'" class="mb-4">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          color="grey-darken-3"
          @click="goBackToCategories"
          class="back-btn"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
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


      <!-- Categories View -->
      <div v-if="currentView === 'categories'">
        <!-- Categories Grid -->
        <div class="categories-grid">
          <v-card
            v-for="category in filteredCategories"
            :key="category.id"
            class="category-card"
            elevation="2"
          >
            <div class="category-content" @click="openCategory(category)">
              <div class="category-image">
                <img 
                  v-if="category.image" 
                  :src="category.image" 
                  :alt="category.name" 
                />
                <div v-else class="image-placeholder">
                  <v-icon size="32" color="grey-lighten-1">mdi-image</v-icon>
                </div>
              </div>
              <div class="category-info">
                <h3 class="category-title">{{ category.name }}</h3>
              </div>
            </div>
            
            <!-- Menu Button -->
            <div class="category-menu">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                    color="grey-darken-2"
                    v-bind="props"
                    @click.stop
                  />
                </template>
                <v-list>
                  <v-list-item @click="editCategory(category)">
                    <template v-slot:prepend>
                      <v-icon>mdi-pencil</v-icon>
                    </template>
                    <v-list-item-title>Editar</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="confirmDeleteCategory(category)">
                    <template v-slot:prepend>
                      <v-icon color="error">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>Eliminar</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-card>
        </div>

        <!-- Empty State -->
        <EmptyState
          v-if="filteredCategories.length === 0 && !searchQuery"
          icon="mdi-archive-outline"
          title="No tienes categorías creadas"
          description="Comienza agregando categorías a tu despensa"
        />
        
        <EmptyState
          v-else-if="filteredCategories.length === 0 && searchQuery"
          icon="mdi-magnify"
          title="No se encontraron categorías"
          description="Intenta con otros términos de búsqueda"
        />
      </div>

      <!-- Products View -->
      <div v-else-if="currentView === 'products'">
        <!-- Loading State -->
        <div v-if="loadingItems" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-2 text-grey">Cargando productos...</p>
        </div>

        <!-- Products Grid -->
        <div v-else-if="filteredProducts.length > 0" class="products-grid">
          <PantryItemCard
            v-for="item in filteredProducts"
            :key="item.id"
            :item="item"
            @delete="deleteItem"
            @add-quantity="addQuantity"
            @remove-quantity="removeQuantity"
            @save="saveItem"
          />
        </div>

      <!-- Empty State -->
      <EmptyState
          v-else-if="!searchQuery"
          icon="mdi-package-variant"
          title="No hay productos en esta despensa"
        description="Comienza agregando productos a tu despensa"
        />
        
        <EmptyState
          v-else
          icon="mdi-magnify"
          title="No se encontraron productos"
          description="Intenta con otros términos de búsqueda"
        />
      </div>
    </v-container>

    <!-- Add/Edit Category Dialog -->
    <NewItemDialog
      v-model="categoryDialog"
      v-model:form-data="categoryForm"
      :title="editingCategory ? 'Editar Categoría' : 'Agregar Categoría'"
      :submit-text="editingCategory ? 'Actualizar' : 'Agregar'"
      :fields="categoryFields"
      @submit="saveCategory"
      @cancel="categoryDialog = false"
    />

    <!-- Add/Edit Product Dialog -->
    <NewItemDialog
      v-model="productDialog"
      v-model:form-data="productForm"
      :title="editingProduct ? 'Editar Producto' : 'Agregar Producto'"
      :submit-text="editingProduct ? 'Actualizar' : 'Agregar'"
      :fields="productFields"
      @submit="saveProduct"
      @cancel="productDialog = false"
    />

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Confirmar eliminación
        </v-card-title>
        <v-card-text>
          ¿Estás seguro de que quieres eliminar la despensa "{{ categoryToDelete?.name }}"? 
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog = false">
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteCategory"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Filter Dialog -->
    <v-dialog v-model="filterDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          Filtrar productos
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="filterStatus"
            :items="statusOptions"
            label="Estado del producto"
            variant="outlined"
            clearable
          />
          <v-select
            v-model="filterCategory"
            :items="categoryOptions"
            label="Categoría"
            variant="outlined"
            clearable
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="clearFilters">
            Limpiar filtros
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="applyFilters"
          >
            Aplicar filtros
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Share Dialog -->
    <v-dialog v-model="shareDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Compartir despensa
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="shareEmail"
            label="Correo electrónico"
            type="email"
            variant="outlined"
            placeholder="usuario@ejemplo.com"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="shareDialog = false">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="sharePantry"
            :disabled="!shareEmail"
          >
            Compartir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Floating Action Button -->
    <v-btn
      color="success"
      size="large"
      icon
      class="new-category-fab"
      elevation="8"
      @click="currentView === 'categories' ? openAddCategoryDialog() : openAddProductDialog()"
    >
      <v-icon size="24">mdi-plus</v-icon>
    </v-btn>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePantryStore } from '@/stores/pantry'
import PantryItemCard from '@/components/PantryItemCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import NewItemDialog from '@/components/NewItemDialog.vue'
import SearchBar from '@/components/SearchBar.vue'

// Reactive data
const categoryDialog = ref(false)
const editingCategory = ref(null)
const productDialog = ref(false)
const editingProduct = ref(null)
const deleteDialog = ref(false)
const categoryToDelete = ref(null)
const filterDialog = ref(false)
const shareDialog = ref(false)
const currentView = ref('categories') // 'categories' or 'products'
const selectedCategory = ref(null)
const pantryItems = ref([])
const loadingItems = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const filterCategory = ref('')
const shareEmail = ref('')

// Form data
const categoryForm = ref({
  name: '',
  image: ''
})

const productForm = ref({
  name: '',
  quantity: 1,
  expiryDate: '',
  category: ''
})

// Categories data
const categories = ref([
  {
    id: 1,
    name: 'Limpieza',
    image: '',
    itemCount: 5
  },
  {
    id: 2,
    name: 'Bebidas',
    image: '',
    itemCount: 8
  }
])

// Form configuration for categories
const categoryFields = [
  {
    key: 'name',
    label: 'Nombre de la categoría',
    type: 'text',
    required: true,
    autofocus: true
  },
  {
    key: 'image',
    label: 'Imagen de la categoría',
    type: 'file',
    required: false,
    accept: 'image/*'
  }
]

// Form configuration for products
const productFields = [
  {
    key: 'name',
    label: 'Nombre del producto',
    type: 'text',
    required: true,
    autofocus: true
  },
  {
    key: 'quantity',
    label: 'Cantidad',
    type: 'number',
    required: true,
    default: 1
  },
  {
    key: 'expiryDate',
    label: 'Fecha de vencimiento',
    type: 'date',
    required: false
  },
  {
    key: 'category',
    label: 'Categoría',
    type: 'text',
    required: false
  }
]

// Filter options
const statusOptions = [
  { title: 'Disponible', value: 'available' },
  { title: 'Poco stock', value: 'low' },
  { title: 'Por vencer', value: 'expiring' },
  { title: 'Vencido', value: 'expired' }
]

const categoryOptions = computed(() => {
  const categories = [...new Set(pantryItems.value.map(item => item.category).filter(Boolean))]
  return categories.map(cat => ({ title: cat, value: cat }))
})

// Use pantry store
const pantryStore = usePantryStore()

// Computed properties for filtering
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  return categories.value.filter(category =>
    category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredProducts = computed(() => {
  let filtered = pantryItems.value

  // Apply search filter
  if (searchQuery.value) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Apply status filter
  if (filterStatus.value) {
    filtered = filtered.filter(item => {
      const status = getItemStatus(item)
      return status === filterStatus.value
    })
  }

  // Apply category filter
  if (filterCategory.value) {
    filtered = filtered.filter(item => item.category === filterCategory.value)
  }

  return filtered
})


// Methods
const openAddCategoryDialog = () => {
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    image: ''
  }
  categoryDialog.value = true
}

const openAddProductDialog = () => {
  editingProduct.value = null
  productForm.value = {
    name: '',
    quantity: 1,
    expiryDate: '',
    category: ''
  }
  productDialog.value = true
}

const editCategory = (category) => {
  editingCategory.value = category
  categoryForm.value = { ...category }
  categoryDialog.value = true
}

const confirmDeleteCategory = (category) => {
  categoryToDelete.value = category
  deleteDialog.value = true
}

const deleteCategory = async () => {
  if (!categoryToDelete.value) return
  
  try {
    await pantryStore.deletePantryRemote(categoryToDelete.value.id)
    
    // Remove from local categories
    const index = categories.value.findIndex(c => c.id === categoryToDelete.value.id)
    if (index > -1) {
      categories.value.splice(index, 1)
      localStorage.setItem('listio:categories', JSON.stringify(categories.value))
    }
    
    console.log('Category deleted successfully')
  } catch (error) {
    console.error('Failed to delete category:', error)
    
    // Fallback: delete locally
    const index = categories.value.findIndex(c => c.id === categoryToDelete.value.id)
    if (index > -1) {
      categories.value.splice(index, 1)
      localStorage.setItem('listio:categories', JSON.stringify(categories.value))
    }
  } finally {
    deleteDialog.value = false
    categoryToDelete.value = null
  }
}

const saveCategory = async (formData) => {
  let imageData = ''
  
  // Handle image file if provided
  if (formData.image && formData.image instanceof File) {
    imageData = await convertFileToBase64(formData.image)
  }
  
  if (editingCategory.value) {
    // Update existing category
    try {
      const pantryData = {
        name: formData.name,
        metadata: {
          image: imageData || editingCategory.value.image,
          type: 'category',
          itemCount: editingCategory.value.itemCount || 0
        }
      }
      
      await pantryStore.updatePantryRemote(editingCategory.value.id, pantryData)
      
      // Update local categories
      const index = categories.value.findIndex(c => c.id === editingCategory.value.id)
      if (index > -1) {
        categories.value[index] = {
          ...categories.value[index],
          name: formData.name,
          image: imageData || categories.value[index].image
        }
      }
      
    } catch (error) {
      console.error('Failed to update category via API, using local fallback:', error)
      
      // Fallback: update locally
      const index = categories.value.findIndex(c => c.id === editingCategory.value.id)
      if (index > -1) {
        categories.value[index] = {
          ...categories.value[index],
          name: formData.name,
          image: imageData || categories.value[index].image
        }
      }
    }
  } else {
    // Add new category using API endpoint /api/pantries
    try {
      const pantryData = {
        name: formData.name,
        metadata: {
          image: imageData,
          type: 'category',
          itemCount: 0
        }
      }
      
      // Try to create pantry via API
      const newPantry = await pantryStore.createPantryRemote(pantryData)
      
      // Add to local categories for display
      const newCategory = {
        id: newPantry.id,
        name: formData.name,
        image: imageData,
        itemCount: 0
      }
      categories.value.push(newCategory)
      
    } catch (error) {
      console.error('Failed to create pantry via API, using local fallback:', error)
      
      // Fallback: Add locally
      const newCategory = {
        id: Date.now(),
        name: formData.name,
        image: imageData,
        itemCount: 0
      }
      categories.value.push(newCategory)
    }
  }
  
  // Save to localStorage
  localStorage.setItem('listio:categories', JSON.stringify(categories.value))
  
  categoryDialog.value = false
}

const saveProduct = async (formData) => {
  if (!selectedCategory.value) return
  
  try {
    const newProduct = await pantryStore.createItemRemote(selectedCategory.value.id, formData)
    pantryItems.value.unshift(newProduct)
    
    // Update category item count
    const categoryIndex = categories.value.findIndex(c => c.id === selectedCategory.value.id)
    if (categoryIndex > -1) {
      categories.value[categoryIndex].itemCount += 1
      localStorage.setItem('listio:categories', JSON.stringify(categories.value))
    }
    
  } catch (error) {
    console.error('Failed to create product via API, using local fallback:', error)
    
    // Fallback: Add locally
    const newProduct = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString()
    }
    pantryItems.value.unshift(newProduct)
    
    // Update category item count
    const categoryIndex = categories.value.findIndex(c => c.id === selectedCategory.value.id)
    if (categoryIndex > -1) {
      categories.value[categoryIndex].itemCount += 1
      localStorage.setItem('listio:categories', JSON.stringify(categories.value))
    }
  }
  
  productDialog.value = false
}

// Helper function to convert file to base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

const openCategory = async (category) => {
  console.log('Opening category:', category.name)
  selectedCategory.value = category
  currentView.value = 'products'
  
  // Load items for this pantry/category
  loadingItems.value = true
  try {
    await pantryStore.fetchPantryItemsRemote(category.id)
    pantryItems.value = pantryStore.items
  } catch (error) {
    console.error('Failed to load pantry items:', error)
    pantryItems.value = []
  } finally {
    loadingItems.value = false
  }
}

const goBackToCategories = () => {
  currentView.value = 'categories'
  selectedCategory.value = null
  pantryItems.value = []
}

// Product management functions
const deleteItem = async (itemId) => {
  if (!selectedCategory.value) return
  
  try {
    await pantryStore.deleteItemRemote(selectedCategory.value.id, itemId)
    pantryItems.value = pantryItems.value.filter(item => item.id !== itemId)
  } catch (error) {
    console.error('Failed to delete item:', error)
    // Fallback: delete locally
    pantryItems.value = pantryItems.value.filter(item => item.id !== itemId)
  }
}

const addQuantity = async (itemId) => {
  if (!selectedCategory.value) return
  
  const item = pantryItems.value.find(i => i.id === itemId)
  if (!item) return
  
  const updatedItem = { ...item, quantity: (item.quantity || 0) + 1 }
  
  try {
    await pantryStore.updateItemRemote(selectedCategory.value.id, itemId, { quantity: updatedItem.quantity })
    const index = pantryItems.value.findIndex(i => i.id === itemId)
    if (index > -1) {
      pantryItems.value[index] = updatedItem
    }
  } catch (error) {
    console.error('Failed to update item quantity:', error)
    // Fallback: update locally
    const index = pantryItems.value.findIndex(i => i.id === itemId)
    if (index > -1) {
      pantryItems.value[index] = updatedItem
    }
  }
}

const removeQuantity = async (itemId) => {
  if (!selectedCategory.value) return
  
  const item = pantryItems.value.find(i => i.id === itemId)
  if (!item || (item.quantity || 0) <= 0) return
  
  const updatedItem = { ...item, quantity: Math.max(0, (item.quantity || 0) - 1) }
  
  try {
    await pantryStore.updateItemRemote(selectedCategory.value.id, itemId, { quantity: updatedItem.quantity })
    const index = pantryItems.value.findIndex(i => i.id === itemId)
    if (index > -1) {
      pantryItems.value[index] = updatedItem
    }
  } catch (error) {
    console.error('Failed to update item quantity:', error)
    // Fallback: update locally
    const index = pantryItems.value.findIndex(i => i.id === itemId)
    if (index > -1) {
      pantryItems.value[index] = updatedItem
    }
  }
}

const saveItem = async (itemData) => {
  if (!selectedCategory.value) return
  
  try {
    const newItem = await pantryStore.createItemRemote(selectedCategory.value.id, itemData)
    pantryItems.value.unshift(newItem)
  } catch (error) {
    console.error('Failed to create item:', error)
    // Fallback: add locally
    const newItem = {
      id: Date.now(),
      ...itemData,
      createdAt: new Date().toISOString()
    }
    pantryItems.value.unshift(newItem)
  }
}

// Helper function to determine item status
const getItemStatus = (item) => {
  if (!item.quantity || item.quantity <= 0) return 'expired'
  if (item.quantity <= 2) return 'low'
  
  if (item.expiryDate) {
    const today = new Date()
    const expiryDate = new Date(item.expiryDate)
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) return 'expired'
    if (daysUntilExpiry <= 3) return 'expiring'
  }
  
  return 'available'
}

// Filter and share functions
const openFilterDialog = () => {
  filterDialog.value = true
}

const applyFilters = () => {
  filterDialog.value = false
}

const clearFilters = () => {
  filterStatus.value = ''
  filterCategory.value = ''
}

const openShareDialog = () => {
  shareEmail.value = ''
  shareDialog.value = true
}

const sharePantry = async () => {
  if (!selectedCategory.value || !shareEmail.value) return
  
  try {
    await pantryStore.sharePantryRemote(selectedCategory.value.id, shareEmail.value)
    console.log('Pantry shared successfully')
    shareDialog.value = false
    shareEmail.value = ''
  } catch (error) {
    console.error('Failed to share pantry:', error)
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
  
  // Initialize empty pantry if none exist
  if (!pantryStore.pantries || pantryStore.pantries.length === 0) {
    pantryStore.seed([], [])
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

// Load categories on mount
onMounted(() => {
  // Load categories from localStorage or use default ones
  const savedCategories = localStorage.getItem('listio:categories')
  if (savedCategories) {
    categories.value = JSON.parse(savedCategories)
  }
})


</script>

<style scoped>
.pantry-page {
  padding-top: 2rem;
  padding-bottom: 6rem;
  min-height: calc(100vh - 80px);
  background-color: #fafafa;
}

.categories-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.category-card {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border-radius: 8px;
  background-color: white;
  border: 0.5px solid #9e9e9e;
  box-shadow: none;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.category-content {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 20px;
  height: 140px;
}

.category-menu {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.category-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border: 2px dashed #e0e0e0;
}

.category-info {
  flex: 1;
  padding: 0;
  display: flex;
  align-items: flex-start;
  height: 80px;
}

.category-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #424242;
  margin: 0;
  line-height: 1.2;
}

.new-category-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.search-wrapper {
  flex: 1;
  max-width: 100%;
  min-width: 250px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  gap: 8px;
}

.action-btn {
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.back-btn {
  margin-left: -8px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .categories-grid {
    max-width: 800px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 600px) {
  .search-wrapper {
    width: 160px;
  }
}
</style>