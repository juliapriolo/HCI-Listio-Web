<template>
  <div class="products-page">
    <v-container>
      <!-- Page Header with Search -->
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Productos
        </h1>

        <div class="header-actions">
          <div class="search-wrapper">
            <SearchBar
              v-model="searchQuery"
              placeholder="Buscar productos..."
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
        title="No se encontraron productos"
        description="Intenta con otros términos de búsqueda"
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
        <v-btn variant="text" @click="snackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>

    <!-- Diálogos -->
    <NewItemDialog
      v-model="newProductDialog"
      v-model:form-data="newProductForm"
      title="Agregar Producto"
      submit-text="Confirmar"
      :fields="addProductFields"
      @submit="addProduct"
      @cancel="newProductDialog = false"
    />

    <ProductInfoDialog
      v-model="productInfoDialog"
      :item="selectedProduct"
      @update="updateProduct"
      @delete="deleteProduct"
      @add-to-list="addToList"
      @cancel="productInfoDialog = false"
    />

    <!-- Diálogo de confirmación de eliminación -->
    <v-dialog v-model="deleteConfirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Confirmar eliminación
        </v-card-title>
        
        <v-card-text>
          <p>¿Estás seguro de que quieres eliminar el producto <strong>"{{ productToDelete?.name }}"</strong>?</p>
          <p class="text-caption text-grey">Esta acción no se puede deshacer.</p>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteConfirmDialog = false">
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="executeDelete"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/products'
import SearchBar from '@/components/SearchBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import NewItemDialog from '@/components/NewItemDialog.vue'
import ProductInfoDialog from '@/components/ProductInfoDialog.vue'

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

const newProductForm = ref({
  name: '',
  description: '',
  image: null,
})

const productStore = useProductStore()

const addProductFields = computed(() => [
  {
    key: 'name',
    label: 'Nombre del producto',
    type: 'text',
    required: true,
    autofocus: true,
  },
  {
    key: 'description',
    label: 'Descripción (opcional)',
    type: 'textarea',
    required: false,
  },
  {
    key: 'image',
    label: 'Imagen del producto',
    type: 'file',
    required: false,
    accept: 'image/*',
  },
])

const filteredProducts = computed(() => {
  const list = productStore.products
  if (!searchQuery.value) return list

  // Usar búsqueda local del store
  return productStore.searchLocal(searchQuery.value)
})

const openNewProductDialog = () => {
  newProductForm.value = { name: '', description: '', image: null }
  newProductDialog.value = true
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
  if (!formData.name) return
  
  try {
    // Convertir imagen a base64 si existe
    const imageBase64 = await convertImageToBase64(formData.image)
    
    const payload = {
      name: formData.name,
      metadata: {
        description: formData.description || '',
        image: imageBase64,
      },
    }
    
    await productStore.createRemote(payload)
    snackbarText.value = `${formData.name} agregado correctamente`
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (error) {
    console.error('Error al agregar producto:', error)
    snackbarText.value = `Error al agregar ${formData.name}: ${error.message || 'Error desconocido'}`
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    newProductDialog.value = false
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
    snackbarText.value = `Producto actualizado correctamente`
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    snackbarText.value = `Error al actualizar producto: ${error.message || 'Error desconocido'}`
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    productInfoDialog.value = false
  }
}

const deleteProduct = async (product) => {
  try {
    await productStore.deleteRemote(product.id)
    snackbarText.value = `Producto eliminado correctamente`
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    snackbarText.value = `Error al eliminar producto: ${error.message || 'Error desconocido'}`
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    productInfoDialog.value = false
  }
}

const addToList = (product) => {
  snackbarText.value = `${product.name} añadido a la lista`
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
    snackbarText.value = 'Error al cargar los datos. Verificando conexión...'
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
</style>