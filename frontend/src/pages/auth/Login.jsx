import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthTopBar from '../../components/layout/AuthTopBar';
import BottomNav from '../../components/layout/BottomNav';
import SocialLinks from '../../components/shared/SocialLinks';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await login(data);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Email ou mot de passe incorrect';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMsg('');
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (err) {
      setErrorMsg('Connexion Google impossible. Réessayez.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">

      <AuthTopBar />

      <div className="flex-1 flex items-center justify-center p-4 pb-20 md:pb-4">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-stone-800">Bon retour !</h1>
            <p className="text-stone-400 text-sm mt-1">Connectez-vous à votre compte</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                <p className="text-sm text-rose-600 font-medium">{errorMsg}</p>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              onClick={handleSubmit(onSubmit)}
            >
              Se connecter
            </Button>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400">ou</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Connexion Google impossible.')}
                locale="fr"
                width="320"
                text="continue_with"
              />
            </div>
          </div>

          <p className="text-center text-sm text-stone-400 mt-4">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-rose-500 hover:text-rose-600 font-medium">
              Créer un compte
            </Link>
          </p>

          <SocialLinks />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}