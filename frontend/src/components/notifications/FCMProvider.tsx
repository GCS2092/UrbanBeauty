'use client';

import { useEffect } from 'react';
import { useFCMNotifications } from '@/hooks/useFCMNotifications';
import { useAuth } from '@/hooks/useAuth';
import { registerServiceWorker } from '@/lib/firebase';
import NotificationPermissionBanner from './NotificationPermissionBanner';

export default function FCMProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { token, permission } = useFCMNotifications();

  useEffect(() => {
    // Enregistrer le service worker au démarrage de l'application
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker().catch((error) => {
        console.error('Failed to register service worker:', error);
      });
    }
  }, []);

  return (
    <>
      {children}
      <NotificationPermissionBanner />
    </>
  );
}

