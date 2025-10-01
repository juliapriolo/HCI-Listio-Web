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
                v-for="(item, index) in items"
                :key="index"
              >
                <div class="list-row">
                  <img src="/icons8-apple-64.png" alt="Manzana" class="category-logo" />
                  <div>
                    <h3 class="item-descr">{{ item.name }}</h3>
                    <!-- <h3 class="item-descr">{{ item.category }}</h3> -->
                  </div>

                  <div class="item-buttons">
                    <v-icon color="black">mdi-checkbox-blank-outline</v-icon>
                    <v-icon color="black">mdi-dots-horizontal</v-icon>
                  </div>
                </div>
                <v-divider thickness="2px"/>
              </li>
            </ul>
          </div>

          <!-- Boton Agregar Producto -->
          <div style="width: 90%">
            <button @click="handleAgregarProducto" class="button-add-product">Agregar Producto</button>
          </div>
        </div>
      </div>
  </v-container>
</template>

<script setup>

const items = [
  { name: "Manzanas", category: "Frutas" },
  { name: "Pan", category: "Despensa" },
  { name: "Leche", category: "Lácteos" },
  { name: "Manzanas", category: "Frutas" },
  { name: "Pan", category: "Despensa" },
  { name: "Leche", category: "Lácteos" },
  { name: "Manzanas", category: "Frutas" },
  { name: "Pan", category: "Despensa" },
  { name: "Leche", category: "Lácteos" },
];

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
}
</style>