<template>
  <div style="padding: 20px;">
  <h2>{{ t('pages.pantry.addCategoryTitle') }}</h2>

    <div style="display: flex; flex-direction: column; gap: 10px; width: 300px;">
  <label>{{ t('pages.pantry.categoryNameLabel') }}</label>
      <input
        v-model="categoryName"
        type="text"
        :placeholder="t('pages.pantry.categoryNamePlaceholder')"
        style="padding: 6px; border: 1px solid #ccc; border-radius: 4px;"
      />

      <button
        @click="addCategory"
        style="padding: 8px; border: none; background-color: #4caf50; color: white; border-radius: 4px; cursor: pointer;"
      >
        {{ t('pages.pantry.addCategoryButton') }}
      </button>
    </div>

  <p v-if="message" style="margin-top: 15px;">{{ message }}</p>

    
    <div style="margin-top: 30px;">
  <h3>{{ t('pages.pantry.existingCategoriesTitle') }}</h3>

  <div v-if="loading" style="margin-top: 10px;">{{ t('pages.pantry.loadingCategories') }}</div>

      <ul v-else-if="categoryStore.categories.length > 0" style="margin-top: 10px;">
        <li
          v-for="category in categoryStore.categories"
          :key="category.id"
          style="padding: 5px 0; border-bottom: 1px solid #ddd;"
        >
          {{ category.name }}
        </li>
      </ul>

      <p v-else style="margin-top: 10px; color: #888;">
        {{ t('pages.pantry.noCategories') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/category'

const categoryName = ref('')
const message = ref('')
const loading = ref(true)
const categoryStore = useCategoryStore()

onMounted(async () => {
  try {
    loading.value = true
    await categoryStore.init()  // carga localStorage o API
  } catch (e) {
    console.error('Error al inicializar categorías:', e)
  } finally {
    loading.value = false
  }
})

const addCategory = async () => {
  if (!categoryName.value.trim()) {
    message.value = '⚠️ Ingresa un nombre de categoría'
    return
  }

  try {
    console.log('[Categories.vue] Enviando:', categoryName.value)
    await categoryStore.createRemote({ name: categoryName.value })
    message.value = `Categoría "${categoryName.value}" agregada correctamente.`
    categoryName.value = ''
  } catch (err) {
    console.error('Error al agregar categoría:', err)
    message.value = `Error: ${err?.data?.message || err.message}`
  }
}
</script>