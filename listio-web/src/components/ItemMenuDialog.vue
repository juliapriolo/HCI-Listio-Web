<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ t('pages.list.itemMenu.title') }}
      </v-card-title>
      
      <v-card-text>
        <v-text-field
          :label="t('common.name')"
          variant="outlined"
          v-model="localData.name"
          required
        />

        <v-select
          :label="t('common.category')"
          variant="outlined"
          v-model="localData.category"
          :items="categories"
          required
        />

        <div class="d-flex gap-3">
          <v-text-field
            label="Cantidad"
            variant="outlined"
            v-model.number="localData.quantity"
            type="number"
            min="1"
            class="flex-grow-1"
          />

          <v-select
            label="Unidad"
            variant="outlined"
            v-model="localData.unit"
            :items="unitOptions"
            class="flex-grow-1"
          />
        </div>
      </v-card-text>
      
      <v-card-actions>
        <v-btn color="error" variant="outlined" @click="handleDelete">
          {{ t('common.delete') }}
        </v-btn>

        <v-spacer />

        <v-btn @click="handleCancel">
          {{ t('common.cancel') }}
        </v-btn>
        <v-btn
          color="success"
          variant="elevated"
          @click="handleSubmit"
          :disabled="!isFormValid"
        >
          {{ t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
const { t } = useLanguage()

const props = defineProps({
  modelValue: Boolean,
  item: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'update', 'delete', 'cancel'])

// Opciones de unidad
const unitOptions = [
  { title: 'Unidad', value: 'unidad' },
  { title: 'Kilogramo', value: 'kg' },
  { title: 'Gramo', value: 'g' },
  { title: 'Litro', value: 'l' },
  { title: 'Mililitro', value: 'ml' },
  { title: 'Paquete', value: 'paquete' },
  { title: 'Caja', value: 'caja' }
]

// Copia local del item para no modificarlo directamente
const localData = ref({ 
  quantity: 1,
  unit: 'g',
  ...props.item 
})

// Cuando cambie el item o se abra el modal, actualizamos la copia
watch(() => props.item, (newItem) => {
  localData.value = { 
    quantity: 1,
    unit: 'g',
    ...newItem 
  }
})

watch(() => props.modelValue, (open) => {
  if (!open) {
    localData.value = { 
      quantity: 1,
      unit: 'g',
      ...props.item 
    }
  }
})

const isFormValid = computed(() => {
  return localData.value.name?.trim() && 
         localData.value.category?.trim() && 
         localData.value.quantity > 0 &&
         localData.value.unit?.trim()
})

// Guardar cambios
const handleSubmit = () => {
  emit('update', { ...localData.value })
  emit('update:modelValue', false)
}

// Eliminar ítem
const handleDelete = () => {
  emit('delete', props.item)
  emit('update:modelValue', false)
}

// Cancelar
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