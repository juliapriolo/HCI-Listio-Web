import api from './index'


export default {
  
  getAllPantries(params = {}) {
    if (params && Object.keys(params).length > 0) {
      const qs = new URLSearchParams()
      Object.keys(params).forEach((k) => {
        const v = params[k]
        if (v === undefined || v === null) return
        qs.append(k, String(v))
      })
      const path = `/api/pantries?${qs.toString()}`
      return api.get(path)
    }

    return api.get('/api/pantries')
  },

  
  createPantry(payload) {
    return api.post('/api/pantries', payload)
  },

  
  getPantryItems(pantryId, params = {}) {
    if (params && Object.keys(params).length > 0) {
      const qs = new URLSearchParams()
      Object.keys(params).forEach((k) => {
        const v = params[k]
        if (v === undefined || v === null) return
        qs.append(k, String(v))
      })
      const path = `/api/pantries/${pantryId}?${qs.toString()}`
      return api.get(path)
    }

    return api.get(`/api/pantries/${pantryId}`)
  },

  
  updatePantry(pantryId, payload) {
    return api.put(`/api/pantries/${pantryId}`, payload)
  },

  
  deletePantry(pantryId) {
    return api.delete(`/api/pantries/${pantryId}`)
  },

  
  sharePantry(pantryId, payload) {
    return api.post(`/api/pantries/${pantryId}/share`, payload)
  },

  
  getPantryShares(pantryId) {
    return api.get(`/api/pantries/${pantryId}/share`)
  },

  
  revokePantryShare(pantryId, userId) {
    return api.delete(`/api/pantries/${pantryId}/share/${userId}`)
  },

  
  addPantryItem(pantryId, payload) {
    console.log('API: addPantryItem called with:')
    console.log('  pantryId:', pantryId)
    console.log('  payload:', JSON.stringify(payload, null, 2))
    console.log('  payload type:', typeof payload)
    console.log('  payload keys:', Object.keys(payload))
    
    return api.post(`/api/pantries/${pantryId}/items`, payload)
  },

  
  getPantryItemsPaginated(pantryId, params = {}) {
    if (params && Object.keys(params).length > 0) {
      const qs = new URLSearchParams()
      Object.keys(params).forEach((k) => {
        const v = params[k]
        if (v === undefined || v === null) return
        qs.append(k, String(v))
      })
      const path = `/api/pantries/${pantryId}/items?${qs.toString()}`
      return api.get(path)
    }

    return api.get(`/api/pantries/${pantryId}/items`)
  },

  
  updatePantryItem(pantryId, itemId, payload) {
    return api.put(`/api/pantries/${pantryId}/items/${itemId}`, payload)
  },

  
  deletePantryItem(pantryId, itemId) {
    return api.delete(`/api/pantries/${pantryId}/items/${itemId}`)
  }
}
