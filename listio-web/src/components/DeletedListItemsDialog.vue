<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
  >
    <v-card>
      <v-card-title class="text-h6 d-flex align-center justify-space-between">
        <span>{{ listName }}</span>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <div class="text-body-2 text-grey-darken-1 mb-4">
          Productos que estaban en esta lista:
        </div>

        <div class="items-list">
          <v-list lines="two" class="pa-0 bg-transparent">
            <v-list-item
              v-for="item in items"
              :key="item.id"
              class="mb-2 item-card"
              rounded="lg"
            >
              <template v-slot:prepend>
                <v-avatar color="primary-lighten-4" size="40">
                  <v-icon color="primary">mdi-package-variant</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ item.data?.name || 'Producto sin nombre' }}
              </v-list-item-title>

              <v-list-item-subtitle v-if="item.data?.quantity">
                {{ item.data.quantity }} {{ item.data.unit || '' }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <div class="text-caption text-grey">
                  {{ formatDate(item.ts) }}
                </div>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="elevated"
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
.items-list {
  max-height: 400px;
  overflow-y: auto;
}

.item-card {
  background-color: #f5f5f5;
  transition: background-color 0.2s ease;
}

.item-card:hover {
  background-color: #eeeeee;
}
</style>
