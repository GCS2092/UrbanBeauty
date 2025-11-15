import api from '@/lib/api';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  isVerifiedPurchase: boolean;
  isPublished: boolean;
  helpfulCount: number;
  providerReply?: string;
  providerReplyAt?: string;
  userId: string;
  user: {
    id: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  productId?: string;
  product?: {
    id: string;
    name: string;
  };
  serviceId?: string;
  service?: {
    id: string;
    name: string;
    provider?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
}

export interface CreateReviewDto {
  rating: number;
  comment?: string;
  productId?: string;
  serviceId?: string;
}

export interface ReplyReviewDto {
  reply: string;
}

export const reviewsService = {
  // Créer un avis
  create: async (data: CreateReviewDto): Promise<Review> => {
    const response = await api.post<Review>('/api/reviews', data);
    return response.data;
  },

  // Récupérer tous les avis (avec filtres optionnels)
  findAll: async (params?: {
    productId?: string;
    serviceId?: string;
    providerId?: string;
  }): Promise<Review[]> => {
    const response = await api.get<Review[]>('/api/reviews', { params });
    return response.data;
  },

  // Récupérer tous les avis (admin)
  findAllForAdmin: async (): Promise<Review[]> => {
    const response = await api.get<Review[]>('/api/reviews/admin');
    return response.data;
  },

  // Récupérer un avis par ID
  findOne: async (id: string): Promise<Review> => {
    const response = await api.get<Review>(`/api/reviews/${id}`);
    return response.data;
  },

  // Mettre à jour un avis
  update: async (id: string, data: { comment?: string }): Promise<Review> => {
    const response = await api.put<Review>(`/api/reviews/${id}`, data);
    return response.data;
  },

  // Supprimer un avis
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/reviews/${id}`);
  },

  // Répondre à un avis (prestataire)
  reply: async (id: string, data: ReplyReviewDto): Promise<Review> => {
    const response = await api.post<Review>(`/api/reviews/${id}/reply`, data);
    return response.data;
  },

  // Marquer un avis comme utile
  markHelpful: async (id: string): Promise<{ helpful: boolean }> => {
    const response = await api.post<{ helpful: boolean }>(`/api/reviews/${id}/helpful`);
    return response.data;
  },
};

