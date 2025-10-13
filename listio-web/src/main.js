


import { registerPlugins } from '@/plugins'


import App from './App.vue'


import { createApp } from 'vue'


import 'unfonts.css'

import { createPinia } from 'pinia'
import bootstrapStores from '@/stores/bootstrap'

const app = createApp(App)

const pinia = createPinia()

// Install core plugins with a single Pinia instance
registerPlugins(app, pinia)




bootstrapStores(pinia)
  .then(() => {
    console.log('✅ Stores bootstrapped successfully')
    app.mount('#app')
  })
  .catch((err) => {
    console.error('❌ Failed to bootstrap stores', err)
    
    app.mount('#app')
  })
