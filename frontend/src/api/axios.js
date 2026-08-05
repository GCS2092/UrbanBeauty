import axios from 'axios';
import { AUTH_TOKEN_KEY } from '../utils/constants';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  // ⚠️ Augmenté de 10s à 30s : le backend (Render, plan Free) peut avoir des
  // connexions froides après une période d'inactivité, rendant certaines
  // requêtes (notamment la création de commande) plus lentes que 10s.
  timeout: 30000,
});

// Injecte le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    // Un timeout ou une erreur réseau n'a pas de error.response (pas de
    // réponse HTTP reçue du tout) — on distingue ce cas pour donner un
    // message honnête plutôt que le fallback générique trompeur.
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

    if (status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.location.href = '/login';
    }

    return Promise.reject({ status, message, isTimeout, isNetworkError, raw: error });
  }
);

export default api;