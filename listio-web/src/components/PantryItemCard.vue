<template>
  <v-card
    class="product-card"
    hover
    color="grey-darken-3"
  >
    <v-img
      :src="imageSrc"
      :alt="item.name || 'Producto'"
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

      <!-- Quantity Chip -->
      <v-chip
        class="info-chip quantity-chip"
        color="success"
        size="small"
        variant="elevated"
      >
        {{ item.quantity }} {{ item.unit }}
      </v-chip>

      <!-- Expiry Date Chip -->
      <v-chip
        v-if="item.expiryDate"
        class="info-chip expiry-chip"
        color="success"
        size="small"
        variant="elevated"
      >
        {{ formatDate(item.expiryDate) }}
      </v-chip>
    </v-img>

    <v-card-text>
      <!-- Header with title and menu -->
      <div class="d-flex align-center justify-space-between mb-2">
        <h4 class="text-h6 mb-0">{{ item.name }}</h4>
        
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
            <v-list-item @click="$emit('edit', item.id)">
              <v-list-item-title>Editar</v-list-item-title>
              <template v-slot:prepend>
                <v-icon>mdi-pencil</v-icon>
              </template>
            </v-list-item>
            <v-list-item @click="$emit('delete', item.id)">
              <v-list-item-title>Eliminar</v-list-item-title>
              <template v-slot:prepend>
                <v-icon color="error">mdi-delete</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Additional Info -->
      <div class="mt-2" v-if="item.metadata?.description">
        <p class="text-body-2 text-grey-darken-1 mb-0">
          {{ item.metadata.description }}
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
    validator: (item) => {
      return item.name && item.category
    }
  }
})

defineEmits(['edit', 'delete'])

const defaultImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect fill='%23eeeeee' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial, Helvetica, sans-serif' font-size='24'>Sin imagen</text></svg>"

const imageSrc = computed(() => {
  const item = props.item || {}
  return (
    item.image ||
    item.metadata?.image ||
    item.metadata?.imageUrl ||
    defaultImage
  )
})

const getStatusColor = (status) => {
  switch (status) {
    case 'available': return 'success'
    case 'low': return 'warning'
    case 'expired': return 'error'
    default: return 'grey'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'available': return 'Disponible'
    case 'low': return 'Poco Stock'
    case 'expired': return 'Vencido'
    default: return 'Desconocido'
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES')
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

.info-chip {
  position: absolute;
  top: 8px;
}

.quantity-chip {
  left: 8px;
}

.expiry-chip {
  right: 8px;
}
</style>