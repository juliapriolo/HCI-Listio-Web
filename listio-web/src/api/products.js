import api from './index'

const PRODUCTS_BASE = '/api/products'

export const productsApi = {
  
  add(data) {
    if (!data.category?.id) {
      throw new Error('El producto debe tener una categoría con id definido.')
    }
    const payload = {
      name: data.name,
      metadata: data.metadata || {},
      category: { id: data.category?.id },
    }
    return api.post(PRODUCTS_BASE, data).then(res => res.data)
  },

  
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

  
  getById(id) {
    return api.get(`${PRODUCTS_BASE}/${id}`)
  },

  
  update(id, data) {
    if (!data.category?.id) {
      throw new Error('El producto debe tener una categoría con id definido.')
    }
    const payload = {
      name: data.name,
      metadata: data.metadata || {},
      category: { id: data.category?.id },
    }
    return api.put(`${PRODUCTS_BASE}/${id}`, data).then(res => res.data)
  },

  
  remove(id) {
    return api.delete(`${PRODUCTS_BASE}/${id}`)
  },

  
  search(query, params = {}) {
    const searchParams = {
      ...params,
      search: query
    }
    return this.getAll(searchParams)
  },
}