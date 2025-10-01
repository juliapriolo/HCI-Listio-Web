<template>
  <v-container fluid class="nav-bar">
    <div class="nav-bar-content">
      <img src="/listio-logo.png" alt="Mi logo" class="logo" />
      <div class="buttons-container">
        <button @click="msgListas" class="button">Listas</button>
        <button @click="msgProductos" class="button">Productos</button>
        <button @click="msgDespensa" class="button">Despensa</button>
      </div>
        <v-icon class="user-icon" color="white" icon="mdi-account-circle" size="60"></v-icon>
    </div>
  </v-container>
</template>

<script setup>

function msgListas (){
  console.log("Listas");
}
function msgProductos (){
  console.log("Productos");
}
function msgDespensa (){
  console.log("Despensa")
}

</script>

<style scoped>
.nav-bar {
  display: flex;
  background-color: #6DCB5A;
  height: 100px;
}
.nav-bar-content {
  display: flex;       
  align-items: center;   
  width: 100%;          
  padding: 0 20px;     
}
.buttons-container {
  display: flex;
  gap: 30px;             /* separa los botones horizontalmente */
  margin-left: 50px;     /* separación entre logo y botones */
}
.button{
  background-color: #009951;
  color: white;
  height: 45px;
  width: 110px;
  border-radius: 8px;
  font-weight: bold;
  font-family: 'Arial';
  font-size: 13px;
}
.logo{
  width: 130px;
  height: auto;
  border-radius: 8px;
}
.user-icon {
  margin-left: auto;
}
</style>