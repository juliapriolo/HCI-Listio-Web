<template>
  <div class="history-page">
    <v-container>
      <!-- Page Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div class="d-flex align-center" style="margin-left: -12px;">
          <v-btn
            icon
            size="small"
            variant="text"
            color="black"
            @click="router.back()"
            class="mr-1"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h4 font-weight-bold text-grey-darken-3 mb-0">
            Historial
          </h1>
        </div>
        
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
        <div v-else class="lists-grid mb-8">
          <ListCard
            v-for="ev in listEvents"
            :key="ev.id"
            :list="mapEventToList(ev)"
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
          variant="text"
          color="error"
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

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      color="info"
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

// Initialize history store only once
let initialized = false
onMounted(() => {
  if (!initialized && !history.events.length) {
    history.init()
    initialized = true
  }
})

const allEvents = computed(() => history.events || [])

// Filter events by resource type
const listEvents = computed(() => {
  let events = allEvents.value.filter(e => e.resource === 'list' || e.type.includes('list'))
  if (filterText.value) {
    const q = filterText.value.toLowerCase()
    events = events.filter(e => 
      (e.data?.name && e.data.name.toLowerCase().includes(q)) ||
      (e.data && JSON.stringify(e.data).toLowerCase().includes(q))
    )
  }
  return events
})

const itemEvents = computed(() => {
  let events = allEvents.value.filter(e => e.resource === 'listItem' || e.type.includes('item'))
  if (filterText.value) {
    const q = filterText.value.toLowerCase()
    events = events.filter(e => 
      (e.data?.name && e.data.name.toLowerCase().includes(q)) ||
      (e.data && JSON.stringify(e.data).toLowerCase().includes(q))
    )
  }
  return events
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
    recurring: ev.data?.recurring || false,
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
    (e.resource === 'listItem' || e.type.includes('item')) && 
    e.listId === listId
  )
  
  if (itemsFromList.length === 0) {
    snackbarText.value = 'Esta lista no tenía productos'
    snackbar.value = true
  } else {
    selectedListName.value = listName
    selectedListItems.value = itemsFromList
    showListDialog.value = true
  }
}

function clearHistory() {
  if (confirm('¿Borrar todo el historial?')) {
    history.clear()
  }
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
</style>
