<template>
  <v-card
    class="shopping-list-card"
    elevation="2"
    rounded="lg"
    hover
    @click="$emit('click')"
  >
    <div class="d-flex align-center pa-4">
      <!-- Image -->
      <v-img
        :src="list.image"
        :alt="list.name"
        width="80"
        height="80"
        cover
        class="rounded-lg"
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular
              color="grey-lighten-4"
              indeterminate
            ></v-progress-circular>
          </div>
        </template>
      </v-img>

      <!-- List Info -->
      <div class="ml-4 flex-grow-1">
        <h3 class="text-h6 font-weight-medium text-grey-darken-3">
          {{ list.name }}
        </h3>
        <p class="text-body-2 text-grey-darken-1 mb-0" v-if="list.itemCount">
          {{ list.itemCount }} productos
        </p>
        <p class="text-body-2 text-grey-darken-1 mb-0" v-if="list.lastUpdated">
          Actualizada {{ formatDate(list.lastUpdated) }}
        </p>
      </div>

      <!-- Actions -->
      <div class="ml-4">
        <v-btn
          icon="mdi-chevron-right"
          variant="text"
          size="small"
          color="grey-darken-2"
        />
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  list: {
    type: Object,
    required: true,
    validator: (list) => {
      return list.name && list.image
    }
  }
})

defineEmits(['click'])

const formatDate = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const listDate = new Date(date)
  const diffDays = Math.floor((now - listDate) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'hoy'
  if (diffDays === 1) return 'ayer'
  if (diffDays < 7) return `hace ${diffDays} días`
  
  return listDate.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  })
}
</script>

<style scoped>
.shopping-list-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
}

.shopping-list-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}
</style>