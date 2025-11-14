'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import api from '@/lib/api';
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
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Demander la permission et obtenir le token si l'utilisateur est connecté
    if (isAuthenticated && permission === 'default') {
      requestNotificationPermission().then((fcmToken) => {
        if (fcmToken) {
          setToken(fcmToken);
          // Enregistrer le token dans le backend
          api
            .post('/api/notifications/register-token', { token: fcmToken })
            .then(() => {
              setIsRegistered(true);
              console.log('FCM token registered successfully');
            })
            .catch((error) => {
              console.error('Error registering FCM token:', error);
            });
        }
      });
    }

    // Si le token existe déjà mais n'est pas enregistré, l'enregistrer
    if (isAuthenticated && token && !isRegistered) {
      api
        .post('/api/notifications/register-token', { token })
        .then(() => {
          setIsRegistered(true);
        })
        .catch((error) => {
          console.error('Error registering FCM token:', error);
        });
    }

    // Écouter les messages en foreground
    onMessageListener().then((payload: any) => {
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
  }, [isAuthenticated, permission, token, isRegistered, appNotifications]);

  const requestPermission = async () => {
    if (typeof window === 'undefined') return null;
    
    const fcmToken = await requestNotificationPermission();
    if (fcmToken) {
      setToken(fcmToken);
      setPermission(Notification.permission);
      
      if (isAuthenticated) {
        try {
          await api.post('/api/notifications/register-token', { token: fcmToken });
          setIsRegistered(true);
          appNotifications.success('Notifications activées', 'Vous recevrez désormais les notifications push');
        } catch (error) {
          console.error('Error registering FCM token:', error);
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

