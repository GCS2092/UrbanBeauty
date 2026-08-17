import api from './axios';

export const cartApi = {
  getCart: (params) => api.get('/api/cart', { params }),
  addItem: (data) => api.post('/api/cart/items', data),
  updateItem: (itemId, data, params) => api.put(`/api/cart/items/${itemId}`, data, { params }),
  removeItem: (itemId, params) => api.delete(`/api/cart/items/${itemId}`, { params }),
  clearCart: (params) => api.delete('/api/cart', { params }),
};