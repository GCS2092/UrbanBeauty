'use client';

import { useEffect } from 'react';
import { useFCMNotifications } from '@/hooks/useFCMNotifications';
import { useAuth } from '@/hooks/useAuth';

export default function FCMProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { token, permission, requestPermission } = useFCMNotifications();

  useEffect(() => {
    // Si l'utilisateur est connecté et n'a pas encore de permission, proposer d'activer
    if (isAuthenticated && permission === 'default' && !token) {
      // Optionnel : demander automatiquement la permission
      // requestPermission();
    }
  }, [isAuthenticated, permission, token, requestPermission]);

  return <>{children}</>;
}

