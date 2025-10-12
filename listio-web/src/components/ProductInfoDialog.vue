<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal product-modal">
      <h2 style="color: black;">{{ t('pages.products.dialog.title') }}</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="productName">{{t('common.name')}}</label>
          <input
            id="productName"
            v-model="localData.name"
            type="text"
            class="form-input"
            placeholder="Ingrese el nombre del producto"
            required
            autofocus
          />
        </div>

        <div class="form-group">
          <label for="productCategory">{{t('common.category')}} *</label>
          <div class="category-input-group">
            <select
              id="productCategory"
              v-model="localData.category"
              class="form-input"
              required
            >
              <option value="">Seleccione una categoría</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category"
              >
                {{ category.name }}
              </option>
              <option value="__new__">+ Crear nueva categoría</option>
            </select>
            
            <!-- Campo para nueva categoría -->
            <div v-if="localData.category === '__new__'" class="new-category-field">
              <input
                v-model="localData.newCategoryName"
                type="text"
                class="form-input"
                placeholder="Nombre de la nueva categoría"
                required
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="productDescription">Descripción (opcional)</label>
          <textarea
            id="productDescription"
            v-model="localData.description"
            class="form-input"
            placeholder="Ingrese una descripción para el producto"
            rows="3"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn--cancel" @click="handleCancel">
            {{ t('common.cancel') }}
          </button>

          <button
            type="submit"
            class="btn btn--success"
            :disabled="!isFormValid"
          >
            {{ t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
const { t } = useLanguage()

const props = defineProps({
  modelValue: Boolean,
  item: { type: Object, default: () => ({}) },
  categories: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'update:modelValue',
  'update',
  'cancel',
])

const localData = ref({ 
  ...props.item, 
  newCategoryName: "" 
})

watch(() => props.item, (newItem) => {
  localData.value = { 
    ...newItem, 
    newCategoryName: "" 
  }
})

watch(() => props.modelValue, (open) => {
  if (!open) {
    localData.value = { 
      ...props.item, 
      newCategoryName: "" 
    }
  }
})

const isFormValid = computed(() => {
  const hasName = !!localData.value.name?.trim()
  const hasCategory = !!localData.value.category
  const hasNewCategoryName = localData.value.category !== '__new__' || !!localData.value.newCategoryName?.trim()
  
  return hasName && hasCategory && hasNewCategoryName
})

const handleSubmit = () => {
  emit('update', { ...localData.value })
  emit('update:modelValue', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  width: 500px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 1rem;
  color: black;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  color: black;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.btn--cancel { background: #ccc; color: #000; }
.btn--primary { background: #1976d2; color: #fff; }
.btn--success { background: #4caf50; color: #fff; }
.btn--error { background: #f44336; color: #fff; }

/* Category input group styles */
.category-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.new-category-field {
  margin-top: 8px;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>