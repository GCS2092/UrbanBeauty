import { supabase } from './supabase';


// Interface pour les réponses API
interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status?: number;
}

// Helper pour gérer les requêtes avec offline queue
const handleOfflineRequest = async <T = any>(method: string, url: string, data?: any): Promise<ApiResponse<T> | null> => {
  if (!navigator.onLine && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (typeof window !== 'undefined') {
      const { offlineManager } = await import('./offline');
      await offlineManager.addToQueue({
        type: method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        url,
        data: data || {},
      });
      
      return {
        data: { 
          message: 'Requête mise en file d\'attente. Elle sera synchronisée automatiquement.',
          queued: true,
          offline: true 
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
  post: async <T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    try {
      // Vérifier le mode hors ligne
      const offlineResponse = await handleOfflineRequest<T>('POST', endpoint, data);
      if (offlineResponse) return offlineResponse;

      // ne rien faire — supabase est déjà importé

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
            }
          }
        });

        if (error) {
          return { data: null, error: error.message };
        }

        // Récupérer le token de session
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
              }
            }
          } as T,
          error: null,
        };
      }

      if (endpoint === '/auth/login' || endpoint === '/api/auth/login') {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          return { data: null, error: error.message };
        }

        const access_token = authData.session?.access_token;

        // Récupérer les infos utilisateur depuis la table profiles
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
              profile: profile ? {
                firstName: profile.first_name,
                lastName: profile.last_name,
                avatar: profile.avatar_url,
              } : undefined
            }
          } as T,
          error: null,
        };
      }

      // Autres endpoints POST
      const { data: result, error } = await supabase
        .from(endpoint.replace('/api/', '').replace('/', ''))
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
      

      // Route pour récupérer l'utilisateur connecté
      if (endpoint === '/auth/me' || endpoint === '/api/auth/me') {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          return { data: null, error: userError?.message || 'Non authentifié' };
        }

        // Récupérer le profil complet
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
            profile: profile ? {
              id: profile.id,
              userId: profile.id,
              firstName: profile.first_name,
              lastName: profile.last_name,
              phone: profile.phone,
              address: profile.address,
              avatar: profile.avatar_url,
              bio: profile.bio,
              city: profile.city,
              country: profile.country,
              postalCode: profile.postal_code,
              website: profile.website,
              instagram: profile.instagram,
              facebook: profile.facebook,
              tiktok: profile.tiktok,
              specialties: profile.specialties,
              experience: profile.experience,
              isProvider: profile.is_provider || false,
              rating: profile.rating,
            } : undefined,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
          } as T,
          error: null,
        };
      }

      // Autres endpoints GET
      const tableName = endpoint.replace('/api/', '').replace('/', '').split('?')[0];
      const { data: result, error } = await supabase
        .from(tableName)
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
  put: async <T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    try {
      // Vérifier le mode hors ligne
      const offlineResponse = await handleOfflineRequest<T>('PUT', endpoint, data);
      if (offlineResponse) return offlineResponse;

      

      // Route pour changer le mot de passe
      if (endpoint === '/auth/change-password' || endpoint === '/api/auth/change-password') {
        const { error } = await supabase.auth.updateUser({
          password: data.newPassword
        });

        if (error) {
          return { data: null, error: error.message };
        }

        // Retourner les infos utilisateur mises à jour
        return api.get('/auth/me');
      }

      // Autres endpoints PUT
      const tableName = endpoint.replace('/api/', '').replace('/', '');
      const { data: result, error } = await supabase
        .from(tableName)
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
      // Vérifier le mode hors ligne
      const offlineResponse = await handleOfflineRequest<T>('DELETE', endpoint);
      if (offlineResponse) return offlineResponse;

      
      const tableName = endpoint.replace('/api/', '').replace('/', '');
      
      const { data: result, error } = await supabase
        .from(tableName)
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
  patch: async <T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    // PATCH est similaire à PUT
    return api.put<T>(endpoint, data);
  },
};

export default api;