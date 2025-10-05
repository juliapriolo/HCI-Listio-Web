import { defineStore } from 'pinia'

const STORAGE_KEY = 'listio:user'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    settings: {}
  }),
  getters: {
    isLoggedIn: (state) => !!state.profile
  },
  actions: {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const data = raw ? JSON.parse(raw) : null
        if (data) {
          this.profile = data.profile || null
          this.settings = data.settings || {}
        }
      } catch (e) {
        console.error('Failed to load user data', e)
        this.profile = null
        this.settings = {}
      }
    },
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile: this.profile, settings: this.settings }))
      } catch (e) {
        console.error('Failed to save user data', e)
      }
    },
    setProfile(profile) {
      this.profile = profile
      this.save()
    },
    clearProfile() {
      this.profile = null
      this.save()
    }
  }
})
