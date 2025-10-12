<template>
  <v-card
    class="list-card"
    :class="{ 'menu-open': showMenu }"
    elevation="2"
  >
    <div class="list-content" @click="$emit('click')">
      <div class="list-image">
        <img 
          v-if="list.image" 
          :src="list.image" 
          :alt="list.name" 
        />
        <div v-else class="image-placeholder">
          <v-icon size="32" color="grey-lighten-1">mdi-format-list-bulleted</v-icon>
        </div>
      </div>
      <div class="list-info">
        <h3 class="list-title">{{ list.name }}</h3>
        <!-- Shared indicator -->
        <p v-if="isSharedWithMe" class="shared-by">
          <v-icon size="16" class="mr-1" color="#1976d2">mdi-account-multiple</v-icon>
          Compartida por {{ ownerLabel }}
        </p>
        <p v-if="list.description" class="list-description">{{ list.description }}</p>
        <div class="list-details">
          <span class="item-count">{{ list.itemCount || 0 }} productos</span>
          <span v-if="list.completedItems && list.itemCount" class="progress-info">
            {{ Math.round((list.completedItems / list.itemCount) * 100) }}% completado
          </span>
        </div>
        <p v-if="list.lastUpdated" class="last-updated">
          Actualizada {{ formatDate(list.lastUpdated) }}
        </p>
      </div>
    </div>
    
    <!-- Menu Button -->
    <div v-if="!hideActions" class="list-menu">
      <button 
        class="menu-button"
        @click.stop="toggleMenu"
        @blur="hideMenu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="12" cy="5" r="1"/>
          <circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
      
      <div v-if="showMenu" class="menu-dropdown">
        <div class="menu-item" @click="handleMenuAction('share', list.id)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49"/>
          </svg>
          <span>{{ t('common.share') }}</span>
        </div>
        <div class="menu-item" @click="handleMenuAction('edit', list.id)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>{{ t('common.edit') }}</span>
        </div>
        <div 
          class="menu-item delete-item"
          :class="{ disabled: isSharedWithMe }"
          :title="isSharedWithMe ? 'No es posible eliminar una lista compartida' : ''"
          @click="handleMenuAction('delete', list.id)"
        >
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
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  list: {
    type: Object,
    required: true,
    validator: (list) => {
      // Require a name and id; image is optional
      return !!(list && list.name && (list.id !== undefined && list.id !== null))
    }
  },
  hideActions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'edit', 'delete', 'share'])

const { t } = useLanguage()
const userStore = useUserStore()

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

const handleMenuAction = (action, listId) => {
  // Close menu immediately to prevent z-index conflicts
  showMenu.value = false
  
  // Use nextTick to ensure the menu is closed before emitting the event
  nextTick(() => {
    if (action === 'edit') {
      emit('edit', listId)
    } else if (action === 'delete') {
      // Always notify parent; parent decides whether to show snackbar or dialog
      emit('delete', listId)
    } else if (action === 'share') {
      emit('share', listId)
    }
  })
}

const formatDate = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const listDate = new Date(date)
  const diffDays = Math.floor((now - listDate) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'hoy'
  if (diffDays === 1) return 'ayer'
  if (diffDays < 7) return `hace ${diffDays} días`
  
  return listDate.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  })
}

// --- Shared ownership helpers ---
const currentUserId = computed(() => userStore?.profile?.id || null)

function getOwnerId(l) {
  // Try common owner fields
  return (
    l?.ownerId ?? l?.owner_id ?? l?.owner?.id ?? l?.createdBy?.id ?? l?.created_by?.id ?? null
  )
}

function getSharedByInfo(l) {
  // Prefer the inviter if present
  return l?.sharedBy || l?.shared_by || null
}

function getOwnerInfo(l) {
  return l?.owner || l?.createdBy || l?.created_by || null
}

const isSharedWithMe = computed(() => {
  const sharedFlag = props.list?.shared === true
  const sharedBy = getSharedByInfo(props.list)
  const ownerId = getOwnerId(props.list)
  const me = currentUserId.value
  return Boolean(
    sharedFlag || sharedBy || (ownerId && me && String(ownerId) !== String(me))
  )
})

const ownerLabel = computed(() => {
  // Prefer showing who shared it with me
  const inviter = getSharedByInfo(props.list)
  if (inviter) {
    const name = [inviter.name, inviter.surname].filter(Boolean).join(' ').trim()
    return name || inviter.email || inviter.username || 'alguien'
  }
  // Fallback to list owner
  const info = getOwnerInfo(props.list)
  if (info) {
    const name = [info.name, info.surname].filter(Boolean).join(' ').trim()
    return name || info.email || info.username || 'el propietario'
  }
  // If we only know it's shared but lack details
  return 'el propietario'
})
</script>

<style scoped>
.list-card {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border-radius: 8px;
  background-color: white;
  border: 0.5px solid #9e9e9e;
  box-shadow: none;
  overflow: visible; /* ensure dropdown menu is not clipped by card */
  z-index: 1;
}

.list-card.menu-open {
  z-index: 10000;
}

.list-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.list-content {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 20px;
  height: 140px;
}

.list-menu {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10000;
}

/* Custom menu styles for lists */
.menu-button {
  background: white;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
  z-index: 10;
}

.menu-button:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

.menu-button:active {
  background: #e0e0e0;
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

.menu-item.disabled {
  opacity: 0.7;
}

.list-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.list-image img {
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

.list-info {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 80px;
}

.list-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #424242;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.shared-by {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 6px 0;
  font-size: 0.9rem;
  color: #1976d2;
}

.list-description {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.3;
  max-height: 2.6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.list-details {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.item-count {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.progress-info {
  font-size: 0.9rem;
  color: #1976d2;
  font-weight: 500;
}

.last-updated {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
  line-height: 1.3;
}
</style>