// src/api/listItems.js
import api from './index'

export default {
  // GET /lists/:listId/items
  getAll(listId, params) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return api.get(`/lists/${listId}/items${qs}`)
  },

  // POST /lists/:listId/items
  create(listId, payload) {
    return api.post(`/lists/${listId}/items`, payload)
  },

  // PATCH /lists/:listId/items/:itemId
  update(listId, itemId, payload) {
    return api.patch(`/lists/${listId}/items/${itemId}`, payload)
  },

  // DELETE /lists/:listId/items/:itemId
  delete(listId, itemId) {
    return api.delete(`/lists/${listId}/items/${itemId}`)
  }
}
