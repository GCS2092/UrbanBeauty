// Service Worker unifié pour mode hors ligne + Firebase Messaging
// Version: 1.3.0 - Corrigé chrome-extension

const CACHE_NAME = 'urbanbeauty-v1';
const RUNTIME_CACHE = 'urbanbeauty-runtime-v1';
const OFFLINE_PAGE = '/offline';

// URLs essentielles à cacher (seulement celles qui existent vraiment)
const STATIC_ASSETS = [
  '/',
  '/offline'
];

// Filtrer les requêtes invalides avant cache
function isValidRequest(request) {
  try {
    const url = new URL(request.url);
    // Ignorer chrome-extension://, about:, data:, blob:, etc.
    const validProtocols = ['http:', 'https:'];
    return validProtocols.includes(url.protocol);
  } catch (e) {
    return false;
  }
}

// Network First pour API et pages HTML
async function networkFirst(request) {
  // ✅ Vérifier la validité avant tout
  if (!isValidRequest(request)) {
    return fetch(request);
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      // Clone avant de cacher pour éviter les erreurs
      cache.put(request, networkResponse.clone()).catch(err => {
        console.warn('[SW] Failed to cache:', request.url, err);
      });
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, using cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // Si c'est une navigation et pas de cache, retourner page offline
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(OFFLINE_PAGE);
      if (offlinePage) return offlinePage;
    }

    // Pour les API, retourner JSON d'erreur
    return new Response(
      JSON.stringify({ 
        error: 'Hors ligne', 
        offline: true,
        message: 'Cette ressource n\'est pas disponible hors ligne'
      }), 
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache First pour assets statiques
async function cacheFirst(request) {
  // ✅ Vérifier la validité avant tout
  if (!isValidRequest(request)) {
    return fetch(request);
  }

  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).catch(err => {
        console.warn('[SW] Failed to cache asset:', request.url, err);
      });
    }
    return response;
  } catch (e) {
    // Image de remplacement si offline
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="sans-serif" font-size="14">Image non disponible</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    throw e;
  }
}

// Installer SW et cacher les pages statiques
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(err => {
        console.error('[SW] Failed to cache some static assets:', err);
        // Continue l'installation même si le cache échoue
        // Cela évite de bloquer l'app
      })
  );
});

// Activer SW et supprimer anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  
  // Prendre le contrôle immédiatement
  self.clients.claim();
});

// Intercepter les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;
  
  // ✅ Ignorer les requêtes invalides (chrome-extension, etc.)
  if (!isValidRequest(request)) {
    console.log('[SW] Ignoring invalid request:', request.url);
    return;
  }

  const url = new URL(request.url);

  // API Supabase → Network First
  if (url.hostname.includes('supabase.co') || url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Assets statiques → Cache First
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|ico)$/i)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Pages HTML → Network First
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Par défaut → Network First
  event.respondWith(networkFirst(request));
});

// ============================================
// FIREBASE MESSAGING
// ============================================
try {
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

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

    // Messages en arrière-plan
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

      return self.registration.showNotification(notificationTitle, notificationOptions);
    });

    // Clic sur notification
    self.addEventListener('notificationclick', (event) => {
      console.log('[SW] Notification clicked:', event);
      event.notification.close();

      const notificationData = event.notification.data || {};
      let targetUrl = '/';

      // Déterminer l'URL cible selon le type de notification
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

      // Ouvrir ou focus sur la fenêtre
      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then((clientList) => {
            // Si une fenêtre est déjà ouverte, la focus
            for (const client of clientList) {
              if (client.url === targetUrl && 'focus' in client) {
                return client.focus();
              }
            }
            // Sinon ouvrir une nouvelle fenêtre
            if (clients.openWindow) {
              return clients.openWindow(targetUrl);
            }
          })
      );
    });
    
    console.log('[SW] Firebase Messaging initialized');
  }
} catch (error) {
  console.warn('[SW] Firebase not available:', error);
}

// ============================================
// SYNCHRONISATION EN ARRIÈRE-PLAN
// ============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[SW] Syncing data...');
  // Logique de synchronisation quand la connexion revient
  try {
    // Exemple : synchroniser les données en attente
    const cache = await caches.open(RUNTIME_CACHE);
    // ... votre logique de sync
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}