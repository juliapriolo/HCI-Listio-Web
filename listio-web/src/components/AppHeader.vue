<template>
  <v-app-bar
    color="#6DCB5A"
    dark
    elevation="2"
    height="80"
  >
    <v-container class="d-flex align-center">
      <!-- Logo -->
      <img src="/listio-logo.png" alt="Listio Logo" class="logo-image" @click="router.push('/listas')" />

      <!-- Navigation Buttons -->
      <div class="d-flex gap-2">
        <v-btn
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.route"
          color="#009951"
          variant="elevated"
          class="text-none"
          min-width="100"
        >
          {{ item.name }}
        </v-btn>
      </div>

      <v-spacer />

      <!-- User Avatar -->
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
            :alt="userProfile.name || 'Avatar'"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
          <v-icon v-else size="32">mdi-account</v-icon>
        </v-avatar>
      </v-btn>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter();
const userStore = useUserStore()
const { profile: userProfile } = storeToRefs(userStore)

const navigationItems = [
  { name: 'Listas', route: '/listas' },
  { name: 'Productos', route: '/productos' },
  { name: 'Despensa', route: '/despensa' }
]
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
