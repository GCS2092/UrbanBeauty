import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AUTH_TOKEN_KEY } from '../utils/constants';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        set({ user, token, isAuthenticated: true });
      },

      setToken: (token) => {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        set({ token });
      },

      updateUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
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