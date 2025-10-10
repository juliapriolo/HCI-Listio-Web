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
                @click="sendVerificationEmail"
                :disabled="sendingVerification"
              >
                {{ sendingVerification ? 'Enviando...' : 'Reenviar verificación' }}
              </button>
              <button
                v-if="loginFeedback.canVerify"
                type="button"
                class="link-button"
                @click="openVerificationModal"
              >
                Ingresar código
              </button>
            </div>
          </div>
          
          <!-- Enlace de recuperación de contraseña -->
          <div class="forgot-password">
            <a href="#" @click.prevent="showForgotPassword = true" class="forgot-link">
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
    </div>

    <!-- Modal de recuperación de contraseña -->
    <div v-if="showForgotPassword" class="modal-overlay">
      <div class="modal">
        <h2>Recuperar Contraseña</h2>
        
        <!-- Paso 1: Solicitar email -->
        <div v-if="recoveryStep === 1">
          <p>Ingrese su email para recibir el código de recuperación:</p>
          <form @submit.prevent="sendRecoveryEmail">
            <div class="form-group">
              <label for="recoveryEmail">Email</label>
              <input
                id="recoveryEmail"
                v-model="recoveryForm.email"
                type="email"
                class="form-input"
                placeholder="Ingrese su email"
                required
              />
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn btn--primary" :disabled="loading">
                {{ loading ? 'Enviando...' : 'Enviar código' }}
              </button>
              <button type="button" class="btn btn--cancel" @click="closeForgotPasswordModal">
                Cancelar
              </button>
            </div>
            <div
              v-if="recoveryFeedback.text"
              :class="['feedback-message', recoveryFeedback.type ? `feedback-message--${recoveryFeedback.type}` : '']"
              role="alert"
              aria-live="polite"
            >
              {{ recoveryFeedback.text }}
            </div>
          </form>
        </div>

        <!-- Paso 2: Ingresar código y nueva contraseña -->
        <div v-if="recoveryStep === 2">
          <p>Ingrese el código recibido en su email y su nueva contraseña:</p>
          <form @submit.prevent="resetPassword">
            <div class="form-group">
              <label for="recoveryCode">Código de verificación</label>
              <input
                id="recoveryCode"
                v-model="recoveryForm.code"
                type="text"
                class="form-input"
                placeholder="Ingrese el código"
                required
              />
            </div>
            <div class="form-group">
              <label for="newPassword">Nueva contraseña</label>
              <input
                id="newPassword"
                v-model="recoveryForm.password"
                type="password"
                class="form-input"
                placeholder="Ingrese nueva contraseña"
                required
              />
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn btn--primary" :disabled="loading">
                {{ loading ? 'Cambiando...' : 'Cambiar contraseña' }}
              </button>
              <button type="button" class="btn btn--cancel" @click="closeForgotPasswordModal">
                Cancelar
              </button>
            </div>
            <div
              v-if="recoveryFeedback.text"
              :class="['feedback-message', recoveryFeedback.type ? `feedback-message--${recoveryFeedback.type}` : '']"
              role="alert"
              aria-live="polite"
            >
              {{ recoveryFeedback.text }}
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de verificación de cuenta -->
    <div v-if="showVerificationModal" class="modal-overlay">
      <div class="modal">
        <h2>Verificar Cuenta</h2>
        <p>Ingresá el código de verificación que recibiste por email para activar tu cuenta.</p>
        <form @submit.prevent="verifyAccount">
          <div class="form-group">
            <label for="verificationCode">Código de verificación</label>
            <input
              id="verificationCode"
              v-model="verificationForm.code"
              type="text"
              class="form-input"
              placeholder="Ingresa el código"
              required
            />
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn--primary" :disabled="verificationLoading">
              {{ verificationLoading ? 'Verificando...' : 'Verificar cuenta' }}
            </button>
            <button type="button" class="btn btn--cancel" @click="closeVerificationModal">
              Cerrar
            </button>
          </div>
          <div
            v-if="verificationFeedback.text"
            :class="['feedback-message', verificationFeedback.type ? `feedback-message--${verificationFeedback.type}` : '']"
            role="alert"
            aria-live="polite"
          >
            {{ verificationFeedback.text }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usersApi } from '@/api/users'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const sendingVerification = ref(false)
const verificationLoading = ref(false)

// Estado para recuperación de contraseña
const showForgotPassword = ref(false)
const recoveryStep = ref(1) // 1: solicitar email, 2: ingresar código y nueva contraseña
const recoveryForm = ref({
  email: '',
  code: '',
  password: ''
})
const recoveryFeedback = ref({ type: '', text: '' })

// Estado para verificación de cuenta
const showVerificationModal = ref(false)
const verificationForm = ref({ code: '' })
const verificationFeedback = ref({ type: '', text: '' })

const loginFeedback = ref({ type: '', text: '', canResend: false, canVerify: false })

const setRecoveryFeedback = (type, text) => {
  recoveryFeedback.value = {
    type,
    text
  }
}

const clearRecoveryFeedback = () => {
  recoveryFeedback.value = { type: '', text: '' }
}

const setLoginFeedback = (type, text, options = {}) => {
  loginFeedback.value = {
    type,
    text,
    canResend: !!options.canResend,
    canVerify: !!options.canVerify
  }
}

const clearLoginFeedback = () => {
  loginFeedback.value = { type: '', text: '', canResend: false, canVerify: false }
}

const setVerificationFeedback = (type, text) => {
  verificationFeedback.value = {
    type,
    text
  }
}

const clearVerificationFeedback = () => {
  verificationFeedback.value = { type: '', text: '' }
}

const handleLogin = async () => {
  if (loading.value) return
  clearLoginFeedback()
  
  loading.value = true
  try {
    await userStore.login(form.value.email, form.value.password)
    const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : '/listas'
    router.push(redirectPath)
  } catch (error) {
    const message = getErrorMessage(error, 'Error al iniciar sesión')
    const needsVerification = /not verified/i.test(error?.message || message)
    setLoginFeedback(
      'error',
      needsVerification
        ? 'Tu cuenta aún no está verificada. Revisá tu email o reenviá el código.'
        : message,
      { canResend: needsVerification, canVerify: needsVerification }
    )
  } finally {
    loading.value = false
  }
}

// Función para convertir errores técnicos en mensajes amigables
const getErrorMessage = (error, fallback) => {
  const errorMsg = error?.message?.toLowerCase() || ''
  
  // Errores específicos con mensajes amigables
  if (errorMsg.includes('missing email') || errorMsg.includes('email is required')) {
    return 'Por favor, ingrese su dirección de email'
  }
  if (errorMsg.includes('missing password') || errorMsg.includes('password is required')) {
    return 'Por favor, ingrese su contraseña'
  }
  if (errorMsg.includes('invalid email')) {
    return 'El formato del email no es válido'
  }
  if (errorMsg.includes('user not found') || errorMsg.includes('email not found')) {
    return 'No se encontró un usuario con ese email'
  }
  if (errorMsg.includes('invalid password') || errorMsg.includes('wrong password')) {
    return 'La contraseña es incorrecta'
  }
  if (errorMsg.includes('invalid code') || errorMsg.includes('wrong code')) {
    return 'El código de verificación es incorrecto'
  }
  if (errorMsg.includes('account not verified') || errorMsg.includes('not verified')) {
    return 'Tu cuenta aún no está verificada. Revisá tu email para activarla.'
  }
  if (errorMsg.includes('code expired') || errorMsg.includes('expired')) {
    return 'El código de verificación ha expirado'
  }
  if (errorMsg.includes('unauthorized')) {
    return 'No tiene permisos para realizar esta acción'
  }
  if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
    return 'Error de conexión. Verifique su internet'
  }
  
  // Si no coincide con ningún error específico, usar el mensaje original o el fallback
  return error?.message || fallback
}

const sendRecoveryEmail = async () => {
  if (loading.value) return
  clearRecoveryFeedback()
  
  // Debug: verificar que el email se esté capturando
  console.log('Email a enviar:', recoveryForm.value.email)
  
  if (!recoveryForm.value.email || recoveryForm.value.email.trim() === '') {
    setRecoveryFeedback('error', 'Por favor, ingrese su dirección de email')
    return
  }
  
  loading.value = true
  try {
    const payload = { email: recoveryForm.value.email.trim() }
    console.log('Payload enviado:', payload)
    
    await usersApi.forgotPassword(payload)
    setRecoveryFeedback('success', 'Código de recuperación enviado a su email')
    recoveryStep.value = 2
  } catch (error) {
    console.error('Error completo:', error)
    const message = getErrorMessage(error, 'Error al enviar código de recuperación')
    setRecoveryFeedback('error', message)
  } finally {
    loading.value = false
  }
}

const resetPassword = async () => {
  if (loading.value) return
  clearRecoveryFeedback()
  
  loading.value = true
  try {
    await usersApi.resetPassword({
      code: recoveryForm.value.code,
      password: recoveryForm.value.password
    })
    setRecoveryFeedback('success', 'Contraseña cambiada con éxito')
    setTimeout(() => {
      closeForgotPasswordModal()
    }, 1500)
  } catch (error) {
    const message = getErrorMessage(error, 'Error al cambiar contraseña')
    setRecoveryFeedback('error', message)
  } finally {
    loading.value = false
  }
}

const closeForgotPasswordModal = () => {
  showForgotPassword.value = false
  recoveryStep.value = 1
  recoveryForm.value = {
    email: '',
    code: '',
    password: ''
  }
  clearRecoveryFeedback()
}

const openVerificationModal = () => {
  verificationForm.value.code = ''
  clearVerificationFeedback()
  showVerificationModal.value = true
}

const closeVerificationModal = () => {
  showVerificationModal.value = false
  verificationForm.value.code = ''
  clearVerificationFeedback()
}

const verifyAccount = async () => {
  if (verificationLoading.value) return
  clearVerificationFeedback()

  const code = verificationForm.value.code?.trim()
  if (!code) {
    setVerificationFeedback('error', 'Ingresá el código de verificación que recibiste por email')
    return
  }

  verificationLoading.value = true
  try {
    await usersApi.verifyAccount({ code })
    setVerificationFeedback('success', 'Cuenta verificada con éxito. Ya podés iniciar sesión.')
    setLoginFeedback('success', 'Cuenta verificada con éxito. Iniciá sesión con tus credenciales.', {
      canVerify: false,
      canResend: false
    })
    setTimeout(() => {
      closeVerificationModal()
    }, 1600)
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo verificar la cuenta. Revisá el código e intentá nuevamente.')
    setVerificationFeedback('error', message)
  } finally {
    verificationLoading.value = false
  }
}

const sendVerificationEmail = async () => {
  if (sendingVerification.value) return

  const email = form.value.email?.trim()

  if (!email) {
    setLoginFeedback('error', 'Ingresá tu email para reenviar la verificación')
    return
  }

  sendingVerification.value = true
  try {
    await usersApi.sendVerification({ email })
    setLoginFeedback('success', 'Te enviamos un nuevo email de verificación. Revisá tu bandeja.', {
      canResend: false,
      canVerify: true
    })
  } catch (error) {
    const message = getErrorMessage(error, 'No pudimos reenviar el email de verificación')
    const needsVerification = /not verified/i.test(error?.message || message)
    setLoginFeedback('error', message, { canResend: needsVerification, canVerify: true })
  } finally {
    sendingVerification.value = false
  }
}

onMounted(() => {
  if (route.query.registered === '1') {
    setLoginFeedback(
      'success',
      'Registro completado. Revisá tu email y verificá tu cuenta para iniciar sesión.',
      { canResend: true, canVerify: true }
    )
    openVerificationModal()

    const { registered, ...rest } = { ...route.query }
    router.replace({ query: rest }).catch(() => {})
  }
})
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

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 32px 24px;
  min-width: 400px;
  max-width: 90vw;
}

.modal h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.5rem;
  text-align: center;
}

.modal p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
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

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  flex: 1;
}

.btn--primary {
  background: #4CAF50;
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  background: #45A049;
}

.btn--primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn--cancel {
  background: #f5f5f5;
  color: #333;
}

.btn--cancel:hover {
  background: #e0e0e0;
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
