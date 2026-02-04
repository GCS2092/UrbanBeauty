import { supabase } from '@/lib/supabase';  // ✅ Correct

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  mustChangePassword?: boolean;
  user: {
    id: string;
    email: string;
    role: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

export const authService = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    // 1. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;

    // 2. Créer le profil dans la table profiles
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          userId: authData.user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        });

      if (profileError) throw profileError;
    }

    // 3. Stocker le token
    if (authData.session) {
      localStorage.setItem('access_token', authData.session.access_token);
    }

    return {
      access_token: authData.session?.access_token || '',
      user: {
        id: authData.user?.id || '',
        email: authData.user?.email || '',
        role: data.role || 'user',
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
      },
    };
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    // 1. Se connecter avec Supabase Auth
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    // 2. Récupérer le profil
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('userId', authData.user.id)
      .single();

    // 3. Stocker le token
    if (authData.session) {
      localStorage.setItem('access_token', authData.session.access_token);
    }

    return {
      access_token: authData.session?.access_token || '',
      user: {
        id: authData.user.id,
        email: authData.user.email || '',
        role: 'user', // À adapter selon votre logique
        profile: profileData ? {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          avatar: profileData.avatar,
        } : undefined,
      },
    };
  },

  logout: () => {
    localStorage.removeItem('access_token');
    supabase.auth.signOut();
    window.location.href = '/auth/login';
  },

  getMe: async (): Promise<any> => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) throw new Error('Not authenticated');

    // Récupérer le profil complet
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('userId', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      role: 'user', // À adapter
      profile: profileData,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  },

  changePassword: async (newPassword: string): Promise<any> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return authService.getMe();
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },
};