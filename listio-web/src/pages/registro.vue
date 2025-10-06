<template>
  <div class="register-container">
    <div class="register-left">
      <div class="logo">
        <h1>LISTIO</h1>
      </div>
      <div class="illustrations">
        <img src="@/assets/login_1.png" alt="Bolsa de compras" class="grocery-bag-image" />
        <img src="@/assets/login_2.png" alt="Bolsas de colores" class="colored-bags-image" />
      </div>
    </div>

    <div class="register-right">
      <div class="register-card">
        <h2 class="register-title">Crear Cuenta</h2>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="name" class="form-label">Nombre</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="Ingrese su nombre"
              required
            />
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Mail</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="Ingrese su mail"
              required
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="Cree una contraseña"
              minlength="6"
              required
            />
          </div>

          <button type="submit" class="register-button">
            Registrarme
          </button>
        </form>

        <p class="redirect-text">
          ¿Ya tienes cuenta?
          <RouterLink to="/login" class="redirect-link">Inicia sesión</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  name: '',
  email: '',
  password: '',
})

const handleRegister = async () => {
  try {
    await userStore.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
    })
    alert('Registro completado. Inicia sesión para continuar.')
    router.push({ path: '/login', query: { registered: '1' } })
  } catch (error) {
    alert(error?.message || 'No se pudo registrar.')
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
}

.register-left {
  flex: 2;
  background-color: #4caf50;
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

.register-right {
  flex: 1;
  background-color: #4caf50;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 20px;
}

.register-card {
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

.register-title {
  color: #333;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 20px 0;
  text-align: center;
}

.register-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: #333;
  font-size: 1rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
  outline: none;
}

.register-button {
  margin-top: 10px;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(46, 125, 50, 0.25);
}

.redirect-text {
  margin-top: 24px;
  text-align: center;
  color: #555;
  font-size: 0.95rem;
}

.redirect-link {
  color: #2e7d32;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}

.redirect-link:hover {
  text-decoration: underline;
}

@media (max-width: 960px) {
  .register-container {
    flex-direction: column;
    height: auto;
  }

  .register-left {
    flex: none;
    height: 40vh;
  }

  .register-right {
    flex: none;
    min-height: 60vh;
  }

  .register-card {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .register-left {
    display: none;
  }

  .register-right {
    background-color: #ffffff;
  }
}
</style>
