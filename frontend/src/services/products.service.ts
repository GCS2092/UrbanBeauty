import api from '@/lib/api';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  isOnSale?: boolean;
  discountPercentage?: number;
  brand?: string;
  volume?: string;
  ingredients?: string;
  skinType?: string;
  sku?: string;
  stock: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  views?: number;
  salesCount?: number;
  averageRating?: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
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
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
}

export const productsService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/api/products');
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/api/products/${id}`);
    return response.data;
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await api.post<Product>('/api/products', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateProductDto>): Promise<Product> => {
    const response = await api.patch<Product>(`/api/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/products/${id}`);
  },
};

