/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Styles
import 'unfonts.css'

import { createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)

registerPlugins(app)

const userStore = useUserStore(pinia)
userStore.load()

if (userStore.token) {
  userStore.fetchProfile().catch((err) => {
    console.error('Failed to refresh user profile', err)
  })
}

app.mount('#app')
