import { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { authApi } from '../api/auth.api';
import { ANONYMOUS_CART_KEY } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user, token, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();
  const { fetchCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchCart(user.id);
    }
  }, [isAuthenticated]);

  const login = async (credentials) => {
    try {
      const { data } = await authApi.login(credentials);
      const anonymousId = localStorage.getItem(ANONYMOUS_CART_KEY);
      setAuth(data.user, data.token);
      await fetchCart(data.user.id, anonymousId);
      localStorage.removeItem(ANONYMOUS_CART_KEY);
      toast.success(`Bienvenue ${data.user.firstName} !`);
      // ✅ ADMIN et STAFF redirigés vers /admin
      navigate(data.user.role === 'ADMIN' || data.user.role === 'STAFF' ? '/admin' : '/');
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Email ou mot de passe incorrect';
      toast.error(message);
      throw err; // re-throw pour que Login.jsx puisse arreter le loading
    }
  };

  const register = async (formData) => {
    try {
      await authApi.register(formData);
      toast.success('Compte cree ! Connectez-vous.');
      navigate('/login');
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Erreur lors de la creation du compte';
      toast.error(message);
      throw err;
    }
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    storeLogout();
    toast.success('A bientot !');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);