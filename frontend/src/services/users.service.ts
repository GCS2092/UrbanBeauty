import api from '@/lib/api';

export interface User {
  id: string;
  email: string;
  role: 'CLIENT' | 'COIFFEUSE' | 'VENDEUSE' | 'ADMIN';
  isActive?: boolean;
  profile?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    rating?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRoleDto {
  role: 'CLIENT' | 'COIFFEUSE' | 'VENDEUSE' | 'ADMIN';
}

export interface CreateUserDto {
  email: string;
  password: string;
  role: 'CLIENT' | 'COIFFEUSE' | 'VENDEUSE' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateUserStatusDto {
  isActive: boolean;
}

export const usersService = {
  getAll: async (role?: string): Promise<User[]> => {
    const params = role ? `?role=${role}` : '';
    const response = await api.get<User[]>(`/api/users${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/api/users/${id}`);
    return response.data;
  },

  updateRole: async (id: string, role: 'CLIENT' | 'COIFFEUSE' | 'VENDEUSE' | 'ADMIN'): Promise<User> => {
    const response = await api.patch<User>(`/api/users/${id}/role`, { role });
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post<User>('/api/users', data);
    return response.data;
  },

  updateStatus: async (id: string, isActive: boolean): Promise<User> => {
    const response = await api.patch<User>(`/api/users/${id}/status`, { isActive });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },
};

