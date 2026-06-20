import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AUTH_TOKEN_KEY } from '../utils/constants';

async function tagUserInOneSignal(userId) {
  try {
    const OneSignal = (await import('react-onesignal')).default;
    await OneSignal.User.addTag('userId', userId);
    console.log('✅ OneSignal tag userId:', userId);
  } catch (e) {
    console.error('❌ OneSignal tag error:', e);
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
        if (user?.id) tagUserInOneSignal(String(user.id));
      },

      setToken: (token) => {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        set({ token });
      },

      updateUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        import('react-onesignal').then(({ default: OneSignal }) => {
          OneSignal.User.removeTag('userId').catch(() => {});
        });
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