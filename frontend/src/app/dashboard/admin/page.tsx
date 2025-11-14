'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import {
  ShoppingBagIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  TagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

function AdminDashboardContent() {
  const { user } = useAuth();

  const stats = [
    { name: 'Produits', value: '16', icon: ShoppingBagIcon, href: '/dashboard/admin/products', color: 'bg-pink-500' },
    { name: 'Services', value: '6', icon: SparklesIcon, href: '/dashboard/admin/services', color: 'bg-purple-500' },
    { name: 'Utilisateurs', value: '5', icon: UserGroupIcon, href: '/dashboard/admin/users', color: 'bg-blue-500' },
    { name: 'Commandes', value: '0', icon: ShoppingBagIcon, href: '/dashboard/admin/orders', color: 'bg-green-500' },
    { name: 'Réservations', value: '0', icon: CalendarIcon, href: '/dashboard/admin/bookings', color: 'bg-yellow-500' },
    { name: 'Catégories', value: '4', icon: TagIcon, href: '/dashboard/admin/categories', color: 'bg-indigo-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Administration
          </h1>
          <p className="text-gray-600">
            Bienvenue {user?.profile?.firstName || 'Admin'} ! Gérez votre plateforme UrbanBeauty
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/admin/products/new"
              className="flex items-center justify-center px-4 py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
            >
              + Nouveau produit
            </Link>
            <Link
              href="/dashboard/admin/services/new"
              className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              + Nouveau service
            </Link>
            <Link
              href="/dashboard/admin/categories/new"
              className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              + Nouvelle catégorie
            </Link>
            <Link
              href="/dashboard/admin/analytics"
              className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Statistiques
            </Link>
          </div>
        </div>

        {/* Sections de gestion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gestion Produits */}
          <Link
            href="/dashboard/admin/products"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <ShoppingBagIcon className="h-8 w-8 text-pink-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Gestion Produits</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gérez tous les produits de la plateforme : ajouter, modifier, supprimer, gérer le stock.
            </p>
            <span className="text-pink-600 font-medium">Gérer les produits →</span>
          </Link>

          {/* Gestion Services */}
          <Link
            href="/dashboard/admin/services"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <SparklesIcon className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Gestion Services</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gérez tous les services de coiffure : ajouter, modifier, supprimer, gérer les disponibilités.
            </p>
            <span className="text-purple-600 font-medium">Gérer les services →</span>
          </Link>

          {/* Gestion Utilisateurs */}
          <Link
            href="/dashboard/admin/users"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Gestion Utilisateurs</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gérez tous les utilisateurs : clients, coiffeuses, vendeuses. Modifier les rôles et permissions.
            </p>
            <span className="text-blue-600 font-medium">Gérer les utilisateurs →</span>
          </Link>

          {/* Gestion Commandes */}
          <Link
            href="/dashboard/admin/orders"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <ShoppingBagIcon className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Gestion Commandes</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Suivez toutes les commandes : statut, livraison, remboursements.
            </p>
            <span className="text-green-600 font-medium">Voir les commandes →</span>
          </Link>

          {/* Gestion Réservations */}
          <Link
            href="/dashboard/admin/bookings"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <CalendarIcon className="h-8 w-8 text-yellow-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Gestion Réservations</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gérez toutes les réservations de services : confirmer, annuler, modifier.
            </p>
            <span className="text-yellow-600 font-medium">Voir les réservations →</span>
          </Link>

          {/* Gestion Catégories */}
          <Link
            href="/dashboard/admin/categories"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <TagIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Gestion Catégories</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gérez les catégories de produits et services : créer, modifier, organiser.
            </p>
            <span className="text-indigo-600 font-medium">Gérer les catégories →</span>
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

