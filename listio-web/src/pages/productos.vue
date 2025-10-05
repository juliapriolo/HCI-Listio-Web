<template>
  <div class="products-page">
    <v-container>
      <!-- Page Header with Search -->
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Productos
        </h1>
        
        <SearchBar
          v-model="searchQuery"
          placeholder="Buscar productos..."
        />
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
            @click="selectProduct"
            @add-to-list="addToList"
          />
        </v-col>
      </v-row>

      <!-- Empty State -->
      <EmptyState
        v-if="filteredProducts.length === 0"
        icon="mdi-package-variant"
        title="No se encontraron productos"
        description="Intenta con otros términos de búsqueda"
      />
    </v-container>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      color="success"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import SearchBar from '@/components/SearchBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'

// Reactive data
const searchQuery = ref('')
const snackbar = ref(false)
const snackbarText = ref('')

// Use Pinia products store
const productsStore = useProductsStore()

// Sample products data with enhanced information
const sampleProducts = [
  {
    id: 1,
    name: 'Leche Entera',
    category: 'Lácteos',
    price: '2.99',
    unit: 'L',
    stock: 15,
    description: 'Leche fresca entera de alta calidad',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'Pan Integral',
    category: 'Panadería',
    price: '1.50',
    unit: 'unidad',
    stock: 8,
    description: 'Pan integral artesanal recién horneado',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'Manzanas',
    category: 'Frutas',
    price: '3.20',
    unit: 'kg',
    stock: 25,
    description: 'Manzanas rojas frescas de temporada',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    name: 'Pollo',
    category: 'Carnes',
    price: '8.99',
    unit: 'kg',
    stock: 12,
    description: 'Pollo fresco de granja',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    name: 'Arroz',
    category: 'Granos',
    price: '2.10',
    unit: 'kg',
    stock: 30,
    description: 'Arroz blanco de grano largo',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&h=300&fit=crop'
  },
  {
    id: 6,
    name: 'Yogurt',
    category: 'Lácteos',
    price: '1.75',
    unit: 'unidad',
    stock: 0,
    description: 'Yogurt natural cremoso',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop'
  }
]

// Computed properties
const filteredProducts = computed(() => {
  const list = productsStore.products
  if (!searchQuery.value) return list
  
  return list.filter(product =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (product.description || '').toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Methods
const selectProduct = (product) => {
  console.log('Selected product:', product.name)
  // Navigate to product detail or implement selection logic
}

const addToList = (product) => {
  snackbarText.value = `${product.name} agregado a la lista`
  snackbar.value = true
  console.log('Added to list:', product.name)
  // Could call a list store to add to active list
}

onMounted(() => {
  productsStore.load()
  if (!productsStore.products || productsStore.products.length === 0) {
    productsStore.seed(sampleProducts)
  }
})
</script>

<style scoped>
.products-page {
  padding-top: 2rem;
  padding-bottom: 2rem;
  min-height: calc(100vh - 80px);
  background-color: #fafafa;
}
</style>