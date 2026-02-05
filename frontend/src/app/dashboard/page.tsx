'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useBookings } from '@/hooks/useBookings';
import { useProviderAnalytics, useSellerAnalytics } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/utils/currency';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ShoppingBagIcon,
  CalendarIcon,
  UserIcon,
  CubeIcon,
  ScissorsIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ArrowRightIcon,
  ClockIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HeartIcon,
  BoltIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import { useFavoritesCount } from '@/hooks/useFavorites';
import { useRouter } from 'next/navigation';

const normalizeRole = (role?: string) => {
  switch ((role || '').toUpperCase()) {
    case 'ADMIN':
    case 'VENDEUSE':
    case 'COIFFEUSE':
    case 'MANICURISTE':
    case 'CLIENT':
      return role!.toUpperCase();
    default:
      return 'CLIENT';
  }
};

const getDashboardPath = (role?: string) => {
  switch (normalizeRole(role)) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'VENDEUSE':
      return '/dashboard/products';
    case 'COIFFEUSE':
    case 'MANICURISTE':
      return '/dashboard/services';
    default:
      return '/dashboard';
  }
};

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: orders = [] } = useOrders(false, user?.role === 'VENDEUSE');
  const isProvider = user?.role === 'COIFFEUSE' || user?.role === 'MANICURISTE';
  const isSeller = user?.role === 'VENDEUSE';
  const isClient = user?.role === 'CLIENT';
  const { data: favoritesCount } = useFavoritesCount();
  const { data: bookings = [] } = useBookings(isProvider);

  useEffect(() => {
    if (!user?.role) return;
    const target = getDashboardPath(user.role);
    if (target !== '/dashboard') {
      router.replace(target);
    }
  }, [user?.role, router]);

  // Analytics backend (seulement pour les rôles appropriés)
  const { data: providerAnalytics, isLoading: loadingProviderAnalytics } =
    useProviderAnalytics({
      enabled: isProvider || user?.role === 'ADMIN',
    });
  const { data: sellerAnalytics, isLoading: loadingSellerAnalytics } =
    useSellerAnalytics({
      enabled: isSeller || user?.role === 'ADMIN',
    });

  // Stats générales (pour les clients et fallback)
  const pendingOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'PROCESSING',
  ).length;
  const completedOrders = orders.filter(
    (o) => o.status === 'DELIVERED' || o.status === 'SHIPPED',
  ).length;

  // Prochains rendez-vous aujourd'hui (pour coiffeuse)
  const todayBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.date);
    return isToday(bookingDate);
  });
  const upcomingTodayBookings = todayBookings
    .filter((b) => b.status !== 'CANCELLED')
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header compact */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Bonjour {user?.profile?.firstName || 'Utilisateur'} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {user?.role === 'CLIENT' && 'Bienvenue sur votre espace'}
              {user?.role === 'COIFFEUSE' && '💇‍♀️ Espace Coiffeuse'}
              {user?.role === 'MANICURISTE' && '💅 Espace Manicuriste'}
              {user?.role === 'VENDEUSE' && '🛍️ Espace Vendeuse'}
              {user?.role === 'ADMIN' && '👑 Administration'}
            </p>
          </div>
          <div className="sm:hidden">
            <NotificationsPanel />
          </div>
        </div>

        {/* Admin Banner */}
        {user?.role === 'ADMIN' && (
          <Link
            href="/dashboard/admin"
            className="block mb-6 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white shadow-lg active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">Panneau Admin</p>
                <p className="text-sm text-white/80">Gérer la plateforme</p>
              </div>
              <ArrowRightIcon className="h-6 w-6" />
            </div>
          </Link>
        )}

        {/* ============ SECTION COIFFEUSE/MANICURISTE AVEC ANALYTICS BACKEND ============ */}
        {(user?.role === 'COIFFEUSE' || user?.role === 'MANICURISTE') && (
          <>
            {/* Stats améliorées depuis le backend */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Aujourd'hui */}
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 shadow-md text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {loadingProviderAnalytics
                        ? '...'
                        : providerAnalytics?.bookings.todayCount || 0}
                    </p>
                    <p className="text-xs text-white/80">Aujourd'hui</p>
                  </div>
                </div>
              </div>

              {/* En attente - avec alerte si > 0 */}
              <div
                className={`rounded-2xl p-4 shadow-sm border ${
                  (providerAnalytics?.bookings.pending || 0) > 0
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      (providerAnalytics?.bookings.pending || 0) > 0
                        ? 'bg-yellow-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <ExclamationCircleIcon
                      className={`h-5 w-5 ${
                        (providerAnalytics?.bookings.pending || 0) > 0
                          ? 'text-yellow-600'
                          : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-bold ${
                        (providerAnalytics?.bookings.pending || 0) > 0
                          ? 'text-yellow-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {loadingProviderAnalytics
                        ? '...'
                        : providerAnalytics?.bookings.pending || 0}
                    </p>
                    <p className="text-xs text-gray-500">À confirmer</p>
                  </div>
                </div>
              </div>

              {/* Cette semaine */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {loadingProviderAnalytics
                        ? '...'
                        : providerAnalytics?.bookings.weekCount || 0}
                    </p>
                    <p className="text-xs text-gray-500">Cette semaine</p>
                  </div>
                </div>
              </div>

              {/* Note moyenne */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <StarIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {loadingProviderAnalytics
                        ? '...'
                        : providerAnalytics?.services.averageRating
                          ? providerAnalytics.services.averageRating.toFixed(1)
                          : '-'}
                    </p>
                    <p className="text-xs text-gray-500">Note moyenne</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenus du mois - Depuis le backend */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 mb-6 shadow-md text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Revenus ce mois</p>
                  <p className="text-2xl font-bold">
                    {loadingProviderAnalytics
                      ? '...'
                      : formatCurrency(
                          providerAnalytics?.revenue.thisMonth || 0,
                          'XOF',
                        )}
                  </p>
                  {/* Indicateur de croissance */}
                  {providerAnalytics &&
                    providerAnalytics.revenue.growth !== 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {providerAnalytics.revenue.growth > 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-200" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-red-200" />
                        )}
                        <span
                          className={`text-xs ${providerAnalytics.revenue.growth > 0 ? 'text-green-200' : 'text-red-200'}`}
                        >
                          {providerAnalytics.revenue.growth > 0 ? '+' : ''}
                          {providerAnalytics.revenue.growth}% vs mois dernier
                        </span>
                      </div>
                    )}
                </div>
                <Link
                  href="/dashboard/analytics"
                  className="px-3 py-1.5 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  Voir détails
                </Link>
              </div>
            </div>

            {/* Rendez-vous aujourd'hui */}
            {todayBookings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-purple-50">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-purple-600" />
                    Mes rendez-vous aujourd'hui
                  </h2>
                  <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {todayBookings.length} RDV
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {upcomingTodayBookings.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/dashboard/bookings/${booking.id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${
                            booking.status === 'CONFIRMED'
                              ? 'bg-green-100'
                              : booking.status === 'PENDING'
                                ? 'bg-yellow-100'
                                : 'bg-gray-100'
                          }`}
                        >
                          {booking.status === 'CONFIRMED' ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <ClockIcon className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {format(new Date(booking.startTime), 'HH:mm', {
                              locale: fr,
                            })}
                            <span className="text-gray-400 mx-1">•</span>
                            {booking.clientName ||
                              booking.user?.profile?.firstName ||
                              'Client'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.service?.name || 'Service'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {booking.status === 'CONFIRMED'
                          ? 'Confirmé'
                          : booking.status === 'PENDING'
                            ? 'En attente'
                            : booking.status}
                      </span>
                    </Link>
                  ))}
                </div>
                {todayBookings.length > 3 && (
                  <Link
                    href="/dashboard/bookings"
                    className="block text-center py-3 text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors border-t border-gray-100"
                  >
                    Voir tous les rendez-vous →
                  </Link>
                )}
              </div>
            )}

            {/* Message si pas de RDV aujourd'hui */}
            {todayBookings.length === 0 && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-center">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun rendez-vous aujourd'hui</p>
                <p className="text-xs text-gray-400 mt-1">
                  Profitez-en pour mettre à jour vos services !
                </p>
              </div>
            )}

            {/* Actions rapides avec badges */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Actions rapides
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/dashboard/bookings"
                  className="relative flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  {(providerAnalytics?.bookings.pending || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {providerAnalytics?.bookings.pending}
                    </span>
                  )}
                  <CalendarIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-semibold">Réservations</span>
                </Link>

                <Link
                  href="/dashboard/services"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  <ScissorsIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-semibold">Mes Services</span>
                </Link>

                <Link
                  href="/dashboard/chat"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  <ChatBubbleLeftRightIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-semibold text-center">
                    Messages
                  </span>
                </Link>

                <Link
                  href="/dashboard/quick-replies"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  <BoltIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-semibold text-center">
                    Réponses rapides
                  </span>
                </Link>
              </div>
            </div>

            {/* Top Services - Services les plus demandés */}
            {providerAnalytics?.services.topServices &&
              providerAnalytics.services.topServices.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                      <ChartBarIcon className="h-5 w-5 text-pink-600" />
                      Services populaires
                    </h2>
                    <Link
                      href="/dashboard/analytics"
                      className="text-xs text-pink-600 font-medium"
                    >
                      Voir plus →
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {providerAnalytics.services.topServices
                      .slice(0, 3)
                      .map((service, index) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between p-4"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : index === 1
                                    ? 'bg-gray-100 text-gray-600'
                                    : 'bg-orange-100 text-orange-600'
                              }`}
                            >
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {service.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {service.bookingsCount} réservation(s)
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-green-600">
                            {formatCurrency(service.revenue, 'XOF')}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </>
        )}

        {/* ============ SECTION CLIENT ============ */}
        {user?.role === 'CLIENT' && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 bg-pink-100 rounded-xl mb-2">
                    <ShoppingBagIcon className="h-5 w-5 text-pink-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.length}
                  </p>
                  <p className="text-[10px] text-gray-500">Commandes</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 bg-purple-100 rounded-xl mb-2">
                    <CalendarIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookings.length}
                  </p>
                  <p className="text-[10px] text-gray-500">RDV</p>
                </div>
              </div>
              <Link
                href="/dashboard/favorites"
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-red-200 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 bg-red-100 rounded-xl mb-2">
                    <HeartIcon className="h-5 w-5 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {favoritesCount?.total || 0}
                  </p>
                  <p className="text-[10px] text-gray-500">Favoris</p>
                </div>
              </Link>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Actions rapides
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/dashboard/orders"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  <ShoppingBagIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-semibold">Mes Commandes</span>
                </Link>
                <Link
                  href="/dashboard/bookings"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  <CalendarIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-semibold">Réservations</span>
                </Link>
                <Link
                  href="/dashboard/favorites"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  <HeartIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-semibold">Mes Favoris</span>
                </Link>
                <Link
                  href="/dashboard/addresses"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  <MapPinIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-semibold">Mes Adresses</span>
                </Link>
              </div>
            </div>
          </>
        )}

        {/* ============ SECTION VENDEUSE AVEC ANALYTICS BACKEND ============ */}
        {user?.role === 'VENDEUSE' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-xl">
                    <ShoppingBagIcon className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {loadingSellerAnalytics
                        ? '...'
                        : sellerAnalytics?.orders.total || 0}
                    </p>
                    <p className="text-xs text-gray-500">Commandes</p>
                  </div>
                </div>
              </div>
              <div
                className={`rounded-2xl p-4 shadow-sm border ${
                  (sellerAnalytics?.orders.pending || 0) > 0
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      (sellerAnalytics?.orders.pending || 0) > 0
                        ? 'bg-yellow-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <ExclamationCircleIcon
                      className={`h-5 w-5 ${
                        (sellerAnalytics?.orders.pending || 0) > 0
                          ? 'text-yellow-600'
                          : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-bold ${
                        (sellerAnalytics?.orders.pending || 0) > 0
                          ? 'text-yellow-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {loadingSellerAnalytics
                        ? '...'
                        : sellerAnalytics?.orders.pending || 0}
                    </p>
                    <p className="text-xs text-gray-500">En attente</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {loadingSellerAnalytics
                        ? '...'
                        : sellerAnalytics?.orders.delivered || 0}
                    </p>
                    <p className="text-xs text-gray-500">Livrées</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <CubeIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {loadingSellerAnalytics
                        ? '...'
                        : sellerAnalytics?.products.total || 0}
                    </p>
                    <p className="text-xs text-gray-500">Produits</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenus du mois - Vendeuse */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 mb-6 shadow-md text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Revenus ce mois</p>
                  <p className="text-2xl font-bold">
                    {loadingSellerAnalytics
                      ? '...'
                      : formatCurrency(
                          sellerAnalytics?.revenue.thisMonth || 0,
                          'XOF',
                        )}
                  </p>
                  {sellerAnalytics && sellerAnalytics.revenue.growth !== 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {sellerAnalytics.revenue.growth > 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-200" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-200" />
                      )}
                      <span
                        className={`text-xs ${sellerAnalytics.revenue.growth > 0 ? 'text-green-200' : 'text-red-200'}`}
                      >
                        {sellerAnalytics.revenue.growth > 0 ? '+' : ''}
                        {sellerAnalytics.revenue.growth}% vs mois dernier
                      </span>
                    </div>
                  )}
                </div>
                <Link
                  href="/dashboard/analytics"
                  className="px-3 py-1.5 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  Voir détails
                </Link>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Actions rapides
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/dashboard/orders"
                  className="relative flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  {(sellerAnalytics?.orders.pending || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {sellerAnalytics?.orders.pending}
                    </span>
                  )}
                  <ShoppingBagIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-semibold">Commandes</span>
                </Link>
                <Link
                  href="/dashboard/products"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  <CubeIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-semibold">Mes Produits</span>
                </Link>
              </div>
            </div>

            {/* Alerte Stock Bas */}
            {sellerAnalytics &&
              (sellerAnalytics.products.lowStock > 0 ||
                sellerAnalytics.products.outOfStock > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-red-900">Alerte stock</p>
                      <p className="text-sm text-red-600">
                        {sellerAnalytics.products.outOfStock > 0 && (
                          <span>
                            {sellerAnalytics.products.outOfStock} rupture(s)
                          </span>
                        )}
                        {sellerAnalytics.products.outOfStock > 0 &&
                          sellerAnalytics.products.lowStock > 0 &&
                          ' • '}
                        {sellerAnalytics.products.lowStock > 0 && (
                          <span>
                            {sellerAnalytics.products.lowStock} stock bas
                          </span>
                        )}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/products"
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg"
                    >
                      Gérer
                    </Link>
                  </div>
                </div>
              )}

            {/* Top Produits - Produits les plus vendus */}
            {sellerAnalytics?.products.topProducts &&
              sellerAnalytics.products.topProducts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                      <ChartBarIcon className="h-5 w-5 text-blue-600" />
                      Produits populaires
                    </h2>
                    <Link
                      href="/dashboard/analytics"
                      className="text-xs text-blue-600 font-medium"
                    >
                      Voir plus →
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {sellerAnalytics.products.topProducts
                      .slice(0, 3)
                      .map((product, index) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-4"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : index === 1
                                    ? 'bg-gray-100 text-gray-600'
                                    : 'bg-orange-100 text-orange-600'
                              }`}
                            >
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {product.salesCount} vendu(s)
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-green-600">
                            {formatCurrency(product.revenue, 'XOF')}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </>
        )}

        {/* Menu commun - Grille 2x2 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Menu</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Profil */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-all touch-manipulation"
            >
              <div className="p-2.5 bg-gray-100 rounded-xl">
                <UserIcon className="h-5 w-5 text-gray-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">Profil</p>
                <p className="text-[10px] text-gray-500 truncate">Mes infos</p>
              </div>
            </Link>

            {/* Messages */}
            {user?.role !== 'ADMIN' && (
              <Link
                href="/dashboard/chat"
                className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-all touch-manipulation"
              >
                <div className="p-2.5 bg-blue-100 rounded-xl">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    Messages
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    Discussions
                  </p>
                </div>
              </Link>
            )}

            {/* Stats */}
            {(user?.role === 'VENDEUSE' ||
              user?.role === 'COIFFEUSE' ||
              user?.role === 'MANICURISTE') && (
              <Link
                href="/dashboard/analytics"
                className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-all touch-manipulation"
              >
                <div className="p-2.5 bg-green-100 rounded-xl">
                  <ChartBarIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">Stats</p>
                  <p className="text-[10px] text-gray-500 truncate">
                    Performances
                  </p>
                </div>
              </Link>
            )}

            {/* Avis */}
            {(user?.role === 'COIFFEUSE' || user?.role === 'MANICURISTE') && (
              <Link
                href="/dashboard/reviews"
                className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-all touch-manipulation"
              >
                <div className="p-2.5 bg-yellow-100 rounded-xl">
                  <StarIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">Avis</p>
                  <p className="text-[10px] text-gray-500 truncate">
                    Mes évaluations
                  </p>
                </div>
              </Link>
            )}
          </div>
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
