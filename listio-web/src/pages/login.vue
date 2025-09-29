<template>
  <div class="login-container">
    <!-- Lado izquierdo con fondo verde -->
    <div class="login-left">
      <!-- Logo LISTIO -->
      <div class="logo">
        <h1>LISTIO</h1>
      </div>
      
      <!-- Ilustraciones -->
      <div class="illustrations">
        <!-- Imagen de la bolsa de compras con productos -->
        <img src="@/assets/login_1.png" alt="Bolsa de compras con productos" class="grocery-bag-image" />
        
        <!-- Imagen de las bolsas de colores -->
        <img src="@/assets/login_2.png" alt="Bolsas de compras de colores" class="colored-bags-image" />
      </div>
    </div>
    
    <!-- Lado derecho con formulario -->
    <div class="login-right">
      <div class="login-card">
        <h2 class="login-title">Iniciar Sesión</h2>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Campo Email -->
          <div class="form-group">
            <label for="email" class="form-label">Mail</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="Ingrese su mail"
            />
          </div>
          
          <!-- Campo Contraseña -->
          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="Ingrese su contraseña"
            />
          </div>
          
          <!-- Botón de Login -->
          <button type="submit" class="login-button">
            Inicia Sesión
          </button>
        </form>
        
        <!-- Términos y condiciones -->
        <p class="terms-text">
          Al iniciar sesión, aceptas nuestros 
          <a href="#" class="terms-link">Términos de Uso</a> y 
          <a href="#" class="terms-link">Política de Privacidad</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const handleLogin = () => {
  // Por ahora simplemente redirigimos sin validación
  // TODO: Implementar validación cuando esté lista la API
  console.log('Login attempt:', form.value)
  router.push('/listas')
}
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
}

/* Lado izquierdo - Fondo verde */
.login-left {
  flex: 2;
  background-color: #4CAF50;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 40px;
}

.logo h1 {
  color: #333;
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  letter-spacing: 2px;
}

.illustrations {
  flex: 1;
  position: relative;
  margin-top: 60px;
}

/* Imágenes de las ilustraciones */
.grocery-bag-image {
  position: absolute;
  top: 0;
  left: 0;
  max-width: 400px;
  max-height: 450px;
  width: auto;
  height: auto;
  object-fit: contain;
  z-index: 2;
}

.colored-bags-image {
  position: absolute;
  bottom: 80px;
  right: 80px;
  max-width: 350px;
  max-height: 450px;
  width: auto;
  height: auto;
  object-fit: contain;
  z-index: 1;
}

/* Lado derecho - Formulario */
.login-right {
  flex: 1;
  background-color: #4CAF50;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background-color: #ffffff;
  border-radius: 20px;
  padding: 40px 60px 60px 60px;
  width: 100%;
  max-width: 500px;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.login-title {
  color: #333;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 20px 0;
  text-align: center;
}

.login-form {
  margin-bottom: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  color: #333;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-input::placeholder {
  color: #999;
}

.login-button {
  width: 100%;
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #45A049;
}

.terms-text {
  color: #666;
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.4;
  margin: 0;
  margin-top: auto;
}

.terms-link {
  color: #333;
  text-decoration: underline;
  cursor: pointer;
}

.terms-link:hover {
  color: #4CAF50;
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-left {
    flex: 1;
    padding: 20px;
  }
  
  .illustrations {
    margin-top: 20px;
    height: 300px;
  }
  
  .grocery-bag-image {
    max-width: 280px;
    max-height: 320px;
    top: 5px;
    left: 5px;
  }
  
  .colored-bags-image {
    max-width: 220px;
    max-height: 260px;
    bottom: 50px;
    right: 50px;
  }
  
  .login-right {
    padding: 15px;
    align-items: stretch;
  }
  
  .login-card {
    padding: 30px 40px 40px 40px;
    max-width: 100%;
    min-height: 70vh;
    justify-content: space-between;
  }
}
</style>
