'use client';

import { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useFCMNotifications } from '@/hooks/useFCMNotifications';
import { useAuth } from '@/hooks/useAuth';

export default function NotificationPermissionBanner() {
  const { isAuthenticated } = useAuth();
  const { permission, requestPermission, isRegistered } = useFCMNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Afficher le banner si :
    // - L'utilisateur est connecté
    // - La permission n'est pas encore accordée
    // - Le banner n'a pas été fermé
    // - Le token n'est pas encore enregistré
    if (
      isAuthenticated &&
      permission === 'default' &&
      !isDismissed &&
      !isRegistered &&
      typeof window !== 'undefined' &&
      'Notification' in window
    ) {
      // Attendre un peu avant d'afficher pour ne pas être trop intrusif
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Afficher après 3 secondes

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isAuthenticated, permission, isDismissed, isRegistered]);

  const handleEnable = async () => {
    const token = await requestPermission();
    if (token) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Stocker dans localStorage pour ne pas réafficher pendant cette session
    if (typeof window !== 'undefined') {
      localStorage.setItem('notification-banner-dismissed', 'true');
    }
  };

  // Vérifier si le banner a été fermé dans une session précédente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('notification-banner-dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="p-2 bg-pink-100 rounded-full">
            <BellIcon className="h-6 w-6 text-pink-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Activer les notifications
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Recevez des notifications pour vos messages, commandes et réservations même quand l'application est fermée.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              className="px-3 py-1.5 bg-pink-600 text-white text-xs font-medium rounded-md hover:bg-pink-700 transition-colors"
            >
              Activer
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

