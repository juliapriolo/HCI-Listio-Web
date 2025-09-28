<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ title }}
      </v-card-title>
      
      <v-card-text>
        <!-- Dynamic Form Fields -->
        <div v-for="field in fields" :key="field.key" class="mb-3">
          <!-- Text Field -->
          <v-text-field
            v-if="field.type === 'text' || field.type === 'number'"
            :model-value="formData[field.key]"
            @update:model-value="updateField(field.key, $event)"
            :label="field.label"
            :type="field.type"
            variant="outlined"
            :required="field.required"
            :autofocus="field.autofocus"
            @keyup.enter="handleSubmit"
          />
          
          <!-- Date Field -->
          <v-text-field
            v-else-if="field.type === 'date'"
            :model-value="formData[field.key]"
            @update:model-value="updateField(field.key, $event)"
            :label="field.label"
            type="date"
            variant="outlined"
            :required="field.required"
          />
          
          <!-- Select Field -->
          <v-select
            v-else-if="field.type === 'select'"
            :model-value="formData[field.key]"
            @update:model-value="updateField(field.key, $event)"
            :label="field.label"
            :items="field.options"
            variant="outlined"
            :required="field.required"
          />
          
          <!-- Textarea Field -->
          <v-textarea
            v-else-if="field.type === 'textarea'"
            :model-value="formData[field.key]"
            @update:model-value="updateField(field.key, $event)"
            :label="field.label"
            variant="outlined"
            :required="field.required"
            rows="3"
          />
        </div>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer />
        <v-btn @click="handleCancel">
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="submitColor"
          variant="elevated"
          @click="handleSubmit"
          :disabled="!isFormValid"
        >
          {{ submitText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  fields: {
    type: Array,
    required: true,
    validator: (fields) => {
      return fields.every(field => 
        field.key && field.label && field.type
      )
    }
  },
  formData: {
    type: Object,
    required: true
  },
  submitText: {
    type: String,
    default: 'Guardar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  submitColor: {
    type: String,
    default: 'success'
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel', 'update:formData'])

const isFormValid = computed(() => {
  const requiredFields = props.fields.filter(field => field.required)
  return requiredFields.every(field => {
    const value = props.formData[field.key]
    return value && value.toString().trim() !== ''
  })
})

const updateField = (key, value) => {
  const updatedData = { ...props.formData, [key]: value }
  emit('update:formData', updatedData)
}

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', props.formData)
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}

// Reset form when dialog closes
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    // Optionally reset form data here
    const resetData = {}
    props.fields.forEach(field => {
      resetData[field.key] = field.default || ''
    })
    emit('update:formData', resetData)
  }
})
</script>

<style scoped>
/* Dialog-specific styles */
</style>