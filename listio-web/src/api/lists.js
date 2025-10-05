import api from './index'

// Wrapper for shopping lists endpoints
export default {
  // GET /api/shopping-lists
  // params: { page, limit, name, owner, recurring, sort, order, ... }
  // returns: server response (array or envelope) — caller should handle envelope if present
  getAll(params) {
    if (params && Object.keys(params).length > 0) {
      const qs = new URLSearchParams()
      Object.keys(params).forEach((k) => {
        const v = params[k]
        if (v === undefined || v === null) return
        qs.append(k, String(v))
      })
      const path = `/api/shopping-lists?${qs.toString()}`
      return api.get(path)
    }

    return api.get('/api/shopping-lists')
  },

  // POST /api/shopping-lists
  create(payload) {
    return api.post('/api/shopping-lists', payload)
  },

  // GET /api/shopping-lists/{id}
  getById(id) {
    return api.get(`/api/shopping-lists/${id}`)
  },

  // PUT /api/shopping-lists/{id}
  update(id, payload) {
    return api.put(`/api/shopping-lists/${id}`, payload)
  },

  // DELETE /api/shopping-lists/{id}
  delete(id) {
    return api.delete(`/api/shopping-lists/${id}`)
  }
}
