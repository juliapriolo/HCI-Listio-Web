<template>
  <div class="lists-page">
    <!-- Page Header -->
    <v-container>
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          {{ currentListName }}
        </h1>
        
  <div class="header-actions">
          <div class="search-wrapper">
            <SearchBar
              v-model="searchQuery"
              :placeholder="t('pages.products.searchPlaceholder')"
            />
          </div>
          <v-btn
            icon
            variant="text"
            class="action-btn"
            size="large"
            @click="openFilterDialog"
          >
            <v-icon color="grey-darken-2">mdi-filter-outline</v-icon>
          </v-btn>

          <v-btn
            icon
            variant="text"
            class="action-btn"
            size="large"
            @click="openShareListDialog"
          >
            <v-icon color="grey-darken-2">mdi-export-variant</v-icon>
          </v-btn>

        </div>
      </div>

      <!-- Shopping List -->
      <div class="lists-grid mb-8">
        <div class="list">
          <ul class="list-items">
            <li v-for="item in filteredItems" :key="item.name">
              <div 
                class="list-row" 
                >
                <img src="/icons8-apple-64.png" alt="Manzana" class="category-logo" />

                <div>
                  <h3 class="item-descr">{{ item.name }}</h3>
                  <p class="text-caption text-grey-darken-2">{{ item.category }}</p>
                </div>

                <div class="item-buttons">
                  <v-checkbox
                    :model-value="item.checked"
                    @click="toggleChecked(item)"
                    :ripple="false"
                    color="black"
                    base-color="black"
                    hide-details
                  />
                  <v-btn 
                    icon 
                    variant="plain"
                    style="background-color: transparent;"
                    @click="openEditDialog(item)"
                  >
                    <v-icon color="black">mdi-dots-horizontal</v-icon>
                  </v-btn>
                </div>
              </div>
              <v-divider thickness="2px"/>
            </li>
          </ul>
        </div>
      </div>

      <!-- Empty States -->
      <EmptyState
        v-if="filteredItems.length === 0 && !searchQuery"
        icon="mdi-format-list-bulleted"
        :title="t('pages.list.empty.title')"
        :description="t('pages.list.empty.description')"
      />

      <EmptyState
        v-else-if="filteredItems.length === 0 && searchQuery"
        icon="mdi-magnify"
        :title="t('pages.list.empty.searchTitle')"
        :description="t('pages.list.empty.searchDescription')"
      />
    </v-container>

    <!-- Floating Action Button -->
    <v-btn
      color="success"
      size="large"
      icon
      class="new-item-fab"
      elevation="8"
      @click="openNewItemDialog"
    >
      <v-icon size="24">mdi-plus</v-icon>
    </v-btn>

    <!-- Dialogs -->
    <NewItemDialog
      v-model="newItemDialog"
      v-model:form-data="newItemForm"
      :title="t('pages.list.addItem.title')"
      :submit-text="t('pages.list.addItem.submit')"
      :cancel-text="t('common.cancel')"
      :fields="addItemFields"
      @submit="addItem"
      @cancel="newItemDialog = false"
    />

    <ItemMenuDialog
      v-model="itemMenuDialog"
      :item="selectedItem"
      :categories="categories"
      @update="updateItem"
      @delete="deleteItem"
      @cancel="itemMenuDialog = false"
    />

    <!-- Share List Dialog -->
    <div v-if="shareListDialog" class="modal-overlay">
      <div class="modal list-modal">
        <h2>{{ t('pages.lists.share.title') || 'Compartir lista' }}</h2>
        <form @submit.prevent="shareListWithEmail">
          <div class="form-group">
            <label for="shareEmail">{{ t('pages.lists.share.emailLabel') || 'Correo electrónico' }}</label>
            <input
              id="shareEmail"
              v-model="shareEmail"
              type="email"
              class="form-input"
              :placeholder="t('pages.lists.share.emailPlaceholder') || 'usuario@ejemplo.com'"
              @input="clearShareEmailErrors"
              @blur="shareEmailTouched = true"
              required
            />
            <small v-if="shareEmailTouched && !isShareEmailValid" class="error-text">
              {{ t('pages.lists.share.invalidEmail') || 'Ingresa un correo válido' }}
            </small>
            <small v-if="shareEmailServerError" class="error-text">
              {{ shareEmailServerError }}
            </small>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn--cancel" @click="closeShareListDialog">{{ t('common.cancel') }}</button>
            <button type="submit" class="btn btn--primary" :disabled="!isShareEmailValid || isSharing">
              {{ isSharing ? (t('pages.lists.share.inviting') || 'Compartiendo...') : (t('pages.lists.share.invite') || 'Compartir') }}
            </button>
          </div>
        </form>

        <!-- Current shared users -->
        <div class="shared-users-section">
          <h3 class="section-title">{{ t('pages.lists.share.currentAccess') || 'Acceso actual' }}</h3>
          <div v-if="isLoadingSharedUsers" class="text-center py-4">
            <v-progress-circular indeterminate color="success" size="28" />
          </div>
          <div v-else>
            <p v-if="!sharedUsers.length" class="muted">{{ t('pages.lists.share.noSharedUsers') || 'Nadie más tiene acceso a esta lista.' }}</p>
            <ul v-else class="shared-users-list">
              <li v-for="user in sharedUsers" :key="user.id" class="shared-user-row">
                <div class="user-info">
                  <span class="user-name" v-if="user.name">{{ user.name }}</span>
                  <span class="user-email">{{ user.email || user.username }}</span>
                </div>
                <button class="btn btn--danger revoke-btn" :disabled="isRevokingMap[user.id]" @click="revokeUser(user)">
                  {{ isRevokingMap[user.id] ? (t('pages.lists.share.revoking') || 'Revocando...') : (t('pages.lists.share.revoke') || 'Revocar') }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>


    <FilterList
      v-model="filterDialog"
      :filters="filters"
      :categories="categories"
      @apply="applyFilters"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { useRoute } from 'vue-router'
import { useListItemsStore } from '@/stores/listItems'
import { useListsStore } from '@/stores/lists'
import listsApi from '@/api/lists'
import SearchBar from '@/components/SearchBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import NewItemDialog from '@/components/NewItemDialog.vue'
import ItemMenuDialog from '@/components/ItemMenuDialog.vue'

const { t } = useLanguage()
// Use listItems store for per-list persistence
const route = useRoute()
const listItemsStore = useListItemsStore()
const listsStore = useListsStore()

const items = computed(() => listItemsStore.items)

// Load the items for the requested list id (query param `id`). If no id
// present, keep items empty.
const loadForRoute = () => {
  const id = route.query.id || null
  // route.query values are strings; try to coerce numeric ids
  const listId = id ? (Number(id) || id) : null
  listItemsStore.load(listId)
}

const currentListName = computed(() => {
  const id = route.query.id || null
  const listId = id ? (Number(id) || id) : null
  const list = listId ? listsStore.getById(listId) : null
  return list ? `Mi Lista: ${list.name}` : 'My List'
})

onMounted(() => loadForRoute())
watch(() => route.fullPath, () => loadForRoute())
onBeforeUnmount(() => {
  // stop storage event listening when component unmounts
  try { listItemsStore.stopListening() } catch (e) {}
})

const searchQuery = ref('')
const newItemDialog = ref(false)
const itemMenuDialog = ref(false)
const selectedItem = ref(null)
const shareListDialog = ref(false)
const filterDialog = ref(false)

// Share modal state
const shareEmail = ref('')
const sharedUsers = ref([])
const isLoadingSharedUsers = ref(false)
const isRevokingMap = ref({})
const shareEmailTouched = ref(false)
const shareEmailServerError = ref('')
const isSharing = ref(false)

const currentListId = computed(() => {
  const id = route.query.id || null
  return id ? (Number(id) || id) : null
})

const newItemForm = ref({
  name: '',
  description: ''
})

const filters = ref({
  name: '',
  category: ''
})


const addItemFields = [
  {
    key: 'name',
    label: t('pages.list.fields.product'),
    type: 'text',
    required: true,
    autofocus: true
  },
  {
    key: 'description',
    label: t('pages.list.fields.descriptionOptional'),
    type: 'textarea',
    required: false
  }
]

const isShareEmailValid = computed(() => {
  if (!shareEmail.value) return false
  const emailRegex = /^(?:[a-zA-Z0-9_'^&\-\+])+(?:\.(?:[a-zA-Z0-9_'^&\-\+])+)*@(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/
  return emailRegex.test(shareEmail.value.trim())
})

// Computed
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  return items.value.filter(i =>
    i.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Métodos
const openNewItemDialog = () => {
  newItemForm.value = { name: '', description: '' }
  newItemDialog.value = true
}

const openEditDialog = (item) => {
  selectedItem.value = { ...item }
  itemMenuDialog.value = true
}

const openShareListDialog = () => {
  shareEmail.value = ''
  shareEmailTouched.value = false
  shareEmailServerError.value = ''
  shareListDialog.value = true
  loadSharedUsers()
}

const openFilterDialog = () => {
  filterDialog.value = true
}

const addItem = (formData) => {
  if (!formData.name) return
  listItemsStore.addItem({
    name: formData.name,
    category: t('common.noCategory'),
    checked: false
  })
  newItemDialog.value = false
}

const updateItem = (updated) => {
  listItemsStore.updateItem(updated.id, updated)
  itemMenuDialog.value = false
}

const deleteItem = (item) => {
  listItemsStore.deleteItem(item.id)
  itemMenuDialog.value = false
}

const closeShareListDialog = () => {
  shareListDialog.value = false
  shareEmail.value = ''
  sharedUsers.value = []
  isLoadingSharedUsers.value = false
  isRevokingMap.value = {}
  shareEmailServerError.value = ''
}

const shareListWithEmail = async () => {
  shareEmailTouched.value = true
  if (!currentListId.value || !isShareEmailValid.value) return
  isSharing.value = true
  try {
    await listsApi.share(currentListId.value, { email: shareEmail.value.trim() })
    // Refresh shared users after invite
    await loadSharedUsers()
    shareEmail.value = ''
    shareEmailTouched.value = false
    shareEmailServerError.value = ''
  } catch (error) {
    const code = error?.data?.code || error?.code || ''
    const message = (typeof error?.data === 'object' && error?.data?.message) ? error.data.message : (error?.message || '')
    if (error?.status === 404 || code === 'user_not_found' || /user.*not.*found|usuario.*no.*existe/i.test(message)) {
      shareEmailServerError.value = t('pages.lists.share.userNotFound') || 'Ese email no pertenece a un usuario registrado'
    } else {
      // Generic error fallback
      shareEmailServerError.value = t('pages.lists.share.error') || 'No se pudo compartir la lista'
    }
  } finally {
    isSharing.value = false
  }
}

async function loadSharedUsers() {
  if (!currentListId.value) return
  isLoadingSharedUsers.value = true
  try {
    const data = await listsApi.getSharedUsers(currentListId.value)
    const users = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.users) ? data.users : []))
    sharedUsers.value = users
  } catch (e) {
    sharedUsers.value = []
  } finally {
    isLoadingSharedUsers.value = false
  }
}

async function revokeUser(user) {
  if (!currentListId.value || !user?.id) return
  isRevokingMap.value = { ...isRevokingMap.value, [user.id]: true }
  try {
    await listsApi.revokeShare(currentListId.value, user.id)
    sharedUsers.value = sharedUsers.value.filter(u => u.id !== user.id)
    shareEmailServerError.value = ''
  } catch (e) {
    // Optionally show error state
  } finally {
    isRevokingMap.value = { ...isRevokingMap.value, [user.id]: false }
  }
}

function clearShareEmailErrors() {
  if (shareEmailServerError.value) shareEmailServerError.value = ''
}


const applyFilters = (appliedFilters) => {
  filters.value = { ...appliedFilters }
}

// Toggle checked state and persist
const toggleChecked = (item) => {
  listItemsStore.updateItem(item.id, { checked: !item.checked })
}
</script>

<style scoped>
.lists-page {
  padding-top: 2rem;
  padding-bottom: 6rem;
  height: calc(100vh - 80px);
  background-color: #fafafa;
}

.lists-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .lists-grid {
    max-width: 800px;
  }
}

.new-item-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.list {
  width: 100%;
  margin-top: 15px;
  border-radius: 8px;
}

.list-items {
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  overflow-y: auto;
  background-color: #c5eabd;
  border-radius: 8px;
}

.list-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 60px;
  margin-left: 30px;
  gap: 30px;
}

.item-descr {
  font-family: 'Arial';
  color: black;
  font-weight: lighter;
}

.item-buttons {
  display: flex;
  flex-direction: row;
  margin-left: auto;
  margin-right: 30px;
  align-items: center;
  justify-content: center;
  padding: 6px;
  gap: 30px;
}

.category-logo {
  width: 26px;
  height: auto;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1; /* Ocupar todo el espacio restante */
  gap: 8px;
}
.action-btn {
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content:center;
  transition: background-color 0.2s ease;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.search-wrapper {
  flex: 1;
  max-width: 100%;
  min-width: 250px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

@media (max-width: 600px) {
  .search-wrapper {
    width: 160px;
  }
}

/* Minimal modal styles reused from listas page */
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
  z-index: 1000;
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

.btn--primary { background: #4CAF50; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #45A049; }
.btn--primary:disabled { background: #ccc; cursor: not-allowed; }
.btn--cancel { background: #f5f5f5; color: #333; }
.btn--cancel:hover { background: #e0e0e0; }
.btn--danger { background: #f44336; color: #fff; }
.btn--danger:hover:not(:disabled) { background: #d32f2f; }
.btn--danger:disabled { background: #ccc; cursor: not-allowed; }

.form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
.form-group label { font-size: 0.9rem; font-weight: 500; color: #555; margin-bottom: 4px; }
.form-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; color: #424242; transition: border-color 0.2s ease; }
.form-input:focus { outline: none; border-color: #4CAF50; box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1); }
.form-input:disabled { background-color: #f5f5f5; color: #999; cursor: not-allowed; }
.form-input::placeholder { color: #9e9e9e; opacity: 1; }
.error-text { color: #d32f2f; font-size: 0.8rem; margin-top: 4px; }

.shared-users-section { margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px; }
.section-title { font-size: 1.1rem; color: #333; margin-bottom: 12px; }
.shared-users-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.shared-user-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #fafafa; border: 1px solid #eee; border-radius: 8px; }
.user-info { display: flex; gap: 8px; align-items: baseline; }
.user-name { font-weight: 600; color: #333; }
.user-email { color: #555; }
.revoke-btn { flex: 0 0 auto; padding: 6px 12px; }
</style>