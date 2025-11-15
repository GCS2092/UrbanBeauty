'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import {
  UserGroupIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

function AdminDashboardContent() {
  const { user } = useAuth();

  const stats = [
    { name: 'Utilisateurs', value: '5', icon: UserGroupIcon, href: '/dashboard/admin/users', color: 'bg-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
            Administration
          </h1>
          <p className="text-gray-600">
            Bienvenue {user?.profile?.firstName || 'Admin'} ! Gérez votre plateforme UrbanBeauty
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.name}
                href={stat.href}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Section principale - Gestion Utilisateurs */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <Link
            href="/dashboard/admin/users"
            className="block hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
              <UserGroupIcon className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mr-0 sm:mr-4 mb-2 sm:mb-0" />
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Gestion des Utilisateurs</h3>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Gérez tous les utilisateurs de la plateforme : modifier les rôles, créer, supprimer ou bloquer des comptes.
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Modifier les rôles
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-green-600" />
                  Créer des utilisateurs
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">🚫</span>
                  Bloquer/Débloquer
                </div>
              </div>
              <span className="text-blue-600 font-semibold text-lg">Gérer →</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

