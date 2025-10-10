import api from './index'

const CATEGORIES_BASE = '/api/categories'

export const categoriesApi = {
  add(data) {
    const payload = {
      name: data.name,
      metadata: data.metadata || {},
    }
    return api.post(CATEGORIES_BASE, payload)
  },

  getAll(params = {}) {
    const query = new URLSearchParams(params).toString()
    return api.get(query ? `${CATEGORIES_BASE}?${query}` : CATEGORIES_BASE)
  },

  getById(id) {
    return api.get(`${CATEGORIES_BASE}/${id}`)
  },

  update(id, data) {
    const payload = {
      name: data.name,
      metadata: data.metadata || {},
    }
    return api.put(`${CATEGORIES_BASE}/${id}`, payload)
  },

  remove(id) {
    return api.delete(`${CATEGORIES_BASE}/${id}`)
  },
}