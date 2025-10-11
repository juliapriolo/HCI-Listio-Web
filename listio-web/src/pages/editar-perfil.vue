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
    form.email = value.email || ''
    form.avatar = value.avatar || null
  },
  { immediate: true }
)

const showPasswordModal = ref(false)
const showAvatarModal = ref(false)
const passwordForm = reactive({ current: '', new: '' })

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
      avatar: form.avatar,
    }
    
    // Solo incluir surname si existe en el perfil original
    if (profile.value?.surname) {
      updateData.surname = profile.value.surname
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

const changePassword = async () => {
  try {
    await userStore.changePassword({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.new,
    })
    showPasswordModal.value = false
    passwordForm.current = ''
    passwordForm.new = ''
  } catch (error) {
    alert(error?.message || 'Error al cambiar la contrasena')
  }
}

onMounted(async () => {
  // Asegurar que los datos del usuario se carguen del localStorage
  if (!userStore.token) {
    userStore.load()
  }
  
  // Verificar nuevamente después de cargar
  if (!userStore.token) {
    redirectToLogin()
    return
  }

  // Si no tenemos perfil, intentar cargarlo
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
    <!-- Header con flecha y título alineados -->
    <div class="page-header">
      <button @click="router.push('/perfil')" class="back-button">
        <span class="back-arrow">←</span>
        <span class="back-text">{{ t('profile.title') }}</span>
      </button>
      <h1 class="edit-profile__title">{{ t('profile.editTitle') }}</h1>
      <div class="spacer"></div>
    </div>

    <!-- Mensaje de éxito -->
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
        <!-- Foto de perfil centrada -->
        <div class="avatar-section">
          <div class="avatar-container" @click="showAvatarModal = true">
            <img 
              v-if="avatarPreview" 
              :src="avatarPreview" 
              :alt="t('profile.avatarFallback')" 
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              <span class="avatar-icon">👤</span>
            </div>
            <div class="avatar-overlay">
              <span class="avatar-edit-icon">📷</span>
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
            <label for="email">{{ t('profile.email') }}</label>
            <input v-model="form.email" id="email" type="email" readonly disabled />
          </div>
        </div>

        <div class="form-group">
          <button type="button" class="btn btn--secondary" @click="showPasswordModal = true">
            {{ t('profile.changePassword') }}
          </button>
        </div>

        <div class="edit-profile__actions">
          <button type="submit" class="btn btn--save">{{ t('common.save') }}</button>
          <router-link to="/perfil" class="btn btn--cancel">{{ t('common.cancel') }}</router-link>
        </div>
      </div>
    </form>

    <!-- Modal de cambio de contraseña -->
    <div v-if="showPasswordModal" class="modal-overlay">
      <div class="modal">
  <h2>{{ t('profile.changePassword') }}</h2>
        <form @submit.prevent="changePassword">
          <div class="form-group">
            <label for="currentPassword">{{ t('profile.currentPassword') }}</label>
            <input v-model="passwordForm.current" id="currentPassword" type="password" required />
          </div>
          <div class="form-group">
            <label for="newPassword">{{ t('profile.newPassword') }}</label>
            <input v-model="passwordForm.new" id="newPassword" type="password" required />
          </div>
          <div class="edit-profile__actions">
            <button type="submit" class="btn btn--save">{{ t('common.save') }}</button>
            <button type="button" class="btn btn--cancel" @click="showPasswordModal = false">{{ t('common.cancel') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de cambio de avatar -->
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
              <span class="avatar-icon">👤</span>
            </div>
          </div>
          <div class="avatar-upload">
            <input 
              type="file" 
              id="avatarFile" 
              @change="handleFileUpload" 
              accept="image/*"
              style="display: none"
            />
            <label for="avatarFile" class="upload-button">
          📁 {{ t('profile.selectNewPhoto') }}
            </label>
            <p class="upload-hint">{{ t('profile.uploadHint') }}</p>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn--save" @click="showAvatarModal = false">{{ t('common.close') }}</button>
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
  z-index: 1000;
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

/* Header alineado */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 10px;
}

.spacer {
  width: 100px; /* Mismo ancho aproximado que el botón de regreso */
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #4CAF50;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  min-width: 100px;
}

.back-button:hover {
  background-color: #f5f5f5;
}

.back-arrow {
  font-size: 20px;
  font-weight: bold;
}

.back-text {
  font-weight: 500;
}

.edit-profile__title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
  text-align: center;
  flex: 1;
}

/* Layout del formulario */
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

/* Sección de Avatar */
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
  font-size: 48px;
  color: #999;
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
}

.avatar-edit-icon {
  font-size: 16px;
  color: white;
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
  background: #06763f;
  color: #fff;
}

.btn--cancel {
  background: #ccc;
  color: #333;
  text-decoration: none;
  display: flex;
  align-items: center;
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

/* Mensaje de éxito */
.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
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

/* Estilos del modal de avatar */
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

.avatar-upload {
  text-align: center;
}

.upload-button {
  display: inline-block;
  background: #4CAF50;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.upload-button:hover {
  background: #45A049;
}

.upload-hint {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

.modal-actions {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Responsive */
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
