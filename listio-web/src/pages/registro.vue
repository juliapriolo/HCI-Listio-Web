<template>
  <div class="register-container">
    <div class="register-left">
      <div class="logo">
        <h1>LISTIO</h1>
      </div>
      <div class="illustrations">
        <img src="@/assets/login_1.png" :alt="t('register.groceryBagAlt')" class="grocery-bag-image" />
        <img src="@/assets/login_2.png" :alt="t('register.coloredBagsAlt')" class="colored-bags-image" />
      </div>
    </div>

    <div class="register-right">
      <div class="register-card">
        <h2 class="register-title">{{ t('register.title') }}</h2>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-row two-col">
            <div class="form-group">
              <label for="name" class="form-label">{{ t('register.name') }}</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="form-input"
                :placeholder="t('register.namePlaceholder')"
                required
                @invalid="onRegisterInvalid"
                @input="onRegisterInput"
              />
            </div>
            <div class="form-group">
              <label for="surname" class="form-label">{{ t('register.surname') }}</label>
              <input
                id="surname"
                v-model="form.surname"
                type="text"
                class="form-input"
                :placeholder="t('register.surnamePlaceholder')"
                required
                @invalid="onRegisterInvalid"
                @input="onRegisterInput"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">{{ t('register.email') }}</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              :class="['form-input', errors.email ? 'form-input--error' : '']"
              :placeholder="t('register.emailPlaceholder')"
              required
              @invalid="onRegisterInvalid"
              @input="onRegisterInput"
              :aria-invalid="errors.email ? 'true' : 'false'"
            />
            <div class="error-slot">
              <p v-if="errors.email" class="input-error-text">{{ errors.email }}</p>
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">{{ t('register.password') }}</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              :class="['form-input', errors.password ? 'form-input--error' : '']"
              :placeholder="t('register.passwordPlaceholder')"
              minlength="6"
              required
              @invalid="onRegisterInvalid"
              @input="onRegisterInput"
              :aria-invalid="errors.password ? 'true' : 'false'"
            />
            <div class="error-slot">
              <p v-if="errors.password" class="input-error-text">{{ errors.password }}</p>
            </div>
          </div>

          <button
            type="submit"
            class="register-button"
            :disabled="registerLoading"
            :aria-busy="registerLoading ? 'true' : 'false'"
          >
            <span v-if="registerLoading">{{ t('register.registerButtonLoading') }}</span>
            <span v-else>{{ t('register.registerButton') }}</span>
          </button>

          <div
            v-if="registerFeedback.text"
            :class="['feedback-message', registerFeedback.type ? `feedback-message--${registerFeedback.type}` : '']"
            role="alert"
            aria-live="polite"
          >
            {{ registerFeedback.text }}
          </div>

          
        </form>

        <p class="redirect-text">
          {{ t('register.alreadyHaveAccount') }}
          <RouterLink to="/login" class="redirect-link">{{ t('register.loginLink') }}</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLanguage } from '@/composables/useLanguage'

const router = useRouter()
const userStore = useUserStore()
const { t } = useLanguage()

const form = ref({
  name: '',
  surname: '',
  email: '',
  password: '',
})

const errors = ref({
  email: '',
  password: ''
})

const registerFeedback = ref({ type: '', text: '' })

const registerLoading = ref(false)


const setRegisterFeedback = (type, text) => {
  registerFeedback.value = { type, text }
}

const clearRegisterFeedback = () => {
  registerFeedback.value = { type: '', text: '' }
}

const onRegisterInvalid = (event) => {
  // Prevent native browser tooltip and show our feedback message in Spanish
  event.preventDefault()
  const input = event.target
  const id = input?.id
  if (id === 'email') {
    if (!input.value || input.value.trim() === '') {
      errors.value.email = t('register.missingEmail')
    } else {
      errors.value.email = t('register.invalidEmail')
    }
  } else if (id === 'password') {
    if (!input.value) {
      errors.value.password = t('register.passwordTooShort')
    } else if (String(input.value).length < 6) {
      errors.value.password = t('register.passwordTooShort')
    }
  }
}

const onRegisterInput = (event) => {
  event.target.setCustomValidity('')
  clearRegisterFeedback()
  const id = event.target?.id
  if (id === 'email') errors.value.email = ''
  if (id === 'password') errors.value.password = ''
}

const handleRegister = async () => {
  errors.value.email = ''
  errors.value.password = ''

  const payload = {
    name: form.value.name.trim(),
    surname: form.value.surname.trim(),
    email: form.value.email.trim(),
    password: form.value.password,
  }

  // Email validation
  const emailRegex = /^(?:[a-zA-Z0-9_'^&\-\+])+(?:\.(?:[a-zA-Z0-9_'^&\-\+])+)*@(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/
  if (!payload.email || !emailRegex.test(payload.email)) {
    errors.value.email = t('register.invalidEmail')
    try { document.getElementById('email')?.focus() } catch (e) {}
    return
  }

  
  if (!payload.password || payload.password.length < 6) {
    errors.value.password = t('register.passwordTooShort')
    
    try { document.getElementById('password')?.focus() } catch (e) {}
    return
  }

  try {
    registerLoading.value = true
    let success = false
    await userStore.register(payload)
    success = true
    router.push({ path: '/login', query: { registered: '1' } })
    return
  } catch (error) {
    const message = error?.message || ''
    if (/email.*(exists|registered)/i.test(message)) {
      errors.value.email = t('register.emailExists')
      return
    }
    setRegisterFeedback('error', t('register.genericError'))
  } finally {
    
    if (router.currentRoute.value.path !== '/login') {
      registerLoading.value = false
    }
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
  max-width: 560px;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.register-card {
  position: relative;
}
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.85);
  border-radius: 20px;
  z-index: 20;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid rgba(0,0,0,0.08);
  border-top-color: #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}
.loading-text {
  color: #333;
  font-weight: 600;
}
@keyframes spin {
  to { transform: rotate(360deg); }
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
  gap: 16px;
  padding-top: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  color: #333;
  font-size: 1rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  color:black;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  min-height: 44px;
}

.form-input--error {
  border-color: #e53935;
  background-color: #fdeaea;
}

.input-error-text {
  color: #b71c1c;
  font-size: 0.85rem;
  margin: 0;
}

.error-slot {
  min-height: 18px; 
}

.form-input:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
  outline: none;
}

.register-button {
  margin-top: 8px;
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
  margin-top: 16px;
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

::placeholder {
  color: #9aa0a6;
}


.two-col .form-group {
  margin-bottom: 0;
}

  .register-right {
    background-color: #ffffff;
  }
}


.form-row {
  display: flex;
  gap: 12px;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 640px) {
  .two-col {
    grid-template-columns: 1fr;
  }
}
</style>
