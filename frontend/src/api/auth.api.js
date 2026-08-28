import api from './axios';

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  google: (credential) => api.post('/api/auth/google', { credential }),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),

  // ✅ 2FA — setupToken et pendingToken sont des tokens temporaires distincts
  // du token de session normal, donc on les passe explicitement en header ici
  // plutôt que de compter sur l'intercepteur axios habituel.
  setupTwoFactor: (setupToken) =>
    api.post('/api/auth/2fa/setup', {}, {
      headers: { Authorization: `Bearer ${setupToken}` },
    }),

  enableTwoFactor: (setupToken, code) =>
    api.post('/api/auth/2fa/enable', { code }, {
      headers: { Authorization: `Bearer ${setupToken}` },
    }),

  // Accepte soit un code TOTP à 6 chiffres, soit un code de secours —
  // { code } ou { backupCode }, jamais les deux à la fois.
  verifyTwoFactor: (pendingToken, { code, backupCode } = {}) =>
    api.post('/api/auth/2fa/verify', { code, backupCode }, {
      headers: { Authorization: `Bearer ${pendingToken}` },
    }),
};