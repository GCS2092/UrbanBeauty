import { useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';
import useAuthStore from '../store/authStore';

/**
 * Hook à appeler UNE SEULE FOIS dans AuthContext après login.
 * - Demande la permission push si pas encore accordée
 * - Associe l'utilisateur connecté à son Player ID OneSignal
 */
export function useNotifications() {
  const { user, isAuthenticated } = useAuthStore();
  const asked = useRef(false);

  useEffect(() => {
    // On ne fait rien si pas connecté ou déjà demandé cette session
    if (!isAuthenticated || !user?.id || asked.current) return;

    async function setup() {
      try {
        asked.current = true;

        // 1️⃣ Demande la permission si pas encore accordée
        const already = OneSignal.Notifications.permission;
        if (!already) {
          await OneSignal.Notifications.requestPermission();
        }

        // 2️⃣ Associe l'utilisateur connecté à OneSignal
        // Comme ça on peut cibler "envoyer notif à userId X" depuis le backend
        await OneSignal.login(String(user.id));

        console.log('OneSignal: utilisateur associé ✅', user.id);
      } catch (err) {
        console.error('OneSignal setup error:', err);
      }
    }

    // Petit délai pour laisser le temps à OneSignal de finir son init
    const t = setTimeout(setup, 1500);
    return () => clearTimeout(t);
  }, [isAuthenticated, user?.id]);
}