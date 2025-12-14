'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeftIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  PhoneIcon 
} from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const { register, isRegistering, registerError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [error, setError] = useState('');

  // Détecter la page de redirection depuis l'URL ou le referrer
  const getRedirectTo = () => {
    // Priorité 1: paramètre redirectTo dans l'URL
    const redirectParam = searchParams.get('redirectTo');
    if (redirectParam) {
      return redirectParam;
    }
    
    // Priorité 2: vérifier le referrer (page d'où vient l'utilisateur)
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      if (referrer && (referrer.includes('/checkout') || referrer.includes('/cart'))) {
        return '/checkout';
      }
    }
    
    // Par défaut: dashboard
    return '/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const redirectTo = getRedirectTo();
      register(formData, {
        redirectTo, // Passer la destination de redirection
        onError: (err: any) => {
          setError(err?.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
        },
      });
    } catch (err) {
      setError('Une erreur est survenue');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-4 flex items-center">
          <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="ml-3 text-lg font-semibold text-gray-900">Inscription</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="max-w-sm w-full mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Créer un compte</h2>
            <p className="text-sm text-gray-500 mt-1">Rejoignez UrbanBeauty</p>
          </div>

          {/* Error */}
          {(error || registerError) && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
              {error || (registerError as any)?.response?.data?.message || 'Une erreur est survenue'}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Prénom
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 text-gray-900 text-sm"
                    placeholder="Prénom"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 text-gray-900 text-sm"
                  placeholder="Nom"
                />
              </div>
            </div>

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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Téléphone <span className="text-gray-400">(optionnel)</span>
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 text-gray-900"
                  placeholder="+33 6 12 34 56 78"
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
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 text-gray-900"
                  placeholder="6 caractères minimum"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full bg-black text-white py-3.5 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isRegistering ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-gray-400 text-center mt-4">
            En vous inscrivant, vous acceptez nos{' '}
            <Link href="/terms" className="underline">CGU</Link> et{' '}
            <Link href="/privacy" className="underline">Politique de confidentialité</Link>
          </p>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-xs text-gray-400">ou</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?
            </p>
            <Link 
              href="/auth/login" 
              className="mt-2 inline-block w-full py-3.5 border border-gray-200 rounded-full text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
