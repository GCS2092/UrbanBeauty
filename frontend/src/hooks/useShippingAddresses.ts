'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  shippingAddressesService,
  CreateShippingAddressDto,
  UpdateShippingAddressDto,
} from '@/services/shipping-addresses.service';
import { useAuth } from '@/hooks/useAuth';

export function useShippingAddresses() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['shipping-addresses'],
    queryFn: () => shippingAddressesService.getAll(),
    enabled: isAuthenticated, // Ne faire la requête que si l'utilisateur est authentifié
    retry: false, // Ne pas réessayer en cas d'erreur
  });
}

export function useDefaultShippingAddress() {
  return useQuery({
    queryKey: ['shipping-addresses', 'default'],
    queryFn: () => shippingAddressesService.getDefault(),
  });
}

export function useShippingAddress(id: string) {
  return useQuery({
    queryKey: ['shipping-addresses', id],
    queryFn: () => shippingAddressesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateShippingAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateShippingAddressDto) => shippingAddressesService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
    },
  });
}

export function useUpdateShippingAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateShippingAddressDto }) =>
      shippingAddressesService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
    },
  });
}

export function useSetDefaultShippingAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shippingAddressesService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
    },
  });
}

export function useDeleteShippingAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shippingAddressesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
    },
  });
}

