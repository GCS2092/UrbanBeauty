// Service Worker pour Firebase Cloud Messaging
// Ce fichier doit être dans le dossier public/

// Import des scripts Firebase (version compat pour service worker)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase - Les valeurs sont injectées par le build
// Pour la production, ces valeurs doivent être dans les variables d'environnement
// et injectées via un script de build ou un template
const firebaseConfig = {
  apiKey: "AIzaSyCGVYzNfAxMi8FIyJcQHFCdsEma1sh7ui8",
  authDomain: "urbanbeauty-15ac0.firebaseapp.com",
  projectId: "urbanbeauty-15ac0",
  storageBucket: "urbanbeauty-15ac0.firebasestorage.app",
  messagingSenderId: "491829409330",
  appId: "1:491829409330:web:4e38abc40ca08abc86ae2b"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Récupérer l'instance de messaging
const messaging = firebase.messaging();

// Écouter les messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
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

  // Afficher la notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  // Déterminer l'URL à ouvrir selon le type de notification
  const notificationData = event.notification.data || {};
  let targetUrl = '/';
  
  // Navigation selon le type de notification
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
  } else if (notificationData.type === 'product') {
    targetUrl = notificationData.productId 
      ? `/products/${notificationData.productId}`
      : '/products';
  } else if (notificationData.type === 'service') {
    targetUrl = notificationData.serviceId 
      ? `/services/${notificationData.serviceId}`
      : '/services';
  } else if (notificationData.url) {
    targetUrl = notificationData.url;
  }

  // Ouvrir ou focus la fenêtre de l'application
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si une fenêtre est déjà ouverte, la focus et naviguer
      for (const client of clientList) {
        if ('focus' in client && 'navigate' in client) {
          client.focus();
          if (client.navigate) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

