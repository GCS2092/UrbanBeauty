'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useBookings } from '@/hooks/useBookings';
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
} from '@heroicons/react/24/outline';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';

function DashboardContent() {
  const { user } = useAuth();
  const { data: orders = [] } = useOrders(false, user?.role === 'VENDEUSE');
  const isProvider = user?.role === 'COIFFEUSE';
  const { data: bookings = [] } = useBookings(isProvider);

  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
  const completedOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'SHIPPED').length;

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

        {/* Stats - Grille 2x2 compacte */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {user?.role === 'CLIENT' && (
            <>
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
            </>
          )}

          {user?.role === 'COIFFEUSE' && (
            <>
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
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <CalendarIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{pendingBookings}</p>
                    <p className="text-xs text-gray-500">En attente</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {user?.role === 'VENDEUSE' && (
            <>
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
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <ShoppingBagIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                    <p className="text-xs text-gray-500">En attente</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <ShoppingBagIcon className="h-5 w-5 text-green-600" />
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
                    <p className="text-2xl font-bold text-blue-600">{orders.reduce((acc, o) => acc + o.items?.length || 0, 0)}</p>
                    <p className="text-xs text-gray-500">Articles vendus</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions principales - Grille 2 colonnes */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* CLIENT */}
            {user?.role === 'CLIENT' && (
              <>
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
              </>
            )}

            {/* COIFFEUSE */}
            {user?.role === 'COIFFEUSE' && (
              <>
                <Link
                  href="/dashboard/bookings"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
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
                  <span className="text-sm font-semibold text-center">Demandes Coiffure</span>
                </Link>
                <Link
                  href="/dashboard/reviews"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
                  <StarIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-semibold">Mes Avis</span>
                </Link>
              </>
            )}

            {/* VENDEUSE */}
            {user?.role === 'VENDEUSE' && (
              <>
                <Link
                  href="/dashboard/orders"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl text-white shadow-md active:scale-[0.98] transition-transform touch-manipulation"
                >
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
              </>
            )}
          </div>
        </div>

        {/* Liens rapides - Grille alignée */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h2 className="text-lg font-bold text-gray-900 px-4 py-3 border-b border-gray-100">Menu</h2>
          <div className="divide-y divide-gray-100">
            
            {/* Profil */}
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

            {/* Messages */}
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

            {/* Analytics */}
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

}

