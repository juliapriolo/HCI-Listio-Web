<template>
  <div class="lists-page">
    <!-- Page Header -->
    <v-container>
      <div class="d-flex align-center justify-space-between mb-6">
         <h1 class="text-h4 font-weight-bold text-grey-darken-3">
           Listas
         </h1>
        
        <div class="search-wrapper">
            <SearchBar
              v-model="searchQuery"
              placeholder="Buscar productos..."
            />
          </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <v-progress-circular 
          indeterminate 
          color="success" 
          size="48"
        ></v-progress-circular>
        <p class="text-body-1 text-grey-darken-1 mt-4">Cargando listas...</p>
      </div>

      <!-- Shopping Lists Grid -->
      <div v-else-if="filteredLists.length > 0" class="lists-grid mb-8">
        <ListCard
          v-for="list in filteredLists"
          :key="list.id"
          :list="list"
          @click="openList(list)"
          @edit="editList"
          @delete="deleteList"
        />
      </div>

      <!-- Empty States -->
      <EmptyState
        v-else-if="filteredLists.length === 0 && !searchQuery"
        icon="mdi-format-list-bulleted"
        title="No tienes listas aún"
        description="Crea tu primera lista de compras"
      />

      <EmptyState
        v-else-if="filteredLists.length === 0 && searchQuery"
        icon="mdi-magnify"
        title="No se encontraron listas"
        description="Intenta con otros términos de búsqueda"
      />

      <!-- Pagination -->
      <div class="text-center mt-6" v-if="totalPages > 1">
        <span class="text-body-2 text-grey-darken-1">
          Frame {{ currentPage }}
        </span>
      </div>
    </v-container>

    <!-- Floating Action Button -->
    <v-btn
      color="success"
      size="large"
      icon
      class="new-list-fab"
      elevation="8"
      @click="openNewListDialog"
    >
      <v-icon size="24">mdi-plus</v-icon>
    </v-btn>

    <!-- New List Dialog -->
    <div v-if="newListDialog" class="modal-overlay">
      <div class="modal list-modal">
        <h2>Nueva Lista</h2>
        
        <form @submit.prevent="createNewList(newListForm)">
          <div class="form-group">
            <label for="listName">Nombre de la lista</label>
            <input
              id="listName"
              v-model="newListForm.name"
              type="text"
              class="form-input"
              placeholder="Ingrese el nombre de la lista"
              required
              autofocus
            />
          </div>
          
          <div class="form-group">
            <label for="listImage">Imagen de la lista</label>
            <input
              id="listImage"
              type="file"
              accept="image/*"
              class="form-input file-input"
              @change="handleNewImageChange"
            />
            <div v-if="newImagePreview" class="image-preview">
              <img :src="newImagePreview" alt="Vista previa" class="preview-img" />
            </div>
          </div>
          
          <div class="form-group">
            <label for="listDescription">Descripción (opcional)</label>
            <textarea
              id="listDescription"
              v-model="newListForm.description"
              class="form-input"
              placeholder="Ingrese una descripción para la lista"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="newListForm.recurring"
                class="checkbox-input"
              />
              <span class="checkbox-text">Lista recurrente</span>
            </label>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn--cancel" @click="closeNewListDialog">
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn--primary"
              :disabled="!newListForm.name?.trim() || isCreating"
            >
              {{ isCreating ? 'Creando...' : 'Crear Lista' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit List Dialog -->
    <div v-if="editListDialog" class="modal-overlay">
      <div class="modal list-edit-modal">
        <h2>Editar Lista</h2>
        
        <form @submit.prevent="saveListEdit">
          <div class="form-group">
            <label for="editListName">Nombre de la lista</label>
            <input
              id="editListName"
              v-model="editListForm.name"
              type="text"
              class="form-input"
              placeholder="Ingrese el nombre de la lista"
              required
              autofocus
            />
          </div>
          
          <div class="form-group">
            <label for="editListImage">Imagen de la lista</label>
            <input
              id="editListImage"
              type="file"
              accept="image/*"
              class="form-input file-input"
              @change="handleEditImageChange"
            />
            <div v-if="editImagePreview" class="image-preview">
              <img :src="editImagePreview" alt="Vista previa" class="preview-img" />
            </div>
          </div>
          
          <div class="form-group">
            <label for="editListDescription">Descripción (opcional)</label>
            <textarea
              id="editListDescription"
              v-model="editListForm.description"
              class="form-input"
              placeholder="Ingrese una descripción para la lista"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="editListForm.recurring"
                class="checkbox-input"
              />
              <span class="checkbox-text">Lista recurrente</span>
            </label>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn--cancel" @click="editListDialog = false">
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn--primary"
              :disabled="!editListForm.name?.trim()"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="deleteDialog" class="modal-overlay">
      <div class="modal delete-confirmation-modal">
        <h2>Confirmar eliminación</h2>
        
        <div class="confirmation-content">
          <p class="confirmation-text">
            ¿Estás seguro de que quieres eliminar la lista <strong>"{{ listToDelete?.name }}"</strong>? 
            Esta acción no se puede deshacer.
          </p>
        </div>
        
        <div class="modal-actions">
          <button type="button" class="btn btn--cancel" @click="deleteDialog = false">
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn--danger"
            @click="confirmDeleteList"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar" :timeout="4000" :color="snackbarColor">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useListsStore } from '@/stores/lists'
import listsApi from '@/api/lists'
import ListCard from '@/components/ListCard.vue'
import SearchBar from '@/components/SearchBar.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()

// Reactive data
const searchQuery = ref('')
const newListDialog = ref(false)
const editListDialog = ref(false)
const deleteDialog = ref(false)
const currentPage = ref(1)
const listToDelete = ref(null)
const listToEdit = ref(null)
const editImageFile = ref(null)
const editImagePreview = ref('')
const newImageFile = ref(null)
const newImagePreview = ref('')
const isLoading = ref(false)
const isCreating = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')


const newListForm = ref({
  name: '',
  description: '',
  recurring: false
})

const editListForm = ref({
  name: '',
  description: '',
  recurring: false,
  image: ''
})

// Use Pinia store for lists
const listsStore = useListsStore()

// API availability check
const isApiAvailable = ref(null) // null = unknown, true = available, false = unavailable

const checkApiAvailability = async () => {
  try {
    // Try a simple GET request to see if API is available without overwriting local data
    console.log('Checking API availability...')
    const response = await listsApi.getAll({ limit: 1 })
    isApiAvailable.value = true
    console.log('API is available, response:', response)
    
    // If API is available, try to sync with remote data
    try {
      await listsStore.fetchRemote()
      console.log('Successfully synced with remote data')
    } catch (syncError) {
      console.warn('Failed to sync with remote data, using local:', syncError)
    }
    
  } catch (error) {
    isApiAvailable.value = false
    console.log('API is not available, using local storage. Error:', error)
  }
}


// Computed properties
const filteredLists = computed(() => {
  if (!searchQuery.value) return listsStore.lists
  
  return listsStore.lists.filter(list =>
    list.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredLists.value.length / 10)
})

// Methods
const openList = (list) => {
  // Navigate to list detail and pass the list id as a query parameter
  router.push({ path: '/list', query: { id: String(list.id) } })
}

const editList = (listId) => {
  const list = listsStore.lists.find(l => l.id === listId)
  if (list) {
    listToEdit.value = list
    editListForm.value = {
      name: list.name,
      description: list.description || '',
      recurring: list.recurring || false,
      image: list.image || ''
    }
    editImagePreview.value = list.image || ''
    editImageFile.value = null
    editListDialog.value = true
  }
}

const deleteList = (listId) => {
  const list = listsStore.lists.find(l => l.id === listId)
  if (list) {
    listToDelete.value = list
    deleteDialog.value = true
  }
}

const confirmDeleteList = async () => {
  if (!listToDelete.value) return
  
  try {
    // Try API first if available
    if (isApiAvailable.value !== false) {
      try {
        await listsStore.deleteRemote(listToDelete.value.id)
        console.log('Successfully deleted list via API:', listToDelete.value.name)
        isApiAvailable.value = true
      } catch (apiError) {
        console.warn('API delete failed, falling back to local:', apiError)
        isApiAvailable.value = false
        
        // Fallback to local delete
        listsStore.deleteList(listToDelete.value.id)
        console.log('Deleted list locally:', listToDelete.value.name)
      }
    } else {
      // API unavailable, delete locally
      listsStore.deleteList(listToDelete.value.id)
      console.log('Deleted list locally (API unavailable):', listToDelete.value.name)
    }
    
    deleteDialog.value = false
    listToDelete.value = null
    
    // Show success message
    snackbarText.value = `Lista "${listToDelete.value?.name}" eliminada exitosamente`
    snackbarColor.value = 'success'
    snackbar.value = true
    
  } catch (error) {
    console.error('Error deleting list:', error)
    snackbarText.value = 'Error al eliminar la lista. Por favor, intenta de nuevo.'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const openNewListDialog = () => {
  newListForm.value = {
    name: '',
    description: '',
    recurring: false
  }
  newImageFile.value = null
  newImagePreview.value = ''
  newListDialog.value = true
}

const closeNewListDialog = () => {
  newListDialog.value = false
  newListForm.value = {
    name: '',
    description: '',
    recurring: false
  }
  newImageFile.value = null
  newImagePreview.value = ''
}

// Handle image file selection for new list
const handleNewImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    newImageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      newImagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const createNewList = async (formData) => {
  if (isCreating.value) return // Prevent double submission
  
  isCreating.value = true
  try {
    let imageData = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop'
    
    // Handle image file if provided
    if (newImageFile.value) {
      imageData = await convertFileToBase64(newImageFile.value)
    }
    
    const payload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      recurring: formData.recurring || false,
      metadata: {
        image: imageData
      }
    }

    console.log('Attempting to create list with payload:', payload)
    
    // Always try API first if we haven't confirmed it's unavailable
    if (isApiAvailable.value !== false) {
      try {
        const createdList = await listsStore.createRemote(payload)
        console.log('Successfully created list via API:', createdList)
        isApiAvailable.value = true // Mark API as available for future calls
        
        // Show success message
        snackbarText.value = `Lista "${payload.name}" creada exitosamente`
        snackbarColor.value = 'success'
        snackbar.value = true
        
      } catch (apiError) {
        console.warn('API creation failed, falling back to local storage:', apiError)
        isApiAvailable.value = false // Mark API as unavailable
        
        // Fallback to local creation
        const newList = {
          id: Date.now(),
          name: payload.name,
          description: payload.description,
          recurring: payload.recurring,
          image: payload.metadata.image,
          itemCount: 0,
          completedItems: 0,
          lastUpdated: new Date()
        }
        
        listsStore.addList(newList)
        console.log('Successfully created list locally:', payload.name)
        
        // Show success message for local creation
        snackbarText.value = `Lista "${payload.name}" creada localmente`
        snackbarColor.value = 'warning'
        snackbar.value = true
      }
    } else {
      // API is known to be unavailable, create locally
      const newList = {
        id: Date.now(),
        name: payload.name,
        description: payload.description,
        recurring: payload.recurring,
        image: payload.metadata.image,
        itemCount: 0,
        completedItems: 0,
        lastUpdated: new Date()
      }

  listsStore.addList(newList)
      console.log('Created list locally (API unavailable):', payload.name)
      
      // Show success message for local creation
      snackbarText.value = `Lista "${payload.name}" creada localmente`
      snackbarColor.value = 'warning'
      snackbar.value = true
    }
    
    closeNewListDialog()
    
  } catch (error) {
    console.error('Unexpected error creating list:', error)
    snackbarText.value = 'Error inesperado al crear la lista. Por favor, intenta de nuevo.'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    isCreating.value = false
  }
}

// Helper function to convert file to base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

// Handle image file selection for editing
const handleEditImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    editImageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      editImagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const saveListEdit = async () => {
  if (!listToEdit.value) return
  
  try {
    let imageData = editListForm.value.image
    
    // Handle image file if provided
    if (editImageFile.value) {
      imageData = await convertFileToBase64(editImageFile.value)
    }
    
    // Update the list via API
    const updateData = {
      name: editListForm.value.name.trim(),
      description: editListForm.value.description?.trim() || '',
      recurring: editListForm.value.recurring || false,
      metadata: {
        image: imageData
      }
    }
    
    // Try API first if available
    if (isApiAvailable.value !== false) {
      try {
        await listsStore.updateRemote(listToEdit.value.id, updateData)
        console.log('Successfully updated list via API:', updateData.name)
        isApiAvailable.value = true
      } catch (apiError) {
        console.warn('API update failed, falling back to local:', apiError)
        isApiAvailable.value = false
        
        // Fallback to local update
        listsStore.updateList(listToEdit.value.id, updateData)
        console.log('Updated list locally:', updateData.name)
      }
    } else {
      // API unavailable, update locally
      listsStore.updateList(listToEdit.value.id, updateData)
      console.log('Updated list locally (API unavailable):', updateData.name)
    }
    
    editListDialog.value = false
    listToEdit.value = null
    console.log('Updated list:', updateData.name)
    
    // Show success message
    snackbarText.value = `Lista "${updateData.name}" actualizada exitosamente`
    snackbarColor.value = 'success'
    snackbar.value = true
    
  } catch (error) {
    console.error('Error updating list:', error)
    snackbarText.value = 'Error al actualizar la lista. Por favor, intenta de nuevo.'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

onMounted(async () => {
  isLoading.value = true
  
  // Debug: Check what's in localStorage
  console.log('=== DEBUGGING LOCALSTORAGE ===')
  console.log('localStorage listio:user:', localStorage.getItem('listio:user'))
  
  // Get the current storage key that will be used
  let currentStorageKey = 'listio:lists' // default
  try {
    const userRaw = localStorage.getItem('listio:user')
    if (userRaw) {
      const userData = JSON.parse(userRaw)
      const userId = userData?.profile?.id
      if (userId) {
        currentStorageKey = `listio:lists:${userId}`
      }
    }
  } catch (e) {
    console.warn('Could not determine storage key:', e)
  }
  
  console.log('Using storage key:', currentStorageKey)
  console.log('localStorage data for key:', localStorage.getItem(currentStorageKey))
  console.log('Current lists in store before load:', listsStore.lists)
  
   // Clear localStorage to remove any existing sample data
   try {
     localStorage.removeItem('listio:lists')
     localStorage.removeItem(currentStorageKey)
     console.log('Cleared localStorage for lists')
   } catch (e) {
     console.warn('Could not clear localStorage:', e)
   }
   
   // Load from localStorage first as immediate fallback
  listsStore.load()
   
   console.log('Current lists in store after load:', listsStore.lists)
  
  try {
    // Try to fetch from API to check availability and get latest data
    console.log('Checking API availability and fetching latest data...')
    await checkApiAvailability()
  } catch (error) {
    console.warn('API check failed:', error)
    isApiAvailable.value = false
  }
  
   // No longer seeding with sample data - start with empty lists
  
  console.log('Final lists in store:', listsStore.lists)
  console.log('=== END DEBUGGING ===')
  
  isLoading.value = false
})
</script>

<style scoped>
.lists-page {
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

@media (min-width: 768px) {
  .lists-grid {
    max-width: 800px;
  }
}

.new-list-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.search-wrapper {
  flex: 1;
  max-width: 100%;
  min-width: 250px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
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

/* List modals specific styles */
.list-modal,
.list-edit-modal {
  max-width: 500px;
  width: 90vw;
}

.file-input {
  padding: 6px 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-input:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.file-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
  background-color: #fff;
}

.file-input::file-selector-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  margin-right: 12px;
  transition: background-color 0.2s ease;
}

.file-input::file-selector-button:hover {
  background-color: #5a6268;
}

.image-preview {
  margin-top: 12px;
  text-align: center;
}

.preview-img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  object-fit: cover;
}

/* Delete confirmation modal specific styles */
.delete-confirmation-modal {
  max-width: 450px;
  width: 90vw;
}

.confirmation-content {
  text-align: center;
  padding: 20px 0;
}

.confirmation-text {
  font-size: 1rem;
  color: #424242;
  line-height: 1.5;
  margin: 0;
}

.confirmation-text strong {
  color: #f44336;
  font-weight: 600;
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

.form-input:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: #9e9e9e;
  opacity: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: #4CAF50;
}

.checkbox-text {
  user-select: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal {
    margin: 20px;
    padding: 24px 16px;
    min-width: auto;
    width: calc(100vw - 40px);
  }
}
</style>
