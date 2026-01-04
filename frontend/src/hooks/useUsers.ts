'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, UpdateUserRoleDto, CreateUserDto } from '@/services/users.service';

export function useUsers(role?: string) {
  return useQuery({
    queryKey: ['users', role],
    queryFn: () => usersService.getAll(role),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => usersService.getById(id),
    enabled: !!id && id !== '',
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'CLIENT' | 'COIFFEUSE' | 'VENDEUSE' | 'ADMIN' }) =>
      usersService.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => usersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive, blockReason }: { id: string; isActive: boolean; blockReason?: string }) =>
      usersService.updateStatus(id, isActive, blockReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

