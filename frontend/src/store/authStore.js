import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AUTH_TOKEN_KEY } from '../utils/constants';

// ✅ OneSignal.login() associe l'appareil à l'external_id (userId)
// C'est ce que le backend utilise pour envoyer les notifs (include_aliases.external_id)
async function loginToOneSignal(userId) {
  try {
    const OneSignal = (await import('react-onesignal')).default;
    await OneSignal.login(String(userId));
    console.log('✅ OneSignal login userId:', userId);
  } catch (e) {
    console.error('❌ OneSignal login error:', e);
  }
}

async function logoutFromOneSignal() {
  try {
    const OneSignal = (await import('react-onesignal')).default;
    await OneSignal.logout();
    console.log('✅ OneSignal logout');
  } catch (e) {
    console.error('❌ OneSignal logout error:', e);
  }
}

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        set({ user, token, isAuthenticated: true });
        if (user?.id) loginToOneSignal(user.id);
      },

      setToken: (token) => {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        set({ token });
      },

      updateUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        logoutFromOneSignal();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'urban-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;