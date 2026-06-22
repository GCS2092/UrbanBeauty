import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import OneSignal from 'react-onesignal';
import './index.css';
import App from './App.jsx';

// ✅ Initialisation OneSignal — une seule fois au démarrage
OneSignal.init({
  appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
  safari_web_id: import.meta.env.VITE_ONESIGNAL_SAFARI_ID, // optionnel, pour Safari macOS
  notifyButton: { enable: false },   // on gère nous-mêmes le bouton dans PWAInstallBanner
  allowLocalhostAsSecureOrigin: true, // ✅ pour que ça marche en dev local
}).catch((err) => console.error('OneSignal init error:', err));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);