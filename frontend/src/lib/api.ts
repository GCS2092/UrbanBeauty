import { supabase } from './supabase';

// Interface pour les rÃƒÂ©ponses API
interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status?: number;
}

// Helper pour convertir les endpoints en noms de table Supabase corrects
const getTableName = (endpoint: string): string => {
  const tableName = endpoint
    .replace('/api/', '')
    .replace(/\//g, '_')
    .split('?')[0];

  // Mapping spÃƒÂ©cial pour les cas particuliers
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
      // VÃƒÂ©rifier le mode hors ligne
      const offlineResponse = await handleOfflineRequest<T>(
        'POST',
        endpoint,
        data,
      );
      if (offlineResponse) return offlineResponse;

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
    // PATCH est similaire ÃƒÂ  PUT
    return api.put<T>(endpoint, data);
  },
};

export default api;
