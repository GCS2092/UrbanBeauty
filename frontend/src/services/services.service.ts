import api from '@/lib/api';

export interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  duration: number;
  category?: string;
  available: boolean;
  maxBookingsPerDay?: number;
  advanceBookingDays?: number;
  views?: number;
  bookingsCount?: number;
  averageRating?: number;
  isFeatured?: boolean;
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
    type?: string;
    alt?: string;
    title?: string;
    order?: number;
    isPrimary?: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ImageDto {
  url: string;
  type?: 'URL' | 'UPLOADED';
  alt?: string;
  title?: string;
  order?: number;
  isPrimary?: boolean;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  price: number;
  duration: number;
  available?: boolean;
  category?: string;
  images?: ImageDto[];
}

export const servicesService = {
  getAll: async (): Promise<Service[]> => {
    const response = await api.get<Service[]>('/api/services');
    return response.data;
  },

  getById: async (id: string): Promise<Service> => {
    const response = await api.get<Service>(`/api/services/${id}`);
    return response.data;
  },

  create: async (data: CreateServiceDto): Promise<Service> => {
    const response = await api.post<Service>('/api/services', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateServiceDto>): Promise<Service> => {
    const response = await api.patch<Service>(`/api/services/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/services/${id}`);
  },
};

