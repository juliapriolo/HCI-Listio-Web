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
        <img
          src="@/assets/login_1.png"
          :alt="t('login.groceryBagAlt')"
          class="grocery-bag-image"
        />
        
        <!-- Imagen de las bolsas de colores -->
        <img
          src="@/assets/login_2.png"
          :alt="t('login.coloredBagsAlt')"
          class="colored-bags-image"
        />
      </div>
    </div>
    
    <!-- Lado derecho con formulario -->
    <div class="login-right">
      <LoginCard
        :loading="loading"
        :sending-verification="sendingVerification"
        :login-feedback="loginFeedback"
        @login="handleLogin"
        @send-verification="sendVerificationEmail"
        @open-verification="openVerificationModal"
        @forgot-password="showForgotPassword = true"
        ref="loginCardRef"
      />
    </div>

    <!-- Forgot password modal -->
    <div v-if="showForgotPassword" class="modal-overlay">
      <div class="modal">
        <h2>{{ t('login.forgotPasswordModal.title') }}</h2>
        
        <!-- Paso 1: Solicitar email -->
        <div v-if="recoveryStep === 1">
          <p>{{ t('login.forgotPasswordModal.step1Description') }}</p>
          <form @submit.prevent="sendRecoveryEmail">
            <div class="form-group">
              <label for="recoveryEmail">{{ t('login.email') }}</label>
              <input
                id="recoveryEmail"
                v-model="recoveryForm.email"
                type="email"
                class="form-input"
                :placeholder="t('login.emailPlaceholder')"
                required
                @invalid="onRecoveryEmailInvalid"
                @input="onRecoveryEmailInput"
              />
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn btn--primary" :disabled="loading">
                {{ loading ? t('login.forgotPasswordModal.sending') : t('login.forgotPasswordModal.sendCode') }}
              </button>
              <button type="button" class="btn btn--cancel" @click="closeForgotPasswordModal">
                {{ t('common.cancel') }}
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
          <p>{{ t('login.forgotPasswordModal.step2Description') }}</p>
          <form @submit.prevent="resetPassword">
            <div class="form-group">
              <label for="recoveryCode">{{ t('login.verificationCode') }}</label>
              <input
                id="recoveryCode"
                v-model="recoveryForm.code"
                type="text"
                class="form-input"
                :placeholder="t('login.forgotPasswordModal.codePlaceholder')"
                required
              />
            </div>
            <div class="form-group">
              <label for="newPassword">{{ t('login.forgotPasswordModal.newPasswordLabel') }}</label>
              <input
                id="newPassword"
                v-model="recoveryForm.password"
                type="password"
                class="form-input"
                :placeholder="t('login.forgotPasswordModal.newPasswordPlaceholder')"
                required
              />
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn btn--primary" :disabled="loading">
                {{ loading ? t('login.forgotPasswordModal.changing') : t('login.forgotPasswordModal.changePassword') }}
              </button>
              <button type="button" class="btn btn--cancel" @click="closeForgotPasswordModal">
                {{ t('common.cancel') }}
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

    <!-- Account verification modal -->
    <div v-if="showVerificationModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ t('login.verifyModal.title') }}</h2>
        <p>{{ t('login.verifyModal.description') }}</p>
        <form @submit.prevent="verifyAccount">
          <div class="form-group">
            <label for="verificationCode">{{ t('login.verificationCode') }}</label>
            <input
              id="verificationCode"
              v-model="verificationForm.code"
              type="text"
              class="form-input"
              :placeholder="t('login.verifyModal.codePlaceholder')"
              required
            />
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn--primary" :disabled="verificationLoading">
              {{ verificationLoading ? t('login.verifyModal.verifying') : t('login.verifyModal.submit') }}
            </button>
            <button type="button" class="btn btn--cancel" @click="closeVerificationModal">
              {{ t('common.close') }}
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
import LoginCard from '@/components/LoginCard.vue'
import { useLanguage } from '@/composables/useLanguage'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { t } = useLanguage()

const loginCardRef = ref(null)

const loading = ref(false)
const sendingVerification = ref(false)
const verificationLoading = ref(false)

const showForgotPassword = ref(false)
const recoveryStep = ref(1)
const recoveryForm = ref({
  email: '',
  code: '',
  password: ''
})
const recoveryFeedback = ref({ type: '', text: '' })

const showVerificationModal = ref(false)
const verificationForm = ref({ code: '' })
const verificationFeedback = ref({ type: '', text: '' })

const loginFeedback = ref({
  type: '',
  text: '',
  canResend: false,
  canVerify: false
})

const setRecoveryFeedback = (type, text) => {
  recoveryFeedback.value = { type, text }
}

const clearRecoveryFeedback = () => {
  setRecoveryFeedback('', '')
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
  setLoginFeedback('', '', { canResend: false, canVerify: false })
}

const setVerificationFeedback = (type, text) => {
  verificationFeedback.value = { type, text }
}

const clearVerificationFeedback = () => {
  setVerificationFeedback('', '')
}

const getErrorMessage = (error, fallbackKey) => {
  const errorMsg = error?.message?.toLowerCase() || ''

  if (errorMsg.includes('missing email') || errorMsg.includes('email is required')) {
    return t('login.errors.missingEmail')
  }
  if (errorMsg.includes('missing password') || errorMsg.includes('password is required')) {
    return t('login.errors.missingPassword')
  }
  if (errorMsg.includes('invalid email')) {
    return t('login.errors.invalidEmail')
  }
  if (errorMsg.includes('user not found') || errorMsg.includes('email not found')) {
    return t('login.errors.userNotFound')
  }
  if (errorMsg.includes('invalid password') || errorMsg.includes('wrong password')) {
    return t('login.errors.invalidPassword')
  }
  if (errorMsg.includes('invalid code') || errorMsg.includes('wrong code')) {
    return t('login.errors.invalidCode')
  }
  if (errorMsg.includes('account not verified') || errorMsg.includes('not verified')) {
    return t('login.errors.accountNotVerified')
  }
  if (errorMsg.includes('code expired') || errorMsg.includes('expired')) {
    return t('login.errors.codeExpired')
  }
  if (errorMsg.includes('unauthorized')) {
    return t('login.errors.unauthorized')
  }
  if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
    return t('login.errors.network')
  }

  return error?.message || (fallbackKey ? t(fallbackKey) : t('errors.generic'))
}

const handleLogin = async (formData) => {
  if (loading.value) return
  clearLoginFeedback()

  loading.value = true
  try {
    await userStore.login(formData.email, formData.password)
    const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : '/listas'
    router.push(redirectPath)
  } catch (error) {
    const message = getErrorMessage(error, 'login.errors.loginFailed')
    const needsVerification = /not verified/i.test(error?.message || '')
    setLoginFeedback(
      'error',
      needsVerification ? t('login.errors.accountNotVerifiedAction') : message,
      { canResend: needsVerification, canVerify: needsVerification }
    )
  } finally {
    loading.value = false
  }
}

// Nota: getErrorMessage está definido más arriba y centraliza los mensajes vía i18n

const sendRecoveryEmail = async () => {
  if (loading.value) return
  clearRecoveryFeedback()

  if (!recoveryForm.value.email || recoveryForm.value.email.trim() === '') {
    setRecoveryFeedback('error', t('login.errors.missingEmail'))
    return
  }

  loading.value = true
  try {
    await usersApi.forgotPassword({ email: recoveryForm.value.email.trim() })
    setRecoveryFeedback('success', t('login.forgotPasswordModal.recoverySent'))
    recoveryStep.value = 2
  } catch (error) {
    const message = getErrorMessage(error, 'login.errors.recoverySendFailed')
    setRecoveryFeedback('error', message)
  } finally {
    loading.value = false
  }
}

// Maneja el mensaje de validación nativo del input de recuperación
const onRecoveryEmailInvalid = (event) => {
  const input = event.target
  // Evitar el tooltip nativo en inglés
  event.preventDefault()
  if (!input.value || input.value.trim() === '') {
    setRecoveryFeedback('error', t('login.errors.missingEmail'))
  } else {
    setRecoveryFeedback('error', t('login.errors.invalidEmail'))
  }
}

// Limpiar cualquier mensaje de validación personalizado cuando el usuario escribe
const onRecoveryEmailInput = (event) => {
  const input = event.target
  input.setCustomValidity('')
  clearRecoveryFeedback()
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
    setRecoveryFeedback('success', t('login.forgotPasswordModal.passwordChanged'))
    setTimeout(() => {
      closeForgotPasswordModal()
    }, 1500)
  } catch (error) {
    const message = getErrorMessage(error, 'login.errors.passwordChangeFailed')
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
    setVerificationFeedback('error', t('login.errors.verifyCodeMissing'))
    return
  }

  verificationLoading.value = true
  try {
    await usersApi.verifyAccount({ code })
    setVerificationFeedback('success', t('login.verifyModal.successMessage'))
    setLoginFeedback('success', t('login.verifyModal.successLogin'), {
      canVerify: false,
      canResend: false
    })
    setTimeout(() => {
      closeVerificationModal()
    }, 1600)
  } catch (error) {
    const message = getErrorMessage(error, 'login.verifyModal.error')
    setVerificationFeedback('error', message)
  } finally {
    verificationLoading.value = false
  }
}

const sendVerificationEmail = async () => {
  if (sendingVerification.value) return

  const email = loginCardRef.value?.form?.email?.trim()
  if (!email) {
    setLoginFeedback('error', t('login.errors.enterEmailToResend'))
    return
  }

  sendingVerification.value = true
  try {
    await usersApi.sendVerification({ email })
    setLoginFeedback('success', t('login.verifyModal.resendSuccess'), {
      canResend: false,
      canVerify: true
    })
  } catch (error) {
    const message = getErrorMessage(error, 'login.errors.resendFailed')
    const needsVerification = /not verified/i.test(error?.message || '')
    setLoginFeedback('error', message, { canResend: needsVerification, canVerify: true })
  } finally {
    sendingVerification.value = false
  }
}

onMounted(() => {
  if (route.query.registered === '1') {
    setLoginFeedback('success', t('login.registeredFeedback'), {
      canResend: true,
      canVerify: true
    })
    openVerificationModal()

    const { registered, ...rest } = { ...route.query }
    router.replace({ query: rest }).catch(() => {})
  }
})
</script>

<style>
/* Estilos globales para el fondo verde */
html, body {
  margin: 0;
  padding: 0;
  background-color: #4CAF50;
  min-height: 100vh;
}

#app {
  background-color: #4CAF50;
  min-height: 100vh;
}
</style>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
  background-color: #4CAF50;
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
  width: 100%;
  height: 100%;
  min-height: 500px;
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
  bottom: 15%;
  right: 15%;
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

.form-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  color:black;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
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

.feedback-message {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.4;
  text-align: center;
  font-weight: 500;
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

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
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


/* Responsive */

/* Pantallas grandes */
@media (max-width: 1400px) {
  .grocery-bag-image {
    max-width: 350px;
    max-height: 400px;
  }
  
  .colored-bags-image {
    max-width: 300px;
    max-height: 400px;
    bottom: 12%;
    right: 12%;
  }
}

/* Tablets y pantallas medianas */
@media (max-width: 1200px) {
  .login-left {
    flex: 1.5;
    padding: 30px;
  }
  
  .illustrations {
    margin-top: 40px;
  }
  
  .grocery-bag-image {
    max-width: 320px;
    max-height: 380px;
  }
  
  .colored-bags-image {
    max-width: 280px;
    max-height: 350px;
    bottom: 10%;
    right: 10%;
  }
  
  .login-right {
    flex: 1;
    padding: 20px;
  }
}

/* Pantallas pequeñas - ocultar imágenes si no hay espacio */
@media (max-width: 1100px) {
  .illustrations {
    display: none;
  }
  
  .login-left {
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }
  
  .logo h1 {
    font-size: 2rem;
  }
}

/* Tablets pequeñas */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    min-height: 100vh;
  }
  
  .login-left {
    flex: 0.6;
    padding: 20px;
    min-height: 200px;
  }
  
  .logo h1 {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }
  
  .login-right {
    flex: 1;
    padding: 15px;
    align-items: stretch;
  }
  
  .illustrations {
    min-height: 300px;
  }
}

/* Móviles */
@media (max-width: 480px) {
  .login-container {
    min-height: 100vh;
  }
  
  .login-left {
    flex: 0.5;
    padding: 15px;
    min-height: 150px;
  }
  
  .logo h1 {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }
  
  .login-right {
    padding: 10px;
  }
  
  .illustrations {
    min-height: 200px;
  }
  
  
  .modal {
    min-width: 320px;
    padding: 24px 20px;
  }
  
  .modal h2 {
    font-size: 1.3rem;
  }
}

/* Pantallas muy pequeñas */
@media (max-width: 360px) {
  
  .modal {
    min-width: 280px;
    padding: 20px 15px;
  }
}
</style>
