<template>
  <div>
    <!-- Esta página redirige automáticamente a login -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // Redirigir a la página de login
  router.replace('/login')
})
</script>
