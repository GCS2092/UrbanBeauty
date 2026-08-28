import axios from 'axios';
import { AUTH_TOKEN_KEY } from '../utils/constants';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Injecte le token JWT automatiquement, sauf si un header Authorization
// a déjà été fourni explicitement (cas des tokens temporaires 2FA :
// setupToken / pendingToken, différents du token de session normal).
api.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isTimeout = error.code === 'ECONNABORTED';
    const isNetworkError = !error.response && !isTimeout;

    let message;
    if (isTimeout) {
      message = 'Le serveur met du temps à répondre. Veuillez réessayer dans quelques instants.';
    } else if (isNetworkError) {
      message = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    } else {
      message = error.response?.data?.message || 'Une erreur est survenue';
    }

    // Ne pas forcer la redirection /login sur les routes 2FA : un 401 ici
    // veut dire "setupToken/pendingToken expiré", pas "session normale expirée" —
    // la page 2FA gère déjà ce cas elle-même.
    const isTwoFactorRoute = error.config?.url?.includes('/2fa/');
    if (status === 401 && !isTwoFactorRoute) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.location.href = '/login';
    }

    return Promise.reject({ status, message, isTimeout, isNetworkError, raw: error });
  }
);

export default api;