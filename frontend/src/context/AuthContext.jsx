import { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { authApi } from '../api/auth.api';
import { ANONYMOUS_CART_KEY } from '../utils/constants';
import { useNotifications } from '../hooks/useNotifications';
import OneSignal from 'react-onesignal';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user, token, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();
  const { fetchCart } = useCartStore();
  const navigate = useNavigate();

  useNotifications();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken && !isAuthenticated) {
      window.history.replaceState({}, '', window.location.pathname);
      setAuth(null, urlToken);
      authApi.me()
        .then(({ data }) => {
          setAuth(data, urlToken);
          fetchCart(data.id);
          toast.success(`Bienvenue ${data.firstName} !`);
        })
        .catch(() => {
          storeLogout();
        });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchCart(user.id);
    }
  }, [isAuthenticated]);

  // ✅ Finalise une connexion réussie : stocke l'auth, charge le panier, redirige
  const completeLogin = async (data) => {
    const anonymousId = localStorage.getItem(ANONYMOUS_CART_KEY);
    setAuth(data.user, data.token);
    await fetchCart(data.user.id, anonymousId);
    localStorage.removeItem(ANONYMOUS_CART_KEY);
    toast.success(`Bienvenue ${data.user.firstName} !`);
    const redirectPath = data.redirectPath ||
                       (data.user.role === 'SELLER' ? '/seller' :
                        data.user.role === 'ADMIN' || data.user.role === 'STAFF' ? '/admin' :
                        '/');
    navigate(redirectPath);
  };

  const login = async (credentials) => {
    try {
      const { data } = await authApi.login(credentials);

      // Cas 1 : première connexion pour ce compte → 2FA à configurer
      if (data.requiresTwoFactorSetup) {
        navigate('/2fa/setup', { state: { setupToken: data.setupToken } });
        return;
      }

      // Cas 2 : 2FA déjà active → code à saisir
      if (data.requiresTwoFactor) {
        navigate('/2fa/verify', { state: { pendingToken: data.pendingToken } });
        return;
      }

      // Cas 3 : connexion normale, sans 2FA
      await completeLogin(data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Email ou mot de passe incorrect';
      toast.error(message);
      throw err;
    }
  };

  // ✅ Connexion / inscription via Google — reçoit le "credential" (id_token) renvoyé par le bouton Google
  const loginWithGoogle = async (credential) => {
    try {
      const { data } = await authApi.google(credential);
      await completeLogin(data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Connexion Google impossible. Réessayez.';
      toast.error(message);
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      await authApi.register(formData);
      toast.success('Compte créé ! Connectez-vous.');
      navigate('/login');
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Erreur lors de la création du compte';
      toast.error(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await OneSignal.logout();
    } catch {}
    try { await authApi.logout(); } catch {}
    storeLogout();
    toast.success('À bientôt !');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, loginWithGoogle, register, logout, completeLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);