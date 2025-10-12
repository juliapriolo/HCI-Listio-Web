<template>
  <div class="pantry-page">
    <v-container>
      <!-- Page Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          {{ currentView === 'categories' ? 'Despensas' : selectedCategory?.name || 'Productos' }}
        </h1>
        
        <div class="header-actions">
          <div class="search-wrapper">
            <SearchBar
              v-model="searchQuery"
              :placeholder="currentView === 'categories' ? 'Buscar despensas...' : 'Buscar productos...'"
        />
      </div>

          <!-- Filter and Share buttons (only in products view) -->
          <template v-if="currentView === 'products'">
            <v-btn
              icon
              variant="text"
              class="action-btn"
              size="large"
              @click="openFilterDialog"
              :aria-label="t('common.filter')"
              :title="t('common.filter')"
            >
              <v-icon color="grey-darken-2">mdi-filter-outline</v-icon>
            </v-btn>

            <v-btn
              icon
              variant="text"
              class="action-btn"
              size="large"
              @click="openShareDialog"
              :aria-label="t('common.share')"
              :title="t('common.share')"
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
                  v-if="category.image || getDefaultImageForCategory(category)" 
                  :src="category.image || getDefaultImageForCategory(category)" 
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
              <button 
                class="menu-button"
                @click.stop="toggleCategoryMenu(category.id)"
                @blur="hideCategoryMenu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
                  <circle cx="12" cy="12" r="1"/>
                  <circle cx="12" cy="5" r="1"/>
                  <circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
              
              <div v-if="activeCategoryMenu === category.id" class="menu-dropdown">
                <div class="menu-item" @click="editCategory(category)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>{{ t('common.edit') }}</span>
                </div>
                <div class="menu-item delete-item" @click="confirmDeleteCategory(category)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                  <span>{{ t('common.delete') }}</span>
                </div>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Empty State -->
        <EmptyState
          v-if="filteredCategories.length === 0 && !searchQuery"
          icon="mdi-archive-outline"
          :title="'No tienes despensas creadas'"
          :description="'Crea tu primera despensa para organizar tus productos'"
        />
        
        <EmptyState
          v-else-if="filteredCategories.length === 0 && searchQuery"
          icon="mdi-magnify"
          :title="'No se encontraron despensas'"
          :description="'Intenta con otro término de búsqueda'"
        />
      </div>

      <!-- Products View -->
      <div v-else-if="currentView === 'products'">
        <!-- Loading State -->
        <div v-if="loadingItems" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-2 text-grey">{{ t('common.loading') }}</p>
        </div>

        <!-- Products Grid -->
        <v-row v-else-if="filteredProducts.length > 0">
        <v-col
            v-for="item in filteredProducts"
          :key="item.id"
          cols="12"
          sm="6"
          md="4"
            lg="3"
        >
          <PantryItemCard
            :item="item"
            @delete="confirmDeleteProduct"
            @edit="editItem"
          />
        </v-col>
      </v-row>

      <!-- Empty State -->
      <EmptyState
          v-else-if="!searchQuery"
          icon="mdi-package-variant"
          :title="'Esta despensa está vacía'"
          :description="'Agrega productos para comenzar a organizar tu despensa'"
        />
        
        <EmptyState
          v-else
          icon="mdi-magnify"
          :title="'No se encontraron productos'"
          :description="'Intenta con otro término de búsqueda'"
        />
      </div>
    </v-container>

    <!-- Add/Edit Category Dialog -->
    <div v-if="categoryDialog" class="modal-overlay">
      <div class="modal category-modal">
        <h2>{{ editingCategory ? 'Editar Despensa' : 'Nueva Despensa' }}</h2>
        
        <form @submit.prevent="saveCategory(categoryForm)">
          <div class="form-group">
            <label for="categoryName">Nombre de la despensa</label>
            <input
              id="categoryName"
              v-model="categoryForm.name"
              type="text"
              class="form-input"
              placeholder="Ej: Frutas, Lácteos, Limpieza..."
              required
              autofocus
            />
          </div>
          
          <div class="form-group">
            <label for="categoryImage">Imagen de la despensa</label>
            <input
              id="categoryImage"
              type="file"
              accept="image/*"
              class="form-input file-input"
              @change="handleImageChange"
            />
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" :alt="t('pages.lists.modals.common.previewAlt')" class="preview-img" />
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn--cancel" @click="categoryDialog = false">
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="btn btn--primary"
              :disabled="!categoryForm.name?.trim()"
            >
              {{ editingCategory ? 'Actualizar Despensa' : 'Crear Despensa' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Product Selection Dialog -->
    <div v-if="productSelectionDialog" class="modal-overlay">
      <div class="modal product-selection-modal">
        <h2>Agregar Producto a la Despensa</h2>
        
        <!-- Search field -->
        <div class="search-section">
          <div class="form-group">
            <label for="productSearch">Buscar producto</label>
            <input
              id="productSearch"
              v-model="productSearchQuery"
              type="text"
              class="form-input"
              placeholder="Escribe el nombre del producto..."
            />
          </div>
        </div>
        
        <div v-if="filteredAvailableProducts.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <p class="empty-text">
            {{ productSearchQuery ? 'No se encontraron productos' : t('pages.pantry.productSelection.noneAvailable') }}
          </p>
          <p class="empty-subtext">
            {{ productSearchQuery ? 'Intenta con otro término de búsqueda' : t('pages.pantry.productSelection.goToProducts') }}
          </p>
        </div>
        
        <div v-else>
          <div class="products-grid">
            <div
              v-for="product in filteredAvailableProducts"
              :key="product.id"
              class="product-card"
              :class="{ 'selected': selectedProduct?.id === product.id }"
              @click="selectProduct(product)"
            >
              <div class="product-content">
                <div class="product-image">
                  <img 
                    v-if="product.metadata?.image" 
                    :src="product.metadata.image" 
                    :alt="product.name"
                    class="product-img"
                  />
                  <div v-else class="image-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                  </div>
                </div>
                <div class="product-info">
                  <h4 class="product-name">{{ product.name }}</h4>
                  <p v-if="product.metadata?.description" class="product-description">
                    {{ product.metadata.description }}
                  </p>
                </div>
                <div v-if="selectedProduct?.id === product.id" class="selected-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#4CAF50">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="selectedProduct" class="product-details">
            <div class="divider"></div>
            <h4 class="details-title">Detalles del Producto</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="productQuantity">Cantidad</label>
                <input
                  id="productQuantity"
                  v-model="productQuantity"
                  type="number"
                  min="1"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="productUnit">Unidad</label>
                <select id="productUnit" v-model="productUnit" class="form-input">
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="g">Gramo</option>
                <option value="l">Litro</option>
                <option value="ml">Mililitro</option>
                <option value="paquete">Paquete</option>
                <option value="caja">Caja</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button type="button" class="btn btn--cancel" @click="productSelectionDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button
            type="button"
            class="btn btn--primary"
            :disabled="!selectedProduct"
            @click="addSelectedProductToPantry"
          >
            Agregar a Despensa
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="deleteDialog" class="modal-overlay">
      <div class="modal delete-confirmation-modal">
        <h2>Eliminar Despensa</h2>
        
        <div class="confirmation-content">
          <p class="confirmation-text">
            ¿Estás seguro de que quieres eliminar la despensa <strong>{{ categoryToDelete?.name || '' }}</strong>? 
            Esta acción no se puede deshacer y se eliminarán todos los productos de esta despensa.
          </p>
        </div>
        
        <div class="modal-actions">
          <button type="button" class="btn btn--cancel" @click="deleteDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button
            type="button"
            class="btn btn--danger"
            @click="deleteCategory"
          >
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Product Delete Confirmation Dialog -->
    <div v-if="productDeleteDialog" class="modal-overlay">
      <div class="modal delete-confirmation-modal">
  <h2>{{ t('pages.pantry.deleteConfirm.productTitle') }}</h2>
        
        <div class="confirmation-content">
          <p class="confirmation-text" v-html="t('pages.pantry.deleteConfirm.productMessage', { name: productToDelete?.name || '' })"></p>
        </div>
        
        <div class="modal-actions">
          <button type="button" class="btn btn--cancel" @click="productDeleteDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button
            type="button"
            class="btn btn--danger"
            @click="confirmDeleteProductAction"
          >
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Product Edit Dialog -->
    <div v-if="productEditDialog" class="modal-overlay">
      <div class="modal product-edit-modal">
        <h2>Editar Producto</h2>
        
        <form @submit.prevent="saveProductEdit">
          <div class="form-row">
            <div class="form-group">
              <label for="editQuantity">Cantidad</label>
              <input
                id="editQuantity"
                v-model="editQuantity"
                type="number"
                min="1"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label for="editUnit">Unidad</label>
              <select id="editUnit" v-model="editUnit" class="form-input">
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="g">Gramo</option>
                <option value="l">Litro</option>
                <option value="ml">Mililitro</option>
                <option value="paquete">Paquete</option>
                <option value="caja">Caja</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label for="editImageFile">Cambiar imagen</label>
            <input
              id="editImageFile"
              type="file"
              accept="image/*"
              class="form-input file-input"
              @change="handleEditImageChange"
            />
            <div v-if="editImagePreview" class="image-preview">
              <img :src="editImagePreview" :alt="t('pages.lists.modals.common.previewAlt')" class="preview-img" />
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn--cancel" @click="productEditDialog = false">
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="btn btn--primary"
            >
              {{ t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Filter Dialog -->
    <v-dialog v-model="filterDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          {{ t('common.filter') }} {{ t('nav.products') }}
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="filterStatus"
            :items="statusOptions"
            :label="t('pages.pantry.statusLabel') || 'Estado del producto'"
            variant="outlined"
            clearable
          />
          <v-select
            v-model="filterCategory"
            :items="categoryOptions"
            :label="t('common.category')"
            variant="outlined"
            clearable
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="clearFilters">
            {{ t('pages.lists.filters.clear') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="applyFilters"
          >
            {{ t('pages.lists.filters.apply') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Share Dialog -->
    <v-dialog v-model="shareDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          {{ t('pages.pantry.share.title') || 'Compartir despensa' }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="shareEmail"
            :label="t('pages.pantry.share.emailLabel') || 'Correo electrónico'"
            type="email"
            variant="outlined"
            :placeholder="t('pages.pantry.share.emailPlaceholder') || 'usuario@ejemplo.com'"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="shareDialog = false">
            {{ t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="sharePantry"
            :disabled="!shareEmail"
          >
            {{ t('common.share') }}
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
import { useProductStore } from '@/stores/products'
import { useLanguage } from '@/composables/useLanguage'
import PantryItemCard from '@/components/PantryItemCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import SearchBar from '@/components/SearchBar.vue'
import { getDefaultCategoryImage } from '@/utils/category-images'

const { t } = useLanguage()

// Reactive data
const categoryDialog = ref(false)
const editingCategory = ref(null)
const productDialog = ref(false)
const editingProduct = ref(null)
const deleteDialog = ref(false)
const categoryToDelete = ref(null)
const productDeleteDialog = ref(false)
const productToDelete = ref(null)
const productEditDialog = ref(false)
const productToEdit = ref(null)
const editQuantity = ref(1)
const editUnit = ref('unidad')
const editImageFile = ref(null)
const editImagePreview = ref('')
const productSelectionDialog = ref(false)
const selectedProduct = ref(null)
const productQuantity = ref(1)
const productUnit = ref('unidad')
const productSearchQuery = ref('')
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
const imagePreview = ref('')
const activeCategoryMenu = ref(null)

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
const statusOptions = computed(() => [
  { title: t('pages.pantry.status.available'), value: 'available' },
  { title: t('pages.pantry.status.low'), value: 'low' },
  { title: t('pages.pantry.status.expiring'), value: 'expiring' },
  { title: t('pages.pantry.status.expired'), value: 'expired' }
])

const categoryOptions = computed(() => {
  const categories = [...new Set(pantryItems.value.map(item => item.category).filter(Boolean))]
  return categories.map(cat => ({ title: cat, value: cat }))
})

const availableProducts = computed(() => {
  return productStore.products || []
})

const filteredAvailableProducts = computed(() => {
  if (!productSearchQuery.value) {
    return availableProducts.value
  }
  
  const query = productSearchQuery.value.toLowerCase().trim()
  return availableProducts.value.filter(product => 
    product.name.toLowerCase().includes(query)
  )
})

// Use stores
const pantryStore = usePantryStore()
const productStore = useProductStore()

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


// Helper function to process items for display
const processItemsForDisplay = (items) => {
  return items.map(item => ({
    id: item.id,
    name: item.product?.name || item.metadata?.name || item.name || 'Producto sin nombre',
    quantity: item.quantity || 0,
    unit: item.unit || 'unidad',
    category: item.product?.category?.name || item.metadata?.category || item.category || 'Sin categoría',
    expiryDate: item.metadata?.expiryDate || item.expiryDate || '',
    image: item.product?.metadata?.image || item.metadata?.image || item.image || '',
    description: item.product?.metadata?.description || item.metadata?.description || '',
    stock: item.quantity || 0,
    status: item.status || 'available',
    createdAt: item.createdAt || new Date().toISOString()
  }))
}

// Methods
const openAddCategoryDialog = () => {
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    image: ''
  }
  imagePreview.value = ''
  categoryDialog.value = true
}

// Helper used in template to show a default image for known categories
const getDefaultImageForCategory = (category) => {
  if (!category) return ''
  // Preferir nombre sobre ID (IDs pueden ser numéricos y no mapear a slugs)
  return getDefaultCategoryImage(category.name || category.id)
}

const openAddProductDialog = () => {
  productSelectionDialog.value = true
  selectedProduct.value = null
  productQuantity.value = 1
  productUnit.value = 'unidad'
  productSearchQuery.value = ''
}

const editCategory = (category) => {
  editingCategory.value = category
  categoryForm.value = { ...category }
  imagePreview.value = category.image || ''
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
      const categoriesStorageKey = getCategoriesStorageKey()
      localStorage.setItem(categoriesStorageKey, JSON.stringify(categories.value))
    }
    
    console.log('Category deleted successfully')
  } catch (error) {
    console.error('Failed to delete category:', error)
    
    // Fallback: delete locally
    const index = categories.value.findIndex(c => c.id === categoryToDelete.value.id)
    if (index > -1) {
      categories.value.splice(index, 1)
      const categoriesStorageKey = getCategoriesStorageKey()
      localStorage.setItem(categoriesStorageKey, JSON.stringify(categories.value))
    }
  } finally {
    deleteDialog.value = false
    categoryToDelete.value = null
  }
}

const saveCategory = async (formData) => {
  console.log('saveCategory called with:', formData)
  
  // Validate required fields
  if (!formData.name || !formData.name.trim()) {
    console.error('Category name is required')
    alert('El nombre de la categoría es obligatorio')
    return
  }
  
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
      
      console.log('Creating pantry with data:', pantryData)
      
      // Try to create pantry via API
      const newPantry = await pantryStore.createPantryRemote(pantryData)
      
      console.log('Pantry created successfully:', newPantry)
      
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
  const categoriesStorageKey = getCategoriesStorageKey()
  localStorage.setItem(categoriesStorageKey, JSON.stringify(categories.value))
  
  categoryDialog.value = false
}

const addSelectedProductToPantry = async () => {
  if (!selectedCategory.value || !selectedProduct.value) return
  
  const productData = {
    product: {
      id: selectedProduct.value.id
    },
    quantity: parseInt(productQuantity.value), // Convert to number
    unit: productUnit.value,
    metadata: {}
  }
  
  console.log('Sending payload:', JSON.stringify(productData, null, 2))
  console.log('Selected product:', selectedProduct.value)
  console.log('Selected category:', selectedCategory.value)
  
  try {
    const newProduct = await pantryStore.createItemRemote(selectedCategory.value.id, productData)
    
    // Process the API response to ensure it has the correct structure for display
    const processedItem = {
      id: newProduct.id,
      name: newProduct.product?.name || selectedProduct.value.name,
      quantity: newProduct.quantity,
      unit: newProduct.unit,
      category: newProduct.product?.category?.name || 'Sin categoría',
      image: newProduct.product?.metadata?.image || selectedProduct.value.metadata?.image || '',
      description: newProduct.product?.metadata?.description || selectedProduct.value.metadata?.description || '',
      stock: newProduct.quantity, // Use quantity as stock for display
      createdAt: newProduct.createdAt || new Date().toISOString()
    }
    
    // Update the item in the store with the processed data
    const itemIndex = pantryStore.items.findIndex(item => item.id === newProduct.id)
    if (itemIndex > -1) {
      pantryStore.items[itemIndex] = processedItem
      pantryStore.save()
    }
    
    // Refresh our local view with processed items
    pantryItems.value = processItemsForDisplay(pantryStore.items)
    
    // Update category item count
    const categoryIndex = categories.value.findIndex(c => c.id === selectedCategory.value.id)
    if (categoryIndex > -1) {
      categories.value[categoryIndex].itemCount += 1
      const categoriesStorageKey = getCategoriesStorageKey()
      localStorage.setItem(categoriesStorageKey, JSON.stringify(categories.value))
    }
    
  } catch (error) {
    console.error('Failed to create product:', error)
    
    // Check if it's a 400 error (bad request)
    if (error.response && error.response.status === 400) {
      // Show error message to user
  alert(t('pages.pantry.messages.invalidQuantityUnit'))
      return
    }
    
    // Fallback: Add locally only for network/server errors
    const newProduct = {
      id: Date.now(),
      name: selectedProduct.value.name,
      quantity: parseInt(productQuantity.value), // Convert to number
      unit: productUnit.value,
      category: 'Sin categoría',
      image: selectedProduct.value.metadata?.image || '',
      createdAt: new Date().toISOString()
    }
    
    // Add to store's local items
    pantryStore.items.unshift(newProduct)
    pantryStore.save()
    
    // Refresh our local view with processed items
    pantryItems.value = processItemsForDisplay(pantryStore.items)
    
    // Update category item count
    const categoryIndex = categories.value.findIndex(c => c.id === selectedCategory.value.id)
    if (categoryIndex > -1) {
      categories.value[categoryIndex].itemCount += 1
      const categoriesStorageKey = getCategoriesStorageKey()
      localStorage.setItem(categoriesStorageKey, JSON.stringify(categories.value))
    }
  }
  
  productSelectionDialog.value = false
}

const selectProduct = (product) => {
  selectedProduct.value = product
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

// Handle image file selection
const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    categoryForm.value.image = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Handle category menu
const toggleCategoryMenu = (categoryId) => {
  activeCategoryMenu.value = activeCategoryMenu.value === categoryId ? null : categoryId
}

const hideCategoryMenu = () => {
  setTimeout(() => {
    activeCategoryMenu.value = null
  }, 150)
}

const openCategory = async (category) => {
  console.log('Opening category:', category.name)
  selectedCategory.value = category
  currentView.value = 'products'

  // Load items for this pantry/category
  loadingItems.value = true
  try {
    await pantryStore.fetchPantryItemsRemote(category.id)

    // Process the items to ensure they have the correct structure for display
    pantryItems.value = processItemsForDisplay(pantryStore.items)
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
  
  // Check if this is a local item (created with Date.now())
  const isLocalItem = itemId > 1000000000000 // Date.now() generates large numbers
  
  try {
    if (!isLocalItem) {
      // Only try to delete from API if it's not a local item
      await pantryStore.deleteItemRemote(selectedCategory.value.id, itemId)
    }
    
    // Update local items after deletion
    pantryItems.value = pantryItems.value.filter(item => item.id !== itemId)
    
    // Update category item count
    const categoryIndex = categories.value.findIndex(c => c.id === selectedCategory.value.id)
    if (categoryIndex > -1) {
      categories.value[categoryIndex].itemCount = Math.max(0, categories.value[categoryIndex].itemCount - 1)
      const categoriesStorageKey = getCategoriesStorageKey()
      localStorage.setItem(categoriesStorageKey, JSON.stringify(categories.value))
    }
  } catch (error) {
    console.error('Failed to delete item:', error)
    // Fallback: delete locally
    pantryItems.value = pantryItems.value.filter(item => item.id !== itemId)
    
    // Update category item count
    const categoryIndex = categories.value.findIndex(c => c.id === selectedCategory.value.id)
    if (categoryIndex > -1) {
      categories.value[categoryIndex].itemCount = Math.max(0, categories.value[categoryIndex].itemCount - 1)
      const categoriesStorageKey = getCategoriesStorageKey()
      localStorage.setItem(categoriesStorageKey, JSON.stringify(categories.value))
    }
  }
}

const editItem = (itemId) => {
  const item = pantryItems.value.find(i => i.id === itemId)
  if (item) {
    productToEdit.value = item
    editQuantity.value = item.quantity || 1
    editUnit.value = item.unit || 'unidad'
    editImageFile.value = null
    editImagePreview.value = item.image || item.metadata?.image || ''
    productEditDialog.value = true
  }
}

const handleEditImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    editImageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      editImagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const saveProductEdit = async () => {
  if (!productToEdit.value || !selectedCategory.value) return
  
  try {
    // Prepare the update data
    const updateData = {
      quantity: parseInt(editQuantity.value),
      unit: editUnit.value,
      metadata: {
        ...productToEdit.value.metadata
      }
    }
    
    // If a new image was selected, convert it to base64
    if (editImageFile.value) {
      const base64Image = await convertFileToBase64(editImageFile.value)
      updateData.metadata.image = base64Image
    }
    
    // Update via API
    await pantryStore.updateItemRemote(selectedCategory.value.id, productToEdit.value.id, updateData)
    
    // Update local view
    const itemIndex = pantryItems.value.findIndex(item => item.id === productToEdit.value.id)
    if (itemIndex > -1) {
      pantryItems.value[itemIndex] = {
        ...pantryItems.value[itemIndex],
        quantity: updateData.quantity,
        unit: updateData.unit,
        image: updateData.metadata.image || pantryItems.value[itemIndex].image,
        metadata: updateData.metadata
      }
    }
    
    console.log('Product updated successfully')
  } catch (error) {
    console.error('Failed to update product:', error)
    alert('Error al actualizar el producto. Inténtalo de nuevo.')
  } finally {
    productEditDialog.value = false
    productToEdit.value = null
  }
}

const confirmDeleteProduct = (itemId) => {
  const item = pantryItems.value.find(i => i.id === itemId)
  if (item) {
    productToDelete.value = item
    productDeleteDialog.value = true
  }
}

const confirmDeleteProductAction = async () => {
  if (!productToDelete.value) return
  
  await deleteItem(productToDelete.value.id)
  
  productDeleteDialog.value = false
  productToDelete.value = null
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
    // Refresh the entire list to ensure consistency
    pantryItems.value = processItemsForDisplay(pantryStore.items)
  } catch (error) {
    console.error('Failed to create item:', error)
    // Fallback: add locally
    const newItem = {
      id: Date.now(),
      ...itemData,
      createdAt: new Date().toISOString()
    }
    pantryStore.items.unshift(newItem)
    pantryStore.save()
    // Refresh the entire list to ensure consistency
    pantryItems.value = processItemsForDisplay(pantryStore.items)
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
  
  try {
    // Initialize product store
    await productStore.init()
  } catch (error) {
    console.log('Failed to initialize product store:', error)
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

// Helper function to get user-specific storage key for categories
const getCategoriesStorageKey = () => {
  try {
    const raw = localStorage.getItem('listio:user')
    const userData = raw ? JSON.parse(raw) : null
    const userId = userData?.profile?.id
    return userId ? `listio:categories:${userId}` : 'listio:categories:anonymous'
  } catch (e) {
    console.error('Failed to get user ID for categories storage key', e)
    return 'listio:categories:anonymous'
  }
}

// Helper function to clear categories data for current user
const clearCategoriesData = () => {
  try {
    const categoriesStorageKey = getCategoriesStorageKey()
    localStorage.removeItem(categoriesStorageKey)
    categories.value = []
  } catch (e) {
    console.error('Failed to clear categories data', e)
  }
}

// Load categories on mount
onMounted(() => {
  // Load categories from localStorage or use default ones
  const categoriesStorageKey = getCategoriesStorageKey()
  const savedCategories = localStorage.getItem(categoriesStorageKey)
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

/* Custom menu styles for categories */
.menu-button {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.menu-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #424242;
  font-weight: 500;
  font-size: 0.9rem;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item.delete-item {
  color: #f44336;
}

.menu-item.delete-item:hover {
  background-color: #ffebee;
}

.menu-item span {
  flex: 1;
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

/* Product Selection Dialog Styles */
.product-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
}

.product-card:hover {
  border-color: #1976d2;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
}

.product-card.selected {
  border-color: #1976d2;
  background-color: #e3f2fd;
}

.product-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Modal styles matching verification modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 32px 24px;
  min-width: 400px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.5rem;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  flex: 1;
}

.btn--primary {
  background: #4CAF50;
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  background: #45A049;
}

.btn--primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn--cancel {
  background: #f5f5f5;
  color: #333;
}

.btn--cancel:hover {
  background: #e0e0e0;
}

.btn--danger {
  background: #f44336;
  color: #fff;
}

.btn--danger:hover:not(:disabled) {
  background: #d32f2f;
}

.btn--danger:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Category modal specific styles */
.category-modal {
  max-width: 500px;
  width: 90vw;
}

.file-input {
  padding: 6px 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-input:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.file-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
  background-color: #fff;
}

.file-input::file-selector-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  margin-right: 12px;
  transition: background-color 0.2s ease;
}

.file-input::file-selector-button:hover {
  background-color: #5a6268;
}

.image-preview {
  margin-top: 12px;
  text-align: center;
}

.preview-img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  object-fit: cover;
}

/* Product edit modal specific styles */
.product-edit-modal {
  max-width: 600px;
  width: 90vw;
}

/* Delete confirmation modal specific styles */
.delete-confirmation-modal {
  max-width: 450px;
  width: 90vw;
}

.confirmation-content {
  text-align: center;
  padding: 20px 0;
}

.confirmation-text {
  font-size: 1rem;
  color: #424242;
  line-height: 1.5;
  margin: 0;
}

.confirmation-text strong {
  color: #f44336;
  font-weight: 600;
}

/* Product selection modal specific styles */
.product-selection-modal {
  max-width: 800px;
  width: 90vw;
}

.search-section {
  margin-bottom: 20px;
}

.search-section .form-group {
  margin-bottom: 0;
}

.search-section label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
  display: block;
}

.search-section .form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-section .form-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-text {
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 8px 0;
}

.empty-subtext {
  font-size: 0.9rem;
  color: #999;
  margin: 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
}

.product-card:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
}

.product-card.selected {
  border-color: #4CAF50;
  background-color: #f1f8e9;
}

.product-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.product-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-img {
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
  border: 1px dashed #e0e0e0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.product-description {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-icon {
  flex-shrink: 0;
}

.product-details {
  margin-top: 20px;
}

.divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 20px 0;
}

.details-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 4px;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #424242; /* Mismo color que text-grey-darken-3 del título */
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: #9e9e9e; /* Color más visible para el placeholder */
  opacity: 1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal {
    margin: 20px;
    padding: 24px 16px;
    min-width: auto;
    width: calc(100vw - 40px);
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    max-height: 250px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>