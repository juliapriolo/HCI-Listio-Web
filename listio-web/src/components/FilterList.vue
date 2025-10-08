<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
  >
    <v-card>
      <v-card-title class="text-h6">
        Filtrar listas
      </v-card-title>
      
      <v-card-text>
        <!-- Filtrar por nombre -->
        <v-text-field
          label="Nombre"
          variant="outlined"
          v-model="localFilters.name"
        />

        <!-- Filtrar por categoría -->
        <v-select
          label="Categoría"
          variant="outlined"
          v-model="localFilters.category"
          :items="categories"
          clearable
        />
      </v-card-text>
      
      <v-card-actions>
        <v-btn color="secondary" variant="outlined" @click="handleClear">
          Limpiar
        </v-btn>

        <v-spacer />

        <v-btn @click="handleCancel">
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="handleApply"
        >
          Aplicar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  filters: {
    type: Object,
    default: () => ({ name: '', category: '' })
  },
  categories: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'apply', 'cancel'])

// Copia local de los filtros para no modificar los props directamente
const localFilters = ref({ ...props.filters })

// Mantener sincronizado al abrir el diálogo
watch(() => props.modelValue, (open) => {
  if (open) localFilters.value = { ...props.filters }
})

// Aplicar filtros
const handleApply = () => {
  emit('apply', { ...localFilters.value })
  emit('update:modelValue', false)
}

// Limpiar filtros
const handleClear = () => {
  localFilters.value = { name: '', category: '' }
}

// Cancelar sin aplicar
const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.v-card-title {
  font-weight: bold;
}
</style>