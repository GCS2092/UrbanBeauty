// Service Worker unifié pour mode hors ligne + Firebase Messaging
// Version: 1.0.0
const CACHE_NAME = 'urbanbeauty-v1';
const RUNTIME_CACHE = 'urbanbeauty-runtime-v1';
const OFFLINE_PAGE = '/offline';

// Import Firebase pour les notifications (si disponible)
try {
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

  // Configuration Firebase (doit être injectée ou définie)
  const firebaseConfig = {
    apiKey: "AIzaSyCGVYzNfAxMi8FIyJcQHFCdsEma1sh7ui8",
    authDomain: "urbanbeauty-15ac0.firebaseapp.com",
    projectId: "urbanbeauty-15ac0",
    storageBucket: "urbanbeauty-15ac0.firebasestorage.app",
    messagingSenderId: "491829409330",
    appId: "1:491829409330:web:4e38abc40ca08abc86ae2b"
  };

  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Écouter les messages en arrière-plan
    messaging.onBackgroundMessage((payload) => {
      console.log('[SW] Background message received:', payload);

      const notificationTitle = payload.notification?.title || 'Notification';
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: payload.notification?.icon || '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: payload.data?.type || 'notification',
        data: payload.data || {},
        requireInteraction: false,
        silent: false,
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });

    // Gérer les clics sur les notifications
    self.addEventListener('notificationclick', (event) => {
      console.log('[SW] Notification clicked:', event);

      event.notification.close();

      const notificationData = event.notification.data || {};
      let targetUrl = '/';

      if (notificationData.type === 'message' || notificationData.type === 'chat') {
        targetUrl = notificationData.conversationId
          ? `/dashboard/chat?conversationId=${notificationData.conversationId}`
          : notificationData.userId
          ? `/dashboard/chat?userId=${notificationData.userId}`
          : '/dashboard/chat';
      } else if (notificationData.type === 'order') {
        targetUrl = notificationData.orderId
          ? `/dashboard/orders/${notificationData.orderId}`
          : '/dashboard/orders';
      } else if (notificationData.type === 'booking') {
        targetUrl = notificationData.bookingId
          ? `/dashboard/bookings/${notificationData.bookingId}`
          : '/dashboard/bookings';
      } else if (notificationData.url) {
        targetUrl = notificationData.url;
      }

      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
          for (const client of clientList) {
            if ('focus' in client && 'navigate' in client) {
              client.focus();
              if (client.navigate) {
                client.navigate(targetUrl);
              }
              return;
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
          }
        })
      );
    });
  }
} catch (error) {
  console.warn('[SW] Firebase not available:', error);
}

// Ressources à mettre en cache immédiatement
const STATIC_CACHE_URLS = [
  '/',
  '/offline',
  '/dashboard',
  '/products',
  '/services',
  '/auth/login',
  '/auth/register',
];

// Installer le service worker et mettre en cache les ressources statiques
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_CACHE_URLS).catch((error) => {
        console.warn('[SW] Failed to cache some static assets:', error);
        // Continuer même si certaines ressources échouent
        return Promise.resolve();
      });
    })
  );

  // Forcer l'activation immédiate
  self.skipWaiting();
});

// Activer le service worker et nettoyer les anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Prendre le contrôle de toutes les pages immédiatement
  return self.clients.claim();
});

// Stratégie de cache: Network First avec fallback sur cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Mettre en cache les réponses réussies
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', request.url);

    // Essayer le cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Si c'est une navigation et qu'on n'a pas de cache, retourner la page offline
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(OFFLINE_PAGE);
      if (offlinePage) {
        return offlinePage;
      }
    }

    throw error;
  }
}

// Stratégie de cache: Cache First pour les assets statiques
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Si c'est une image, retourner une image placeholder
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="sans-serif" font-size="14">Image non disponible</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    throw error;
  }
}

// Intercepter les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-http(s) (ex: chrome-extension://)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers l'API (sauf pour mise en cache optionnelle)
  if (url.pathname.startsWith('/api/')) {
    // Pour les API, utiliser network first mais ne pas bloquer
    event.respondWith(networkFirst(request).catch(() => {
      // Retourner une réponse vide si hors ligne
      return new Response(
        JSON.stringify({ error: 'Hors ligne', offline: true }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }));
    return;
  }

  // Cache first pour les assets statiques (CSS, JS, images, fonts)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network first pour les pages HTML
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Par défaut: network first
  event.respondWith(networkFirst(request));
});

// Gérer les messages depuis le client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// Synchronisation en arrière-plan (pour synchroniser les données quand la connexion revient)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Cette fonction sera appelée quand la connexion revient
  // Vous pouvez l'implémenter pour synchroniser les données en attente
  console.log('[SW] Syncing data...');

  // Exemple: synchroniser les commandes en attente
  // const pendingOrders = await getPendingOrders();
  // for (const order of pendingOrders) {
  //   await syncOrder(order);
  // }
}
