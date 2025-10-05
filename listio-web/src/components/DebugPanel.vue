<template>
  <div class="debug-panel" v-if="isDev">
    <h3>Debug Panel (Pinia Stores)</h3>
    <div class="actions">
      <v-btn color="primary" small @click="seedAll">Seed All</v-btn>
      <v-btn color="error" small @click="clearAll">Clear All</v-btn>
    </div>

    <details open>
      <summary>Lists</summary>
      <pre>{{ JSON.stringify(listsStore.$state, null, 2) }}</pre>
    </details>

    <details>
      <summary>Products</summary>
      <pre>{{ JSON.stringify(productsStore.$state, null, 2) }}</pre>
    </details>

    <details>
      <summary>Pantry</summary>
      <pre>{{ JSON.stringify(pantryStore.$state, null, 2) }}</pre>
    </details>

    <details>
      <summary>User</summary>
      <pre>{{ JSON.stringify(userStore.$state, null, 2) }}</pre>
    </details>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useListsStore } from '@/stores/lists'
import { useProductsStore } from '@/stores/products'
import { usePantryStore } from '@/stores/pantry'
import { useUserStore } from '@/stores/user'

const listsStore = useListsStore()
const productsStore = useProductsStore()
const pantryStore = usePantryStore()
const userStore = useUserStore()

const isDev = import.meta.env.DEV

const seedAll = () => {
  listsStore.seed(listsStore.sample || [])
  productsStore.seed(productsStore.sample || [])
  pantryStore.seed(pantryStore.sample || [])
}

const clearAll = () => {
  listsStore.items = []
  productsStore.items = []
  pantryStore.items = []
  userStore.profile = {}
  listsStore.save && listsStore.save()
  productsStore.save && productsStore.save()
  pantryStore.save && pantryStore.save()
}
</script>

<style scoped>
.debug-panel {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  width: 360px;
  max-height: 60vh;
  overflow: auto;
  background: rgba(255,255,255,0.95);
  border: 1px solid #ddd;
  padding: 0.75rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  z-index: 9999;
}
.debug-panel pre { background:#f6f8fa; padding:0.5rem; overflow:auto }
.debug-panel .actions { display:flex; gap:0.5rem; margin-bottom:0.5rem }
</style>
