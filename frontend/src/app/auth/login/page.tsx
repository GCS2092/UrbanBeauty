'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeftIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    login(formData, {
      onSuccess: () => {
        // La redirection est gérée par useAuth
      },
      onError: (err: any) => {
        setError(err?.response?.data?.message || 'Email ou mot de passe incorrect');
      },
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-4 flex items-center">
          <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="ml-3 text-lg font-semibold text-gray-900">Connexion</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="max-w-sm w-full mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Bon retour !</h2>
            <p className="text-sm text-gray-500 mt-1">Connectez-vous à votre compte</p>
          </div>

          {/* Error */}
          {(error || loginError) && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
              {error || (loginError as any)?.response?.data?.message || 'Email ou mot de passe incorrect'}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 text-gray-900"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-black text-white py-3.5 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoggingIn ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-xs text-gray-400">ou</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Register link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?
            </p>
            <Link 
              href="/auth/register" 
              className="mt-2 inline-block w-full py-3.5 border border-gray-200 rounded-full text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
