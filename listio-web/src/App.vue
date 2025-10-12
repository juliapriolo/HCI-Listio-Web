<template>
  <v-app>
    <AppHeader v-if="!shouldHideHeader" />
    <v-main>
      <router-view :key="route.path" />
    </v-main>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()

const routesWithoutHeader = ['/', '/login', '/registro', '/editar-perfil', '/edit-profile']

const shouldHideHeader = computed(() => routesWithoutHeader.includes(route.path))
</script>
