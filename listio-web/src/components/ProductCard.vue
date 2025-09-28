<template>
  <v-card
    class="product-card"
    hover
    @click="$emit('click', product)"
  >
    <v-img
      :src="product.image"
      :alt="product.name"
      height="150"
      cover
    >
      <template v-slot:placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-progress-circular
            color="grey-lighten-4"
            indeterminate
          ></v-progress-circular>
        </div>
      </template>
      
      <!-- Category Badge -->
      <v-chip
        class="category-chip"
        color="primary"
        size="small"
        variant="elevated"
      >
        {{ product.category }}
      </v-chip>
    </v-img>
    
    <v-card-text>
      <h4 class="text-h6 mb-1">{{ product.name }}</h4>
      
      <div class="d-flex align-center justify-space-between mt-3">
        <div class="price-section">
          <span class="text-h6 font-weight-bold text-success">
            ${{ product.price }}
          </span>
          <span class="text-body-2 text-grey-darken-1 ml-1" v-if="product.unit">
            / {{ product.unit }}
          </span>
        </div>
        
        <div class="actions-section">
          <v-btn
            icon="mdi-plus"
            size="small"
            color="success"
            variant="elevated"
            @click.stop="$emit('add-to-list', product)"
          />
        </div>
      </div>
      
      <!-- Additional Info -->
      <div class="mt-2" v-if="product.description">
        <p class="text-body-2 text-grey-darken-1 mb-0">
          {{ product.description }}
        </p>
      </div>
      
      <!-- Stock Status -->
      <v-chip
        v-if="product.stock !== undefined"
        :color="getStockColor(product.stock)"
        size="x-small"
        class="mt-2"
      >
        {{ getStockText(product.stock) }}
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
    validator: (product) => {
      return product.name && product.price && product.image
    }
  }
})

defineEmits(['click', 'add-to-list'])

const getStockColor = (stock) => {
  if (stock === 0) return 'error'
  if (stock < 5) return 'warning'
  return 'success'
}

const getStockText = (stock) => {
  if (stock === 0) return 'Sin stock'
  if (stock < 5) return 'Poco stock'
  return 'Disponible'
}
</script>

<style scoped>
.product-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.category-chip {
  position: absolute;
  top: 8px;
  left: 8px;
}

.price-section {
  display: flex;
  align-items: baseline;
}

.actions-section {
  display: flex;
  gap: 8px;
}
</style>