<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLanguage } from '@/composables/useLanguage'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)
const { t } = useLanguage()

const redirectToLogin = () => {
  const target = route.fullPath || '/editar-perfil'
  router.replace({ path: '/login', query: { redirect: target } })
}

const form = reactive({
  name: '',
  surname: '',
  email: '',
  avatar: null,
})

const avatarPreview = computed(() => form.avatar)

watch(
  profile,
  (value) => {
    if (!value) {
      return
    }

    form.name = value.name || ''
    form.surname = value.surname || ''
    form.email = value.email || ''
    form.avatar = value.avatar || null
  },
  { immediate: true }
)

const showPasswordModal = ref(false)
const showAvatarModal = ref(false)
const passwordForm = reactive({ current: '', new: '' })
const showPasswordSuccessMessage = ref(false)
const showPasswordErrorMessage = ref(false)
const passwordErrorMessage = ref('')

const handleFileUpload = (event) => {
  const [file] = event?.target?.files ?? []
  if (!file) {
    form.avatar = profile.value?.avatar || null
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    form.avatar = reader.result
  }
  reader.readAsDataURL(file)
}

const showSuccessMessage = ref(false)

const submitForm = async () => {
  try {
    // Solo enviar los campos que realmente pueden cambiar
    const updateData = {
      name: form.name,
      surname: form.surname,
      avatar: form.avatar,
    }
    
    await userStore.updateProfile(updateData)
    
    // Mostrar mensaje agradable
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
      router.push('/perfil')
    }, 2000)
    
  } catch (error) {
    alert(error?.message || 'No se pudo actualizar el perfil')
  }
}

const openPasswordModal = () => {
  showPasswordModal.value = true
  showPasswordSuccessMessage.value = false
  showPasswordErrorMessage.value = false
  passwordErrorMessage.value = ''
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  showPasswordSuccessMessage.value = false
  showPasswordErrorMessage.value = false
  passwordErrorMessage.value = ''
  passwordForm.current = ''
  passwordForm.new = ''
}

const translatePasswordError = (errorMessage) => {
  // Buscar traducción específica para el mensaje de error
  const translatedError = t(`profile.passwordErrors.${errorMessage}`)
  
  // Si no hay traducción específica, devolver el mensaje original
  if (translatedError === `profile.passwordErrors.${errorMessage}`) {
    return errorMessage
  }
  
  return translatedError
}

const changePassword = async () => {
  try {
    await userStore.changePassword({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.new,
    })
    
    // Mostrar mensaje de éxito
    showPasswordSuccessMessage.value = true
    showPasswordErrorMessage.value = false
    
    // Cerrar modal y limpiar formulario después de un breve delay
    setTimeout(() => {
      closePasswordModal()
    }, 2000)
    
  } catch (error) {
    // Mostrar mensaje de error traducido
    const errorMessage = error?.message || t('profile.passwordErrorDefault')
    passwordErrorMessage.value = translatePasswordError(errorMessage)
    showPasswordErrorMessage.value = true
    showPasswordSuccessMessage.value = false
  }
}

onMounted(async () => {
  
  if (!userStore.token) {
    userStore.load()
  }
  
  
  if (!userStore.token) {
    redirectToLogin()
    return
  }

  
  if (!profile.value) {
    try {
      await userStore.fetchProfile()
    } catch (error) {
      console.error('Error al cargar perfil:', error)
      redirectToLogin()
    }
  }
})
</script>

<template>
  <main class="edit-profile">
    
    <div class="page-header">
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        color="grey-darken-3"
        @click="router.push('/perfil')"
        class="back-btn"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <h1 class="edit-profile__title">{{ t('profile.editTitle') }}</h1>
      <div class="spacer"></div>
    </div>

    
    <div v-if="showSuccessMessage" class="success-message">
      <div class="success-content">
        <div class="success-icon">✓</div>
        <div class="success-text">
          <h3>{{ t('profile.successTitle') }}</h3>
          <p>{{ t('profile.successDescription') }}</p>
        </div>
      </div>
    </div>

    <form class="edit-profile__form" @submit.prevent="submitForm">
      <div class="form-container">
        
        <div class="avatar-section">
          <div class="avatar-container" @click="showAvatarModal = true">
            <img 
              v-if="avatarPreview" 
              :src="avatarPreview" 
              :alt="t('profile.avatarFallback')" 
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              <v-icon class="avatar-icon" size="48">mdi-account</v-icon>
            </div>
          </div>
          <p class="avatar-hint">{{ t('profile.photoHint') }}</p>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="name">{{ t('common.name') }}</label>
            <input v-model="form.name" id="name" type="text" style="color:black;" required />
          </div>

          <div class="form-group">
            <label for="surname">{{ t('common.surname') }}</label>
            <input v-model="form.surname" id="surname" type="text" style="color:black;" />
          </div>
        </div>

        <div class="form-group">
          <label for="email">{{ t('profile.email') }}</label>
          <input v-model="form.email" id="email" type="email" readonly disabled />
        </div>

        <div class="form-group">
          <button type="button" class="btn btn--secondary" @click="openPasswordModal">
            {{ t('profile.changePassword') }}
          </button>
        </div>

        <div class="edit-profile__actions">
          <button type="submit" class="btn btn--save">{{ t('common.save') }}</button>
          <router-link to="/perfil" class="btn btn--cancel">{{ t('common.cancel') }}</router-link>
        </div>
      </div>
    </form>

    
    <div v-if="showPasswordModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ t('profile.changePassword') }}</h2>
        
        
        <div v-if="showPasswordSuccessMessage" class="password-success-message">
          <div class="success-content">
            <div class="success-icon">✓</div>
            <div class="success-text">
              <h3>{{ t('profile.passwordSuccessTitle') }}</h3>
              <p>{{ t('profile.passwordSuccessDescription') }}</p>
            </div>
          </div>
        </div>
        
        
        <div v-if="showPasswordErrorMessage" class="password-error-text">
          {{ passwordErrorMessage }}
        </div>
        
        <form v-if="!showPasswordSuccessMessage" @submit.prevent="changePassword">
          <div class="form-group">
            <label for="currentPassword">{{ t('profile.currentPassword') }}</label>
            <input v-model="passwordForm.current" id="currentPassword" type="password" style="color:black;" required />
          </div>
          <div class="form-group">
            <label for="newPassword">{{ t('profile.newPassword') }}</label>
            <input v-model="passwordForm.new" id="newPassword" type="password" style="color:black;" required />
          </div>
          <div class="edit-profile__actions">
            <button type="submit" class="btn btn--save">{{ t('common.save') }}</button>
            <button type="button" class="btn btn--cancel" @click="closePasswordModal">{{ t('common.cancel') }}</button>
          </div>
        </form>
      </div>
    </div>

    
    <div v-if="showAvatarModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ t('profile.changePhoto') }}</h2>
        <div class="avatar-modal-content">
          <div class="current-avatar">
            <img 
              v-if="avatarPreview" 
              :src="avatarPreview" 
              :alt="t('profile.avatarFallback')" 
              class="modal-avatar-preview"
            />
            <div v-else class="modal-avatar-placeholder">
              <v-icon class="avatar-icon" size="48">mdi-account</v-icon>
            </div>
          </div>
          <div class="form-group">
            <label for="avatarFile">Cambiar imagen</label>
            <input 
              type="file" 
              id="avatarFile" 
              @change="handleFileUpload" 
              accept="image/*"
              class="form-input file-input"
            />
            <div v-if="avatarPreview" class="image-preview">
              <img :src="avatarPreview" :alt="t('profile.avatarFallback')" class="preview-img" />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn--cancel" @click="showAvatarModal = false">{{ t('common.cancel') }}</button>
            <button type="button" class="btn btn--primary" @click="showAvatarModal = false">{{ t('common.save') }}</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<route lang="json">
{
  "alias": ["/edit-profile"]
}
</route>

<style scoped>
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
  min-width: 320px;
  max-width: 90vw;
}

.edit-profile {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background: #f9f9f9;
  margin: 0;
  max-width: none;
  border-radius: 0;
  box-shadow: none;
}


.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 10px;
}

.spacer {
  width: 48px; 
}

.back-btn {
  margin-left: -8px;
}

.edit-profile__title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
  text-align: center;
  flex: 1;
}


.edit-profile__form {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 120px);
  padding-top: 20px;
}

.form-container {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}


.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 4px solid #e0e0e0;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  color: #999;
}

.avatar-hint {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  color:black;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 6px;
}

.form-group input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.form-group small {
  margin-top: 6px;
  color: #6b6b6b;
  font-size: 13px;
}

.avatar-preview {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.avatar-preview img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.edit-profile__actions {
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
}

.btn--save {
  background: #4CAF50;
  color: #fff;
}

.btn--save:hover {
  background: #45A049;
}

.btn--cancel {
  background: #f5f5f5;
  color: #333;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.btn--cancel:hover {
  background: #e0e0e0;
}

.btn--secondary {
  background: #4CAF50;
  color: #fff;
  border: none;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  margin-bottom: 16px;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.btn--secondary:hover {
  background: #45A049;
}


.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  animation: slideIn 0.3s ease-out;
}

.success-content {
  background: linear-gradient(135deg, #4CAF50, #45A049);
  color: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3);
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 300px;
}

.success-icon {
  background: rgba(255, 255, 255, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.success-text h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.success-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}


.avatar-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.current-avatar {
  display: flex;
  justify-content: center;
}

.modal-avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e0e0e0;
}

.modal-avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #e0e0e0;
}

.upload-hint {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

.modal-actions {
  width: 100%;
  display: flex;
  gap: 12px;
  justify-content: center;
}


.file-input {
  padding: 6px 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  font-size: 0.9rem;
}

.file-input:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.file-input:focus {
  outline: none;
  border-color: #4CAF50;
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

.btn--primary {
  background: #4CAF50;
  color: #fff;
}

.btn--primary:hover {
  background: #45A049;
}


.image-preview {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.preview-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}


.password-success-message {
  margin-bottom: 20px;
}

.password-success-message .success-content {
  background: linear-gradient(135deg, #4CAF50, #45A049);
  color: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3);
  display: flex;
  align-items: center;
  gap: 16px;
}

.password-success-message .success-icon {
  background: rgba(255, 255, 255, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.password-success-message .success-text h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.password-success-message .success-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.password-error-text {
  color: #f44336;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
}


@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-container {
    padding: 30px 20px;
    margin: 0 10px;
  }
  
  .edit-profile {
    padding: 10px;
  }
}
</style>
