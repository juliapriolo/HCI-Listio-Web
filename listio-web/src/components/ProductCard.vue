<template>
  <v-card
    class="product-card"
    hover
    color="grey-darken-3"
    @click="$emit('click', product)"
  >
    <v-img
      :src="imageSrc"
      :alt="product.name || 'Producto'"
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

      <v-chip
        class="category-chip"
        color="primary"
        size="small"
        variant="elevated"
      >
        {{ categoryName }}
      </v-chip>
    </v-img>

    <v-card-text>
      <!-- Header with title and menu -->
      <div class="d-flex align-center justify-space-between mb-2">
        <h4 class="text-h6 mb-0">{{ product.name }}</h4>
        
        <!-- Actions Menu -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="text"
              size="small"
              v-bind="props"
              @click.stop
            />
          </template>
          <v-list>
            <v-list-item @click="$emit('edit', product)">
              <v-list-item-title>{{ t('common.edit') }}</v-list-item-title>
              <template v-slot:prepend>
                <v-icon>mdi-pencil</v-icon>
              </template>
            </v-list-item>
            <v-list-item @click="$emit('delete', product)">
              <v-list-item-title>{{ t('common.delete') }}</v-list-item-title>
              <template v-slot:prepend>
                <v-icon color="error">mdi-delete</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Additional Info -->
      <div class="mt-2" v-if="product.metadata?.description">
        <p class="text-body-2 text-grey-darken-1 mb-0">
          {{ product.metadata.description }}
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
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
const { t } = useLanguage()

const props = defineProps({
  product: {
    type: Object,
    required: true,
    validator: (product) => {
      return !!product && !!product.id && !!product.name
    }
  }
})

defineEmits(['click', 'add-to-list', 'edit', 'delete'])

const defaultImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect fill='%23eeeeee' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial, Helvetica, sans-serif' font-size='24'>Sin imagen</text></svg>"

const imageSrc = computed(() => {
  const p = props.product || {}
  return (
    p.image ||
    p.metadata?.image ||
    p.metadata?.imageUrl ||
    defaultImage
  )
})

const categoryName = computed(() => {
  return props.product?.category?.name || t('common.noCategory')
})

const getStockColor = (stock) => {
  if (stock === 0) return 'error'
  if (stock < 5) return 'warning'
  return 'success'
}

const getStockText = (stock) => {
  if (stock === 0) return t('pages.products.stock.none')
  if (stock < 5) return t('pages.products.stock.low')
  return t('pages.products.stock.available')
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

.actions-section {
  display: flex;
  gap: 8px;
}
</style>


