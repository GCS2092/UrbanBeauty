'use client';

import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { ChartBarIcon, CurrencyDollarIcon, CalendarDaysIcon, CubeIcon, ShoppingBagIcon, ScissorsIcon, TrendingUpIcon, TrendingDownIcon } from '@heroicons/react/24/outline';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, StarIcon } from '@heroicons/react/24/solid';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useServices } from '@/hooks/useServices';
import { useBookings } from '@/hooks/useBookings';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';
import SalesChart from '@/components/charts/SalesChart';
import RevenueChart from '@/components/charts/RevenueChart';
import BookingsChart from '@/components/charts/BookingsChart';
import TopProductsChart from '@/components/charts/TopProductsChart';

function AnalyticsContent() {
  const { user } = useAuth();
  const currency = getSelectedCurrency();
  
  const isSeller = user?.role === 'VENDEUSE';
  const isProvider = user?.role === 'COIFFEUSE';
  
  const { data: orders = [] } = useOrders(false, isSeller);
  const { data: products = [] } = useProducts();
  const { data: services = [] } = useServices();
  const { data: bookings = [] } = useBookings(isProvider);

  const myProducts = isSeller ? products.filter(p => p.sellerId === user?.id) : [];
  const myServices = isProvider ? services.filter(s => s.providerId === user?.profile?.id) : [];
  const myOrders = isSeller 
    ? orders.filter(o => o.items?.some(item => item.product?.sellerId === user?.id))
    : [];
  const myBookings = isProvider ? bookings : [];

  // Stats VENDEUSE
  const sellerStats = isSeller ? {
    totalProducts: myProducts.length,
    totalOrders: myOrders.length,
    pendingOrders: myOrders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length,
    completedOrders: myOrders.filter(o => o.status === 'DELIVERED').length,
    totalRevenue: myOrders
      .filter(o => o.status === 'DELIVERED' || o.status === 'SHIPPED' || o.status === 'PAID')
      .reduce((sum, o) => {
        const sellerItems = o.items.filter(item => item.product?.sellerId === user?.id);
        return sum + sellerItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
      }, 0),
    lowStockProducts: myProducts.filter(p => p.stock <= (p.lowStockThreshold || 10)).length,
  } : null;

  // Stats COIFFEUSE
  const providerStats = isProvider ? {
    totalServices: myServices.length,
    totalBookings: myBookings.length,
    pendingBookings: myBookings.filter(b => b.status === 'PENDING').length,
    completedBookings: myBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length,
    totalRevenue: myBookings
      .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (b.service?.price || 0), 0),
    averageRating: myServices.length > 0 
      ? myServices.filter(s => s.averageRating).reduce((acc, s) => acc + (s.averageRating || 0), 0) / myServices.filter(s => s.averageRating).length || 0
      : 0,
  } : null;

  // Chart data VENDEUSE
  const getSalesChartData = () => {
    if (!isSeller) return [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayOrders = myOrders.filter(o => {
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDate === date;
      });
      const revenue = dayOrders
        .filter(o => o.status === 'DELIVERED' || o.status === 'SHIPPED' || o.status === 'PAID')
        .reduce((sum, o) => {
          const sellerItems = o.items.filter(item => item.product?.sellerId === user?.id);
          return sum + sellerItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        }, 0);

      return {
        date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        sales: dayOrders.length,
        revenue,
      };
    });
  };

  // Chart data COIFFEUSE
  const getBookingsChartData = () => {
    if (!isProvider) return [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayBookings = myBookings.filter(b => {
        const bookingDate = new Date(b.createdAt).toISOString().split('T')[0];
        return bookingDate === date;
      });
      const revenue = dayBookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum, b) => sum + (b.service?.price || 0), 0);

      return {
        date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        bookings: dayBookings.length,
        revenue,
      };
    });
  };

  // Top produits VENDEUSE
  const getTopProductsData = () => {
    if (!isSeller) return [];
    const productSales: Record<string, { name: string; sales: number; revenue: number }> = {};
    
    myOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product?.sellerId === user?.id) {
          const productId = item.product.id;
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.product.name || 'Produit inconnu',
              sales: 0,
              revenue: 0,
            };
          }
          productSales[productId].sales += item.quantity;
          productSales[productId].revenue += item.price * item.quantity;
        }
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-8">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <ChartBarIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Statistiques</h1>
              <p className="text-xs text-gray-500">Performances & revenus</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats principales */}
        {isSeller && sellerStats && (
          <>
            {/* Revenus Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Revenus totaux</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(sellerStats.totalRevenue, currency)}</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <CurrencyDollarIcon className="h-8 w-8" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-200" />
                <span className="text-sm text-emerald-100">{sellerStats.completedOrders} commandes livrées</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <CubeIcon className="h-8 w-8 text-blue-500" />
                  <span className="text-2xl font-bold text-gray-900">{sellerStats.totalProducts}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Produits</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <ShoppingBagIcon className="h-8 w-8 text-purple-500" />
                  <span className="text-2xl font-bold text-gray-900">{sellerStats.totalOrders}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Commandes</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">⏳</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">{sellerStats.pendingOrders}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">En attente</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📦</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{sellerStats.lowStockProducts}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Stock bas</p>
              </div>
            </div>

            {/* Charts */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Ventes (7 jours)</h2>
              <SalesChart data={getSalesChartData()} type="line" />
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Revenus</h2>
              <RevenueChart data={getSalesChartData().map(d => ({ period: d.date, revenue: d.revenue }))} />
            </div>

            {getTopProductsData().length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">Top 5 produits</h2>
                <TopProductsChart data={getTopProductsData()} />
              </div>
            )}
          </>
        )}

        {isProvider && providerStats && (
          <>
            {/* Revenus Card */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Revenus totaux</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(providerStats.totalRevenue, currency)}</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <CurrencyDollarIcon className="h-8 w-8" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <ArrowTrendingUpIcon className="h-4 w-4 text-purple-200" />
                <span className="text-sm text-purple-100">{providerStats.completedBookings} réservations confirmées</span>
              </div>
            </div>

            {/* Note moyenne */}
            {providerStats.averageRating > 0 && (
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Note moyenne</p>
                  <p className="text-2xl font-bold mt-1">{providerStats.averageRating.toFixed(1)} / 5</p>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon 
                      key={star}
                      className={`h-6 w-6 ${star <= Math.round(providerStats.averageRating) ? 'text-white' : 'text-white/30'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <ScissorsIcon className="h-8 w-8 text-purple-500" />
                  <span className="text-2xl font-bold text-gray-900">{providerStats.totalServices}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Services</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <CalendarDaysIcon className="h-8 w-8 text-blue-500" />
                  <span className="text-2xl font-bold text-gray-900">{providerStats.totalBookings}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Réservations</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">⏳</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">{providerStats.pendingBookings}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">En attente</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">✅</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{providerStats.completedBookings}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Confirmées</p>
              </div>
            </div>

            {/* Charts */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Réservations (7 jours)</h2>
              <BookingsChart data={getBookingsChartData()} />
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Revenus</h2>
              <RevenueChart data={getBookingsChartData().map(d => ({ period: d.date, revenue: d.revenue }))} />
            </div>
          </>
        )}
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
