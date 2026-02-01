import api from '@/lib/api';

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

export interface UserMeResponse {
  id: string;
  email: string;
  role: string;
  profile?: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    avatar?: string;
    bio?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    specialties?: string[];
    experience?: number;
    isProvider: boolean;
    rating?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const authService = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    
    if (!response?.data || response.status >= 400) {
      throw new Error(response?.error || 'Erreur lors de l\'inscription');
    }
    
    if (response.data?.access_token && typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.data.access_token);
    }
    
    return response.data;
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    
    if (!response?.data || response.status >= 400) {
      throw new Error(response?.error || 'Email ou mot de passe incorrect');
    }
    
    if (response.data?.access_token && typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.data.access_token);
    }
    
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      window.location.href = '/auth/login';
    }
  },

  getMe: async (): Promise<UserMeResponse> => {
    const response = await api.get('/auth/me');
    
    if (!response?.data || response.status >= 400) {
      throw new Error(response?.error || 'Erreur lors de la récupération du profil');
    }
    
    return response.data;
  },

  changePassword: async (newPassword: string): Promise<UserMeResponse> => {
    const response = await api.put('/auth/change-password', {
      newPassword,
    });
    
    if (!response?.data || response.status >= 400) {
      throw new Error(response?.error || 'Erreur lors du changement de mot de passe');
    }
    
    return response.data;
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