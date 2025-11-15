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
      registerServiceWorker()
        .then((registration) => {
          if (registration) {
            console.log('Service Worker registered successfully:', registration);
          } else {
            console.warn('Service Worker registration returned null');
          }
        })
        .catch((error) => {
          console.error('Failed to register service worker:', error);
        });
    } else {
      console.warn('Service Worker not supported in this browser');
    }
  }, []);

  return (
    <>
      {children}
      <NotificationPermissionBanner />
    </>
  );
}

