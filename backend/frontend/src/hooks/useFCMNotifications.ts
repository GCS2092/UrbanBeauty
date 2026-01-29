// hooks/useFCMNotifications.ts
'use client';

import React, { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener, messaging } from '@/lib/firebase';
import api from '@/lib/api'; // Maintenant compatible avec Supabase!
import { useAuth } from './useAuth';
import { useNotifications as useAppNotifications } from '@/components/admin/NotificationProvider';

export function useFCMNotifications() {
  const { isAuthenticated } = useAuth();
  const appNotifications = useAppNotifications();
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Vérifier la permission actuelle
    const currentPermission = 'Notification' in window ? Notification.permission : 'default';
    setPermission(currentPermission);

    // Si l'utilisateur a déjà accordé la permission et est authentifié, récupérer le token
    if (isAuthenticated && currentPermission === 'granted' && !token) {
      requestNotificationPermission().then((fcmToken) => {
        if (fcmToken) {
          setToken(fcmToken);
          // Enregistrer le token dans le backend (maintenant via Supabase)
          api
            .post('/api/notifications/register-token', { token: fcmToken })
            .then((response) => {
              if (response.status === 200) {
                setIsRegistered(true);
                console.log('✅ FCM token registered successfully');
              }
            })
            .catch((error) => {
              console.error('❌ Error registering FCM token:', error);
            });
        }
      });
    }

    // Si le token existe déjà mais n'est pas enregistré, l'enregistrer
    if (isAuthenticated && token && !isRegistered) {
      api
        .post('/api/notifications/register-token', { token })
        .then((response) => {
          if (response.status === 200) {
            setIsRegistered(true);
          }
        })
        .catch((error) => {
          console.error('❌ Error registering FCM token:', error);
        });
    }
  }, [isAuthenticated, token, isRegistered]);

  // Écouter les messages en foreground (séparé pour éviter les re-renders)
  useEffect(() => {
    if (!messaging || typeof window === 'undefined') return;

    const unsubscribe = onMessageListener((payload: any) => {
      console.log('📬 Message received in foreground:', payload);
      if (payload && payload.notification) {
        // Afficher une notification dans l'app
        appNotifications.info(
          payload.notification.title || 'Notification',
          payload.notification.body || '',
        );

        // Afficher aussi une notification native du navigateur
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(payload.notification.title || 'Notification', {
            body: payload.notification.body || '',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: payload.data?.type || 'notification',
            data: payload.data,
          });
        }
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [messaging, appNotifications]);

  const requestPermission = async () => {
    if (typeof window === 'undefined') return null;
    
    const fcmToken = await requestNotificationPermission();
    if (fcmToken) {
      setToken(fcmToken);
      setPermission(Notification.permission);
      
      if (isAuthenticated) {
        try {
          const response = await api.post('/api/notifications/register-token', { token: fcmToken });
          if (response.status === 200) {
            setIsRegistered(true);
            appNotifications.success(
              'Notifications activées', 
              'Vous recevrez désormais les notifications push'
            );
          }
        } catch (error) {
          console.error('❌ Error registering FCM token:', error);
        }
      }
    }
    
    return fcmToken;
  };

  return {
    token,
    permission,
    isRegistered,
    requestPermission,
  };
}