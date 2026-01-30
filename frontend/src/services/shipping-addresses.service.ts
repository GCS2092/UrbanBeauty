import api from '@/lib/api';

export interface ShippingAddress {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone?: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingAddressDto {
  label: string;
  fullName: string;
  phone?: string;
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateShippingAddressDto {
  label?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export const shippingAddressesService = {
  getAll: async (): Promise<ShippingAddress[]> => {
    const response = await api.get('/api/shipping-addresses');
    return response.data;
  },

  getDefault: async (): Promise<ShippingAddress | null> => {
    try {
      const response = await api.get('/api/shipping-addresses/default');
      return response.data;
    } catch {
      return null;
    }
  },

  getById: async (id: string): Promise<ShippingAddress> => {
    const response = await api.get(`/api/shipping-addresses/${id}`);
    return response.data;
  },

  create: async (dto: CreateShippingAddressDto): Promise<ShippingAddress> => {
    const response = await api.post('/api/shipping-addresses', dto);
    return response.data;
  },

  update: async (id: string, dto: UpdateShippingAddressDto): Promise<ShippingAddress> => {
    const response = await api.patch(`/api/shipping-addresses/${id}`, dto);
    return response.data;
  },

  setDefault: async (id: string): Promise<ShippingAddress> => {
    const response = await api.patch(`/api/shipping-addresses/${id}/set-default`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/shipping-addresses/${id}`);
  },
};

