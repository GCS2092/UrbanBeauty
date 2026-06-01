import api from './axios';

export const adminApi = {
  getOrders: (params) => api.get('/api/admin/orders', { params }),
  updatePayment: (id, data) => api.patch(`/api/admin/orders/${id}/payment`, data),
  getSettings: () => api.get('/api/settings'),
  updateSettings: (data) => api.put('/api/settings', data),
};