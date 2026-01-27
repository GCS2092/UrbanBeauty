import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, isSupported } from 'firebase/messaging';

// Fallback Firebase configuration (matches firebase-messaging-sw.js)
const fallbackFirebaseConfig = {
  apiKey: "AIzaSyCGVYzNfAxMi8FIyJcQHFCdsEma1sh7ui8",
  authDomain: "urbanbeauty-15ac0.firebaseapp.com",
  projectId: "urbanbeauty-15ac0",
  storageBucket: "urbanbeauty-15ac0.firebasestorage.app",
  messagingSenderId: "491829409330",
  appId: "1:491829409330:web:4e38abc40ca08abc86ae2b"
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || fallbackFirebaseConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackFirebaseConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackFirebaseConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || fallbackFirebaseConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || fallbackFirebaseConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || fallbackFirebaseConfig.appId,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

if (typeof window !== 'undefined') {
  // Vérifier que toutes les variables d'environnement sont définies (avec fallbacks)
  const hasAllConfig = firebaseConfig.apiKey && 
                       firebaseConfig.authDomain && 
                       firebaseConfig.projectId && 
                       firebaseConfig.appId;

  if (hasAllConfig) {
    if (!getApps().length) {
      try {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
        app = null;
      }
    } else {
      app = getApps()[0];
      console.log('✅ Firebase app already initialized');
    }
  } else {
    console.warn('⚠️ Firebase configuration is incomplete. Some features may not work.');
    console.warn('💡 Tip: Set NEXT_PUBLIC_FIREBASE_* environment variables in Vercel for production.');
  }

  // Initialiser messaging de manière synchrone si possible
  // Sinon, l'initialiser de manière asynchrone
  if (app && 'serviceWorker' in navigator) {
    isSupported().then((supported) => {
      if (supported && !messaging && app) {
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

// Export une fonction pour vérifier si Firebase est configuré
export function isFirebaseConfigured(): boolean {
  return !!app && !!firebaseConfig.appId;
}

// Fonction pour enregistrer le service worker (unifié avec mode hors ligne)
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    // Utiliser le service worker unifié (sw.js) qui inclut Firebase + mode hors ligne
    const registration = await navigator.serviceWorker.register('/sw.js', {
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
    if (!messaging && app) {
      messaging = getMessaging(app);
    }

    // Vérifier que messaging est initialisé
    if (!messaging) {
      console.error('Firebase Messaging is not initialized');
      return null;
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
  if (!messaging || !app) {
    console.warn('Messaging not initialized');
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });

  return unsubscribe;
}

