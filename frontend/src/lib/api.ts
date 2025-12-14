import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://urbanbeauty.onrender.com';

// Créer une instance axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        
        // Ne pas rediriger automatiquement sur les pages publiques (checkout, produits, etc.)
        const publicPaths = ['/checkout', '/cart', '/products', '/services', '/'];
        const currentPath = window.location.pathname;
        const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
        
        // Ne rediriger que si on n'est pas sur une page publique
        if (!isPublicPath) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
