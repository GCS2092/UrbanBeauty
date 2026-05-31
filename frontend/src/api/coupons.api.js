import api from './axios';

export const couponsApi = {
  validate: (code) => api.post('/api/coupons/validate', { code }),
  getAll: () => api.get('/api/coupons'),
  create: (data) => api.post('/api/coupons', data),
  update: (id, data) => api.put(`/api/coupons/${id}`, data),
  delete: (id) => api.delete(`/api/coupons/${id}`),
};
