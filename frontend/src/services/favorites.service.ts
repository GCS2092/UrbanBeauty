import api from '@/lib/api';

export interface Favorite {
  id: string;
  userId: string;
  productId?: string;
  serviceId?: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    isOnSale: boolean;
    images: Array<{ url: string; isPrimary: boolean }>;
    category?: { name: string };
    seller?: {
      profile?: {
        firstName: string;
        lastName: string;
      };
    };
  };
  service?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    duration: number;
    images: Array<{ url: string; isPrimary: boolean }>;
    provider?: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
}

export interface FavoritesCount {
  products: number;
  services: number;
  total: number;
}

export const favoritesService = {
  getAll: async (): Promise<Favorite[]> => {
    const response = await api.get('/api/favorites');
    return response.data;
  },

  getCount: async (): Promise<FavoritesCount> => {
    const response = await api.get('/api/favorites/count');
    return response.data;
  },

  isProductFavorite: async (productId: string): Promise<boolean> => {
    const response = await api.get(`/api/favorites/check/product/${productId}`);
    return response.data.isFavorite;
  },

  isServiceFavorite: async (serviceId: string): Promise<boolean> => {
    const response = await api.get(`/api/favorites/check/service/${serviceId}`);
    return response.data.isFavorite;
  },

  addProduct: async (productId: string): Promise<Favorite> => {
    const response = await api.post(`/api/favorites/product/${productId}`, {});
    return response.data;
  },

  addService: async (serviceId: string): Promise<Favorite> => {
    const response = await api.post(`/api/favorites/service/${serviceId}`, {});
    return response.data;
  },

  removeProduct: async (productId: string): Promise<void> => {
    await api.delete(`/api/favorites/product/${productId}`);
  },

  removeService: async (serviceId: string): Promise<void> => {
    await api.delete(`/api/favorites/service/${serviceId}`);
  },

  remove: async (favoriteId: string): Promise<void> => {
    await api.delete(`/api/favorites/${favoriteId}`);
  },

  clearAll: async (): Promise<{ message: string; count: number }> => {
    const response = await api.delete('/api/favorites');
    return response.data;
  },
};