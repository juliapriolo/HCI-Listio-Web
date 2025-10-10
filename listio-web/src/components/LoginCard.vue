<template>
  <div class="login-card">
    <h2 class="login-title">Iniciar Sesión</h2>
    
    <form @submit.prevent="handleLogin" class="login-form">
      <!-- Campo Email -->
      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-input"
          placeholder="Ingrese su email"
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
      <button type="submit" class="login-button" :disabled="loading">
        {{ loading ? 'Iniciando...' : 'Inicia Sesión' }}
      </button>

      <div
        v-if="loginFeedback.text"
        :class="['feedback-message', loginFeedback.type ? `feedback-message--${loginFeedback.type}` : '']"
        role="alert"
        aria-live="assertive"
      >
        <span>{{ loginFeedback.text }}</span>
        <div class="feedback-actions" v-if="loginFeedback.canResend || loginFeedback.canVerify">
          <button
            v-if="loginFeedback.canResend"
            type="button"
            class="link-button"
            @click="$emit('send-verification')"
            :disabled="sendingVerification"
          >
            {{ sendingVerification ? 'Enviando...' : 'Reenviar verificación' }}
          </button>
          <button
            v-if="loginFeedback.canVerify"
            type="button"
            class="link-button"
            @click="$emit('open-verification')"
          >
            Ingresar código
          </button>
        </div>
      </div>
      
      <!-- Enlace de recuperación de contraseña -->
      <div class="forgot-password">
        <a href="#" @click.prevent="$emit('forgot-password')" class="forgot-link">
          ¿Olvidó su contraseña?
        </a>
      </div>
    </form>
    
    <!-- Términos y condiciones -->
    <p class="terms-text">
      Al iniciar sesión, aceptas nuestros 
      <a href="#" class="terms-link">Términos de Uso</a> y 
      <a href="#" class="terms-link">Política de Privacidad</a>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  sendingVerification: {
    type: Boolean,
    default: false
  },
  loginFeedback: {
    type: Object,
    default: () => ({ type: '', text: '', canResend: false, canVerify: false })
  }
})

// Emits
const emit = defineEmits(['login', 'send-verification', 'open-verification', 'forgot-password'])

// Form data
const form = ref({
  email: '',
  password: ''
})

// Methods
const handleLogin = () => {
  emit('login', form.value)
}

// Expose form for parent component
defineExpose({
  form
})
</script>

<style scoped>
.login-card {
  background-color: #ffffff;
  border-radius: 20px;
  padding: 40px 60px 60px 60px;
  width: 100%;
  max-width: 500px;
  min-height: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  overflow: hidden;
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
  min-height: 0;
  overflow-y: auto;
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

.login-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.forgot-password {
  text-align: center;
  margin-top: 16px;
}

.forgot-link {
  color: #4CAF50;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-link:hover {
  text-decoration: underline;
}

.feedback-message {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.4;
  text-align: center;
  font-weight: 500;
  transition: opacity 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.feedback-message--success {
  background-color: #e8f8ef;
  border: 1px solid #b7e6c5;
  color: #20603c;
}

.feedback-message--error {
  background-color: #fdecea;
  border: 1px solid #f5c6c6;
  color: #b71c1c;
}

.feedback-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.link-button {
  margin-top: 12px;
  background: none;
  border: none;
  color: #4CAF50;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.link-button:disabled {
  color: #9e9e9e;
  cursor: not-allowed;
  text-decoration: none;
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

/* Responsive styles for the card */
@media (max-width: 1024px) {
  .login-card {
    padding: 35px 50px 50px 50px;
    max-width: 450px;
  }
}

@media (max-width: 768px) {
  .login-card {
    padding: 30px 40px 40px 40px;
    max-width: 100%;
    min-height: 500px;
    max-height: 85vh;
    justify-content: space-between;
  }
  
  .login-title {
    font-size: 1.7rem;
    margin-bottom: 15px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 25px 30px 35px 30px;
    border-radius: 15px;
    min-height: 450px;
    max-height: 80vh;
  }
  
  .login-title {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }
  
  .form-group {
    margin-bottom: 12px;
  }
  
  .form-input {
    padding: 12px;
    font-size: 0.95rem;
  }
  
  .login-button {
    padding: 12px;
    font-size: 1rem;
  }
  
  .forgot-password {
    margin-top: 12px;
  }
  
  .terms-text {
    font-size: 0.8rem;
    line-height: 1.3;
  }
}

@media (max-width: 360px) {
  .login-card {
    padding: 20px 25px 30px 25px;
    min-height: 400px;
    max-height: 75vh;
  }
  
  .login-title {
    font-size: 1.3rem;
    margin-bottom: 12px;
  }
  
  .form-group {
    margin-bottom: 10px;
  }
  
  .form-input {
    padding: 10px;
    font-size: 0.9rem;
  }
  
  .login-button {
    padding: 10px;
    font-size: 0.95rem;
  }
  
  .forgot-password {
    margin-top: 10px;
  }
  
  .terms-text {
    font-size: 0.75rem;
    line-height: 1.2;
  }
}
</style>
