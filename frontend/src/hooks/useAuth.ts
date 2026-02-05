'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, RegisterDto, LoginDto } from '@/services/auth.service';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const normalizeRole = (role?: string) => {
  switch ((role || '').toUpperCase()) {
    case 'ADMIN':
    case 'VENDEUSE':
    case 'COIFFEUSE':
    case 'MANICURISTE':
    case 'CLIENT':
      return role!.toUpperCase();
    default:
      return 'CLIENT';
  }
};

const getDashboardPath = (role?: string) => {
  switch (normalizeRole(role)) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'VENDEUSE':
      return '/dashboard/products';
    case 'COIFFEUSE':
    case 'MANICURISTE':
      return '/dashboard/services';
    default:
      return '/dashboard';
  }
};

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      const hasSession = !!data.session;
      setIsAuthenticated(hasSession);
      setIsHydrated(true);

      if (hasSession) {
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      } else {
        queryClient.setQueryData(['auth', 'me'], null);
      }
    };

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const hasSession = !!session;
        setIsAuthenticated(hasSession);
        if (hasSession) {
          queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        } else {
          queryClient.setQueryData(['auth', 'me'], null);
        }
      },
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [queryClient]);

  const registerMutation = useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: () => {
      setIsAuthenticated(true);
      window.dispatchEvent(new Event('auth-change'));
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (response) => {
      setIsAuthenticated(true);
      window.dispatchEvent(new Event('auth-change'));
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      if (response.mustChangePassword) {
        router.push('/auth/change-password');
      } else {
        router.push(getDashboardPath(response.user?.role));
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.getMe(),
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    queryClient.clear();
    window.dispatchEvent(new Event('auth-change'));
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    isHydrated,
    register: (data: RegisterDto, options?: any) => {
      const redirectTo = options?.redirectTo || '/dashboard';

      registerMutation.mutate(data, {
        ...options,
        onSuccess: (response) => {
          setIsAuthenticated(true);
          window.dispatchEvent(new Event('auth-change'));
          queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
          router.push(redirectTo);
          if (options?.onSuccess) {
            options.onSuccess(response);
          }
        },
      });
    },
    login: (data: LoginDto, options?: any) =>
      loginMutation.mutate(data, options),
    logout,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    registerError: registerMutation.error,
    loginError: loginMutation.error,
  };
}
