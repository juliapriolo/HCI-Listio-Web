// src/api/listItems.js
import api from './index'

export default {
  // GET /api/shopping-lists/:listId/items
  getAll(listId, params) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return api.get(`/api/shopping-lists/${listId}/items${qs}`)
  },

  // POST /api/shopping-lists/:listId/items
  create(listId, payload) {
    return api.post(`/api/shopping-lists/${listId}/items`, payload)
  },

  // PUT /api/shopping-lists/:listId/items/:itemId - Para editar producto (quantity, unit, metadata)
  update(listId, itemId, payload) {
    return api.put(`/api/shopping-lists/${listId}/items/${itemId}`, payload)
  },

  // PATCH /api/shopping-lists/:listId/items/:itemId - Para marcar como comprado (purchased)
  markAsPurchased(listId, itemId, payload) {
    return api.patch(`/api/shopping-lists/${listId}/items/${itemId}`, payload)
  },

  // DELETE /api/shopping-lists/:listId/items/:itemId
  delete(listId, itemId) {
    return api.delete(`/api/shopping-lists/${listId}/items/${itemId}`)
  }
}
