'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, UpdateUserRoleDto } from '@/services/users.service';

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

