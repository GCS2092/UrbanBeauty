'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService, CreateOrderDto } from '@/services/orders.service';

export function useOrders(all?: boolean, seller?: boolean) {
  return useQuery({
    queryKey: ['orders', all, seller],
    queryFn: () => ordersService.getAll(all, seller),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersService.getById(id),
    enabled: !!id && id !== '',
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderDto) => ordersService.create(data),
    onSuccess: () => {
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Rafraîchir les produits pour mettre à jour le stock
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
      ordersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useClearSellerHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ordersService.clearSellerHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateSellerNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, sellerNotes }: { id: string; sellerNotes: string }) =>
      ordersService.updateSellerNotes(id, sellerNotes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
    },
  });
}

