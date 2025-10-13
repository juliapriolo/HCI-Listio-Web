<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
  >
    <v-card class="white-background">
      <v-card-title class="text-h6 d-flex align-center justify-space-between">
        <span class="text-grey-darken-3 font-weight-bold">{{ listName }}</span>
        <v-btn
          icon
          variant="text"
          size="small"
          color="success"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <div v-if="items.length === 0" class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1">mdi-cart-outline</v-icon>
          <div class="text-h6 text-grey-darken-1 mt-4">No había productos</div>
          <div class="text-body-2 text-grey mt-2">Esta lista estaba vacía cuando fue eliminada</div>
        </div>
        
        <div v-else>
          <div class="text-body-2 text-grey-darken-1 mb-4">
            Productos que estaban en esta lista ({{ items.length }}):
          </div>

          <!-- Lista de productos con el mismo diseño que list.vue -->
          <div class="list">
            <ul class="list-items">
              <li v-for="item in items" :key="item.id">
                <div class="list-row">
                  <div>
                    <h3 class="item-descr">{{ item.data?.name || 'Producto sin nombre' }}</h3>
                    <p class="text-caption text-grey-darken-2">
                      {{ item.data?.quantity || 1 }} {{ item.data?.unit || 'unidad' }}
                    </p>
                  </div>

                  <div class="item-buttons">
                    <div class="text-caption text-grey">
                      {{ formatDate(item.ts) }}
                    </div>
                  </div>
                </div>
                <v-divider thickness="1px" class="mt-2 mb-2"/>
              </li>
            </ul>
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="#f44336"
          variant="elevated"
          class="text-none"
          @click="$emit('update:modelValue', false)"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  listName: {
    type: String,
    default: 'Lista sin nombre'
  },
  items: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:modelValue'])

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return String(ts)
  }
}
</script>

<style scoped>
.white-background {
  background-color: white !important;
}

.list {
  width: 100%;
  margin-top: 15px;
  border-radius: 8px;
}

.list-items {
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow-y: auto;
  background-color: #c5eabd;
  border-radius: 8px;
}

.list-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 60px;
  margin-left: 30px;
  gap: 30px;
}

.item-descr {
  font-family: 'Arial';
  color: black;
  font-weight: lighter;
  margin: 0;
}

.item-buttons {
  display: flex;
  flex-direction: row;
  margin-left: auto;
  margin-right: 30px;
  align-items: center;
  justify-content: center;
  padding: 6px;
  gap: 30px;
}

.category-logo {
  width: 26px;
  height: auto;
}
</style>
