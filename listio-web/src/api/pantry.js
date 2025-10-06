import api from './index'

// Wrapper for pantry endpoints (multiple pantries per user)
export default {
  // GET /api/pantries - Get all pantries for the user
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

  // POST /api/pantries - Create a new pantry
  createPantry(payload) {
    return api.post('/api/pantries', payload)
  },

  // GET /api/pantries/{id} - Get all product/items in a pantry
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

  // PUT /api/pantries/{id} - Edit a pantry
  updatePantry(pantryId, payload) {
    return api.put(`/api/pantries/${pantryId}`, payload)
  },

  // DELETE /api/pantries/{id} - Delete a pantry
  deletePantry(pantryId) {
    return api.delete(`/api/pantries/${pantryId}`)
  },

  // POST /api/pantries/{id}/share - Share a pantry with another user by mail
  sharePantry(pantryId, payload) {
    return api.post(`/api/pantries/${pantryId}/share`, payload)
  },

  // GET /api/pantries/{id}/share - Get users with whom the pantry is shared
  getPantryShares(pantryId) {
    return api.get(`/api/pantries/${pantryId}/share`)
  },

  // DELETE /api/pantries/{id}/share/{user_id} - Revoke a user's access to a shared pantry
  revokePantryShare(pantryId, userId) {
    return api.delete(`/api/pantries/${pantryId}/share/${userId}`)
  },

  // POST /api/pantries/{id}/items - Add an item to the pantry
  addPantryItem(pantryId, payload) {
    return api.post(`/api/pantries/${pantryId}/items`, payload)
  },

  // GET /api/pantries/{id}/items - Get all items in a pantry (paginated)
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

  // PUT /api/pantries/{id}/items/{item_id} - Update a specific item in the pantry
  updatePantryItem(pantryId, itemId, payload) {
    return api.put(`/api/pantries/${pantryId}/items/${itemId}`, payload)
  },

  // DELETE /api/pantries/{id}/items/{item_id} - Delete a specific item in the pantry
  deletePantryItem(pantryId, itemId) {
    return api.delete(`/api/pantries/${pantryId}/items/${itemId}`)
  }
}
