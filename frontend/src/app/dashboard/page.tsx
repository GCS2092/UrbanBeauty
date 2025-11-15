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
  BellIcon,
} from '@heroicons/react/24/outline';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import OrdersChart from '@/components/charts/OrdersChart';

function DashboardContent() {
  const { user } = useAuth();
  // Pour les vendeuses, récupérer seulement leurs commandes (celles contenant leurs produits)
  const { data: orders = [] } = useOrders(false, user?.role === 'VENDEUSE');
  const isProvider = user?.role === 'COIFFEUSE';
  const { data: bookings = [] } = useBookings(isProvider);

  // Filtrer les commandes en attente pour les vendeuses (celles contenant leurs produits)
  // Pour les vendeuses, le backend retourne déjà les commandes filtrées, donc on compte directement
  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Bienvenue {user?.profile?.firstName || 'Utilisateur'} !
            </h1>
            <p className="text-gray-600">Rôle : {user?.role}</p>
          </div>
          <div className="sm:hidden">
            <NotificationsPanel />
          </div>
        </div>

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

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {user?.role === 'CLIENT' && (
            <>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Commandes</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                  <ShoppingBagIcon className="h-8 w-8 text-pink-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Réservations</p>
                    <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-pink-600" />
                </div>
              </div>
            </>
          )}

          {user?.role === 'COIFFEUSE' && (
            <>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Réservations</p>
                    <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-pink-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingBookings}</p>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </>
          )}

          {user?.role === 'VENDEUSE' && (
            <>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Commandes</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                  <ShoppingBagIcon className="h-8 w-8 text-pink-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                  </div>
                  <ShoppingBagIcon className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Complétées</p>
                    <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'DELIVERED' || o.status === 'SHIPPED').length}</p>
                  </div>
                  <ShoppingBagIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mes Commandes - CLIENT seulement */}
          {user?.role === 'CLIENT' && (
            <Link
              href="/dashboard/orders"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <ShoppingBagIcon className="h-8 w-8 text-pink-600 mb-3" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Mes Commandes</h2>
              <p className="text-gray-600">Suivez vos commandes</p>
            </Link>
          )}

          {/* Commandes Vendeuse */}
          {user?.role === 'VENDEUSE' && (
            <Link
              href="/dashboard/orders"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <ShoppingBagIcon className="h-8 w-8 text-pink-600 mb-3" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Commandes Reçues</h2>
              <p className="text-gray-600">Gérez les commandes de vos produits</p>
            </Link>
          )}

          {/* Mes Réservations */}
          {(user?.role === 'CLIENT' || user?.role === 'COIFFEUSE') && (
            <Link
              href="/dashboard/bookings"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <CalendarIcon className="h-8 w-8 text-pink-600 mb-3" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {user?.role === 'COIFFEUSE' ? 'Mes Réservations Reçues' : 'Mes Réservations'}
              </h2>
              <p className="text-gray-600">
                {user?.role === 'COIFFEUSE' ? 'Gérez les réservations de vos services' : 'Gérez vos rendez-vous'}
              </p>
            </Link>
          )}

          {/* Mes Produits (VENDEUSE) */}
          {user?.role === 'VENDEUSE' && (
            <Link
              href="/dashboard/products"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <CubeIcon className="h-8 w-8 text-pink-600 mb-3" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Mes Produits</h2>
              <p className="text-gray-600">Gérez votre catalogue</p>
            </Link>
          )}

          {/* Mes Services (COIFFEUSE) */}
          {user?.role === 'COIFFEUSE' && (
            <Link
              href="/dashboard/services"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <ScissorsIcon className="h-8 w-8 text-pink-600 mb-3" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Mes Services</h2>
              <p className="text-gray-600">Gérez vos services</p>
            </Link>
          )}

          {/* Mon Profil */}
          <Link
            href="/dashboard/profile"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <UserIcon className="h-8 w-8 text-pink-600 mb-3" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Mon Profil</h2>
            <p className="text-gray-600">Modifiez vos informations</p>
          </Link>

          {/* Messages - Masquer pour les admins */}
          {user?.role !== 'ADMIN' && (
            <Link
              href="/dashboard/chat"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-pink-600 mb-3" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Messages</h2>
              <p className="text-gray-600">Discutez avec les autres utilisateurs</p>
            </Link>
          )}

          {/* Analytics (VENDEUSE/COIFFEUSE) */}
          {(user?.role === 'VENDEUSE' || user?.role === 'COIFFEUSE') && (
            <Link
              href="/dashboard/analytics"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <ChartBarIcon className="h-8 w-8 text-pink-600 mb-3" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Statistiques</h2>
              <p className="text-gray-600">Consultez vos performances</p>
            </Link>
          )}
        </div>

        {/* Graphique pour les clients */}
        {user?.role === 'CLIENT' && orders.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Évolution de mes commandes</h2>
            <OrdersChart data={(() => {
              const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                return date.toISOString().split('T')[0];
              });

              return last7Days.map(date => {
                const dayOrders = orders.filter(o => {
                  const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
                  return orderDate === date;
                });

                return {
                  period: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                  orders: dayOrders.length,
                  amount: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
                };
              });
            })()} />
          </div>
        )}
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

