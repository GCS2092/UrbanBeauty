import api from './axios';

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  google: (credential) => api.post('/api/auth/google', { credential }),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
};