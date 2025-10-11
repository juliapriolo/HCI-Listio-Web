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
        <div class="actions-menu">
          <button 
            class="menu-button"
            @click.stop="toggleMenu"
            @blur="hideMenu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
          
          <div v-if="showMenu" class="menu-dropdown">
            <div class="menu-item" @click="handleMenuAction('edit', item.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span>Editar</span>
            </div>
            <div class="menu-item delete-item" @click="handleMenuAction('delete', item.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              <span>Eliminar</span>
            </div>
          </div>
        </div>
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
import { computed, ref } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
    validator: (item) => {
      return item.name && item.category
    }
  }
})

const emit = defineEmits(['edit', 'delete'])

const showMenu = ref(false)

const toggleMenu = (event) => {
  event.stopPropagation()
  showMenu.value = !showMenu.value
}

const hideMenu = () => {
  setTimeout(() => {
    showMenu.value = false
  }, 150)
}

const handleMenuAction = (action, itemId) => {
  showMenu.value = false
  if (action === 'edit') {
    emit('edit', itemId)
  } else if (action === 'delete') {
    emit('delete', itemId)
  }
}

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
  overflow: visible;
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

/* Custom menu styles */
.actions-menu {
  position: relative;
  z-index: 100;
}

.menu-button {
  background: rgba(0, 0, 0, 0.1);
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  position: relative;
  z-index: 10;
}

.menu-button:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.menu-button:active {
  background: rgba(0, 0, 0, 0.3);
  transform: scale(0.95);
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: -8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  min-width: 140px;
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
</style>