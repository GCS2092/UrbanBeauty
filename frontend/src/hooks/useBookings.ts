'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsService, CreateBookingDto, UpdateBookingDto } from '@/services/bookings.service';

export function useBookings(provider?: boolean) {
  return useQuery({
    queryKey: ['bookings', provider],
    queryFn: () => bookingsService.getAll(provider),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingsService.getById(id),
    enabled: !!id && id !== '',
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingDto) => bookingsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingDto }) =>
      bookingsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

