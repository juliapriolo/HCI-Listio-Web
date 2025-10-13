


import vuetify from './vuetify'
import router from '@/router'
import { createPinia } from 'pinia'
import i18n from './i18n'

// Register core plugins. Accept an optional Pinia instance to avoid creating two.
export function registerPlugins (app, piniaInstance) {
  const pinia = piniaInstance || createPinia()

  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(i18n)
}
