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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Administration
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Bienvenue {user?.profile?.firstName || 'Admin'} ! Gérez votre plateforme UrbanBeauty
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.name}
                href={stat.href}
                className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group active:scale-[0.98]"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-2 sm:p-3 rounded-lg group-hover:scale-110 transition-transform shrink-0`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Sections principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Gestion Utilisateurs */}
          <Link
            href="/dashboard/admin/users"
            className="bg-white rounded-xl shadow-sm p-5 sm:p-6 hover:shadow-lg transition-all duration-200 active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 sm:p-4 rounded-xl group-hover:scale-110 transition-transform">
                <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Gestion des Utilisateurs</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Créer, modifier, bloquer des comptes</p>
              </div>
            </div>
          </Link>

          {/* Analytics */}
          <Link
            href="/dashboard/admin/analytics"
            className="bg-white rounded-xl shadow-sm p-5 sm:p-6 hover:shadow-lg transition-all duration-200 active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 sm:p-4 rounded-xl group-hover:scale-110 transition-transform">
                <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Statistiques & Analytics</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Vue d'ensemble de la plateforme</p>
              </div>
            </div>
          </Link>

          {/* Gestion des Avis */}
          <Link
            href="/dashboard/admin/reviews"
            className="bg-white rounded-xl shadow-sm p-5 sm:p-6 hover:shadow-lg transition-all duration-200 active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-3 sm:p-4 rounded-xl group-hover:scale-110 transition-transform">
                <ChatBubbleLeftRightIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Modération des Avis</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Gérer et modérer les avis</p>
              </div>
            </div>
          </Link>

          {/* Gestion des Notifications */}
          <Link
            href="/dashboard/admin/notifications"
            className="bg-white rounded-xl shadow-sm p-5 sm:p-6 hover:shadow-lg transition-all duration-200 active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 sm:p-4 rounded-xl group-hover:scale-110 transition-transform">
                <BellIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Notifications</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Envoyer des notifications</p>
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

