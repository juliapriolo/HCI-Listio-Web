
import api from './index'

export default {
  
  getAll(listId, params) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return api.get(`/api/shopping-lists/${listId}/items${qs}`)
  },

  
  create(listId, payload) {
    return api.post(`/api/shopping-lists/${listId}/items`, payload)
  },

  
  update(listId, itemId, payload) {
    return api.put(`/api/shopping-lists/${listId}/items/${itemId}`, payload)
  },

  
  markAsPurchased(listId, itemId, payload) {
    return api.patch(`/api/shopping-lists/${listId}/items/${itemId}`, payload)
  },

  
  delete(listId, itemId) {
    return api.delete(`/api/shopping-lists/${listId}/items/${itemId}`)
  }
}
