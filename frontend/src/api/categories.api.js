import api from './axios';

export const categoriesApi = {
  getAll: (params) => api.get('/api/categories', { params }),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};
