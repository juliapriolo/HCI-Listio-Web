<template>
  <v-container fluid class="background">
      <div style="margin-top: 20px;" class="main">
        <div class="list-opt">
          <!-- Nombre Lista -->
          <h1 class="list-name">Mi Lista: Supermercado</h1>

          <!-- Botones (Filtrar, compartir, buscar)-->
          <div class="list-buttons"> 
            <v-icon @click="handleFiltrar" color="#009951" icon="mdi-filter-outline" size="50"></v-icon>
            <v-icon @click="handleCompartir" color="#009951" icon="mdi-export-variant" size="50"></v-icon>
            <v-icon @click="handleBuscar" color="#009951" icon="mdi-magnify" size="50"></v-icon>
          </div>
        </div>

        <div style="display:flex; flex-direction: column; width: 75%; justify-content: center; align-items: center;">
          <!-- Productos -->
          <div class="list">
            <ul class="list-items">
              <li 
                v-for="(item) in items"
                :key="item.name"
              >
                <div class="list-row">
                  <!-- Dynamic category icon -->
                  <v-avatar size="40" :color="getCategoryColor(item.categoryId)" class="mr-3">
                    <v-icon :color="isDarkColor(getCategoryColor(item.categoryId)) ? 'white' : 'black'">
                      {{ getCategoryIcon(item.categoryId) }}
                    </v-icon>
                  </v-avatar>
                  <div>
                    <h3 class="item-descr">{{ item.name }}</h3>
                    <!-- <h3 class="item-descr">{{ item.category }}</h3> -->
                  </div>

                  <div class="item-buttons">
                    <!-- <v-btn 
                    icon 
                    variant="plain"
                    @click="toggleCheck(item)"
                    style="background-color: transparent;"
                    >
                        <v-icon v-if="!item.checked" color="black">mdi-checkbox-blank-outline</v-icon>
                        <v-icon v-else color="black">mdi-checkbox-marked</v-icon>
                    </v-btn> -->
                    <v-checkbox
                   
                    :ripple="false"
                    color="black"
                    base-color="black"
                    hide-details
                    />
                    <v-btn 
                    icon 
                    variant="plain"
                    style="background-color: transparent;"
                    >
                        <v-icon color="black">mdi-dots-horizontal</v-icon>
                    </v-btn>
                  </div>
                </div>
                <v-divider thickness="2px"/>
              </li>
            </ul>
          </div>

          <!-- Boton Agregar Producto -->
          <div style="width: 90%">
            <v-btn
            color="#009951"
            variant="elevated"
            class="button-add-product"
            @click="handleAgregarProducto"
            min-width="100"
            >
            Agregar Producto
            </v-btn>
          </div>
        </div>
      </div>
  </v-container>
</template>

<script setup>
import { useCategoryStore } from '@/stores/category'

const categoryStore = useCategoryStore()

const items = [
  { name: "Manzanas", category: "Frutas", categoryId: "cat-fruits", checked: true },
  { name: "Pan", category: "Despensa", categoryId: "cat-bakery", checked: true },
  { name: "Leche", category: "Lácteos", categoryId: "cat-dairy", checked: true },
  { name: "Banana", category: "Frutas", categoryId: "cat-fruits", checked: true },
  { name: "Aceite", category: "Despensa", categoryId: "cat-canned", checked: !true },
  { name: "Yogur", category: "Lácteos", categoryId: "cat-dairy", checked: !true },
  { name: "Melon", category: "Frutas", categoryId: "cat-fruits", checked: false },
  { name: "Dulce de leche", category: "Despensa", categoryId: "cat-snacks", checked: false },
  { name: "Manteca", category: "Lácteos", categoryId: "cat-dairy", checked: false },
];

// Helper functions for category icons
const getCategoryIcon = (categoryId) => {
  if (!categoryId) return 'mdi-package-variant'
  return categoryStore.getIconById(categoryId)
}

const getCategoryColor = (categoryId) => {
  if (!categoryId) return '#9E9E9E'
  return categoryStore.getColorById(categoryId)
}

const isDarkColor = (hexColor) => {
  // Convert hex to RGB and calculate luminance
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.5
}

function handleFiltrar (){
  console.log("Filtrar");
}
function handleCompartir (){
  console.log("Compartir");
}
function handleBuscar (){
  console.log("Buscar")
}
function handleAgregarProducto (){
  console.log("Agregar Producto")
}

</script>

<style scoped>
.background {
  display: flex;
  background-color: white;
  align-items: flex-start;
  justify-content: center;
  width: 100%; 
  height: 100%; 
}
.main {
  display: flex;
  background-color: white;
  width: 65%;
  align-items: center;
  flex-direction: column;
}
.list-opt {
  display: flex;
  align-items: center;
  width: 100%;
}
.list-name {
  display: flex;
  color: black;
  font-size: 42px;
}
.list-buttons {
  display: flex;
  margin-left: auto;
  gap: 15px;
}
.list {
  width: 100%;
  margin-top: 15px;
  border-radius: 8px;
}
.list-items {
  display: flex;
  flex-direction: column;
  max-height: 60vh; 
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
  color: black ;
  font-weight: lighter;
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
.button-add-product {
  background-color: #009951;
  color: white;
  height: 30px;
  width: 100%;
  border-radius: 8px;
  font-weight: bold;
  font-family: 'Arial';
  font-size: 13px;
  margin-top: 15px;
  font-variant-caps: normal;
  text-transform: none;
}
</style>