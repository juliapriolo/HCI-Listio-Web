<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ t('pages.lists.filters.title') }}
      </v-card-title>
      
      <v-card-text>
        
        <v-text-field
          :label="t('pages.lists.filters.name')"
          variant="outlined"
          v-model="localFilters.name"
        />

        
        <v-select
          :label="t('pages.lists.filters.category')"
          variant="outlined"
          v-model="localFilters.category"
          :items="categories"
          clearable
        />
      </v-card-text>
      
      <v-card-actions>
        <v-btn color="secondary" variant="outlined" @click="handleClear">
          {{ t('pages.lists.filters.clear') }}
        </v-btn>

        <v-spacer />

        <v-btn @click="handleCancel">
          {{ t('common.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="handleApply"
        >
          {{ t('pages.lists.filters.apply') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
const { t } = useLanguage()

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


const localFilters = ref({ ...props.filters })


watch(() => props.modelValue, (open) => {
  if (open) localFilters.value = { ...props.filters }
})


const handleApply = () => {
  emit('apply', { ...localFilters.value })
  emit('update:modelValue', false)
}


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