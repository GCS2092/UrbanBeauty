'use client';

import { useEffect, useState } from 'react';
import { offlineManager } from '@/lib/offline';

export default function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    // Initialiser le service worker
    offlineManager.registerServiceWorker().then((registration) => {
      if (registration) {
        console.log('✅ Service Worker registered for offline mode');
      }
    });

    // Initialiser le gestionnaire hors ligne
    offlineManager.init();

    // Vérifier l'état de la connexion
    setIsOnline(navigator.onLine);

    // Écouter les changements de connexion
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      // Synchroniser automatiquement
      offlineManager.syncQueue().then((result) => {
        if (result.success > 0) {
          console.log(`✅ ${result.success} éléments synchronisés`);
        }
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    offlineManager.onOnline(handleOnline);
    offlineManager.onOffline(handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {showOfflineBanner && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm z-50 flex items-center justify-center gap-2">
          <span>📡</span>
          <span>Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.</span>
          <button
            onClick={() => setShowOfflineBanner(false)}
            className="ml-auto text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}
      {children}
    </>
  );
}

