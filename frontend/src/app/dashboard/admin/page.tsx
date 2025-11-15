'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  ScissorsIcon,
  TagIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useUsers } from '@/hooks/useUsers';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useServices } from '@/hooks/useServices';
import { useBookings } from '@/hooks/useBookings';

function AdminDashboardContent() {
  const { user } = useAuth();
  const { data: users = [] } = useUsers();
  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts();
  const { data: services = [] } = useServices();
  const { data: bookings = [] } = useBookings();

  const stats = [
    { name: 'Utilisateurs', value: users.length.toString(), icon: UserGroupIcon, href: '/dashboard/admin/users', color: 'bg-blue-500' },
    { name: 'Commandes', value: orders.length.toString(), icon: ShoppingBagIcon, href: '/dashboard/admin/orders', color: 'bg-green-500' },
    { name: 'Produits', value: products.length.toString(), icon: ShoppingBagIcon, href: '/dashboard/admin/products', color: 'bg-purple-500' },
    { name: 'Services', value: services.length.toString(), icon: ScissorsIcon, href: '/dashboard/admin/services', color: 'bg-pink-500' },
    { name: 'Réservations', value: bookings.length.toString(), icon: CalendarIcon, href: '/dashboard/admin/bookings', color: 'bg-yellow-500' },
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

        {/* Sections principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gestion Utilisateurs */}
          <Link
            href="/dashboard/admin/users"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <UserGroupIcon className="h-12 w-12 text-blue-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Gestion des Utilisateurs</h3>
                <p className="text-sm text-gray-600">Créer, modifier, bloquer des comptes</p>
              </div>
            </div>
          </Link>

          {/* Analytics */}
          <Link
            href="/dashboard/admin/analytics"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <ChartBarIcon className="h-12 w-12 text-purple-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Statistiques & Analytics</h3>
                <p className="text-sm text-gray-600">Vue d'ensemble de la plateforme</p>
              </div>
            </div>
          </Link>

          {/* Gestion des Avis */}
          <Link
            href="/dashboard/admin/reviews"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-pink-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Modération des Avis</h3>
                <p className="text-sm text-gray-600">Gérer et modérer les avis</p>
              </div>
            </div>
          </Link>

          {/* Gestion des Notifications */}
          <Link
            href="/dashboard/admin/notifications"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <BellIcon className="h-12 w-12 text-yellow-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">Envoyer des notifications</p>
              </div>
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

