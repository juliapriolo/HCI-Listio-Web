<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)

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

const submitForm = async () => {
  try {
    await userStore.updateProfile({
      name: form.name,
      email: form.email,
      avatar: form.avatar,
    })
    alert('Perfil actualizado con exito')
    router.push('/perfil')
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

onMounted(() => {
  if (!userStore.token) {
    redirectToLogin()
    return
  }

  if (!profile.value) {
    userStore.fetchProfile().catch(() => {
      redirectToLogin()
    })
  }
})
</script>

<template>
  <main class="edit-profile">
    <h1 class="edit-profile__title">Editar Perfil</h1>

    <form class="edit-profile__form" @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">Nombre</label>
        <input v-model="form.name" id="name" type="text" required />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input v-model="form.email" id="email" type="email" required />
      </div>

      <div class="form-group">
        <button type="button" class="btn btn--secondary" @click="showPasswordModal = true">
        </button>
      </div>

      <div class="form-group">
        <label for="avatar">Foto de Perfil</label>
        <input type="file" id="avatar" @change="handleFileUpload" />
        <div v-if="avatarPreview" class="avatar-preview">
          <img :src="avatarPreview" alt="Vista previa del avatar" />
        </div>
      </div>

      <div class="edit-profile__actions">
        <button type="submit" class="btn btn--save">Guardar</button>
        <router-link to="/perfil" class="btn btn--cancel">Cancelar</router-link>
      </div>
    </form>

    <div v-if="showPasswordModal" class="modal-overlay">
      <div class="modal">
        <h2>Cambiar contraseña</h2>
        <form @submit.prevent="changePassword">
          <div class="form-group">
            <label for="currentPassword">Contraseña actual</label>
            <input v-model="passwordForm.current" id="currentPassword" type="password" required />
          </div>
          <div class="form-group">
            <label for="newPassword">Nueva contraseña</label>
            <input v-model="passwordForm.new" id="newPassword" type="password" required />
          </div>
          <div class="edit-profile__actions">
            <button type="submit" class="btn btn--save">Guardar</button>
            <button type="button" class="btn btn--cancel" @click="showPasswordModal = false">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

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
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.edit-profile__title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
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
  background: #009951;
  color: #fff;
  border: none;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
}
</style>
