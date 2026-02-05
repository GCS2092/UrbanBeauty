import { supabase } from '@/lib/supabase';

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
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;

    return {
      access_token: authData.session?.access_token || '',
      user: {
        id: authData.user?.id || '',
        email: authData.user?.email || '',
        role: data.role || 'CLIENT',
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
      },
    };
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('userId', authData.user.id)
      .maybeSingle();

    if (profileError) {
      console.warn('Profile not found or Supabase error:', profileError.message);
    }

    return {
      access_token: authData.session?.access_token || '',
      user: {
        id: authData.user.id,
        email: authData.user.email || '',
        role: (authData.user.user_metadata?.role as string) || 'CLIENT',
        profile: profileData
          ? {
              firstName: profileData.firstName ?? profileData.first_name,
              lastName: profileData.lastName ?? profileData.last_name,
              avatar: profileData.avatar ?? profileData.avatar_url,
            }
          : undefined,
      },
    };
  },

  logout: () => {
    supabase.auth.signOut();
    window.location.href = '/auth/login';
  },

  getMe: async (): Promise<any> => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) throw new Error('Not authenticated');

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('userId', user.id)
      .maybeSingle();

    if (profileError) {
      console.warn('Profile not found or Supabase error:', profileError.message);
    }

    return {
      id: user.id,
      email: user.email,
      role: (user.user_metadata?.role as string) || 'CLIENT',
      profile: profileData || undefined,
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
};
