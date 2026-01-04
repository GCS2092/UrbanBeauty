'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService, CreateReviewDto, Review } from '@/services/reviews.service';

export function useReviews(params?: { productId?: string; serviceId?: string; providerId?: string }) {
  return useQuery<Review[]>({
    queryKey: ['reviews', params],
    queryFn: () => reviewsService.findAll(params),
    enabled: !!(params?.productId || params?.serviceId || params?.providerId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewDto) => reviewsService.create(data),
    onSuccess: (_, variables) => {
      // Invalider les reviews du produit/service concerné
      if (variables.productId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', { productId: variables.productId }] });
        queryClient.invalidateQueries({ queryKey: ['products', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
      if (variables.serviceId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', { serviceId: variables.serviceId }] });
        queryClient.invalidateQueries({ queryKey: ['services', variables.serviceId] });
        queryClient.invalidateQueries({ queryKey: ['services'] });
      }
    },
  });
}

export function useMarkHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewsService.markHelpful(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

