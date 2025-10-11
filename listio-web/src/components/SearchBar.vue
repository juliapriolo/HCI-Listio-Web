<template>
  <div class="search-container">
    <!-- Campo de búsqueda -->
    <v-expand-transition>
      <v-text-field
        v-show="showSearch"
        ref="searchField"
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        :placeholder="placeholder"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        bg-color="grey-lighten-3"
        color="grey-darken-3"
        rounded="lg"
        hide-details
        class="search-field"
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
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: 'Buscar...'
  }
})

const emit = defineEmits(['update:modelValue'])
const showSearch = ref(false)
const searchField = ref(null) 

const toggleSearch = async () => {
  showSearch.value = !showSearch.value

  if (showSearch.value) {
    await nextTick()
    searchField.value?.focus()
  } else {
    emit('update:modelValue', '')
  }
}

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
  flex: 1;
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