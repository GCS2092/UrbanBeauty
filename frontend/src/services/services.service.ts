import api from '@/lib/api';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  available: boolean;
  providerId: string;
  provider?: {
    id: string;
    firstName: string;
    lastName: string;
    rating?: number;
  };
  images?: Array<{
    id: string;
    url: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  price: number;
  duration: number;
  available?: boolean;
}

export const servicesService = {
  getAll: async (): Promise<Service[]> => {
    const response = await api.get<Service[]>('/services');
    return response.data;
  },

  getById: async (id: string): Promise<Service> => {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  },

  create: async (data: CreateServiceDto): Promise<Service> => {
    const response = await api.post<Service>('/services', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateServiceDto>): Promise<Service> => {
    const response = await api.patch<Service>(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },
};

