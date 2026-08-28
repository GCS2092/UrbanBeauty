import api from './axios';

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  google: (credential) => api.post('/api/auth/google', { credential }),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),

  setupTwoFactor: (setupToken) =>
    api.post('/api/auth/2fa/setup', {}, {
      headers: { Authorization: `Bearer ${setupToken}` },
    }),

  enableTwoFactor: (setupToken, code) =>
    api.post('/api/auth/2fa/enable', { code }, {
      headers: { Authorization: `Bearer ${setupToken}` },
    }),

  verifyTwoFactor: (pendingToken, { code, backupCode } = {}) =>
    api.post('/api/auth/2fa/verify', { code, backupCode }, {
      headers: { Authorization: `Bearer ${pendingToken}` },
    }),

  // ✅ Changement d'appareil — utilise la session normale déjà active
  // (le token est ajouté automatiquement par l'intercepteur axios).
  reconfigureStart: ({ password, code, backupCode }) =>
    api.post('/api/auth/2fa/reconfigure/start', { password, code, backupCode }),

  reconfigureConfirm: (code) =>
    api.post('/api/auth/2fa/reconfigure/confirm', { code }),
};