'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useBookings } from '@/hooks/useBookings';
import { useServices } from '@/hooks/useServices';
import { formatCurrency } from '@/utils/currency';
import { format, isToday, isThisWeek } from 'date-fns';
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
} from '@heroicons/react/24/outline';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';

function DashboardContent() {
  const { user } = useAuth();
  const { data: orders = [] } = useOrders(false, user?.role === 'VENDEUSE');
  const isProvider = user?.role === 'COIFFEUSE';
  const { data: bookings = [] } = useBookings(isProvider);
  const { data: services = [] } = useServices();

  // Stats générales
  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
  const completedOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'SHIPPED').length;

  // Stats COIFFEUSE améliorées
  const todayBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    return isToday(bookingDate);
  });
  const weekBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    return isThisWeek(bookingDate, { weekStartsOn: 1 });
  });
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
  
  // Calcul note moyenne (simulé - à remplacer par vraies données)
  const averageRating = services.length > 0 
    ? services.reduce((acc, s) => acc + (s.rating || 0), 0) / services.filter(s => s.rating).length || 0
    : 0;

  // Revenus du mois (COIFFEUSE)
  const monthRevenue = bookings
    .filter(b => b.status === 'COMPLETED' || b.status === 'CONFIRMED')
    .reduce((acc, b) => acc + (b.service?.price || 0), 0);

  // Prochains rendez-vous aujourd'hui (triés par heure)
  const upcomingTodayBookings = todayBookings
    .filter(b => b.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
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

        {/* ============ SECTION COIFFEUSE AMÉLIORÉE ============ */}
        {user?.role === 'COIFFEUSE' && (
          <>
            {/* Stats améliorées - Grille 2x2 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Aujourd'hui */}
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 shadow-md text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{todayBookings.length}</p>
                    <p className="text-xs text-white/80">Aujourd'hui</p>
                  </div>
                </div>
              </div>

              {/* En attente - avec alerte si > 0 */}
              <div className={`rounded-2xl p-4 shadow-sm border ${pendingBookings > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${pendingBookings > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    <ExclamationCircleIcon className={`h-5 w-5 ${pendingBookings > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${pendingBookings > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>{pendingBookings}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{weekBookings.length}</p>
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
                      {averageRating > 0 ? averageRating.toFixed(1) : '-'}
                    </p>
                    <p className="text-xs text-gray-500">Note moyenne</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenus du mois */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 mb-6 shadow-md text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Revenus ce mois</p>
                  <p className="text-2xl font-bold">{formatCurrency(monthRevenue, 'XOF')}</p>
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
                        <div className={`p-2 rounded-xl ${
                          booking.status === 'CONFIRMED' ? 'bg-green-100' : 
                          booking.status === 'PENDING' ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          {booking.status === 'CONFIRMED' ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <ClockIcon className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {format(new Date(booking.startTime), 'HH:mm', { locale: fr })}
                            <span className="text-gray-400 mx-1">•</span>
                            {booking.clientName || booking.user?.profile?.firstName || 'Client'}
                          </p>
                          <p className="text-xs text-gray-500">{booking.service?.name || 'Service'}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {booking.status === 'CONFIRMED' ? 'Confirmé' : 
                         booking.status === 'PENDING' ? 'En attente' : booking.status}
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
                <p className="text-xs text-gray-400 mt-1">Profitez-en pour mettre à jour vos services !</p>
              </div>
            )}

            {/* Actions rapides avec badges */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Actions rapides</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/dashboard/bookings"
                  className="relative flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  {pendingBookings > 0 && (
                    <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {pendingBookings}
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
                  href="/dashboard/hair-style-requests"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  <ScissorsIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-semibold text-center">Demandes</span>
                </Link>
                
                <Link
                  href="/dashboard/services/new"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  <PlusIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-semibold">Nouveau Service</span>
                </Link>
              </div>
            </div>
          </>
        )}

        {/* ============ SECTION CLIENT ============ */}
        {user?.role === 'CLIENT' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-xl">
                    <ShoppingBagIcon className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                    <p className="text-xs text-gray-500">Commandes</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <CalendarIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                    <p className="text-xs text-gray-500">Réservations</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Actions rapides</h2>
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
              </div>
            </div>
          </>
        )}

        {/* ============ SECTION VENDEUSE ============ */}
        {user?.role === 'VENDEUSE' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-xl">
                    <ShoppingBagIcon className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                    <p className="text-xs text-gray-500">Commandes</p>
                  </div>
                </div>
              </div>
              <div className={`rounded-2xl p-4 shadow-sm border ${pendingOrders > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${pendingOrders > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    <ExclamationCircleIcon className={`h-5 w-5 ${pendingOrders > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${pendingOrders > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>{pendingOrders}</p>
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
                    <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
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
                    <p className="text-2xl font-bold text-blue-600">{orders.reduce((acc, o) => acc + (o.items?.length || 0), 0)}</p>
                    <p className="text-xs text-gray-500">Articles</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Actions rapides</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/dashboard/orders"
                  className="relative flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  {pendingOrders > 0 && (
                    <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {pendingOrders}
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
          </>
        )}

        {/* Menu commun */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h2 className="text-lg font-bold text-gray-900 px-4 py-3 border-b border-gray-100">Menu</h2>
          <div className="divide-y divide-gray-100">
            <Link
              href="/dashboard/profile"
              className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mon Profil</p>
                  <p className="text-xs text-gray-500">Modifier mes informations</p>
                </div>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400" />
            </Link>

            {user?.role !== 'ADMIN' && (
              <Link
                href="/dashboard/chat"
                className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Messages</p>
                    <p className="text-xs text-gray-500">Discuter avec les utilisateurs</p>
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              </Link>
            )}

            {(user?.role === 'VENDEUSE' || user?.role === 'COIFFEUSE') && (
              <Link
                href="/dashboard/analytics"
                className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <ChartBarIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Statistiques</p>
                    <p className="text-xs text-gray-500">Voir mes performances</p>
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              </Link>
            )}

            {user?.role === 'COIFFEUSE' && (
              <Link
                href="/dashboard/reviews"
                className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <StarIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mes Avis</p>
                    <p className="text-xs text-gray-500">Voir et répondre aux avis</p>
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
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
