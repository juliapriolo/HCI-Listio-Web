<template>
  <div class="products-page">
    <v-container>
      <!-- Page Header with Search -->
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          {{ t('pages.products.title') }}
        </h1>

        <div class="header-actions">
          <div class="search-wrapper">
            <SearchBar
              v-model="searchQuery"
              :placeholder="t('pages.products.searchPlaceholder')"
            />
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <v-row>
        <v-col
          v-for="product in filteredProducts"
          :key="product.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <ProductCard
            :product="product"
            @click="openProductDialog(product)"
            @add-to-list="addToList(product)"
            @edit="editProduct(product)"
            @delete="confirmDeleteProduct(product)"
          />
        </v-col>
      </v-row>

      <!-- Empty State -->
      <EmptyState
        v-if="!loading && filteredProducts.length === 0"
        icon="mdi-package-variant"
        :title="t('pages.products.empty.noResultsTitle')"
        :description="t('pages.products.empty.noResultsDescription')"
      />

      <!-- Loading Spinner -->
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>
    </v-container>

    <!-- Floating Action Button -->
    <v-btn
      color="success"
      size="large"
      icon
      class="new-item-fab"
      elevation="8"
      @click="openNewProductDialog"
    >
      <v-icon size="24">mdi-plus</v-icon>
    </v-btn>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :timeout="4000" :color="snackbarColor">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">{{ t('common.close') }}</v-btn>
      </template>
    </v-snackbar>

    <!-- New Product Dialog -->
    <div v-if="newProductDialog" class="modal-overlay">
      <div class="modal product-modal">
        <h2>{{ t('pages.products.modals.new.title') }}</h2>
        
        <form @submit.prevent="addProduct(newProductForm)">
          <div class="form-group">
            <label for="productName">{{ t('pages.products.modals.common.nameLabel') }}</label>
            <input
              id="productName"
              v-model="newProductForm.name"
              type="text"
              class="form-input"
              :placeholder="t('pages.products.modals.common.namePlaceholder')"
              required
              autofocus
            />
          </div>
          
          <div class="form-group">
            <label for="productImage">{{ t('pages.products.modals.common.imageLabel') }}</label>
            <input
              id="productImage"
              type="file"
              accept="image/*"
              class="form-input file-input"
              @change="handleProductImageChange"
            />
            <div v-if="productImagePreview" class="image-preview">
              <img :src="productImagePreview" :alt="t('pages.products.modals.common.previewAlt')" class="preview-img" />
            </div>
          </div>
          
          <div class="form-group">
            <label for="productDescription">{{ t('pages.products.modals.common.descriptionLabel') }}</label>
            <textarea
              id="productDescription"
              v-model="newProductForm.description"
              class="form-input"
              :placeholder="t('pages.products.modals.common.descriptionPlaceholder')"
              rows="3"
            ></textarea>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn--cancel" @click="closeNewProductDialog">
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="btn btn--primary"
              :disabled="!newProductForm.name?.trim() || isCreating"
            >
              {{ isCreating ? t('pages.products.modals.new.creating') : t('pages.products.modals.new.submit') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ProductInfoDialog
      v-model="productInfoDialog"
      :item="selectedProduct"
      @update="updateProduct"
      @delete="deleteProduct"
      @add-to-list="addToList"
      @cancel="productInfoDialog = false"
    />

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteConfirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          {{ t('pages.products.deleteConfirm.title') }}
        </v-card-title>
        
        <v-card-text>
          <p v-html="t('pages.products.deleteConfirm.message', { name: productToDelete?.name || '' })"></p>
          <p class="text-caption text-grey">{{ t('pages.products.deleteConfirm.warning') }}</p>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteConfirmDialog = false">
            {{ t('common.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="executeDelete"
          >
            {{ t('common.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/products'
import { useLanguage } from '@/composables/useLanguage'
import SearchBar from '@/components/SearchBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import ProductInfoDialog from '@/components/ProductInfoDialog.vue'
const { t } = useLanguage()

const searchQuery = ref('')
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const loading = ref(true)

const productInfoDialog = ref(false)
const newProductDialog = ref(false)
const deleteConfirmDialog = ref(false)
const selectedProduct = ref(null)
const productToDelete = ref(null)
const isCreating = ref(false)
const productImageFile = ref(null)
const productImagePreview = ref('')

const newProductForm = ref({
  name: '',
  description: '',
  image: null,
})

const productStore = useProductStore()


const filteredProducts = computed(() => {
  const list = productStore.products
  if (!searchQuery.value) return list

  // Usar búsqueda local del store
  return productStore.searchLocal(searchQuery.value)
})

const openNewProductDialog = () => {
  newProductForm.value = { name: '', description: '', image: null }
  productImageFile.value = null
  productImagePreview.value = ''
  newProductDialog.value = true
}

const closeNewProductDialog = () => {
  newProductDialog.value = false
  newProductForm.value = { name: '', description: '', image: null }
  productImageFile.value = null
  productImagePreview.value = ''
}

// Handle image file selection for new product
const handleProductImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    productImageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      productImagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const openProductDialog = (product) => {
  selectedProduct.value = { ...product }
  productInfoDialog.value = true
}

// --- Helper Functions ---
const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null)
      return
    }
    
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// --- CRUD Actions ---
const addProduct = async (formData) => {
  if (!formData.name || isCreating.value) return
  
  isCreating.value = true
  try {
    // Convertir imagen a base64 si existe
    let imageBase64 = null
    if (productImageFile.value) {
      imageBase64 = await convertImageToBase64(productImageFile.value)
    }
    
    const payload = {
      name: formData.name.trim(),
      metadata: {
        description: formData.description?.trim() || '',
        image: imageBase64,
      },
    }
    
  await productStore.createRemote(payload)
  snackbarText.value = t('pages.products.messages.added', { name: formData.name })
    snackbarColor.value = 'success'
    snackbar.value = true
    closeNewProductDialog()
  } catch (error) {
    console.error('Error al agregar producto:', error)
    snackbarText.value = t('pages.products.messages.addError', { name: formData.name, error: error.message || 'Error desconocido' })
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    isCreating.value = false
  }
}

const updateProduct = async (updatedData) => {
  try {
    // Convertir imagen a base64 si existe
    const imageBase64 = await convertImageToBase64(updatedData.image)
    
    const payload = {
      name: updatedData.name,
      metadata: {
        description: updatedData.description || '',
        image: imageBase64 || updatedData.metadata?.image, // Mantener imagen existente si no se sube nueva
      },
    }
    
  await productStore.updateRemote(updatedData.id, payload)
  snackbarText.value = t('pages.products.messages.updated')
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    snackbarText.value = t('pages.products.messages.updateError', { error: error.message || 'Error desconocido' })
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    productInfoDialog.value = false
  }
}

const deleteProduct = async (product) => {
  try {
  await productStore.deleteRemote(product.id)
  snackbarText.value = t('pages.products.messages.deleted')
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    snackbarText.value = t('pages.products.messages.deleteError', { error: error.message || 'Error desconocido' })
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    productInfoDialog.value = false
  }
}

const addToList = (product) => {
  snackbarText.value = t('pages.products.messages.addedToList', { name: product.name })
  snackbarColor.value = 'success'
  snackbar.value = true
}

// --- Menu Actions ---
const editProduct = (product) => {
  selectedProduct.value = { ...product }
  productInfoDialog.value = true
}

const confirmDeleteProduct = (product) => {
  productToDelete.value = product
  deleteConfirmDialog.value = true
}

const executeDelete = () => {
  if (productToDelete.value) {
    deleteProduct(productToDelete.value)
    deleteConfirmDialog.value = false
    productToDelete.value = null
  }
}

onMounted(async () => {
  try {
    loading.value = true
    
    // Cargar productos
    await productStore.init()
    
    // Mostrar mensaje si no hay productos
    if (productStore.products.length === 0) {
      console.log('No hay productos disponibles')
    }
    
  } catch (err) {
    console.error('Error cargando datos:', err)
  snackbarText.value = t('pages.products.messages.loadError')
    snackbarColor.value = 'warning'
    snackbar.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.products-page {
  padding-top: 2rem;
  padding-bottom: 6rem;
  min-height: calc(100vh - 80px);
  background-color: #fafafa;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  gap: 8px;
}

.search-wrapper {
  flex: 1;
  max-width: 100%;
  min-width: 250px;
  display: flex;
  align-items: center;
}

@media (max-width: 600px) {
  .search-wrapper {
    width: 160px;
  }
}

.new-item-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

/* Modal styles */
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
  z-index: 1000;
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

/* Product modal specific styles */
.product-modal {
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

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
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
  color: #424242;
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
  color: #9e9e9e;
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
}
</style>