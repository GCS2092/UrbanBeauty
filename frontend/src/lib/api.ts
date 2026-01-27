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
    
    // Gérer les erreurs 404 (Not Found) - Routes backend manquantes ou URL incorrecte
    if (error.response?.status === 404) {
      console.error('❌ Backend route not found (404). Possible causes:');
      console.error('  1. Backend is not deployed or URL is incorrect');
      console.error('  2. Backend routes are not configured correctly');
      console.error('  3. CORS is blocking the request');
      console.error(`  Requested URL: ${error.config?.url || 'unknown'}`);
      console.error(`  Base URL: ${API_URL || 'not configured'}`);
      
      // Pour les requêtes GET, retourner un tableau vide pour éviter de bloquer l'UI
      if (error.config?.method?.toLowerCase() === 'get') {
        const url = error.config.url || '';
        if (url.includes('/products') || url.includes('/services') || url.includes('/providers')) {
          return Promise.resolve({
            data: [],
            status: 200,
            statusText: 'OK (fallback)',
            headers: {},
            config: error.config,
          });
        }
      }
    }
    
    // Gérer les erreurs 503 (Service Unavailable) - Backend en veille ou indisponible
    if (error.response?.status === 503 || error.code === 'ECONNREFUSED' || error.message?.includes('503')) {
      console.warn('⚠️ Backend service unavailable (503). The backend may be sleeping or restarting.');
      console.warn('💡 Tip: On Render free tier, services sleep after 15 minutes of inactivity.');
      console.warn('💡 The service will wake up automatically on the next request (may take 30-60 seconds).');
      
      // Pour les requêtes GET, on peut retourner un tableau vide pour éviter de bloquer l'UI
      if (error.config?.method?.toLowerCase() === 'get') {
        const url = error.config.url || '';
        // Si c'est une requête qui devrait retourner un tableau, retourner un tableau vide
        if (url.includes('/products') || url.includes('/services') || url.includes('/providers')) {
          return Promise.resolve({
            data: [],
            status: 200,
            statusText: 'OK (cached)',
            headers: {},
            config: error.config,
          });
        }
      }
    }
    
    // Gérer les erreurs CORS
    if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('Cross-Origin')) {
      console.error('❌ CORS error detected. Possible causes:');
      console.error('  1. Backend CORS_ORIGIN is not configured correctly');
      console.error('  2. Backend is not allowing requests from this origin');
      console.error(`  Current origin: ${typeof window !== 'undefined' ? window.location.origin : 'unknown'}`);
      console.error(`  Backend URL: ${API_URL || 'not configured'}`);
      console.error('💡 Solution: Configure CORS_ORIGIN in backend to include:', typeof window !== 'undefined' ? window.location.origin : 'your frontend URL');
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
