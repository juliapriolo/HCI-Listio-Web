<template>
  <div class="search-container">
    <!-- Campo de búsqueda (aparece al lado del botón) -->
    <v-expand-transition>
      <v-text-field
        v-show="showSearch"
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        :placeholder="placeholder"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        bg-color="grey-lighten-3"
        color="grey-darken-3"
        rounded="lg"
        clearable
        hide-details
        autofocus
        class="search-field"
        @click:clear="$emit('update:modelValue', '')"
      />
    </v-expand-transition>

    <!-- Botón -->
    <v-btn
      :icon="showSearch ? 'mdi-close' : 'mdi-magnify'"
      variant="text"
      size="large"
      color="grey-darken-2"
      class="toggle-btn"
      @click="toggleSearch"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: 'Buscar...'
  }
})

const emit = defineEmits(['update:modelValue'])
const showSearch = ref(false)

const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) emit('update:modelValue', '')
}

// Si se limpia desde fuera, oculta la barra
watch(() => props.modelValue, (newValue) => {
  if (!newValue && showSearch.value) showSearch.value = false
})
</script>

<style scoped>
.search-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  gap: 8px;
}

.search-field {
  flex: 1; /* Ocupa todo el espacio libre */
  transition: all 0.3s ease;
  margin: 20px;
}

.toggle-btn {
  transition: transform 0.2s ease;
}

.toggle-btn:hover {
  transform: scale(1.1);
}
</style>