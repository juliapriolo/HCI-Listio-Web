<template>
  <v-card
    class="text-center pa-8"
    color="grey-lighten-5"
    flat
  >
    <v-icon 
      :size="iconSize" 
      :color="iconColor" 
      class="mb-4"
    >
      {{ icon }}
    </v-icon>
    
    <h3 class="text-h6 text-grey-darken-1 mb-2">
      {{ title }}
    </h3>
    
    <p class="text-body-2 text-grey-darken-1" v-if="description">
      {{ description }}
    </p>

    <!-- Optional Action Button -->
    <v-btn
      v-if="actionText"
      :color="actionColor"
      variant="elevated"
      class="mt-4"
      @click="$emit('action')"
    >
      {{ actionText }}
    </v-btn>
  </v-card>
</template>

<script setup>
const props = defineProps({
  icon: {
    type: String,
    default: 'mdi-inbox-outline'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  actionText: {
    type: String,
    default: ''
  },
  actionColor: {
    type: String,
    default: 'primary'
  },
  iconSize: {
    type: [String, Number],
    default: 64
  },
  iconColor: {
    type: String,
    default: 'grey-lighten-1'
  }
})

defineEmits(['action'])
</script>

<style scoped>
/* Component-specific styles can go here if needed */
</style>