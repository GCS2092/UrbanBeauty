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
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    window.location.href = '/auth/login';
  },

  getMe: async (): Promise<UserMeResponse> => {
    const response = await api.get<UserMeResponse>('/api/auth/me');
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

