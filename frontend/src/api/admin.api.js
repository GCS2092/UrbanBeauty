import api from './axios';

export const adminApi = {
  getOrders: (params) => api.get('/admin/orders', { params }),
  updatePayment: (id, data) => api.patch(`/admin/orders/${id}/payment`, data),
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
};