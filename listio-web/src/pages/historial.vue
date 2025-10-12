<template>
  <div class="history-page">
    <v-container>
      <!-- Page Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Historial
        </h1>
        
        <div class="search-wrapper">
          <v-text-field
            v-model="filterText"
            placeholder="Buscar eventos..."
            density="compact"
            variant="outlined"
            clearable
            prepend-inner-icon="mdi-magnify"
            hide-details
          />
        </div>

        <!-- Empty space to match the layout of listas.vue -->
        <div class="ml-4"></div>
      </div>

      <!-- Back Button -->
      <div class="mb-4">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          color="grey-darken-3"
          @click="router.back()"
          class="back-btn"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </div>

      <!-- Tabs -->
      <v-tabs v-model="activeTab" class="mb-4">
        <v-tab value="lists">Listas</v-tab>
        <v-tab value="items">Productos</v-tab>
      </v-tabs>

      <!-- Lists Tab -->
      <div v-if="activeTab === 'lists'">
        <!-- Empty State -->
        <EmptyState
          v-if="listEvents.length === 0"
          icon="mdi-format-list-bulleted"
          title="No hay listas en el historial"
          description="Las listas eliminadas aparecerán aquí"
        />

        <!-- Lists Grid -->
        <div v-else class="history-grid mb-8">
          <ListCard
            v-for="ev in listEvents"
            :key="ev.id"
            :list="mapEventToList(ev)"
            :hide-actions="true"
            @click="openListHistory(ev)"
          />
        </div>
      </div>

      <!-- Items Tab -->
      <div v-if="activeTab === 'items'">
        <!-- Empty State -->
        <EmptyState
          v-if="itemEvents.length === 0"
          icon="mdi-cart-outline"
          title="No hay productos en el historial"
          description="Los productos de listas eliminadas aparecerán aquí"
        />

        <!-- Items Grid -->
        <div v-else class="history-grid mb-8">
          <v-card
            v-for="ev in itemEvents"
            :key="ev.id"
            class="history-card"
            elevation="1"
          >
            <div class="d-flex align-center pa-4">
              <v-avatar size="48" color="#f5f5f5" class="mr-4">
                <v-icon color="primary">mdi-package-variant</v-icon>
              </v-avatar>

              <div class="flex-grow-1">
                <div class="text-subtitle-1 font-weight-medium">
                  {{ ev.data?.name || 'Producto sin nombre' }}
                </div>
                <div class="text-body-2 text-grey-darken-1">
                  Lista: {{ getListName(ev) }}
                </div>
                <div class="text-caption text-grey mt-1">
                  {{ formatDate(ev.ts) }}
                </div>
              </div>
            </div>
          </v-card>
        </div>
      </div>

      <!-- Clear History Action -->
      <div v-if="allEvents.length > 0" class="text-center mt-6">
        <v-btn
          color="#f44336"
          variant="elevated"
          class="text-none"
          min-width="100"
          @click="clearHistory"
        >
          Limpiar historial
        </v-btn>
      </div>
    </v-container>

    <!-- Dialog for List Items -->
    <DeletedListItemsDialog
      v-model="showListDialog"
      :list-name="selectedListName"
      :items="selectedListItems"
    />

    <!-- Confirm Clear History Dialog -->
    <div v-if="showClearConfirm" class="modal-overlay">
      <div class="modal delete-confirmation-modal">
        <h2>Confirmar acción</h2>
        
        <div class="confirmation-content">
          <p class="confirmation-text">
            ¿Está seguro que desea borrar todo el historial? Esta acción no se puede deshacer.
          </p>
        </div>
        
        <div class="modal-actions">
          <button type="button" class="btn btn--cancel" @click="showClearConfirm = false">
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn--danger"
            @click="confirmClearHistory"
          >
            Borrar
          </button>
        </div>
      </div>
    </div>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      color="success"
      location="bottom"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar = false"
        >
          OK
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import { useHistoryStore } from '@/stores/history'
import EmptyState from '@/components/EmptyState.vue'
import ListCard from '@/components/ListCard.vue'
import DeletedListItemsDialog from '@/components/DeletedListItemsDialog.vue'

const { t } = useLanguage()
const router = useRouter()
const history = useHistoryStore()

const filterText = ref('')
const activeTab = ref('lists')
const showListDialog = ref(false)
const selectedListItems = ref([])
const selectedListName = ref('')
const snackbar = ref(false)
const snackbarText = ref('')
const showClearConfirm = ref(false)

// Initialize history store only once
let initialized = false
onMounted(() => {
  if (!initialized && !history.events.length) {
    history.init()
    initialized = true
  }
})

const allEvents = computed(() => history.events || [])

// Filter events by resource type - only show deleted lists
const listEvents = computed(() => {
  let events = allEvents.value.filter(e => e.type === 'list.delete')
  
  // Apply text filter if present
  if (filterText.value) {
    const q = filterText.value.toLowerCase()
    events = events.filter(e => 
      (e.data?.name && e.data.name.toLowerCase().includes(q)) ||
      (e.data && JSON.stringify(e.data).toLowerCase().includes(q))
    )
  }
  
  // Deduplicate: Keep only the most recent event for each unique resourceId
  const uniqueListsMap = new Map()
  for (const event of events) {
    const key = event.resourceId || event.id
    if (!uniqueListsMap.has(key) || uniqueListsMap.get(key).ts < event.ts) {
      uniqueListsMap.set(key, event)
    }
  }
  
  // Convert back to array and sort by timestamp (most recent first)
  return Array.from(uniqueListsMap.values()).sort((a, b) => b.ts - a.ts)
})

const itemEvents = computed(() => {
  let events = allEvents.value.filter(e => e.type === 'listItem.delete')
  
  // Apply text filter if present
  if (filterText.value) {
    const q = filterText.value.toLowerCase()
    events = events.filter(e => 
      (e.data?.name && e.data.name.toLowerCase().includes(q)) ||
      (e.data && JSON.stringify(e.data).toLowerCase().includes(q))
    )
  }
  
  // Deduplicate: Keep only the most recent event for each unique resourceId
  const uniqueItemsMap = new Map()
  for (const event of events) {
    const key = event.resourceId || event.id
    if (!uniqueItemsMap.has(key) || uniqueItemsMap.get(key).ts < event.ts) {
      uniqueItemsMap.set(key, event)
    }
  }
  
  // Convert back to array and sort by timestamp (most recent first)
  return Array.from(uniqueItemsMap.values()).sort((a, b) => b.ts - a.ts)
})

function formatDate(ts) { 
  try { 
    return new Date(ts).toLocaleString() 
  } catch (e) { 
    return String(ts) 
  } 
}

function mapEventToList(ev) {
  // Map history event to list format for ListCard
  return {
    id: ev.resourceId || ev.id,
    name: ev.data?.name || 'Lista sin nombre',
    description: ev.data?.description || '',
    image: ev.data?.image || ev.data?.metadata?.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    itemCount: ev.data?.itemCount || 0,
    completedItems: 0,
    lastUpdated: new Date(ev.ts),
    recurring: false, // Always false for deleted lists
    isDeleted: true // Mark as deleted for visual indication
  }
}

function getListName(ev) {
  // Try to get list name from event metadata
  if (ev.data?.listName) return ev.data.listName
  if (ev.meta?.listName) return ev.meta.listName
  if (ev.listId) return `Lista #${ev.listId}`
  return 'Lista desconocida'
}

function openListHistory(ev) {
  // Find all items that belonged to this list
  const listId = ev.resourceId || ev.id
  const listName = ev.data?.name || 'Lista sin nombre'
  
  // Filter items from the same list
  const itemsFromList = allEvents.value.filter(e => 
    e.type === 'listItem.delete' && 
    e.listId === listId
  )
  
  if (itemsFromList.length === 0) {
    // Always show dialog, even if no items found
    // The dialog will show appropriate empty state
    selectedListName.value = listName
    selectedListItems.value = []
    showListDialog.value = true
  } else {
    selectedListName.value = listName
    selectedListItems.value = itemsFromList
    showListDialog.value = true
  }
}

function clearHistory() {
  showClearConfirm.value = true
}

function confirmClearHistory() {
  history.clear()
  showClearConfirm.value = false
  snackbarText.value = 'Historial borrado exitosamente'
  snackbar.value = true
}

</script>

<style scoped>
.history-page {
  padding-top: 2rem;
  padding-bottom: 6rem;
  min-height: calc(100vh - 80px);
  background-color: #fafafa;
}

.lists-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.history-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.history-card {
  background-color: white;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.search-wrapper {
  flex: 1;
  max-width: 400px;
  min-width: 250px;
}

@media (max-width: 768px) {
  .search-wrapper {
    max-width: 100%;
  }
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
  z-index: 2000;
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

.btn--danger {
  background: #f44336;
  color: #fff;
}

.btn--danger:hover:not(:disabled) {
  background: #d32f2f;
}

.btn--danger:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Delete confirmation modal specific styles */
.delete-confirmation-modal {
  max-width: 550px;
}

.confirmation-content {
  margin: 20px 0;
}

.confirmation-text {
  font-size: 1rem;
  color: #333;
  margin-bottom: 16px;
}
</style>
