import api from './index'


export default {
  
  
  
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

  
  create(payload) {
    console.log('API call: POST /api/shopping-lists with payload:', payload)
    return api.post('/api/shopping-lists', payload)
  },

  
  getById(id) {
    return api.get(`/api/shopping-lists/${id}`)
  },

  
  update(id, payload) {
    return api.put(`/api/shopping-lists/${id}`, payload)
  },

  
  delete(id) {
    return api.delete(`/api/shopping-lists/${id}`)

  },

  
  share(id, payload) {
    
    return api.post(`/api/shopping-lists/${id}/share`, payload)
  },

  
  getSharedUsers(id) {
    return api.get(`/api/shopping-lists/${id}/shared-users`)
  },

  
  revokeShare(id, userId) {
    return api.delete(`/api/shopping-lists/${id}/share/${userId}`)
  }
}
