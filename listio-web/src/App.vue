<template>
  <v-app>
    <AppHeader v-if="!shouldHideHeader" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()

const routesWithoutHeader = ['/', '/login', '/registro']

const shouldHideHeader = computed(() => routesWithoutHeader.includes(route.path))
</script>
