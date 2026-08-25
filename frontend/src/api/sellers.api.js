import api from './axios';

export const sellersApi = {
  getStats: () => api.get('/api/sellers/stats'),
  getProducts: (params) => api.get('/api/sellers/products', { params }),
  getOrders: (params) => api.get('/api/sellers/orders', { params }),
  getStock: () => api.get('/api/sellers/stock'),
};
