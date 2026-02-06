import { supabase } from './supabase';

// Interface pour les reponses API
interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status?: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || '';

const shouldUseBackend = (endpoint: string): boolean => {
  return (
    /^\/api\/analytics(\/|$)/.test(endpoint) ||
    /^\/api\/analytics[-_]/.test(endpoint) ||
    /^\/analytics[-_]/.test(endpoint) ||
    /^\/api\/maintenance(\/|$)/.test(endpoint) ||
    /^\/api\/maintenance[-_]/.test(endpoint) ||
    /^\/maintenance[-_]/.test(endpoint) ||
    /^\/api\/users(\/|$)/.test(endpoint) ||
    /^\/users(\/|$)/.test(endpoint) ||
    /^\/api\/notifications\/send$/.test(endpoint) ||
    /^\/api\/notifications[-_]/.test(endpoint) ||
    /^\/notifications[-_]send$/.test(endpoint) ||
    /^\/api\/reviews\/admin$/.test(endpoint) ||
    /^\/api\/reviews[-_]/.test(endpoint) ||
    /^\/reviews[-_]admin$/.test(endpoint)
  );
};

const backendRequest = async <T = any>(
  method: string,
  endpoint: string,
  data?: any,
): Promise<ApiResponse<T>> => {
  if (!BACKEND_URL) {
    return { data: null, error: 'API URL non configuree' };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch (_) {
    json = null;
  }

  if (!res.ok) {
    return {
      data: null,
      error: json?.message || json?.error || res.statusText,
      status: res.status,
    };
  }

  return { data: json as T, error: null, status: res.status };
};

// Helper pour convertir les endpoints en noms de table Supabase corrects
const getTableName = (endpoint: string): string => {
  const tableName = endpoint
    .replace('/api/', '')
    .replace(/\//g, '_')
    .split('?')[0];

  // Mapping special pour les cas particuliers
  const tableMapping: { [key: string]: string } = {
    'notifications-unread-count': 'notifications_unread_count',
    'notificationsunread-count': 'notifications_unread_count',
    notificationsunread_count: 'notifications_unread_count',
    favoritescount: 'favorites',
    'favorites-count': 'favorites',
    'quick-replies': 'quick_replies',
    'chat-conversations': 'chat_conversations',
    chatconversations: 'chat_conversations',
  };

  return tableMapping[tableName] || tableName.replace(/-/g, '_');
};

// Helper pour gÃƒÂ©rer les requÃƒÂªtes avec offline queue
const handleOfflineRequest = async <T = any>(
  method: string,
  url: string,
  data?: any,
): Promise<ApiResponse<T> | null> => {
  if (
    !navigator.onLine &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
  ) {
    if (typeof window !== 'undefined') {
      const { offlineManager } = await import('./offline');
      await offlineManager.addToQueue({
        type: method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        url,
        data: data || {},
      });

      return {
        data: {
          message:
            "RequÃƒÂªte mise en file d'attente. Elle sera synchronisÃƒÂ©e automatiquement.",
          queued: true,
          offline: true,
        } as T,
        error: null,
        status: 202,
      };
    }
  }
  return null;
};

// API pour l'authentification
export const api = {
  // POST request
  post: async <T = any>(
    endpoint: string,
    data: any,
  ): Promise<ApiResponse<T>> => {
    try {
      if (shouldUseBackend(endpoint)) {
        return backendRequest<T>('POST', endpoint, data);
      }
      // VÃƒÂ©rifier le mode hors ligne
      const offlineResponse = await handleOfflineRequest<T>(
        'POST',
        endpoint,
        data,
      );
      if (offlineResponse) return offlineResponse;

      // Shipping addresses
      if (
        endpoint.startsWith('/api/shipping-addresses/') ||
        endpoint.startsWith('/shipping-addresses/')
      ) {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (authError || !authData.user) {
          return {
            data: null,
            error: authError?.message || 'Non authentifi????????',
          };
        }

        const match = endpoint.match(/\/shipping-addresses\/([^/]+)$/i);
        const id = match ? match[1] : null;
        if (!id) {
          return { data: null, error: 'ID manquant' };
        }

        const { data: result, error } = await supabase
          .from('shipping_addresses')
          .delete()
          .eq('id', id)
          .eq('userId', authData.user.id)
          .select()
          .single();

        if (error) {
          return { data: null, error: error.message };
        }

        return { data: result as T, error: null };
      }

      // Shipping addresses
      if (
        endpoint.startsWith('/api/shipping-addresses/') ||
        endpoint.startsWith('/shipping-addresses/')
      ) {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (authError || !authData.user) {
          return {
            data: null,
            error: authError?.message || 'Non authentifie',
          };
        }

        const match = endpoint.match(/\/shipping-addresses\/([^/]+)$/i);
        const id = match ? match[1] : null;
        if (!id) {
          return { data: null, error: 'ID manquant' };
        }

        const { data: result, error } = await supabase
          .from('shipping_addresses')
          .delete()
          .eq('id', id)
          .eq('userId', authData.user.id)
          .select()
          .single();

        if (error) {
          return { data: null, error: error.message };
        }

        return { data: result as T, error: null };
      }

      // ne rien faire Ã¢â‚¬â€ supabase est dÃƒÂ©jÃƒÂ  importÃƒÂ©

      // Routes d'authentification
      if (endpoint === '/auth/register' || endpoint === '/api/auth/register') {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
              phone: data.phone,
              role: data.role || 'client',
            },
          },
        });

        if (error) {
          return { data: null, error: error.message };
        }

        // RÃƒÂ©cupÃƒÂ©rer le token de session
        const { data: sessionData } = await supabase.auth.getSession();
        const access_token = sessionData.session?.access_token;

        return {
          data: {
            access_token,
            user: {
              id: authData.user?.id,
              email: authData.user?.email,
              role: data.role || 'client',
              profile: {
                firstName: data.firstName,
                lastName: data.lastName,
              },
            },
          } as T,
          error: null,
        };
      }

      if (endpoint === '/auth/login' || endpoint === '/api/auth/login') {
        const { data: authData, error } =
          await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

        if (error) {
          return { data: null, error: error.message };
        }

        const access_token = authData.session?.access_token;

        // RÃƒÂ©cupÃƒÂ©rer les infos utilisateur depuis la table profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('userId', authData.user.id)
          .single();

        return {
          data: {
            access_token,
            user: {
              id: authData.user.id,
              email: authData.user.email,
              role: authData.user.user_metadata?.role || 'client',
              profile: profile
                ? {
                    firstName: profile.firstName ?? profile.first_name,
                    lastName: profile.lastName ?? profile.last_name,
                    avatar: profile.avatar ?? profile.avatar_url,
                  }
                : undefined,
            },
          } as T,
          error: null,
        };
      }

      // Enregistrement du token FCM (table notification_tokens)
      if (
        endpoint === '/api/notifications/register-token' ||
        endpoint === '/notifications/register-token'
      ) {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (authError || !authData.user) {
          return {
            data: null,
            error: authError?.message || 'Non authentifiÃƒÂ©',
          };
        }

        const token = data?.token;
        if (!token) {
          return { data: null, error: 'Token FCM manquant' };
        }

        // Nettoyer un token deja enregistre (evite le conflit unique)
        await supabase.from('notification_tokens').delete().eq('token', token);

        const { data: result, error } = await supabase
          .from('notification_tokens')
          .upsert(
            {
              userId: authData.user.id,
              token,
            },
            { onConflict: 'userId' },
          )
          .select()
          .single();

        if (error) {
          return { data: null, error: error.message };
        }

        return { data: result as T, error: null };
      }

      // Shipping addresses
      if (
        endpoint === '/api/shipping-addresses' ||
        endpoint === '/shipping-addresses'
      ) {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (authError || !authData.user) {
          return {
            data: null,
            error: authError?.message || 'Non authentifiÃƒÆ’Ã‚Â©',
          };
        }

        const payload = {
          ...data,
          userId: authData.user.id,
        };

        if (payload.isDefault) {
          await supabase
            .from('shipping_addresses')
            .update({ isDefault: false })
            .eq('userId', authData.user.id);
        }

        const { data: result, error } = await supabase
          .from('shipping_addresses')
          .insert(payload)
          .select()
          .single();

        if (error) {
          return { data: null, error: error.message };
        }

        return { data: result as T, error: null };
      }

      // Autres endpoints POST
      const { data: result, error } = await supabase
        .from(getTableName(endpoint))
        .insert(data)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: result as T, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Une erreur est survenue' };
    }
  },

  // GET request
  get: async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      if (shouldUseBackend(endpoint)) {
        return backendRequest<T>('GET', endpoint);
      }
      // Route pour rÃƒÂ©cupÃƒÂ©rer l'utilisateur connectÃƒÂ©
      if (endpoint === '/auth/me' || endpoint === '/api/auth/me') {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          return {
            data: null,
            error: userError?.message || 'Non authentifiÃƒÂ©',
          };
        }

        // RÃƒÂ©cupÃƒÂ©rer le profil complet
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('userId', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          return { data: null, error: profileError.message };
        }

        return {
          data: {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'client',
            profile: profile
              ? {
                  id: profile.id,
                  userId: profile.userId ?? profile.user_id,
                  firstName: profile.firstName ?? profile.first_name,
                  lastName: profile.lastName ?? profile.last_name,
                  phone: profile.phone,
                  address: profile.address,
                  avatar: profile.avatar ?? profile.avatar_url,
                  bio: profile.bio,
                  city: profile.city,
                  country: profile.country,
                  postalCode: profile.postalCode ?? profile.postal_code,
                  website: profile.website,
                  instagram: profile.instagram,
                  facebook: profile.facebook,
                  tiktok: profile.tiktok,
                  specialties: profile.specialties,
                  experience: profile.experience,
                  isProvider:
                    profile.isProvider ?? (profile.is_provider || false),
                  rating: profile.rating,
                }
              : undefined,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
          } as T,
          error: null,
        };
      }

      // Shipping addresses
      if (
        endpoint === '/api/shipping-addresses' ||
        endpoint === '/shipping-addresses' ||
        endpoint.startsWith('/api/shipping-addresses/') ||
        endpoint.startsWith('/shipping-addresses/')
      ) {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (authError || !authData.user) {
          return {
            data: null,
            error: authError?.message || 'Non authentifiÃƒÆ’Ã‚Â©',
          };
        }

        if (endpoint.endsWith('/default')) {
          const { data: result, error } = await supabase
            .from('shipping_addresses')
            .select('*')
            .eq('userId', authData.user.id)
            .eq('isDefault', true)
            .maybeSingle();

          if (error) {
            return { data: null, error: error.message };
          }

          return { data: result as T, error: null };
        }

        const match = endpoint.match(/\/shipping-addresses\/([^/]+)$/i);
        if (match) {
          const id = match[1];
          const { data: result, error } = await supabase
            .from('shipping_addresses')
            .select('*')
            .eq('id', id)
            .eq('userId', authData.user.id)
            .maybeSingle();

          if (error) {
            return { data: null, error: error.message };
          }

          return { data: result as T, error: null };
        }

        const { data: result, error } = await supabase
          .from('shipping_addresses')
          .select('*')
          .eq('userId', authData.user.id)
          .order('createdAt', { ascending: false });

        if (error) {
          return { data: null, error: error.message };
        }

        return { data: result as T, error: null };
      }


      // Product by id
      if (endpoint.match(/^\/api\/products\/[^/]+$/) || endpoint.match(/^\/products\/[^/]+$/)) {
        const id = endpoint.split('/').pop();
        const { data: result, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) {
          return { data: null, error: error.message };
        }
        return { data: result as T, error: null };
      }

      if (endpoint.match(/^\/api\/products[-_][^/]+$/) || endpoint.match(/^\/products[-_][^/]+$/)) {
        const id = endpoint
          .replace(/^\/api\/products[-_]/, '')
          .replace(/^\/products[-_]/, '');
        const { data: result, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) {
          return { data: null, error: error.message };
        }
        return { data: result as T, error: null };
      }

      // Service by id
      if (endpoint.match(/^\/api\/services\/[^/]+$/) || endpoint.match(/^\/services\/[^/]+$/)) {
        const id = endpoint.split('/').pop();
        const { data: result, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) {
          return { data: null, error: error.message };
        }
        return { data: result as T, error: null };
      }

      if (endpoint.match(/^\/api\/services[-_][^/]+$/) || endpoint.match(/^\/services[-_][^/]+$/)) {
        const id = endpoint
          .replace(/^\/api\/services[-_]/, '')
          .replace(/^\/services[-_]/, '');
        const { data: result, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) {
          return { data: null, error: error.message };
        }
        return { data: result as T, error: null };
      }


      // Category by id
      if (endpoint.match(/^\/api\/categories\/[^/]+$/) || endpoint.match(/^\/categories\/[^/]+$/)) {
        const id = endpoint.split('/').pop();
        const { data: result, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) {
          return { data: null, error: error.message };
        }
        return { data: result as T, error: null };
      }

      // Order by id
      if (endpoint.match(/^\/api\/orders\/[^/]+$/) || endpoint.match(/^\/orders\/[^/]+$/)) {
        const id = endpoint.split('/').pop();
        const { data: result, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) {
          return { data: null, error: error.message };
        }
        return { data: result as T, error: null };
      }

      // Booking by id
      if (endpoint.match(/^\/api\/bookings\/[^/]+$/) || endpoint.match(/^\/bookings\/[^/]+$/)) {
        const id = endpoint.split('/').pop();
        const { data: result, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) {
          return { data: null, error: error.message };
        }
        return { data: result as T, error: null };
      }

      // Autres endpoints GET
      const { data: result, error } = await supabase
        .from(getTableName(endpoint))
        .select('*');

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: result as T, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Une erreur est survenue' };
    }
  },

  // PUT request
  put: async <T = any>(
    endpoint: string,
    data: any,
  ): Promise<ApiResponse<T>> => {
    try {
      if (shouldUseBackend(endpoint)) {
        return backendRequest<T>('PUT', endpoint, data);
      }
      // VÃƒÂ©rifier le mode hors ligne
      const offlineResponse = await handleOfflineRequest<T>(
        'PUT',
        endpoint,
        data,
      );
      if (offlineResponse) return offlineResponse;

      // Route pour changer le mot de passe
      if (
        endpoint === '/auth/change-password' ||
        endpoint === '/api/auth/change-password'
      ) {
        const { error } = await supabase.auth.updateUser({
          password: data.newPassword,
        });

        if (error) {
          return { data: null, error: error.message };
        }

        // Retourner les infos utilisateur mises ÃƒÂ  jour
        return api.get('/auth/me');
      }

      // Shipping addresses (PUT as update)
      if (
        endpoint.startsWith('/api/shipping-addresses/') ||
        endpoint.startsWith('/shipping-addresses/')
      ) {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (authError || !authData.user) {
          return {
            data: null,
            error: authError?.message || 'Non authentifie',
          };
        }

        const match = endpoint.match(/\/shipping-addresses\/([^/]+)$/i);
        const id = match ? match[1] : null;
        if (!id) {
          return { data: null, error: 'ID manquant' };
        }

        if (data?.isDefault) {
          await supabase
            .from('shipping_addresses')
            .update({ isDefault: false })
            .eq('userId', authData.user.id);
        }

        const { data: result, error } = await supabase
          .from('shipping_addresses')
          .update({ ...data, updatedAt: new Date().toISOString() })
          .eq('id', id)
          .eq('userId', authData.user.id)
          .select()
          .single();

        if (error) {
          return { data: null, error: error.message };
        }

        return { data: result as T, error: null };
      }

      // Autres endpoints PUT
      const { data: result, error } = await supabase
        .from(getTableName(endpoint))
        .update(data)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: result as T, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Une erreur est survenue' };
    }
  },

  // DELETE request
  delete: async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      if (shouldUseBackend(endpoint)) {
        return backendRequest<T>('DELETE', endpoint);
      }
      // VÃƒÂ©rifier le mode hors ligne
      const offlineResponse = await handleOfflineRequest<T>('DELETE', endpoint);
      if (offlineResponse) return offlineResponse;

      const { data: result, error } = await supabase
        .from(getTableName(endpoint))
        .delete()
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: result as T, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Une erreur est survenue' };
    }
  },

  // PATCH request
  patch: async <T = any>(
    endpoint: string,
    data: any,
  ): Promise<ApiResponse<T>> => {
    if (shouldUseBackend(endpoint)) {
      return backendRequest<T>('PATCH', endpoint, data);
    }
    // Shipping addresses set-default
    if (
      endpoint.endsWith('/set-default') &&
      (endpoint.startsWith('/api/shipping-addresses/') ||
        endpoint.startsWith('/shipping-addresses/'))
    ) {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
        return {
          data: null,
          error: authError?.message || 'Non authentifi????????',
        };
      }

      const match = endpoint.match(
        /\/shipping-addresses\/([^/]+)\/set-default$/i,
      );
      const id = match ? match[1] : null;
      if (!id) {
        return { data: null, error: 'ID manquant' };
      }

      await supabase
        .from('shipping_addresses')
        .update({ isDefault: false })
        .eq('userId', authData.user.id);

      const { data: result, error } = await supabase
        .from('shipping_addresses')
        .update({ isDefault: true, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .eq('userId', authData.user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: result as T, error: null };
    }

    // PATCH est similaire ???????? PUT
    return api.put<T>(endpoint, data);
  },
};

export default api;
