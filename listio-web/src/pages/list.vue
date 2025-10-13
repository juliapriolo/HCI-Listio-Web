<template>
  <div class="lists-page">
    
    <v-container>
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold text-grey-darken-3">
            {{ currentListName }}
          </h1>
          <p v-if="isSharedWithMe" class="shared-by">
            <v-icon size="16" class="mr-1" color="#1976d2">mdi-account-multiple</v-icon>
            {{ t('pages.lists.sharedBy', { name: ownerLabel }) }}
          </p>
        </div>
        
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
          
          <div v-if="filterDialog" class="modal-overlay">
            <div class="modal">
              <h2>{{ t('pages.list.filters.title') }}</h2>

              <form @submit.prevent="applyFilters">
                <div class="form-row">
                  <div class="form-group">
                    <label for="filterCategoryDialog">{{ t('common.category') }}</label>
                    <select
                      id="filterCategoryDialog"
                      v-model="filterCategoryDialog"
                      class="form-input"
                    >
                      <option value="">{{ t('common.selectCategory') }}</option>
                      <option
                        v-for="category in categoryStore.categories"
                        :key="category.id"
                        :value="category.id"
                      >
                        {{ getCategoryDisplayName(category) }}
                      </option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="filterPurchasedDialog">{{ t('pages.list.filters.purchased') }}</label>
                    <select id="filterPurchasedDialog" v-model="filterPurchasedDialog" class="form-input">
                      <option :value="true">{{ t('pages.list.filters.options.yes') }}</option>
                      <option :value="false">{{ t('pages.list.filters.options.no') }}</option>
                      <option :value="''">{{ t('pages.list.filters.options.all') }}</option>
                    </select>
                  </div>
                </div>

                <div class="modal-actions">
                  <button type="button" class="btn btn--cancel" @click="filterDialog = false">
                    {{ t('common.cancel') }}
                  </button>
                  <button type="button" class="btn btn--cancel" @click="resetFilters">
                    {{ t('pages.lists.filters.clear') || 'Limpiar' }}
                  </button>
                  <button
                    type="submit"
                    class="btn btn--primary"
                  >
                    {{ t('common.save') }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          
          <div v-if="pantrySelectionDialog" class="modal-overlay">
            <div class="modal pantry-selection-modal">
              <h2>{{ t('pages.list.pantrySelection.title') }}</h2>
              
              <div class="pantry-selection-content">
                <p class="pantry-selection-description">
                  {{ t('pages.list.pantrySelection.description') }}
                </p>
                
                <div class="pantry-selection">
                  <h4>{{ t('pages.list.pantrySelection.purchasedTitle') }}</h4>
                  <div class="products-selection">
                    <div
                      v-for="item in purchasedItems"
                      :key="item.id"
                      class="product-selection-item"
                      :class="{ 'selected': selectedForPantry.includes(item.id) }"
                      @click="togglePantrySelection(item.id)"
                    >
                      <div class="product-info">
                        <v-avatar size="32" :color="getCategoryColor(item.categoryId)" class="mr-2">
                          <v-icon :color="isDarkColor(getCategoryColor(item.categoryId)) ? 'white' : 'black'" size="16">
                            {{ getCategoryIcon(item.categoryId) }}
                          </v-icon>
                        </v-avatar>
                        <div>
                          <span class="product-name">{{ item.name }}</span>
                          <span class="product-quantity">{{ item.quantity || 1 }} {{ unitLabel(item.unit) }}</span>
                        </div>
                      </div>
                      <v-checkbox
                        :model-value="selectedForPantry.includes(item.id)"
                        :ripple="false"
                        color="success"
                        hide-details
                        @click.stop="togglePantrySelection(item.id)"
                      />
                    </div>
                  </div>
                  
                  <div v-if="selectedForPantry.length > 0" class="pantry-category-selection">
                    <h4>{{ t('pages.list.pantrySelection.selectCategoryTitle') }}</h4>
                    <select v-model="selectedPantryCategory" class="form-input">
                      <option value="">{{ t('pages.list.pantrySelection.categoryPlaceholder') }}</option>
                      <option
                        v-for="category in pantryCategories"
                        :key="category.id"
                        :value="category.id"
                      >
                        {{ category.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn btn--cancel" @click="pantrySelectionDialog = false">
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="button"
                  class="btn btn--primary"
                  @click="confirmPantrySelection"
                  :disabled="selectedForPantry.length > 0 && !selectedPantryCategory"
                >
                  {{ t('pages.list.pantrySelection.addToPantry') }}
                </button>
              </div>
            </div>
          </div>

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

      
      <div v-if="allItemsPurchased && items.length > 0" class="all-purchased-message mb-4">
        <div class="purchased-card">
          <div class="purchased-content">
            <v-icon color="success" size="32" class="success-icon">mdi-check-circle</v-icon>
            <div class="purchased-text">
              <h3>{{ t('pages.list.allPurchased.title') }}</h3>
              <p>{{ t('pages.list.allPurchased.description') }}</p>
            </div>
          </div>
          <v-btn
            color="success"
            variant="outlined"
            @click="openPantrySelectionDialog"
            class="add-to-pantry-btn"
          >
            <v-icon left>mdi-plus</v-icon>
            {{ t('pages.list.allPurchased.addToPantry') }}
          </v-btn>
        </div>
      </div>

      
      <div class="lists-grid mb-8">
        <div class="list">
          <ul class="list-items">
            <li v-for="item in filteredItems" :key="item.name">
              <div 
                class="list-row" 
                >
                
                <v-avatar size="40" :color="getCategoryColor(item.categoryId)" class="mr-3">
                  <v-icon :color="isDarkColor(getCategoryColor(item.categoryId)) ? 'white' : 'black'">
                    {{ getCategoryIcon(item.categoryId) }}
                  </v-icon>
                </v-avatar>

                <div>
                  <h3 class="item-descr">{{ item.name }}</h3>
                  <p class="text-caption text-grey-darken-2">{{ item.quantity || 1 }} {{ unitLabel(item.unit) }}</p>
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
                        <span>{{ t('common.edit') }}</span>
                      </div>
                      <div class="menu-item delete-item" @click="deleteItem(item)">
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
                </div>
              </div>
              <v-divider thickness="2px"/>
            </li>
          </ul>
        </div>
      </div>

      
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

    
    <div v-if="itemMenuDialog" class="modal-overlay">
      <div class="modal item-edit-modal">
        <h2>{{ t('pages.products.modals.edit.title') }}</h2>
        
        
        <div v-if="selectedItem" class="product-info">
          <h3>{{ selectedItem.name }}</h3>
          <p v-if="selectedItem.product?.metadata?.description">{{ selectedItem.product.metadata.description }}</p>
        </div>
        
        <form @submit.prevent="saveItemEdit">
          <div class="form-row">
            <div class="form-group">
              <label for="editItemQuantity">{{ t('pages.pantry.editProduct.quantityLabel') }}</label>
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
              <label for="editItemUnit">{{ t('pages.pantry.editProduct.unitLabel') }}</label>
              <select id="editItemUnit" v-model="editItemUnit" class="form-input">
                <option value="unidad">{{ t('pages.pantry.units.unidad') }}</option>
                <option value="kg">{{ t('pages.pantry.units.kg') }}</option>
                <option value="g">{{ t('pages.pantry.units.g') }}</option>
                <option value="l">{{ t('pages.pantry.units.l') }}</option>
                <option value="ml">{{ t('pages.pantry.units.ml') }}</option>
                <option value="paquete">{{ t('pages.pantry.units.paquete') }}</option>
                <option value="caja">{{ t('pages.pantry.units.caja') }}</option>
              </select>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn--cancel" @click="itemMenuDialog = false">
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="btn btn--primary"
            >
              {{ t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    
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

    
    <div v-if="productSelectionDialog" class="modal-overlay">
      <div class="modal product-selection-modal">
  <h2>{{ t('pages.pantry.productSelection.title') || t('pages.list.productSelection.title') }}</h2>

        
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
                  <option value="unidad">{{ t('pages.pantry.units.unidad') }}</option>
                  <option value="kg">{{ t('pages.pantry.units.kg') }}</option>
                  <option value="g">{{ t('pages.pantry.units.g') }}</option>
                  <option value="l">{{ t('pages.pantry.units.l') }}</option>
                  <option value="ml">{{ t('pages.pantry.units.ml') }}</option>
                  <option value="paquete">{{ t('pages.pantry.units.paquete') }}</option>
                  <option value="caja">{{ t('pages.pantry.units.caja') }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        
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
                  <option value="unidad">{{ t('pages.pantry.units.unidad') }}</option>
                  <option value="kg">{{ t('pages.pantry.units.kg') }}</option>
                  <option value="g">{{ t('pages.pantry.units.g') }}</option>
                  <option value="l">{{ t('pages.pantry.units.l') }}</option>
                  <option value="ml">{{ t('pages.pantry.units.ml') }}</option>
                  <option value="paquete">{{ t('pages.pantry.units.paquete') }}</option>
                  <option value="caja">{{ t('pages.pantry.units.caja') }}</option>
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
import { useUserStore } from '@/stores/user'
import { useCategoryI18n } from '@/composables/useCategoryI18n'

const { t } = useLanguage()
const { getCategoryDisplayName } = useCategoryI18n()

const route = useRoute()
const listItemsStore = useListItemsStore()
const listsStore = useListsStore()
const productStore = useProductStore()
const categoryStore = useCategoryStore()


const pantrySelectionDialog = ref(false)
const selectedForPantry = ref([])
const selectedPantryCategory = ref('')
const pantryCategories = ref([])
const userStore = useUserStore()

const items = computed(() => listItemsStore.items)
const availableProducts = computed(() => {
  return productStore.products || []
})

// Pantry selection computed properties
const purchasedItems = computed(() => {
  return items.value.filter(item => item.purchased)
})

const allItemsPurchased = computed(() => {
  return items.value.length > 0 && items.value.every(item => item.purchased)
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
  return list ? t('pages.lists.detailTitle', { name: list.name }) : 'List'
})

onMounted(async () => await loadForRoute())
watch(() => route.fullPath, async () => await loadForRoute())
onBeforeUnmount(() => {
  
  try { listItemsStore.stopListening() } catch (e) {}
})

const searchQuery = ref('')
const newItemDialog = ref(false)
const itemMenuDialog = ref(false)
const selectedItem = ref(null)
const shareListDialog = ref(false)
const productSelectionDialog = ref(false)
const selectedProduct = ref(null)
const productQuantity = ref(1)
const productUnit = ref('g')
const activeItemMenu = ref(null)

const productSearchQuery = ref('')
const creatingNewProduct = ref(false)
const creatingNewProductLoading = ref(false)
const newProductForm = ref({ name: '', description: '', category: '', newCategoryName: '' })

// Item edit modal state
const editItemQuantity = ref(1)
const editItemUnit = ref('unidad')


const shareEmail = ref('')
const sharedUsers = ref([])
const isLoadingSharedUsers = ref(false)
const isRevokingMap = ref({})
const shareEmailTouched = ref(false)
const shareEmailServerError = ref('')
const isSharing = ref(false)

// Filter
const filterDialog = ref(false)
const filterCategoryDialog = ref('')
const filterPurchasedDialog = ref('')

const currentListId = computed(() => {
  const id = route.query.id || null
  return id ? (Number(id) || id) : null
})

// Shared/owner info for detail header
const currentList = computed(() => {
  const id = currentListId.value
  return id ? listsStore.getById(id) : null
})

function getOwnerId(l) {
  return (
    l?.ownerId ?? l?.owner_id ?? l?.owner?.id ?? l?.createdBy?.id ?? l?.created_by?.id ?? null
  )
}
function getSharedByInfo(l) {
  return l?.sharedBy || l?.shared_by || null
}
function getOwnerInfo(l) {
  return l?.owner || l?.createdBy || l?.created_by || null
}

const isSharedWithMe = computed(() => {
  const l = currentList.value
  if (!l) return false
  const sharedFlag = l?.shared === true
  const sharedBy = getSharedByInfo(l)
  const ownerId = getOwnerId(l)
  const me = userStore?.profile?.id
  return Boolean(sharedFlag || sharedBy || (ownerId && me && String(ownerId) !== String(me)))
})

const ownerLabel = computed(() => {
  const l = currentList.value
  if (!l) return ''
  const inviter = getSharedByInfo(l)
  if (inviter) {
    const name = [inviter.name, inviter.surname].filter(Boolean).join(' ').trim()
    return name || inviter.email || inviter.username || t('pages.lists.ownerFallback')
  }
  const info = getOwnerInfo(l)
  if (info) {
    const name = [info.name, info.surname].filter(Boolean).join(' ').trim()
    return name || info.email || info.username || t('pages.lists.theOwner')
  }
  return t('pages.lists.theOwner')
})

const newItemForm = ref({
  name: '',
  description: ''
})

const filters = ref({
  categoryId: '',
  onlyPurchased: '',
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


const filteredItems = computed(() => {
  let list = items.value || []
  console.log('Filtros',filters)

  
  if (filters.value.categoryId) {
    const wantedId = Number(filters.value.categoryId)
    list = list.filter(i => Number(i?.product?.category?.id) === wantedId)
  }

  
  if (filters.value.onlyPurchased === true) {
    list = list.filter(i => i.purchased === true)
  } else if (filters.value.onlyPurchased === false) {
    list = list.filter(i => i.purchased === false)
  }

  console.log('Items', list)
  return list
})


const getCategoryIcon = (categoryId) => {
  if (!categoryId) return 'mdi-package-variant'
  return categoryStore.getIconById(categoryId)
}

const getCategoryColor = (categoryId) => {
  if (!categoryId) return '#9E9E9E'
  return categoryStore.getColorById(categoryId)
}

const isDarkColor = (hexColor) => {
  
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.5
}

// Localize unit labels
const unitLabel = (unit) => {
  const key = (unit || '').toString().toLowerCase()
  switch (key) {
    case 'unidad':
      return t('pages.pantry.units.unidad')
    case 'kg':
      return t('pages.pantry.units.kg')
    case 'g':
      return t('pages.pantry.units.g')
    case 'l':
      return t('pages.pantry.units.l')
    case 'ml':
      return t('pages.pantry.units.ml')
    case 'paquete':
      return t('pages.pantry.units.paquete')
    case 'caja':
      return t('pages.pantry.units.caja')
    default:
      return unit || t('pages.pantry.units.unidad')
  }
}


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
  filterCategoryDialog.value = filters.value.categoryId ?? ''
  // si filters.value.onlyPurchased es booleano, convertir a booleano; si '' mantener ''
  filterPurchasedDialog.value =
    filters.value.onlyPurchased === true ? true :
    filters.value.onlyPurchased === false ? false : ''
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
    
    const payload = {
      quantity: parseInt(editItemQuantity.value),
      unit: editItemUnit.value,
      metadata: {}
    }
    
    
    await listItemsStore.updateRemote(selectedItem.value.id, payload)
    console.log('Item actualizado en el servidor:', selectedItem.value.name)
  } catch (error) {
    console.error('Error al actualizar item en el servidor:', error)
    
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
    
    const payload = {
      quantity: parseInt(updated.quantity) || 1,
      unit: updated.unit || 'unidad',
      metadata: {}
    }
    
    
    await listItemsStore.updateRemote(updated.id, payload)
    console.log('Item actualizado en el servidor:', updated.name)
  } catch (error) {
    console.error('Error al actualizar item en el servidor:', error)
    
    listItemsStore.updateItem(updated.id, updated)
  }
  itemMenuDialog.value = false
}

const deleteItem = async (item) => {
  try {
    
    await listItemsStore.deleteRemote(item.id)
    console.log('Item eliminado del servidor:', item.name)
  } catch (error) {
    console.error('Error al eliminar item del servidor:', error)
    
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
  //Reset del estado completo
  productSelectionDialog.value = true
  selectedProduct.value = null
  productQuantity.value = 1
  productUnit.value = 'unidad'
  productSearchQuery.value = ''
  creatingNewProduct.value = false
  creatingNewProductLoading.value = false
  newProductForm.value = { name: '', description: '', category: '', newCategoryName: '' }

  // 🔹 Carga inteligente
  const needsProducts = !productStore.products?.length
  const needsCategories = !categoryStore.categories?.length

  if (needsProducts || needsCategories) {
    try {
      const promises = []
      if (needsProducts) promises.push(productStore.fetchRemote())
      
      // Only fetch categories if needed, don't call init() to avoid re-creating defaults
      if (needsCategories) {
        
        categoryStore.load()
        
        if (!categoryStore.categories?.length || 
            categoryStore.categories.every(c => typeof c.id === 'string')) {
          promises.push(categoryStore.fetchRemote())
        }
      }
      
      if (promises.length > 0) {
        await Promise.all(promises)
        console.log('Datos cargados desde el servidor.')
      }
    } catch (error) {
      console.error('Error al cargar productos o categorías:', error)
    }
  } else {
    
    
    Promise.allSettled([
      productStore.fetchRemote(),
    ])
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
    
    const payload = {
      product: {
        id: selectedProduct.value.id
      },
      quantity: parseInt(productQuantity.value),
      unit: productUnit.value,
      metadata: {}
    }
    
    
    await listItemsStore.createRemote(payload)
    
    
    await listItemsStore.fetchRemote()
    
    productSelectionDialog.value = false
    selectedProduct.value = null
    productQuantity.value = 1
    productUnit.value = 'unidad'
    
  } catch (error) {
    console.error('Error adding product to list:', error)
  }
}


const startCreateNewProduct = () => {
  creatingNewProduct.value = true
  if (!newProductForm.value.name && productSearchQuery.value) {
    newProductForm.value.name = productSearchQuery.value.trim()
  }
  
  nextTick(() => {
    const el = document.getElementById('newProductName')
    if (el) el.focus()
  })
}


const toggleItemMenu = (itemId, event) => {
  if (activeItemMenu.value === itemId) {
    activeItemMenu.value = null
  } else {
    activeItemMenu.value = itemId
    
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
    
    productSelectionDialog.value = false

    
    if (!categoryStore.categories || categoryStore.categories.length === 0) {
      categoryStore.load()
      
      if (!categoryStore.categories?.length || 
          categoryStore.categories.every(c => typeof c.id === 'string')) {
        try { await categoryStore.fetchRemote() } catch (e) {  }
      }
    }

    
    let categoryToUse = newProductForm.value.category
    if (categoryToUse === '__new__') {
      const name = (newProductForm.value.newCategoryName || '').trim()
      if (!name) { creatingNewProductLoading.value = false; return }
      const createdCat = await categoryStore.createRemote({ name, metadata: {} })
      categoryToUse = createdCat
      // Refresh categories after creating new one
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
        
        listItemsStore.deleteItem(tempId, { remote: false })
        throw e
      }
      
      await listItemsStore.fetchRemote()
    }

    
    creatingNewProduct.value = false
    newProductForm.value = { name: '', description: '', category: '', newCategoryName: '' }
    selectedProduct.value = null
    productQuantity.value = 1
    productUnit.value = 'unidad'
  } catch (e) {
    console.error('Error creando y agregando producto:', e)
    
    try {
      
      const exists = (listItemsStore.items || []).some(i => i.id === tempId)
      if (exists) listItemsStore.deleteItem(tempId, { remote: false })
    } catch (er) {  }
  } finally {
    creatingNewProductLoading.value = false
  }
}

const goBackToLists = () => {
  
  window.history.back()
}


const applyFilters = () => {
  filters.value = {
    categoryId: filterCategoryDialog.value || '',
    onlyPurchased:
      filterPurchasedDialog.value === true ? true :
      filterPurchasedDialog.value === false ? false : ''
  }
  filterDialog.value = false
}

const resetFilters = () => {
  filters.value = { categoryId: '', onlyPurchased: '' }
  filterCategoryDialog.value = ''
  filterPurchasedDialog.value = ''
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

// Pantry selection methods
const openPantrySelectionDialog = async () => {
  // Load pantry categories
  try {
    const { usePantryStore } = await import('@/stores/pantry')
    const pantryStore = usePantryStore()
    await pantryStore.fetchPantriesRemote()
    pantryCategories.value = pantryStore.pantries || []
  } catch (error) {
    console.error('Error loading pantry categories:', error)
    pantryCategories.value = []
  }
  
  
  selectedForPantry.value = []
  selectedPantryCategory.value = ''
  pantrySelectionDialog.value = true
}

const togglePantrySelection = (itemId) => {
  const index = selectedForPantry.value.indexOf(itemId)
  if (index > -1) {
    selectedForPantry.value.splice(index, 1)
  } else {
    selectedForPantry.value.push(itemId)
  }
}

const confirmPantrySelection = async () => {
  try {
    // Add selected items to pantry
    if (selectedForPantry.value.length > 0 && selectedPantryCategory.value) {
      await addSelectedItemsToPantry()
    }
    
    console.log('Productos agregados a la despensa exitosamente')
    pantrySelectionDialog.value = false
    
  } catch (error) {
    console.error('Error al agregar productos a la despensa:', error)
    alert(t('pages.pantry.messages.updateError'))
  }
}

const addSelectedItemsToPantry = async () => {
  try {
    const { usePantryStore } = await import('@/stores/pantry')
    const pantryStore = usePantryStore()
    
    const selectedItems = purchasedItems.value.filter(item => 
      selectedForPantry.value.includes(item.id)
    )
    
    for (const item of selectedItems) {
      const productData = {
        product: {
          id: item.product?.id || null
        },
        quantity: parseInt(item.quantity) || 1,
        unit: item.unit || 'unidad',
        metadata: {
          name: item.name,
          description: item.product?.metadata?.description || '',
          image: item.product?.metadata?.image || ''
        }
      }
      
      await pantryStore.createItemRemote(selectedPantryCategory.value, productData)
    }
    
    console.log(`${selectedItems.length} productos agregados a la despensa`)
    
  } catch (error) {
    console.error('Error al agregar productos a la despensa:', error)
    throw error 
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
  flex: 1; 
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

.shared-by {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 6px 0 0 0;
  font-size: 0.9rem;
  color: #1976d2;
}

@media (max-width: 600px) {
  .search-wrapper {
    width: 160px;
  }
}


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

.btn--primary { background: #4CAF50; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #45A049; }
.btn--primary:disabled { background: #ccc; cursor: not-allowed; }
.btn--cancel { background: #f5f5f5; color: #333; }
.btn--resetFilter { background: #f5f5f5; color: #333; }
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
  z-index: 2000;
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


.back-btn {
  margin-bottom: 16px;
}


@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
    max-height: 250px;
  }
}

.category-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.muted {
  color: black;
}


.all-purchased-message {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.purchased-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  border: 2px solid #4CAF50;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
}

.purchased-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.success-icon {
  margin-right: 16px;
}

.purchased-text h3 {
  margin: 0 0 4px 0;
  color: #2e7d32;
  font-size: 1.2rem;
  font-weight: 600;
}

.purchased-text p {
  margin: 0;
  color: #388e3c;
  font-size: 0.95rem;
}

.add-to-pantry-btn {
  margin-left: 16px;
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
}

.pantry-selection-modal {
  max-width: 600px;
  width: 90vw;
}

.pantry-selection-content {
  margin-bottom: 20px;
}

.pantry-selection-description {
  font-size: 1rem;
  color: #666;
  margin-bottom: 20px;
  text-align: center;
}

.pantry-selection h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.products-selection {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 20px;
}

.product-selection-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.product-selection-item:last-child {
  border-bottom: none;
}

.product-selection-item:hover {
  background-color: #f8f9fa;
}

.product-selection-item.selected {
  background-color: #e8f5e8;
  border-left: 3px solid #4CAF50;
}

.product-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.product-name {
  font-weight: 500;
  color: #333;
  margin-right: 8px;
}

.product-quantity {
  font-size: 0.9rem;
  color: #666;
}

.pantry-category-selection {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.pantry-category-selection h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}


@media (max-width: 768px) {
  .purchased-card {
    flex-direction: column;
    text-align: center;
    padding: 16px;
  }
  
  .purchased-content {
    margin-bottom: 16px;
  }
  
  .add-to-pantry-btn {
    margin-left: 0;
    width: 100%;
  }
  
  .pantry-selection-modal {
    margin: 20px;
    padding: 24px 16px;
    width: calc(100vw - 40px);
  }
  
  .products-selection {
    max-height: 250px;
  }
  
  .product-selection-item {
    padding: 10px 12px;
  }
}
</style>