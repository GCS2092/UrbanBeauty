import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import OneSignal from 'react-onesignal'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { SpeedInsights } from '@vercel/speed-insights/react'

OneSignal.init({
  appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
  notifyButton: { enable: false },
  allowLocalhostAsSecureOrigin: true,
  serviceWorkerParam: { scope: '/' },
  serviceWorkerPath: '/OneSignalSDKWorker.js',
  serviceWorkerUpdaterPath: '/OneSignalSDKWorker.js',
}).then(() => {
  console.log('OneSignal initialisé ✅')
}).catch((err) => {
  console.error('OneSignal init error:', err)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
      <SpeedInsights />
    </GoogleOAuthProvider>
  </StrictMode>
)