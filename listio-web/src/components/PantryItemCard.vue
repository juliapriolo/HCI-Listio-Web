<template>
  <v-card
    class="pantry-item-card"
    :class="getStatusClass()"
  >
    <v-card-text>
      <!-- Header with image and basic info -->
      <div class="d-flex align-center mb-3">
        <v-avatar
          size="48"
          class="mr-3"
        >
          <v-img :src="item.image" :alt="item.name" />
        </v-avatar>
        
        <div class="flex-grow-1">
          <h4 class="text-h6 mb-1">{{ item.name }}</h4>
          <p class="text-body-2 text-grey-darken-1 mb-0">
            {{ item.category }}
          </p>
        </div>

        <!-- Actions Menu -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="text"
              size="small"
              v-bind="props"
            />
          </template>
          <v-list>
            <v-list-item @click="$emit('edit', item)">
              <v-list-item-title>Editar</v-list-item-title>
              <template v-slot:prepend>
                <v-icon>mdi-pencil</v-icon>
              </template>
            </v-list-item>
            <v-list-item @click="$emit('delete', item)">
              <v-list-item-title>Eliminar</v-list-item-title>
              <template v-slot:prepend>
                <v-icon>mdi-delete</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Quantity Info -->
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-body-2 text-grey-darken-1">
          Cantidad:
        </span>
        <v-chip
          :color="getQuantityColor(item.quantity)"
          size="small"
        >
          {{ item.quantity }} {{ item.unit }}
        </v-chip>
      </div>

      <!-- Expiry Date -->
      <div class="d-flex align-center justify-space-between mb-2" v-if="item.expiryDate">
        <span class="text-body-2 text-grey-darken-1">
          Vence:
        </span>
        <span class="text-body-2" :class="getExpiryDateClass(item.expiryDate)">
          {{ formatDate(item.expiryDate) }}
        </span>
      </div>

      <!-- Status Indicator -->
      <div class="d-flex align-center justify-space-between" v-if="item.status">
        <span class="text-body-2 text-grey-darken-1">
          Estado:
        </span>
        <v-chip
          :color="getStatusColor(item.status)"
          size="small"
          variant="tonal"
        >
          {{ getStatusText(item.status) }}
        </v-chip>
      </div>

      <!-- Quick Actions -->
      <div class="d-flex gap-2 mt-3">
        <v-btn
          size="small"
          variant="outlined"
          color="primary"
          prepend-icon="mdi-plus"
          @click="$emit('add-quantity', item)"
        >
          Agregar
        </v-btn>
        <v-btn
          size="small"
          variant="outlined"
          color="warning"
          prepend-icon="mdi-minus"
          @click="$emit('remove-quantity', item)"
          :disabled="item.quantity <= 0"
        >
          Usar
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
    validator: (item) => {
      return item.name && item.category
    }
  }
})

defineEmits(['edit', 'delete', 'add-quantity', 'remove-quantity'])

const getStatusClass = () => {
  if (!props.item.status) return ''
  
  switch (props.item.status) {
    case 'low': return 'border-warning'
    case 'expired': return 'border-error'
    default: return ''
  }
}

const getQuantityColor = (quantity) => {
  if (quantity <= 0) return 'error'
  if (quantity <= 1) return 'warning'
  return 'success'
}

const getExpiryDateClass = (expiryDate) => {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiry < 0) return 'text-error'
  if (daysUntilExpiry <= 7) return 'text-warning'
  return 'text-success'
}

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
.pantry-item-card {
  transition: transform 0.2s ease-in-out;
  height: 100%;
}

.pantry-item-card:hover {
  transform: translateY(-2px);
}

.border-warning {
  border-left: 4px solid #ff9800;
}

.border-error {
  border-left: 4px solid #f44336;
}
</style>