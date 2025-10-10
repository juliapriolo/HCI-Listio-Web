import api from './index'

const PRODUCTS_BASE = '/api/products'

export const productsApi = {
  // Crear producto
  add(data) {
    const payload = {
      name: data.name,
      metadata: data.metadata || {},
    }
    return api.post(PRODUCTS_BASE, payload)
  },

  // Obtener todos los productos
  getAll(params = {}) {
    if (params && Object.keys(params).length > 0) {
      const qs = new URLSearchParams()
      Object.keys(params).forEach((k) => {
        const v = params[k]
        if (v === undefined || v === null) return
        qs.append(k, String(v))
      })
      const path = `${PRODUCTS_BASE}?${qs.toString()}`
      return api.get(path)
    }
    return api.get(PRODUCTS_BASE)
  },

  // Obtener por ID
  getById(id) {
    return api.get(`${PRODUCTS_BASE}/${id}`)
  },

  // Actualizar producto
  update(id, data) {
    const payload = {
      name: data.name,
      metadata: data.metadata || {},
    }
    return api.put(`${PRODUCTS_BASE}/${id}`, payload)
  },

  // Eliminar producto
  remove(id) {
    return api.delete(`${PRODUCTS_BASE}/${id}`)
  },

  // Buscar productos
  search(query, params = {}) {
    const searchParams = {
      ...params,
      search: query
    }
    return this.getAll(searchParams)
  },
}