'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService } from '@/services/favorites.service';

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesService.getAll(),
  });
}

export function useFavoritesCount() {
  return useQuery({
    queryKey: ['favorites', 'count'],
    queryFn: () => favoritesService.getCount(),
  });
}

export function useIsProductFavorite(productId: string) {
  return useQuery({
    queryKey: ['favorites', 'product', productId],
    queryFn: () => favoritesService.isProductFavorite(productId),
    enabled: !!productId,
  });
}

export function useIsServiceFavorite(serviceId: string) {
  return useQuery({
    queryKey: ['favorites', 'service', serviceId],
    queryFn: () => favoritesService.isServiceFavorite(serviceId),
    enabled: !!serviceId,
  });
}

export function useAddProductFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => favoritesService.addProduct(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.setQueryData(['favorites', 'product', productId], true);
    },
  });
}

export function useAddServiceFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) => favoritesService.addService(serviceId),
    onSuccess: (_, serviceId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.setQueryData(['favorites', 'service', serviceId], true);
    },
  });
}

export function useRemoveProductFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => favoritesService.removeProduct(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.setQueryData(['favorites', 'product', productId], false);
    },
  });
}

export function useRemoveServiceFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) => favoritesService.removeService(serviceId),
    onSuccess: (_, serviceId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.setQueryData(['favorites', 'service', serviceId], false);
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (favoriteId: string) => favoritesService.remove(favoriteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useClearFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => favoritesService.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

// Hook utilitaire pour toggle un produit favori
export function useToggleProductFavorite() {
  const addFavorite = useAddProductFavorite();
  const removeFavorite = useRemoveProductFavorite();

  return {
    toggle: (productId: string, isFavorite: boolean) => {
      if (isFavorite) {
        removeFavorite.mutate(productId);
      } else {
        addFavorite.mutate(productId);
      }
    },
    isPending: addFavorite.isPending || removeFavorite.isPending,
  };
}

// Hook utilitaire pour toggle un service favori
export function useToggleServiceFavorite() {
  const addFavorite = useAddServiceFavorite();
  const removeFavorite = useRemoveServiceFavorite();

  return {
    toggle: (serviceId: string, isFavorite: boolean) => {
      if (isFavorite) {
        removeFavorite.mutate(serviceId);
      } else {
        addFavorite.mutate(serviceId);
      }
    },
    isPending: addFavorite.isPending || removeFavorite.isPending,
  };
}

