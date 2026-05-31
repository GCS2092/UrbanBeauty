import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

export default function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try { await login(data); } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🌸</span>
            <span className="font-bold text-2xl text-stone-800">
              Urban<span className="text-rose-400">Beauty</span>
            </span>
          </Link>
          <h1 className="text-2xl font-semibold text-stone-800">Bon retour !</h1>
          <p className="text-stone-400 text-sm mt-1">Connectez-vous à votre compte</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
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
        </div>

        <p className="text-center text-sm text-stone-400 mt-4">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-rose-500 hover:text-rose-600 font-medium">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
