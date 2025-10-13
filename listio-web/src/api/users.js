import api from './index'

const USERS_BASE = '/api/users'

export const usersApi = {
  register(data) {
    return api.post(`${USERS_BASE}/register`, data)
  },
  login(data) {
    return api.post(`${USERS_BASE}/login`, data)
  },
  getProfile() {
    return api.get(`${USERS_BASE}/profile`)
  },
  updateProfile(data) {
    return api.put(`${USERS_BASE}/profile`, data)
  },
  verifyAccount(data) {
    return api.post(`${USERS_BASE}/verify-account`, data)
  },
  sendVerification(data) {
    const email = typeof data === 'string' ? data : data?.email
    if (!email || !`${email}`.trim()) {
      return Promise.reject(new Error('Email is required'))
    }
    const search = new URLSearchParams({ email: `${email}`.trim() })
    return api.post(`${USERS_BASE}/send-verification?${search.toString()}`)
  },
  
  
  forgotPassword(data) {
    const email = typeof data === 'string' ? data : data?.email
    if (!email || !`${email}`.trim()) {
      return Promise.reject(new Error('Email is required'))
    }
    const search = new URLSearchParams({ email: `${email}`.trim() })
    return api.post(`${USERS_BASE}/forgot-password?${search.toString()}`)
  },

  
  resetPassword(data) {
    return api.post(`${USERS_BASE}/reset-password`, data)
  },

  changePassword(data) {
    return api.post(`${USERS_BASE}/change-password`, data)
  },
  
  logout() {
    return api.post(`${USERS_BASE}/logout`)
  },
}
