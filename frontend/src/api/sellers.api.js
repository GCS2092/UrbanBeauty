import api from './axios';

export const sellersApi = {
  getStats: () => api.get('/api/sellers/stats'),
  getProducts: (params) => api.get('/api/sellers/products', { params }),
  createProduct: (data) => api.post('/api/sellers/products', data),
  updateProduct: (id, data) => api.put(`/api/sellers/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/sellers/products/${id}`),
  getOrders: (params) => api.get('/api/sellers/orders', { params }),
  getStock: () => api.get('/api/sellers/stock'),
  getStoreSettings: () => api.get('/api/sellers/store-settings'),
  updateStoreSettings: (data) => api.put('/api/sellers/store-settings', data),
};
