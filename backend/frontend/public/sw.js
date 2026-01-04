// Service Worker unifié pour mode hors ligne + Firebase Messaging
// Version: 1.1.0

const CACHE_NAME = 'urbanbeauty-v1';
const RUNTIME_CACHE = 'urbanbeauty-runtime-v1';
const OFFLINE_PAGE = '/offline';

// Filtrer les requêtes invalides avant cache
function isValidRequest(request) {
  return request.url.startsWith('http'); // ignore chrome-extension:// et autres
}

// Network First pour API et pages HTML
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200 && isValidRequest(request)) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, using cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(OFFLINE_PAGE);
      if (offlinePage) return offlinePage;
    }

    return new Response(JSON.stringify({ error: 'Hors ligne', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache First pour assets statiques
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200 && isValidRequest(request)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
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
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(['/','/offline','/dashboard','/products','/services','/auth/login','/auth/register'])
    )
  );
});

// Activer SW et supprimer anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map(k => (k !== CACHE_NAME && k !== RUNTIME_CACHE) ? caches.delete(k) : null))
    )
  );
  self.clients.claim();
});

// Intercepter les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || !isValidRequest(request)) return;

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

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

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

// Firebase Messaging
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
          if (clients.openWindow) return clients.openWindow(targetUrl);
        })
      );
    });
  }
} catch (error) {
  console.warn('[SW] Firebase not available:', error);
}

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[SW] Syncing data...');
  // Ici tu peux ajouter la logique pour synchroniser les données Neon quand la connexion revient
}
