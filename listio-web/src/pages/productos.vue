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
    <v-snackbar v-model="snackbar" :timeout="3000" color="success">
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
      :categories="categories"
      @update="updateProduct"
      @delete="deleteProduct"
      @add-to-list="addToList"
      @cancel="productInfoDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/products'
import { useCategoryStore } from '@/stores/category'
import SearchBar from '@/components/SearchBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import NewItemDialog from '@/components/NewItemDialog.vue'
import ProductInfoDialog from '@/components/ProductInfoDialog.vue'

const searchQuery = ref('')
const snackbar = ref(false)
const snackbarText = ref('')
const loading = ref(true)

const productInfoDialog = ref(false)
const newProductDialog = ref(false)
const selectedProduct = ref(null)

const newProductForm = ref({
  name: '',
  description: '',
  price: '',
  category_id: null,
})

const productStore = useProductStore()
const categoryStore = useCategoryStore()
const categories = ref([])

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
    key: 'price',
    label: 'Precio',
    type: 'number',
    required: false,
  },
  {
    key: 'category_id',
    label: 'Categoría',
    type: 'select',
    required: false,
    options: categories.value.map((c) => ({
      title: c.name,
      value: c.id,
    })),
  },
])

const filteredProducts = computed(() => {
  const list = productStore.products
  if (!searchQuery.value) return list

  const q = searchQuery.value.toLowerCase()
  return list.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.category?.name || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
  )
})

const openNewProductDialog = () => {
  newProductForm.value = { name: '', description: '', price: '', category_id: null }
  newProductDialog.value = true
}

const openProductDialog = (product) => {
  selectedProduct.value = { ...product }
  productInfoDialog.value = true
}

// --- CRUD Actions ---
const addProduct = async (formData) => {
  if (!formData.name) return
  try {
    await productStore.createRemote({
      name: formData.name,
      metadata: {},
      category_id: formData.category_id,
    })
    snackbarText.value = `${formData.name} agregado correctamente`
    snackbar.value = true
  } catch (error) {
    console.error('Error al agregar producto:', error)
  } finally {
    newProductDialog.value = false
  }
}

const updateProduct = async (updatedData) => {
  try {
    await productStore.updateRemote(updatedData.id, updatedData)
    snackbarText.value = `Producto actualizado correctamente`
    snackbar.value = true
  } catch (e) {
    console.error('Error al actualizar producto:', e)
  } finally {
    productInfoDialog.value = false
  }
}

const deleteProduct = async (product) => {
  try {
    await productStore.deleteRemote(product.id)
    snackbarText.value = `Producto eliminado correctamente`
    snackbar.value = true
  } catch (e) {
    console.error('Error al eliminar producto:', e)
  } finally {
    productInfoDialog.value = false
  }
}

const addToList = (product) => {
  snackbarText.value = `${product.name} añadido a la lista`
  snackbar.value = true
}

onMounted(async () => {
  try {
    loading.value = true
    await categoryStore.init()
    await productStore.init()
    categories.value = categoryStore.categories
  } catch (err) {
    console.error('Error cargando productos o categorías:', err)
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