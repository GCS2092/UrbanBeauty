import api from './axios';

export const stockAlertsApi = {
  create: (data) => api.post('/api/stock-alerts', data),
};