'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon, ChartBarIcon } from '@heroicons/react/24/outline';

function AdminAnalyticsContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour à l'administration
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Statistiques & Analytics</h1>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produits totaux</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">16</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-pink-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services actifs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">6</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commandes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Graphiques (à implémenter) */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Évolution des ventes</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Graphiques à implémenter avec une bibliothèque de graphiques (Chart.js, Recharts, etc.)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminAnalyticsContent />
    </ProtectedRoute>
  );
}

