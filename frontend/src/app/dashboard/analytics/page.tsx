'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeftIcon, ChartBarIcon, ShoppingBagIcon, CubeIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useServices } from '@/hooks/useServices';
import { useBookings } from '@/hooks/useBookings';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';

function AnalyticsContent() {
  const { user } = useAuth();
  const currency = getSelectedCurrency();
  
  // Récupérer les données selon le rôle
  const isSeller = user?.role === 'VENDEUSE';
  const isProvider = user?.role === 'COIFFEUSE';
  
  const { data: orders = [] } = useOrders(false, isSeller);
  const { data: products = [] } = useProducts();
  const { data: services = [] } = useServices();
  const { data: bookings = [] } = useBookings(isProvider);

  // Filtrer selon le rôle
  const myProducts = isSeller ? products.filter(p => p.sellerId === user?.id) : [];
  const myServices = isProvider ? services.filter(s => s.providerId === user?.profile?.id) : [];
  const myOrders = isSeller 
    ? orders.filter(o => o.items?.some(item => item.product?.sellerId === user?.id))
    : [];
  const myBookings = isProvider ? bookings : [];

  // Calculer les statistiques pour les vendeuses
  const sellerStats = isSeller ? {
    totalProducts: myProducts.length,
    totalOrders: myOrders.length,
    pendingOrders: myOrders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length,
    completedOrders: myOrders.filter(o => o.status === 'DELIVERED').length,
    totalRevenue: myOrders
      .filter(o => o.status === 'DELIVERED' || o.status === 'SHIPPED' || o.status === 'PAID')
      .reduce((sum, o) => {
        // Calculer le revenu seulement pour les produits de la vendeuse
        const sellerItems = o.items.filter(item => item.product?.sellerId === user?.id);
        const itemsTotal = sellerItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        return sum + itemsTotal;
      }, 0),
    lowStockProducts: myProducts.filter(p => p.stock <= (p.lowStockThreshold || 10)).length,
  } : null;

  // Calculer les statistiques pour les coiffeuses
  const providerStats = isProvider ? {
    totalServices: myServices.length,
    totalBookings: myBookings.length,
    pendingBookings: myBookings.filter(b => b.status === 'PENDING').length,
    completedBookings: myBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length,
    totalRevenue: myBookings
      .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (b.service?.price || 0), 0),
  } : null;

  const stats = sellerStats || providerStats;
  
  // Type guards pour TypeScript
  const isSellerStats = (s: typeof stats): s is typeof sellerStats => {
    return s !== null && 'totalProducts' in s;
  };
  
  const isProviderStats = (s: typeof stats): s is typeof providerStats => {
    return s !== null && 'totalServices' in s;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Statistiques & Performances</h1>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isSeller && (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Produits</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{isSellerStats(stats) ? stats.totalProducts : 0}</p>
                  </div>
                  <CubeIcon className="h-8 w-8 text-pink-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Commandes totales</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{isSellerStats(stats) ? stats.totalOrders : 0}</p>
                  </div>
                  <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En attente</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{isSellerStats(stats) ? stats.pendingOrders : 0}</p>
                  </div>
                  <ShoppingBagIcon className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenus</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {formatCurrency(stats ? stats.totalRevenue : 0, currency)}
                    </p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Commandes complétées</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{isSellerStats(stats) ? stats.completedOrders : 0}</p>
                  </div>
                  <ShoppingBagIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Stock bas</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{isSellerStats(stats) ? stats.lowStockProducts : 0}</p>
                  </div>
                  <CubeIcon className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </>
          )}

          {isProvider && (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Services</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{isProviderStats(stats) ? stats.totalServices : 0}</p>
                  </div>
                  <ScissorsIcon className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Réservations</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{isProviderStats(stats) ? stats.totalBookings : 0}</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En attente</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{isProviderStats(stats) ? stats.pendingBookings : 0}</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenus</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {formatCurrency(stats ? stats.totalRevenue : 0, currency)}
                    </p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Graphiques (à implémenter) */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isSeller ? 'Évolution des ventes' : 'Évolution des réservations'}
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Graphiques à implémenter avec une bibliothèque de graphiques (Chart.js, Recharts, etc.)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute requiredRole={['VENDEUSE', 'COIFFEUSE']}>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}

