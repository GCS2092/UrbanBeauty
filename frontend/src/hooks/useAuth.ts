'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, RegisterDto, LoginDto } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());

  // Écouter les changements de localStorage pour mettre à jour l'état d'authentification
  useEffect(() => {
    const checkAuth = () => {
      const newAuthState = authService.isAuthenticated();
      if (newAuthState !== isAuthenticated) {
        setIsAuthenticated(newAuthState);
        if (newAuthState) {
          queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        } else {
          queryClient.setQueryData(['auth', 'me'], null);
        }
      }
    };

    // Vérifier immédiatement
    checkAuth();

    // Écouter les événements de stockage (pour les changements dans d'autres onglets)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        checkAuth();
      }
    };

    // Écouter les événements personnalisés (pour les changements dans le même onglet)
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);

    // Vérifier périodiquement (toutes les secondes)
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
      clearInterval(interval);
    };
  }, [isAuthenticated, queryClient]);

  const registerMutation = useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: () => {
      setIsAuthenticated(true);
      // Déclencher un événement personnalisé
      window.dispatchEvent(new Event('auth-change'));
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push('/dashboard');
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: () => {
      setIsAuthenticated(true);
      // Déclencher un événement personnalisé
      window.dispatchEvent(new Event('auth-change'));
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push('/dashboard');
    },
    onError: (error) => {
      // Les erreurs sont gérées dans le composant qui appelle login()
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
    // Déclencher un événement personnalisé
    window.dispatchEvent(new Event('auth-change'));
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    register: (data: RegisterDto, options?: any) => registerMutation.mutate(data, options),
    login: (data: LoginDto, options?: any) => loginMutation.mutate(data, options),
    logout,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    registerError: registerMutation.error,
    loginError: loginMutation.error,
  };
}

