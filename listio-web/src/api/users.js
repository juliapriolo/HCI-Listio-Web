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
    return api.post(`${USERS_BASE}/send-verification`, data)
  },
  forgotPassword(data) {
    return api.post(`${USERS_BASE}/forgot-password`, data)
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