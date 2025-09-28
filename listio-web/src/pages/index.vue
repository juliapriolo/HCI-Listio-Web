<template>
  <div>
    <!-- Esta página redirige automáticamente a listas -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // Redirigir a la página de listas
  router.replace('/listas')
})
</script>
