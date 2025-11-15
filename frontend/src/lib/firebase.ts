import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let messaging: Messaging | null = null;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Initialiser messaging de manière synchrone si possible
  // Sinon, l'initialiser de manière asynchrone
  if ('serviceWorker' in navigator) {
    isSupported().then((supported) => {
      if (supported && !messaging) {
        try {
          messaging = getMessaging(app);
          console.log('Firebase Messaging initialized');
        } catch (error) {
          console.error('Error initializing Firebase Messaging:', error);
        }
      }
    }).catch((error) => {
      console.error('Firebase Messaging not supported:', error);
    });
  }
}

export { app, messaging };

// Fonction pour enregistrer le service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// Fonction pour demander la permission et obtenir le token
export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return null;
  }

  try {
    // Vérifier si Firebase Messaging est supporté
    const supported = await isSupported();
    if (!supported) {
      console.log('Firebase Messaging is not supported in this browser');
      return null;
    }

    // Initialiser messaging si nécessaire
    if (!messaging) {
      messaging = getMessaging(app);
    }

    // Enregistrer le service worker d'abord
    const registration = await registerServiceWorker();
    if (!registration) {
      console.error('Service Worker registration failed');
      return null;
    }

    // Demander la permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied:', permission);
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VAPID key is not configured. Check NEXT_PUBLIC_FIREBASE_VAPID_KEY');
      return null;
    }

    // Attendre que le service worker soit prêt
    const readyRegistration = await navigator.serviceWorker.ready;
    console.log('Service Worker ready:', readyRegistration);

    // Obtenir le token FCM
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: readyRegistration,
    });
    
    if (token) {
      console.log('FCM Token obtained:', token);
      return token;
    } else {
      console.log('No registration token available. Request permission was granted but token is empty.');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Fonction pour écouter les messages en foreground
export function onMessageListener(callback: (payload: any) => void) {
  if (!messaging) {
    console.warn('Messaging not initialized');
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });

  return unsubscribe;
}

