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
import bootstrapStores from '@/stores/bootstrap'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)

registerPlugins(app)

// Bootstrap stores (load persisted state, refresh profile if needed)
// IMPORTANT: Wait for bootstrap to complete before mounting the app
// This ensures categories and other stores are initialized before routes load
bootstrapStores(pinia)
  .then(() => {
    console.log('✅ Stores bootstrapped successfully')
    app.mount('#app')
  })
  .catch((err) => {
    console.error('❌ Failed to bootstrap stores', err)
    // Mount anyway to show error page
    app.mount('#app')
  })
