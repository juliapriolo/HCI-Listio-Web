import { defineStore } from 'pinia'
import { usersApi } from '@/api/users'
import { setAuthToken } from '@/api'

const STORAGE_KEY = 'listio:user'

function normalizeProfile(payload) {
  if (!payload) {
    return null
  }

  const metadata = typeof payload.metadata === 'object' && payload.metadata !== null ? payload.metadata : {}

  return {
    id: payload.id ?? null,
    name: payload.name ?? '',
    surname: payload.surname ?? '',
    email: payload.email ?? '',
    avatar: metadata.avatar ?? null,
    metadata,
    createdAt: payload.createdAt ?? null,
    updatedAt: payload.updatedAt ?? null,
  }
}

function buildProfilePayload(source, currentSettings) {
  const metadata = {
    ...(currentSettings || {}),
    ...(source.metadata || {}),
  }

  if (Object.prototype.hasOwnProperty.call(source, 'avatar')) {
    if (source.avatar === null) {
      delete metadata.avatar
    } else {
      metadata.avatar = source.avatar
    }
  }

  const payload = {}

  if (Object.prototype.hasOwnProperty.call(source, 'name')) {
    payload.name = source.name
  }

  if (Object.prototype.hasOwnProperty.call(source, 'surname')) {
    payload.surname = source.surname
  }

  if (Object.prototype.hasOwnProperty.call(source, 'email')) {
    payload.email = source.email
  }

  if (Object.keys(metadata).length > 0) {
    payload.metadata = metadata
  }

  return payload
}

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    settings: {},
    token: null,
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    fullName: (state) => {
      if (!state.profile) {
        return ''
      }

      const parts = [state.profile.name, state.profile.surname].filter(Boolean)
      return parts.join(' ').trim()
    },
  },

  actions: {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const data = JSON.parse(raw)
          this.profile = normalizeProfile(data.profile)
          this.settings = data.settings || {}
          this.token = data.token || null
          setAuthToken(this.token)
        }
      } catch (e) {
        console.error('Failed to load user data', e)
        this.clearProfile()
      }
    },

    save() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            profile: this.profile,
            settings: this.settings,
            token: this.token,
          })
        )
      } catch (e) {
        console.error('Failed to save user data', e)
      }
    },

    clearProfile() {
      this.profile = null
      this.settings = {}
      this.token = null
      this.error = null
      setAuthToken(null)
      localStorage.removeItem(STORAGE_KEY)
    },

    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const data = await usersApi.login({ email, password })
        if (!data?.token) {
          throw new Error('Missing token in login response')
        }

        this.token = data.token
        setAuthToken(this.token)

        await this.fetchProfile(true)
        this.save()
        
        // Reload lists for the new user
        try {
          const { useListsStore } = await import('./lists')
          const listsStore = useListsStore()
          listsStore.reload()
        } catch (e) {
          console.warn('Failed to reload lists after login:', e)
        }
      } catch (e) {
        this.error = e?.message || 'Unable to login'
        this.clearProfile()
        throw e
      } finally {
        this.loading = false
      }
    },

    async register(payload) {
      this.loading = true
      this.error = null
      try {
        const response = await usersApi.register(payload)
        return response
      } catch (e) {
        this.error = e?.message || 'Unable to register'
        throw e
      } finally {
        this.loading = false
      }
    },

    async fetchProfile(force = false) {
      if (!this.token) {
        return
      }

      if (!force && this.profile) {
        return
      }

      try {
        const profile = await usersApi.getProfile()
        const normalized = normalizeProfile(profile)
        this.profile = normalized
        this.settings = normalized?.metadata || {}
        this.save()
        return normalized
      } catch (e) {
        console.error('Error fetching profile', e)
        if (e?.status === 401) {
          this.clearProfile()
        }
        throw e
      }
    },

    async updateProfile(data) {
      if (!this.token) {
        throw new Error('Not authenticated')
      }

      try {
        const payload = buildProfilePayload(data, this.settings)
        const updated = await usersApi.updateProfile(payload)
        const normalized = normalizeProfile(updated)
        this.profile = normalized
        this.settings = normalized?.metadata || {}
        this.save()
        return normalized
      } catch (e) {
        console.error('Error updating profile', e)
        throw e
      }
    },

    async changePassword(payload) {
      if (!this.token) {
        throw new Error('Not authenticated')
      }

      try {
        await usersApi.changePassword(payload)
      } catch (e) {
        console.error('Error changing password', e)
        throw e
      }
    },

    async logout() {
      try {
        if (this.token) {
          await usersApi.logout()
        }
      } catch (e) {
        console.warn('Logout failed (continuing):', e)
      } finally {
        this.clearProfile()
        
        // Clear category defaults flag so they get recreated on next login
        try {
          localStorage.removeItem('listio:defaults-created:v1')
        } catch (e) {
          console.warn('Failed to clear defaults flag:', e)
        }
        
        // Clear lists when logging out
        try {
          const { useListsStore } = await import('./lists')
          const listsStore = useListsStore()
          listsStore.clear()
        } catch (e) {
          console.warn('Failed to clear lists after logout:', e)
        }
      }
    },
  },
})

