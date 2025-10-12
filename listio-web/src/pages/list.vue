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

      <!-- Back Button -->
      <div class="mb-4">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          color="grey-darken-3"
          @click="goBackToLists"
          class="back-btn"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
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
                  <p class="text-caption text-grey-darken-2">{{ item.quantity || 1 }} {{ item.unit || 'g' }}</p>
                </div>

                <div class="item-buttons">
                  <v-checkbox
                    :model-value="item.purchased"
                    @click="toggleChecked(item)"
                    :ripple="false"
                    color="black"
                    base-color="black"
                    hide-details
                  />
                  <div class="item-menu">
                    <button 
                      class="menu-button"
                      @click.stop="toggleItemMenu(item.id, $event)"
                      @blur="hideItemMenu"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="12" cy="5" r="1"/>
                        <circle cx="12" cy="19" r="1"/>
                      </svg>
                    </button>
                    
                    <div v-if="activeItemMenu === item.id" class="menu-dropdown">
                      <div class="menu-item" @click="openEditDialog(item)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <span>Editar</span>
                      </div>
                      <div class="menu-item delete-item" @click="deleteItem(item)">
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
      @click="openProductSelectionDialog"
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

    <!-- Item Edit Dialog -->
    <div v-if="itemMenuDialog" class="modal-overlay">
      <div class="modal item-edit-modal">
        <h2>Editar Producto</h2>
        
        <!-- Mostrar información del producto (solo lectura) -->
        <div v-if="selectedItem" class="product-info">
          <h3>{{ selectedItem.name }}</h3>
          <p v-if="selectedItem.product?.metadata?.description">{{ selectedItem.product.metadata.description }}</p>
        </div>
        
        <form @submit.prevent="saveItemEdit">
          <div class="form-group">
            <label for="editItemName">{{t('common.name')}}</label>
            <input
              id="editItemName"
              v-model="editItemName"
              type="text"
              class="form-input"
              required
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="editItemQuantity">Cantidad</label>
              <input
                id="editItemQuantity"
                v-model="editItemQuantity"
                type="number"
                min="1"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label for="editItemUnit">Unidad</label>
              <select id="editItemUnit" v-model="editItemUnit" class="form-input">
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="g">Gramo</option>
                <option value="l">Litro</option>
                <option value="ml">Mililitro</option>
                <option value="paquete">Paquete</option>
                <option value="caja">Caja</option>
              </select>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn--cancel" @click="itemMenuDialog = false">
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn--primary"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

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

    <!-- Product Selection Dialog -->
    <div v-if="productSelectionDialog" class="modal-overlay">
      <div class="modal product-selection-modal">
  <h2>{{ t('pages.pantry.productSelection.title') || t('pages.list.productSelection.title') }}</h2>

        <!-- Search and quick create toggle -->
        <div class="form-row" style="align-items: end; margin-bottom: 12px;">
          <div class="form-group" style="flex:2">
            <label for="productSearch">{{ t('pages.list.productSelection.searchLabel') }}</label>
            <input id="productSearch" v-model="productSearchQuery" type="text" class="form-input" :placeholder="t('pages.products.searchPlaceholder') || 'Buscar producto'" />
          </div>
          <div class="form-group" style="flex:1">
            <label>&nbsp;</label>
            <button type="button" class="btn btn--primary" @click="startCreateNewProduct">{{ t('pages.list.productSelection.createNew') }}</button>
          </div>
        </div>

        <!-- Products list or empty state -->
        <div v-if="!creatingNewProduct">
          <div v-if="filteredAvailableProducts.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <p class="empty-text">{{ t('pages.list.productSelection.empty.noMatchesTitle') }}</p>
            <p class="empty-subtext">{{ t('pages.list.productSelection.empty.createSuggestion') }}</p>
            <div class="modal-actions" style="justify-content:center">
              <button type="button" class="btn btn--primary" @click="startCreateNewProduct">{{ t('pages.list.productSelection.empty.createAction', { name: productSearchQuery || t('pages.list.productSelection.empty.newProductFallback') }) }}</button>
            </div>
          </div>

          <div v-else class="products-grid">
            <div
              v-for="product in filteredAvailableProducts"
              :key="product.id"
              class="product-card"
              :class="{ 'selected': selectedProduct?.id === product.id }"
              @click="selectProduct(product)"
            >
              <div class="product-content">
                <div class="product-image">
                  <img 
                    v-if="product.metadata?.image" 
                    :src="product.metadata.image" 
                    :alt="product.name"
                    class="product-img"
                  />
                  <div v-else class="image-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                  </div>
                </div>
                <div class="product-info">
                  <h4 class="product-name">{{ product.name }}</h4>
                  <p v-if="product.metadata?.description" class="product-description">
                    {{ product.metadata.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedProduct" class="product-details">
            <div class="divider"></div>
            <h4 class="details-title">{{ t('pages.list.productSelection.detailsTitle') }}</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="productQuantity">{{ t('pages.list.productSelection.createForm.quantityLabel') || t('common.quantity') }}</label>
                <input
                  id="productQuantity"
                  v-model="productQuantity"
                  type="number"
                  min="1"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="productUnit">{{ t('pages.list.productSelection.createForm.unitLabel') || 'Unidad' }}</label>
                <select id="productUnit" v-model="productUnit" class="form-input">
                  <option value="unidad">Unidad</option>
                  <option value="kg">Kilogramo</option>
                  <option value="g">Gramo</option>
                  <option value="l">Litro</option>
                  <option value="ml">Mililitro</option>
                  <option value="paquete">Paquete</option>
                  <option value="caja">Caja</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Create new product form -->
        <div v-else class="product-details">
          <div class="divider"></div>
          <h4 class="details-title">{{ t('pages.list.productSelection.createForm.title') }}</h4>
          <form @submit.prevent="createAndAddNewProduct">
            <div class="form-group">
              <label for="newProductName">{{ t('pages.list.productSelection.createForm.nameLabel') }}</label>
              <input id="newProductName" v-model="newProductForm.name" type="text" class="form-input" :placeholder="t('pages.list.productSelection.createForm.namePlaceholder')" required />
            </div>
            <div class="form-group">
              <label for="newProductDesc">{{ t('pages.list.productSelection.createForm.descriptionLabel') }}</label>
              <input id="newProductDesc" v-model="newProductForm.description" type="text" class="form-input" :placeholder="t('pages.list.productSelection.createForm.descriptionPlaceholder')" />
            </div>
            <div class="form-group">
              <label for="newProductCategory">{{ t('pages.list.productSelection.createForm.categoryLabel') }}</label>
              <select id="newProductCategory" v-model="newProductForm.category" class="form-input" required>
                <option disabled value="">{{ t('pages.list.productSelection.createForm.categoryPlaceholder') }}</option>
                <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat">{{ cat.name }}</option>
                <option value="__new__">{{ t('pages.list.productSelection.createForm.newCategoryOption') }}</option>
              </select>
            </div>
            <div v-if="newProductForm.category === '__new__'" class="form-group">
              <label for="newCategoryName">{{ t('pages.list.productSelection.createForm.newCategoryNameLabel') }}</label>
              <input id="newCategoryName" v-model="newProductForm.newCategoryName" type="text" class="form-input" :placeholder="t('pages.list.productSelection.createForm.newCategoryNamePlaceholder')" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="newProdQty">{{ t('pages.list.productSelection.createForm.quantityLabel') || t('common.quantity') }}</label>
                <input id="newProdQty" v-model="productQuantity" type="number" min="1" class="form-input" />
              </div>
              <div class="form-group">
                <label for="newProdUnit">{{ t('pages.list.productSelection.createForm.unitLabel') }}</label>
                <select id="newProdUnit" v-model="productUnit" class="form-input">
                  <option value="unidad">Unidad</option>
                  <option value="kg">Kilogramo</option>
                  <option value="g">Gramo</option>
                  <option value="l">Litro</option>
                  <option value="ml">Mililitro</option>
                  <option value="paquete">Paquete</option>
                  <option value="caja">Caja</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-actions">
          <button type="button" class="btn btn--cancel" @click="productSelectionDialog = false; creatingNewProduct = false">
            {{ t('common.cancel') }}
          </button>
          <template v-if="!creatingNewProduct">
            <button
              type="button"
              class="btn btn--primary"
              :disabled="!selectedProduct"
              @click="addSelectedProductToList"
            >
              {{ t('pages.list.productSelection.addToList') }}
            </button>
          </template>
          <template v-else>
            <button
              type="submit"
              class="btn btn--primary"
              :disabled="!newProductForm.name || !newProductForm.category || creatingNewProductLoading"
              @click="createAndAddNewProduct"
            >
              {{ creatingNewProductLoading ? t('pages.list.productSelection.createForm.creating') : t('pages.list.productSelection.createForm.submit') }}
            </button>
          </template>
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
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { useRoute } from 'vue-router'
import { useListItemsStore } from '@/stores/listItems'
import { useListsStore } from '@/stores/lists'
import { useProductStore } from '@/stores/products'
import { useCategoryStore } from '@/stores/category'
import listsApi from '@/api/lists'
import SearchBar from '@/components/SearchBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import NewItemDialog from '@/components/NewItemDialog.vue'

const { t } = useLanguage()
// Use listItems store for per-list persistence
const route = useRoute()
const listItemsStore = useListItemsStore()
const listsStore = useListsStore()
const productStore = useProductStore()
const categoryStore = useCategoryStore()

const items = computed(() => listItemsStore.items)
const availableProducts = computed(() => {
  return productStore.products || []
})

// Load the items for the requested list id (query param `id`). If no id
// present, keep items empty.
const loadForRoute = async () => {
  const id = route.query.id || null
  // route.query values are strings; try to coerce numeric ids
  const listId = id ? (Number(id) || id) : null
  
  if (listId) {
    // Cargar desde localStorage primero (para mostrar datos inmediatamente)
    listItemsStore.load(listId)
    
    // Luego intentar obtener datos actualizados del servidor
    try {
      await listItemsStore.fetchRemote()
      console.log('Items cargados desde el servidor para lista:', listId)
    } catch (error) {
      console.warn('No se pudieron cargar items desde el servidor, usando datos locales:', error)
    }
  }
}

const currentListName = computed(() => {
  const id = route.query.id || null
  const listId = id ? (Number(id) || id) : null
  const list = listId ? listsStore.getById(listId) : null
  return list ? `Lista: ${list.name}` : 'My List'
})

onMounted(async () => await loadForRoute())
watch(() => route.fullPath, async () => await loadForRoute())
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
const productSelectionDialog = ref(false)
const selectedProduct = ref(null)
const productQuantity = ref(1)
const productUnit = ref('g')
const activeItemMenu = ref(null)
// Product selection helpers
const productSearchQuery = ref('')
const creatingNewProduct = ref(false)
const creatingNewProductLoading = ref(false)
const newProductForm = ref({ name: '', description: '', category: '', newCategoryName: '' })

// Item edit modal state
const editItemQuantity = ref(1)
const editItemUnit = ref('unidad')

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
  editItemQuantity.value = item.quantity || 1
  editItemUnit.value = item.unit || 'unidad'
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
    category: formData.category || t('common.noCategory'),
    quantity: formData.quantity || 1,
    unit: formData.unit || 'g',
    purchased: false
  })
  newItemDialog.value = false
}

const saveItemEdit = async () => {
  if (!selectedItem.value) return
  
  try {
    // Crear payload según el formato requerido
    const payload = {
      quantity: parseInt(editItemQuantity.value),
      unit: editItemUnit.value,
      metadata: {}
    }
    
    // Actualizar en el servidor usando el endpoint correcto
    await listItemsStore.updateRemote(selectedItem.value.id, payload)
    console.log('Item actualizado en el servidor:', selectedItem.value.name)
  } catch (error) {
    console.error('Error al actualizar item en el servidor:', error)
    // Fallback: actualizar localmente si falla el servidor (sin cambiar el nombre)
    const updatedItem = {
      ...selectedItem.value,
      quantity: parseInt(editItemQuantity.value),
      unit: editItemUnit.value
    }
    listItemsStore.updateItem(selectedItem.value.id, updatedItem)
  }
  itemMenuDialog.value = false
}

const updateItem = async (updated) => {
  try {
    // Crear payload según el formato requerido
    const payload = {
      quantity: parseInt(updated.quantity) || 1,
      unit: updated.unit || 'unidad',
      metadata: {}
    }
    
    // Actualizar en el servidor usando el endpoint correcto
    await listItemsStore.updateRemote(updated.id, payload)
    console.log('Item actualizado en el servidor:', updated.name)
  } catch (error) {
    console.error('Error al actualizar item en el servidor:', error)
    // Fallback: actualizar localmente si falla el servidor
    listItemsStore.updateItem(updated.id, updated)
  }
  itemMenuDialog.value = false
}

const deleteItem = async (item) => {
  try {
    // Eliminar del servidor usando el endpoint correcto
    await listItemsStore.deleteRemote(item.id)
    console.log('Item eliminado del servidor:', item.name)
  } catch (error) {
    console.error('Error al eliminar item del servidor:', error)
    // Fallback: eliminar localmente si falla el servidor
    listItemsStore.deleteItem(item.id)
  }
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

// Product selection functions
const openProductSelectionDialog = async () => {
  productSelectionDialog.value = true
  selectedProduct.value = null
  productQuantity.value = 1
  productUnit.value = 'unidad'
  productSearchQuery.value = ''
  creatingNewProduct.value = false
  creatingNewProductLoading.value = false
  newProductForm.value = { name: '', description: '', category: '', newCategoryName: '' }
  
  // Cargar productos y categorías del servidor si no están disponibles
  try {
    const promises = []
    
    if (!productStore.products || productStore.products.length === 0) {
      promises.push(productStore.fetchRemote())
    }
    
    if (!categoryStore.categories || categoryStore.categories.length === 0) {
      promises.push(categoryStore.fetchRemote())
    }
    
    if (promises.length > 0) {
      await Promise.all(promises)
      console.log('Productos y categorías cargados desde el servidor para selección')
    }
  } catch (error) {
    console.error('Error al cargar productos y categorías:', error)
  }
}

const selectProduct = (product) => {
  selectedProduct.value = product
}

const addSelectedProductToList = async () => {
  if (!selectedProduct.value) return
  if (!listItemsStore.listId && currentListId.value) {
    listItemsStore.load(currentListId.value)
  }
  
  try {
    // Crear payload según el nuevo formato requerido
    const payload = {
      product: {
        id: selectedProduct.value.id
      },
      quantity: parseInt(productQuantity.value),
      unit: productUnit.value,
      metadata: {}
    }
    
    // Usar el store de listItems para agregar el producto
    await listItemsStore.createRemote(payload)
    
    // Refrescar la lista para mostrar el nuevo producto inmediatamente
    await listItemsStore.fetchRemote()
    
    productSelectionDialog.value = false
    selectedProduct.value = null
    productQuantity.value = 1
    productUnit.value = 'unidad'
    
  } catch (error) {
    console.error('Error adding product to list:', error)
  }
}

// Start create-new flow and prefill name from current search
const startCreateNewProduct = () => {
  creatingNewProduct.value = true
  if (!newProductForm.value.name && productSearchQuery.value) {
    newProductForm.value.name = productSearchQuery.value.trim()
  }
  // focus name input on next tick
  nextTick(() => {
    const el = document.getElementById('newProductName')
    if (el) el.focus()
  })
}

// Item menu functions
const toggleItemMenu = (itemId, event) => {
  if (activeItemMenu.value === itemId) {
    activeItemMenu.value = null
  } else {
    activeItemMenu.value = itemId
    // Calculate position for fixed dropdown
    nextTick(() => {
      const button = event.target.closest('.menu-button')
      const dropdown = document.querySelector('.menu-dropdown')
      if (button && dropdown) {
        const rect = button.getBoundingClientRect()
        dropdown.style.top = `${rect.bottom + 8}px`
        dropdown.style.right = `${window.innerWidth - rect.right + 8}px`
      }
    })
  }
}

const hideItemMenu = () => {
  setTimeout(() => {
    activeItemMenu.value = null
  }, 150)
}

// Filter available products by search query
const filteredAvailableProducts = computed(() => {
  const list = availableProducts.value || []
  const q = (productSearchQuery.value || '').trim().toLowerCase()
  if (!q) return list
  return list.filter(p => p.name?.toLowerCase().includes(q) || (p.metadata?.description || '').toLowerCase().includes(q))
})

// Create a new product and immediately add it to the current list
const createAndAddNewProduct = async () => {
  if (creatingNewProductLoading.value) return
  if (!newProductForm.value.name || !newProductForm.value.category) return
  try {
    creatingNewProductLoading.value = true

    // Ensure list context loaded
    if (!listItemsStore.listId && currentListId.value) {
      listItemsStore.load(currentListId.value)
    }

    // 1) Optimistic local add so the user sees it immediately
    const tempId = Date.now()
    const optimisticItem = {
      id: tempId,
      name: newProductForm.value.name.trim(),
      quantity: parseInt(productQuantity.value) || 1,
      unit: productUnit.value || 'unidad',
      purchased: false,
      metadata: {}
    }
    listItemsStore.addItem(optimisticItem, { remote: false })
    // Close dialog right away for perceived performance
    productSelectionDialog.value = false

    // Ensure categories are available
    if (!categoryStore.categories || categoryStore.categories.length === 0) {
      try { await categoryStore.fetchRemote() } catch (e) { /* ignore */ }
    }

    // Create category if needed
    let categoryToUse = newProductForm.value.category
    if (categoryToUse === '__new__') {
      const name = (newProductForm.value.newCategoryName || '').trim()
      if (!name) { creatingNewProductLoading.value = false; return }
      const createdCat = await categoryStore.createRemote({ name, metadata: {} })
      categoryToUse = createdCat
      try { await categoryStore.fetchRemote() } catch (e) { /* ignore */ }
    }

    // Create product
    const payload = {
      name: newProductForm.value.name.trim(),
      metadata: { description: (newProductForm.value.description || '').trim() },
      category: { id: categoryToUse.id }
    }
    const created = await productStore.createRemote(payload)
    // Refresh list of products (optional to ensure it appears)
    try { await productStore.fetchRemote() } catch (e) { /* ignore */ }

    // 2) Add to current list on server
    if (created && created.id) {
      const liPayload = {
        product: { id: created.id },
        quantity: parseInt(productQuantity.value) || 1,
        unit: productUnit.value || 'unidad',
        metadata: {}
      }
      try {
        await listItemsStore.createRemote(liPayload)
      } catch (e) {
        // If server add fails, remove optimistic item and rethrow
        listItemsStore.deleteItem(tempId, { remote: false })
        throw e
      }
      // Refresh from server to reconcile ids and product info
      await listItemsStore.fetchRemote()
    }

    // 3) Reset local state
    creatingNewProduct.value = false
    newProductForm.value = { name: '', description: '', category: '', newCategoryName: '' }
    selectedProduct.value = null
    productQuantity.value = 1
    productUnit.value = 'unidad'
  } catch (e) {
    console.error('Error creando y agregando producto:', e)
    // Rollback optimistic add if still present
    try {
      // If item with tempId exists, remove it
      const exists = (listItemsStore.items || []).some(i => i.id === tempId)
      if (exists) listItemsStore.deleteItem(tempId, { remote: false })
    } catch (er) { /* ignore */ }
  } finally {
    creatingNewProductLoading.value = false
  }
}

const goBackToLists = () => {
  // Navigate back to the lists page
  window.history.back()
}


const applyFilters = (appliedFilters) => {
  filters.value = { ...appliedFilters }
}

// Toggle purchased state and persist
const toggleChecked = async (item) => {
  try {
    // Usar el método específico para marcar como comprado
    await listItemsStore.markAsPurchasedRemote(item.id, !item.purchased)
    console.log('Estado purchased actualizado en el servidor:', item.name, 'purchased:', !item.purchased)
  } catch (error) {
    console.error('Error al actualizar estado purchased en el servidor:', error)
    // Fallback: actualizar localmente si falla el servidor
    listItemsStore.updateItem(item.id, { purchased: !item.purchased })
  }
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

/* Product Selection Dialog Styles */
.product-selection-modal {
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-text {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 8px;
}

.empty-subtext {
  font-size: 0.9rem;
  color: #999;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.product-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
}

.product-card:hover {
  border-color: #1976d2;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
}

.product-card.selected {
  border-color: #1976d2;
  background-color: #e3f2fd;
}

.product-content {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.product-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-img {
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
  border: 1px solid #e0e0e0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.product-description {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.product-details {
  margin-top: 20px;
}

.divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 20px 0;
}

.details-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 4px;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #424242;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.form-input select {
  background-color: white;
  cursor: pointer;
}

/* Item menu styles */
.item-menu {
  position: relative;
  z-index: 1000;
}

.menu-button {
  background: rgba(0, 0, 0, 0.05);
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
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.menu-button:active {
  background: rgba(0, 0, 0, 0.15);
  transform: scale(0.95);
}

.menu-dropdown {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 10000;
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

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10002;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal h2 {
  margin: 0 0 24px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn--cancel {
  background: #f5f5f5;
  color: #666;
}

.btn--cancel:hover {
  background: #e0e0e0;
}

.btn--primary {
  background: #4CAF50;
  color: white;
}

.btn--primary:hover {
  background: #45a049;
}

/* Back button styles */
.back-btn {
  margin-bottom: 16px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
    max-height: 250px;
  }
}
</style>