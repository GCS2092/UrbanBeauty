// lib/api.ts
// Version migrée vers Supabase - Compatible avec Next.js build

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ================================
// INITIALISATION SUPABASE (ULTRA ROBUSTE)
// ================================

const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
};

const getSupabaseKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
};

// Fonction pour créer le client de manière lazy
const createSupabaseClient = (): SupabaseClient | null => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  
  if (!url || !key) {
    console.error('❌ Variables Supabase manquantes:', { 
      urlPresent: !!url, 
      keyPresent: !!key 
    });
    return null;
  }
  
  try {
    return createClient(url, key);
  } catch (error) {
    console.error('❌ Erreur création client Supabase:', error);
    return null;
  }
};

// Client singleton - créé une seule fois
let supabaseInstance: SupabaseClient | null = null;

const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  
  if (!supabaseInstance) {
    throw new Error(
      '❌ Supabase non disponible. Vérifiez vos variables d\'environnement:\n' +
      'NEXT_PUBLIC_SUPABASE_URL\n' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }
  
  return supabaseInstance;
};

// ================================
// MAPPING DES TABLES
// ================================

const TABLE_MAPPING: Record<string, string> = {
  '/api/services': 'Service',
  '/api/users': 'User',
  '/api/bookings': 'Booking',
  '/api/categories': 'Category',
  '/api/images': 'Image',
  '/api/orders': 'Order',
  '/api/order-items': 'OrderItem',
  '/api/payments': 'Payment',
  '/api/products': 'Product',
  '/api/profiles': 'Profile',
  '/api/reviews': 'Review',
};

const getTableName = (endpoint: string): string => {
  return TABLE_MAPPING[endpoint] || endpoint.replace('/api/', '');
};

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
  console.error('Supabase error:', {
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
  });

  return {
    error: error?.message || error?.details || 'Une erreur est survenue',
    status: error?.code === 'PGRST116' ? 404 : error?.code === '42501' ? 403 : 500,
    data: undefined
  };
};

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
        console.error('❌ Erreur lors du traitement:', error);
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
// API WRAPPER
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
      if (typeof window !== 'undefined' && !navigator.onLine) {
        return { data: [], status: 200, message: 'Mode hors ligne' };
      }
      return await this.parseAndExecuteGet(url);
    } catch (error: any) {
      return this.handleError(error, 'GET', url);
    }
  }

  async post(url: string, data: any): Promise<ApiResponse> {
    try {
      if (typeof window !== 'undefined' && !navigator.onLine) {
        await offlineManager.addToQueue({ type: 'POST', url, data });
        return { data: { queued: true, offline: true }, status: 202 };
      }
      return await this.parseAndExecutePost(url, data);
    } catch (error: any) {
      return this.handleError(error, 'POST', url, data);
    }
  }

  async put(url: string, data: any): Promise<ApiResponse> {
    try {
      if (typeof window !== 'undefined' && !navigator.onLine) {
        await offlineManager.addToQueue({ type: 'PUT', url, data });
        return { data: { queued: true, offline: true }, status: 202 };
      }
      return await this.parseAndExecutePut(url, data);
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
        return { data: { queued: true, offline: true }, status: 202 };
      }
      return await this.parseAndExecuteDelete(url);
    } catch (error: any) {
      return this.handleError(error, 'DELETE', url);
    }
  }

  // ================================
  // PARSERS D'URL
  // ================================

  private async parseAndExecuteGet(url: string): Promise<ApiResponse> {
    try {
      const sb = getSupabase();

      // GET /api/services - Liste tous les services
      if (url.includes('/services') && !url.match(/\/services\/[^/]+$/)) {
        const { data, error } = await sb
          .from('Service')
          .select(`
            *,
            provider:Profile!Service_providerId_fkey(
              id,
              userId,
              firstName,
              lastName,
              rating
            ),
            images:Image(
              id,
              url,
              type,
              alt,
              title,
              order,
              isPrimary
            )
          `)
          .eq('available', true)
          .order('name', { ascending: true });

        if (error) return handleSupabaseError(error);
        return { data: data || [], status: 200 };
      }

      // GET /api/services/:id - Un service spécifique
      if (url.match(/\/services\/([^/]+)$/)) {
        const id = url.split('/').pop();
        const { data, error } = await sb
          .from('Service')
          .select(`
            *,
            provider:Profile!Service_providerId_fkey(
              id,
              userId,
              firstName,
              lastName,
              rating
            ),
            images:Image(
              id,
              url,
              type,
              alt,
              title,
              order,
              isPrimary
            )
          `)
          .eq('id', id)
          .single();

        if (error) return handleSupabaseError(error);
        return { data, status: 200 };
      }

      // GET /api/products - Liste tous les produits
      if (url.includes('/products') && !url.match(/\/products\/[^/]+$/)) {
        const { data, error } = await sb
          .from('Product')
          .select('*')
          .order('name', { ascending: true });

        if (error) return handleSupabaseError(error);
        return { data: data || [], status: 200 };
      }

      // GET /api/products/:id - Un produit spécifique
      if (url.match(/\/products\/([^/]+)$/)) {
        const id = url.split('/').pop();
        const { data, error } = await sb
          .from('Product')
          .select('*')
          .eq('id', id)
          .single();

        if (error) return handleSupabaseError(error);
        return { data, status: 200 };
      }

      // GET /api/providers - Liste tous les prestataires
      if (url.includes('/providers') || url.includes('/prestataires')) {
        const { data, error } = await sb
          .from('Profile')
          .select('*')
          .order('firstName', { ascending: true });

        if (error) return handleSupabaseError(error);
        return { data: data || [], status: 200 };
      }

      // GET /api/categories - Liste toutes les catégories
      if (url.includes('/categories')) {
        const { data, error } = await sb
          .from('Category')
          .select('*')
          .order('name', { ascending: true });

        if (error) return handleSupabaseError(error);
        return { data: data || [], status: 200 };
      }

      // GET /api/bookings - Liste les réservations de l'utilisateur connecté
      if (url.includes('/bookings')) {
        const token = this.auth.getToken();
        if (!token) {
          return { data: [], status: 401, error: 'Non authentifié' };
        }

        const { data, error } = await sb
          .from('Booking')
          .select(`
            *,
            service:Service(*),
            user:User(*)
          `)
          .order('createdAt', { ascending: false });

        if (error) return handleSupabaseError(error);
        return { data: data || [], status: 200 };
      }

      return { data: [], status: 200 };
    } catch (error: any) {
      console.error('❌ Erreur parseAndExecuteGet:', error);
      return { 
        data: [], 
        status: 500, 
        error: error.message || 'Erreur lors de la récupération des données' 
      };
    }
  }

  private async parseAndExecutePost(url: string, data: any): Promise<ApiResponse> {
    try {
      // Auth routes
      if (url.includes('/auth/login')) return await this.handleLogin(data);
      if (url.includes('/auth/register')) return await this.handleRegister(data);

      const sb = getSupabase();

      // POST /api/services - Créer un service
      if (url.includes('/services')) {
        const { data: result, error } = await sb
          .from('Service')
          .insert([{ 
            ...data, 
            slug: data.slug || this.generateSlug(data.name),
            createdAt: new Date().toISOString(), 
            updatedAt: new Date().toISOString() 
          }])
          .select()
          .single();

        if (error) return handleSupabaseError(error);
        return { data: result, status: 201 };
      }

      // POST /api/products - Créer un produit
      if (url.includes('/products')) {
        const { data: result, error } = await sb
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

      // POST /api/bookings - Créer une réservation
      if (url.includes('/bookings')) {
        const { data: result, error } = await sb
          .from('Booking')
          .insert([{ 
            ...data, 
            status: data.status || 'PENDING',
            createdAt: new Date().toISOString(), 
            updatedAt: new Date().toISOString() 
          }])
          .select()
          .single();

        if (error) return handleSupabaseError(error);
        return { data: result, status: 201 };
      }

      return { data: null, status: 404, error: 'Route non trouvée' };
    } catch (error: any) {
      console.error('❌ Erreur parseAndExecutePost:', error);
      return { 
        data: null, 
        status: 500, 
        error: error.message || 'Erreur lors de la création' 
      };
    }
  }

  private async parseAndExecutePut(url: string, data: any): Promise<ApiResponse> {
    try {
      const sb = getSupabase();
      const id = url.split('/').pop();

      // PUT /api/services/:id
      if (url.match(/\/services\/([^/]+)$/)) {
        const { data: result, error } = await sb
          .from('Service')
          .update({ ...data, updatedAt: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) return handleSupabaseError(error);
        return { data: result, status: 200 };
      }

      // PUT /api/products/:id
      if (url.match(/\/products\/([^/]+)$/)) {
        const { data: result, error } = await sb
          .from('Product')
          .update({ ...data, updatedAt: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) return handleSupabaseError(error);
        return { data: result, status: 200 };
      }

      // PUT /api/bookings/:id
      if (url.match(/\/bookings\/([^/]+)$/)) {
        const { data: result, error } = await sb
          .from('Booking')
          .update({ ...data, updatedAt: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) return handleSupabaseError(error);
        return { data: result, status: 200 };
      }

      return { data: null, status: 404, error: 'Route non trouvée' };
    } catch (error: any) {
      console.error('❌ Erreur parseAndExecutePut:', error);
      return { 
        data: null, 
        status: 500, 
        error: error.message || 'Erreur lors de la mise à jour' 
      };
    }
  }

  private async parseAndExecuteDelete(url: string): Promise<ApiResponse> {
    try {
      const sb = getSupabase();
      const id = url.split('/').pop();

      // DELETE /api/services/:id
      if (url.match(/\/services\/([^/]+)$/)) {
        const { error } = await sb.from('Service').delete().eq('id', id);
        if (error) return handleSupabaseError(error);
        return { data: { success: true }, status: 200 };
      }

      // DELETE /api/products/:id
      if (url.match(/\/products\/([^/]+)$/)) {
        const { error } = await sb.from('Product').delete().eq('id', id);
        if (error) return handleSupabaseError(error);
        return { data: { success: true }, status: 200 };
      }

      // DELETE /api/bookings/:id
      if (url.match(/\/bookings\/([^/]+)$/)) {
        const { error } = await sb.from('Booking').delete().eq('id', id);
        if (error) return handleSupabaseError(error);
        return { data: { success: true }, status: 200 };
      }

      return { data: null, status: 404, error: 'Route non trouvée' };
    } catch (error: any) {
      console.error('❌ Erreur parseAndExecuteDelete:', error);
      return { 
        data: null, 
        status: 500, 
        error: error.message || 'Erreur lors de la suppression' 
      };
    }
  }

  // ================================
  // AUTH - Utilise Supabase Auth
  // ================================

  private async handleLogin(credentials: { email: string; password: string }): Promise<ApiResponse> {
    try {
      const sb = getSupabase();

      // Connexion avec Supabase Auth
      const { data, error } = await sb.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error || !data.user) {
        return { status: 401, error: 'Email ou mot de passe incorrect' };
      }

      // Récupérer les infos utilisateur complètes
      const { data: userData, error: userError } = await sb
        .from('User')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        return { status: 500, error: 'Erreur lors de la récupération du profil' };
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.session?.access_token || '');
        localStorage.setItem('user', JSON.stringify(userData));
      }

      return { 
        data: { 
          user: userData, 
          access_token: data.session?.access_token,
          session: data.session
        }, 
        status: 200 
      };
    } catch (error: any) {
      console.error('❌ Erreur handleLogin:', error);
      return { 
        status: 500, 
        error: error.message || 'Erreur lors de la connexion' 
      };
    }
  }

  private async handleRegister(userData: any): Promise<ApiResponse> {
    try {
      const sb = getSupabase();

      // 1. Créer l'utilisateur avec Supabase Auth
      const { data: authData, error: authError } = await sb.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            role: userData.role || 'CLIENT',
            first_name: userData.firstName,
            last_name: userData.lastName,
          }
        }
      });

      if (authError) {
        return handleSupabaseError(authError);
      }

      if (!authData.user) {
        return { status: 500, error: 'Erreur lors de la création du compte' };
      }

      // 2. Créer l'entrée dans la table User
      const { error: userError } = await sb
        .from('User')
        .insert({
          id: authData.user.id,
          email: userData.email,
          role: userData.role || 'CLIENT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      if (userError) {
        // Si l'insertion échoue, supprimer l'utilisateur Auth
        await sb.auth.admin.deleteUser(authData.user.id);
        return handleSupabaseError(userError);
      }

      // 3. Si c'est un PROVIDER, créer aussi le Profile
      if (userData.role === 'PROVIDER' || userData.role === 'COIFFEUSE' || userData.role === 'MANICURISTE') {
        const { error: profileError } = await sb
          .from('Profile')
          .insert({
            userId: authData.user.id,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

        if (profileError) {
          console.error('⚠️ Erreur création profile:', profileError);
          // On ne bloque pas l'inscription pour autant
        }
      }

      return { 
        data: { 
          user: authData.user, 
          message: 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.' 
        }, 
        status: 201 
      };
    } catch (error: any) {
      console.error('❌ Erreur handleRegister:', error);
      return { 
        status: 500, 
        error: error.message || 'Erreur lors de l\'inscription' 
      };
    }
  }

  // ================================
  // HELPERS
  // ================================

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private handleError(error: any, method: string, url: string, data?: any): ApiResponse {
    console.error(`❌ Erreur ${method} ${url}:`, error);
    return { status: 500, error: error.message || 'Une erreur est survenue' };
  }
}

// ================================
// EXPORT
// ================================

export const api = new SupabaseApiWrapper();
export default api;