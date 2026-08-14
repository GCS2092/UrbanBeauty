import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Home, ShoppingBag, Sparkles } from 'lucide-react';
import '../../components/shop/home/hero.css';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caracteres'),
});

export default function Login() {
  const { login } = useAuth();
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

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-rose-50 via-stone-50 to-amber-50 overflow-hidden flex flex-col">

      <div className="absolute top-10 right-10 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl pointer-events-none blob-breathe-a" />
      <div className="absolute bottom-20 left-0 w-48 h-48 bg-amber-200/30 rounded-full blur-2xl pointer-events-none blob-breathe-b" />

      <header className="relative z-10 sticky top-0 bg-white/85 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="SonShop" className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight text-stone-900">
              Son<span className="text-rose-400">Shop</span>
            </span>
          </Link>
          <Link to="/products" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors">
            <ShoppingBag size={15} /> Boutique
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Sparkles size={12} /> Content de vous revoir
            </span>
            <h1 className="text-2xl font-semibold text-stone-900">Bon retour !</h1>
            <p className="text-stone-500 text-sm mt-1">Connectez-vous a votre compte</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-lg shadow-rose-200/30 p-6 space-y-4">

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
              placeholder="********"
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
          </div>

          <p className="text-center text-sm text-stone-400 mt-4">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-rose-500 hover:text-rose-600 font-medium">
              Creer un compte
            </Link>
          </p>
        </div>
      </div>

      <nav className="relative z-10 md:hidden bg-white border-t border-stone-100 py-2.5 flex justify-around items-center">
        <Link to="/" className="flex flex-col items-center gap-1 text-[10px] text-stone-400">
          <Home size={18} />
          Accueil
        </Link>
        <Link to="/products" className="flex flex-col items-center gap-1 text-[10px] text-stone-400">
          <ShoppingBag size={18} />
          Boutique
        </Link>
        <Link to="/register" className="flex flex-col items-center gap-1 text-[10px] text-rose-600 font-bold">
          <Sparkles size={18} />
          Creer un compte
        </Link>
      </nav>
    </div>
  );
}
