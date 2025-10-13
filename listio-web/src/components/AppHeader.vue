<template>
  <v-app-bar
    color="#6DCB5A"
    dark
    elevation="2"
    height="80"
  >
    <v-container class="d-flex align-center">
      
      <img src="/listio-logo.png" alt="Listio Logo" class="logo-image" @click="router.push('/listas')" />

      
      <div class="d-flex gap-2">
        <v-btn
          v-for="item in navigationItems"
          :key="item.route"
          :to="item.route"
          color="#009951"
          variant="elevated"
          class="text-none"
          min-width="100"
        >
          {{ item.label }}
        </v-btn>
      </div>

      <v-spacer />

      
      <v-btn
        icon
        size="large"
        color="#d9dadb"
        variant="elevated"
        to="/perfil"
      >
        <v-avatar>
          <img 
            v-if="userProfile?.avatar" 
            :src="userProfile.avatar" 
            :alt="userProfile.name || t('profile.avatarFallback')"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
          <v-icon v-else size="32">mdi-account</v-icon>
        </v-avatar>
      </v-btn>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'

const router = useRouter()
const userStore = useUserStore()
const { profile: userProfile } = storeToRefs(userStore)
const { t } = useLanguage()

const navigationItems = computed(() => [
  { label: t('nav.lists'), route: '/listas' },
  { label: t('nav.products'), route: '/productos' },
  { label: t('nav.pantry'), route: '/despensa' }
])
</script>

<style scoped>
.gap-2 > * + * {
  margin-left: 8px;
}

.logo-image {
  width: 120px;
  height: auto;
  object-fit: contain;
  margin-right: 15px;
  border-radius: 10px;
}
</style>
