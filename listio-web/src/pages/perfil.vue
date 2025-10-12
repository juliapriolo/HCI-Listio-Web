<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLanguage } from '@/composables/useLanguage'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { profile: storedProfile } = storeToRefs(userStore)
const { t, toggleLanguage, language } = useLanguage()

const alternateLanguageLabel = computed(() =>
  language.value === 'es' ? t('common.englishShort') : t('common.spanishShort')
)

const redirectToLogin = () => {
  const target = route.fullPath || '/perfil'
  router.replace({ path: '/login', query: { redirect: target } })
}

const profile = computed(() => storedProfile.value || { name: '', email: '', avatar: null })

const handleLogout = async () => {
  try {
    await userStore.logout()
  } finally {
    router.push('/login')
  }
}

const handleLanguageChange = () => {
  toggleLanguage()
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
  if (!userStore.profile) {
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
  <main class="profile">
    <v-container>
      <!-- Page Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          {{ t('profile.title') }}
        </h1>
      </div>

      <section class="profile__layout">
        <article class="profile__card">
        <div class="profile__avatar">
          <img
            v-if="profile.avatar"
            :src="profile.avatar"
            :alt="t('profile.photoAlt', { name: profile.name })"
            class="profile__avatar-image"
          />
          <v-icon class="profile__avatar-icon" size="64">mdi-account</v-icon>
        </div>
        <div class="profile__identity">
          <h2 class="profile__name">{{ profile.name }}</h2>
          <p class="profile__email">{{ profile.email }}</p>
        </div>
      </article>

      <nav class="profile__actions" :aria-label="t('profile.accountActions')">
        <v-btn
          variant="elevated"
          class="profile__action-btn profile__action-btn--edit"
          to="/editar-perfil"
          block
        >
          <v-icon left>mdi-account-edit</v-icon>
          {{ t('profile.editProfile') }}
        </v-btn>
        
        <v-btn
          variant="elevated"
          class="profile__action-btn profile__action-btn--language"
          @click="handleLanguageChange"
          block
        >
          <v-icon left>mdi-translate</v-icon>
          {{ t('profile.changeLanguage') }} ({{ alternateLanguageLabel }})
        </v-btn>
        
        <v-btn
          variant="elevated"
          class="profile__action-btn profile__action-btn--logout"
          @click="handleLogout"
          block
        >
          <v-icon left>mdi-logout</v-icon>
          {{ t('profile.logout') }}
        </v-btn>
      </nav>
      </section>
    </v-container>
  </main>
</template>

<style scoped>
.profile {
  padding-top: 2rem;
  padding-bottom: 6rem;
  min-height: calc(100vh - 80px);
  background-color: #fafafa;
}

.profile__layout {
  width: min(880px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  margin: 0 auto;
}

.profile__card {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #f6f6f6;
  border-radius: 24px;
  padding: clamp(20px, 4vw, 32px);
  box-shadow: 0 10px 24px rgba(31, 78, 53, 0.1);
  width: 100%;
}

.profile__avatar {
  width: clamp(96px, 14vw, 140px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: #d9dadb;
  display: grid;
  place-items: center;
  color: #ffffff;
  overflow: hidden;
}

.profile__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile__avatar-icon {
  color: #ffffff;
}

.profile__identity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile__name {
  margin: 0;
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 600;
  color: #243624;
}

.profile__email {
  margin: 0;
  color: #5c6f5f;
  font-size: 15px;
}

.profile__actions {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(31, 78, 53, 0.08);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.profile__action-btn {
  height: 48px;
  font-weight: 500;
  text-transform: none;
  border-radius: 12px;
}

/* Botones grises por defecto con colores en hover */
.profile__action-btn--edit {
  background-color: #f5f5f5 !important;
  color: #4CAF50 !important;
}

.profile__action-btn--edit:hover {
  background-color: #4CAF50 !important;
  color: #ffffff !important;
}

.profile__action-btn--language {
  background-color: #f5f5f5 !important;
  color: #1976d2 !important;
}

.profile__action-btn--language:hover {
  background-color: #1976d2 !important;
  color: #ffffff !important;
}

.profile__action-btn--logout {
  background-color: #f5f5f5 !important;
  color: #f44336 !important;
}

.profile__action-btn--logout:hover {
  background-color: #f44336 !important;
  color: #ffffff !important;
}

@media (max-width: 720px) {
  .profile {
    padding-top: 1rem;
    padding-bottom: 4rem;
  }

  .profile__card {
    flex-direction: column;
    text-align: center;
  }

  .profile__identity {
    align-items: center;
  }
}
</style>
