import api from './axios';

export const couponsApi = {
  validate: (code, orderAmount, storeId) =>
    api.post('/api/coupons/validate', { code, orderAmount, storeId }),
  getAll: (params) => api.get('/api/coupons', { params }),
  create: (data) => api.post('/api/coupons', data),
  update: (id, data) => api.put(`/api/coupons/${id}`, data),
  delete: (id) => api.delete(`/api/coupons/${id}`),
  getPublic: (storeId) => api.get('/api/coupons/public/active', { params: storeId ? { storeId } : {} }),
};