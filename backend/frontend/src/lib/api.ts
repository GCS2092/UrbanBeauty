import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || undefined;

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

// Intercepteur pour gérer les erreurs et le mode hors ligne
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Gérer les erreurs 401 (non autorisé)
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
    
    // Gérer le mode hors ligne pour les requêtes POST/PUT/PATCH/DELETE
    if (!navigator.onLine && error.config) {
      const method = error.config.method?.toUpperCase();
      if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        // Ajouter à la queue hors ligne
        if (typeof window !== 'undefined') {
          const { offlineManager } = await import('./offline');
          await offlineManager.addToQueue({
            type: method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
            url: error.config.url || '',
            data: error.config.data ? JSON.parse(error.config.data) : {},
          });
          
          // Retourner une réponse spéciale pour indiquer que la requête est en queue
          return Promise.resolve({
            data: { 
              message: 'Requête mise en file d\'attente. Elle sera synchronisée automatiquement.',
              queued: true,
              offline: true 
            },
            status: 202,
            statusText: 'Accepted',
            headers: {},
            config: error.config,
          });
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
