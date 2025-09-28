<template>
  <div class="search-container">
    <!-- Search Toggle Button -->
    <v-btn
      :icon="showSearch ? 'mdi-close' : 'mdi-magnify'"
      variant="text"
      size="large"
      color="grey-darken-2"
      @click="toggleSearch"
    />
    
    <!-- Expandable Search Field -->
    <v-expand-transition>
      <v-text-field
        v-show="showSearch"
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        :label="placeholder"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        rounded
        clearable
        class="mt-4"
        autofocus
        @click:clear="$emit('update:modelValue', '')"
      />
    </v-expand-transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Buscar...'
  }
})

const emit = defineEmits(['update:modelValue'])

const showSearch = ref(false)

const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    emit('update:modelValue', '')
  }
}

// Watch for external changes to hide search when cleared externally
watch(() => props.modelValue, (newValue) => {
  if (!newValue && showSearch.value) {
    showSearch.value = false
  }
})
</script>

<style scoped>
.search-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
</style>