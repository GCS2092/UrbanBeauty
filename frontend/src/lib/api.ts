// lib/api.ts
// Version migrée vers Supabase - Compatible avec Next.js build

let supabase: any;

try {
  supabase = require('./supabase').supabase;
} catch (error) {
  console.warn('⚠️ Supabase client not initialized');
  supabase = {
    from: () => ({ select: () => ({ order: () => ({}) }), eq: () => ({}) })
  };
}

// ================================
// TYPES
// ================================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
  queued?: boolean;
  offline?: boolean;
}

interface OfflineRequest {
  type: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data: any;
}

// ================================
// GESTION DES ERREURS
// ================================

const handleSupabaseError = (error: any): ApiResponse => {
  console.error('Supabase error:', error);
  
  return {
    error: error.message || 'Une erreur est survenue',
    status: error.code === 'PGRST116' ? 404 : 500,
    data: undefined
  };
};

// ================================
// HASH PASSWORD - Compatible Browser & Server
// ================================

async function hashPassword(password: string): Promise<string> {
  // Utiliser Web Crypto API (disponible dans le navigateur ET Node.js)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// ================================
// MODE HORS LIGNE
// ================================

class OfflineManager {
  private queueKey = 'offline_requests_queue';

  async addToQueue(request: OfflineRequest): Promise<void> {
    if (typeof window === 'undefined') return;

    const queue = this.getQueue();
    queue.push({
      ...request,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
    console.log('✅ Requête ajoutée à la file d\'attente hors ligne');
  }

  getQueue(): any[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.queueKey);
    return stored ? JSON.parse(stored) : [];
  }

  async processQueue(): Promise<void> {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log(`🔄 Traitement de ${queue.length} requêtes en attente...`);
    
    for (const request of queue) {
      try {
        await this.executeRequest(request);
      } catch (error) {
        console.error('❌ Erreur lors du traitement de la requête:', error);
      }
    }

    localStorage.removeItem(this.queueKey);
  }

  private async executeRequest(request: any): Promise<void> {
    console.log('Exécution de la requête:', request);
  }
}

export const offlineManager = new OfflineManager();

// ================================
// API WRAPPER (Compatible avec l'ancien code)
// ================================

class SupabaseApiWrapper {
  private auth: {
    getToken: () => string | null;
    removeToken: () => void;
  };

  constructor() {
    this.auth = {
      getToken: () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('access_token');
      },
      removeToken: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('access_token');
      }
    };

    // Écouter les changements de connexion
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('✅ Connexion rétablie');
        offlineManager.processQueue();
      });
    }
  }

  // ================================
  // MÉTHODES HTTP
  // ================================

  async get(url: string): Promise<ApiResponse> {
    try {
      // Mode hors ligne
      if (typeof window !== 'undefined' && !navigator.onLine) {
        console.warn('⚠️ Mode hors ligne - Retour de données vides');
        return {
          data: [],
          status: 200,
          message: 'Mode hors ligne'
        };
      }

      const result = await this.parseAndExecuteGet(url);
      return result;
    } catch (error: any) {
      return this.handleError(error, 'GET', url);
    }
  }

  async post(url: string, data: any): Promise<ApiResponse> {
    try {
      // Mode hors ligne
      if (typeof window !== 'undefined' && !navigator.onLine) {
        await offlineManager.addToQueue({ type: 'POST', url, data });
        return {
          data: { queued: true, offline: true },
          status: 202,
          message: 'Requête mise en file d\'attente'
        };
      }

      const result = await this.parseAndExecutePost(url, data);
      return result;
    } catch (error: any) {
      return this.handleError(error, 'POST', url, data);
    }
  }

  async put(url: string, data: any): Promise<ApiResponse> {
    try {
      if (typeof window !== 'undefined' && !navigator.onLine) {
        await offlineManager.addToQueue({ type: 'PUT', url, data });
        return {
          data: { queued: true, offline: true },
          status: 202,
          message: 'Requête mise en file d\'attente'
        };
      }

      const result = await this.parseAndExecutePut(url, data);
      return result;
    } catch (error: any) {
      return this.handleError(error, 'PUT', url, data);
    }
  }

  async patch(url: string, data: any): Promise<ApiResponse> {
    return this.put(url, data);
  }

  async delete(url: string): Promise<ApiResponse> {
    try {
      if (typeof window !== 'undefined' && !navigator.onLine) {
        await offlineManager.addToQueue({ type: 'DELETE', url, data: {} });
        return {
          data: { queued: true, offline: true },
          status: 202,
          message: 'Requête mise en file d\'attente'
        };
      }

      const result = await this.parseAndExecuteDelete(url);
      return result;
    } catch (error: any) {
      return this.handleError(error, 'DELETE', url);
    }
  }

  // ================================
  // PARSERS D'URL
  // ================================

  private async parseAndExecuteGet(url: string): Promise<ApiResponse> {
    // /api/services
    if (url.includes('/services') && !url.match(/\/services\/[^/]+$/)) {
      const { data, error } = await supabase
        .from('Service')
        .select('*')
        .order('name');
      
      if (error) return handleSupabaseError(error);
      return { data: data || [], status: 200 };
    }

    // /api/services/:id
    if (url.match(/\/services\/([^/]+)$/)) {
      const id = url.split('/').pop();
      const { data, error } = await supabase
        .from('Service')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) return handleSupabaseError(error);
      return { data, status: 200 };
    }

    // /api/products
    if (url.includes('/products') && !url.match(/\/products\/[^/]+$/)) {
      const { data, error } = await supabase
        .from('Product')
        .select('*')
        .order('name');
      
      if (error) return handleSupabaseError(error);
      return { data: data || [], status: 200 };
    }

    // /api/products/:id
    if (url.match(/\/products\/([^/]+)$/)) {
      const id = url.split('/').pop();
      const { data, error } = await supabase
        .from('Product')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) return handleSupabaseError(error);
      return { data, status: 200 };
    }

    // /api/providers ou /api/prestataires
    if (url.includes('/providers') || url.includes('/prestataires')) {
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .in('role', ['COIFFEUSE', 'MANICURISTE', 'VENDEUSE']);
      
      if (error) return handleSupabaseError(error);
      return { data: data || [], status: 200 };
    }

    // Route non gérée - retourner tableau vide
    console.warn(`⚠️ Route GET non gérée: ${url}`);
    return { data: [], status: 200 };
  }

  private async parseAndExecutePost(url: string, data: any): Promise<ApiResponse> {
    // /api/auth/login
    if (url.includes('/auth/login')) {
      return await this.handleLogin(data);
    }

    // /api/auth/register
    if (url.includes('/auth/register')) {
      return await this.handleRegister(data);
    }

    // /api/notifications/register-token
    if (url.includes('/notifications/register-token')) {
      console.log('📱 FCM Token enregistré:', data.token);
      return { 
        data: { success: true }, 
        status: 200,
        message: 'Token FCM enregistré' 
      };
    }

    // /api/services
    if (url.includes('/services')) {
      const { data: result, error } = await supabase
        .from('Service')
        .insert([{
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) return handleSupabaseError(error);
      return { data: result, status: 201 };
    }

    // /api/products
    if (url.includes('/products')) {
      const { data: result, error } = await supabase
        .from('Product')
        .insert([{
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) return handleSupabaseError(error);
      return { data: result, status: 201 };
    }

    console.warn(`⚠️ Route POST non gérée: ${url}`);
    return { data: null, status: 404, error: 'Route non trouvée' };
  }

  private async parseAndExecutePut(url: string, data: any): Promise<ApiResponse> {
    // /api/services/:id
    if (url.match(/\/services\/([^/]+)$/)) {
      const id = url.split('/').pop();
      const { data: result, error } = await supabase
        .from('Service')
        .update({
          ...data,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) return handleSupabaseError(error);
      return { data: result, status: 200 };
    }

    // /api/products/:id
    if (url.match(/\/products\/([^/]+)$/)) {
      const id = url.split('/').pop();
      const { data: result, error } = await supabase
        .from('Product')
        .update({
          ...data,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) return handleSupabaseError(error);
      return { data: result, status: 200 };
    }

    console.warn(`⚠️ Route PUT non gérée: ${url}`);
    return { data: null, status: 404, error: 'Route non trouvée' };
  }

  private async parseAndExecuteDelete(url: string): Promise<ApiResponse> {
    // /api/services/:id
    if (url.match(/\/services\/([^/]+)$/)) {
      const id = url.split('/').pop();
      const { error } = await supabase
        .from('Service')
        .delete()
        .eq('id', id);
      
      if (error) return handleSupabaseError(error);
      return { data: { success: true }, status: 200 };
    }

    // /api/products/:id
    if (url.match(/\/products\/([^/]+)$/)) {
      const id = url.split('/').pop();
      const { error } = await supabase
        .from('Product')
        .delete()
        .eq('id', id);
      
      if (error) return handleSupabaseError(error);
      return { data: { success: true }, status: 200 };
    }

    console.warn(`⚠️ Route DELETE non gérée: ${url}`);
    return { data: null, status: 404, error: 'Route non trouvée' };
  }

  // ================================
  // AUTHENTIFICATION
  // ================================

  private async handleLogin(credentials: { email: string; password: string }): Promise<ApiResponse> {
    try {
      const hashedPassword = await hashPassword(credentials.password);

      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('email', credentials.email)
        .eq('password', hashedPassword)
        .single();

      if (error || !data) {
        return {
          status: 401,
          error: 'Email ou mot de passe incorrect'
        };
      }

      if (data.blockReason) {
        return {
          status: 403,
          error: `Compte bloqué: ${data.blockReason}`
        };
      }

      // Générer un token simple
      const token = btoa(JSON.stringify({ id: data.id, role: data.role, timestamp: Date.now() }));
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(data));
      }

      return {
        data: {
          user: data,
          access_token: token
        },
        status: 200
      };
    } catch (error: any) {
      return {
        status: 500,
        error: error.message
      };
    }
  }

  private async handleRegister(userData: any): Promise<ApiResponse> {
    try {
      const hashedPassword = await hashPassword(userData.password);

      const { data, error } = await supabase
        .from('User')
        .insert([{
          email: userData.email,
          password: hashedPassword,
          role: userData.role || 'CLIENT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) return handleSupabaseError(error);

      return {
        data: {
          user: data,
          message: 'Inscription réussie'
        },
        status: 201
      };
    } catch (error: any) {
      return {
        status: 500,
        error: error.message
      };
    }
  }

  // ================================
  // GESTION DES ERREURS
  // ================================

  private handleError(error: any, method: string, url: string, data?: any): ApiResponse {
    console.error(`❌ Erreur ${method} ${url}:`, error);

    // Erreur 401 - Token expiré
    if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
      this.auth.removeToken();
      
      if (typeof window !== 'undefined') {
        const publicPaths = ['/checkout', '/cart', '/products', '/services', '/', '/prestataires', '/lookbook'];
        const currentPath = window.location.pathname;
        const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
        
        if (!isPublicPath) {
          window.location.href = '/auth/login';
        }
      }

      return {
        status: 401,
        error: 'Session expirée'
      };
    }

    return {
      status: 500,
      error: error.message || 'Une erreur est survenue'
    };
  }
}

// ================================
// EXPORT SINGLETON
// ================================

export const api = new SupabaseApiWrapper();
export default api;