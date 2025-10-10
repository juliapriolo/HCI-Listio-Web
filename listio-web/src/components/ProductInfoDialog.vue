<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
  >
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        Información del producto
      </v-card-title>

      <v-card-text>
        <v-text-field
          label="Nombre"
          variant="outlined"
          v-model="localData.name"
          required
        />

        <v-select
          label="Categoría"
          variant="outlined"
          v-model="localData.category_id"
          :items="categories"
          item-title="name"
          item-value="id"
          required
        />
      </v-card-text>

      <v-card-actions class="flex-wrap">
        <v-btn color="primary" variant="outlined" @click="handleAddToList">
          Añadir a lista
        </v-btn>

        <v-btn color="error" variant="outlined" @click="handleDelete">
          Eliminar
        </v-btn>

        <v-spacer />

        <v-btn @click="handleCancel">
          Cancelar
        </v-btn>
        <v-btn
          color="success"
          variant="elevated"
          @click="handleSubmit"
          :disabled="!isFormValid"
        >
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  item: {
    type: Object,
    default: () => ({}),
  },
  categories: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'update', 'delete', 'add-to-list', 'cancel'])

const localData = ref({ ...props.item })

watch(
  () => props.item,
  (newItem) => {
    localData.value = { ...newItem }
  }
)

watch(
  () => props.modelValue,
  (open) => {
    if (!open) localData.value = { ...props.item }
  }
)

const isFormValid = computed(() => !!localData.value.name?.trim())

const handleSubmit = () => {
  emit('update', { ...localData.value })
  emit('update:modelValue', false)
}

const handleDelete = () => {
  emit('delete', props.item)
  emit('update:modelValue', false)
}

const handleAddToList = () => {
  emit('add-to-list', props.item)
  emit('update:modelValue', false)
}

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
