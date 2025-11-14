'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

function DashboardContent() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Bienvenue {user?.profile?.firstName || 'Utilisateur'} !
        </h1>
        <p className="text-gray-600 mb-8">Rôle : {user?.role}</p>

        {user?.role === 'ADMIN' && (
          <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <Link
              href="/dashboard/admin"
              className="flex items-center justify-between group"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Panneau d'administration</h3>
                <p className="text-sm text-gray-600">Accédez à toutes les fonctionnalités d'administration</p>
              </div>
              <span className="text-purple-600 group-hover:text-purple-700 font-medium">
                Accéder →
              </span>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mes Commandes */}
          <Link
            href="/dashboard/orders"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Mes Commandes</h2>
            <p className="text-gray-600">Suivez vos commandes</p>
          </Link>

          {/* Mes Réservations */}
          <Link
            href="/dashboard/bookings"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Mes Réservations</h2>
            <p className="text-gray-600">Gérez vos rendez-vous</p>
          </Link>

          {/* Mon Profil */}
          <Link
            href="/dashboard/profile"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Mon Profil</h2>
            <p className="text-gray-600">Modifiez vos informations</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

