'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, RegisterDto, LoginDto } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push('/dashboard');
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push('/dashboard');
    },
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.getMe(),
    enabled: authService.isAuthenticated(),
    retry: false,
  });

  const logout = () => {
    authService.logout();
    queryClient.clear();
  };

  return {
    user,
    isLoading,
    isAuthenticated: authService.isAuthenticated(),
    register: (data: RegisterDto, options?: any) => registerMutation.mutate(data, options),
    login: (data: LoginDto, options?: any) => loginMutation.mutate(data, options),
    logout,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    registerError: registerMutation.error,
    loginError: loginMutation.error,
  };
}

