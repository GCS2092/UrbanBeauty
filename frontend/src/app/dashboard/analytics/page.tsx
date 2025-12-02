'use client';

import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useProviderAnalytics, useSellerAnalytics } from '@/hooks/useAnalytics';
import { ChartBarIcon, CurrencyDollarIcon, CalendarDaysIcon, CubeIcon, ShoppingBagIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, StarIcon } from '@heroicons/react/24/solid';
import { formatCurrency } from '@/utils/currency';
import SalesChart from '@/components/charts/SalesChart';
import RevenueChart from '@/components/charts/RevenueChart';
import BookingsChart from '@/components/charts/BookingsChart';
import TopProductsChart from '@/components/charts/TopProductsChart';

function AnalyticsContent() {
  const { user } = useAuth();
  
  const isSeller = user?.role === 'VENDEUSE';
  const isProvider = user?.role === 'COIFFEUSE' || user?.role === 'MANICURISTE';
  
  // Utiliser les hooks backend avec enabled conditionnel
  const { data: providerAnalytics, isLoading: loadingProvider } = useProviderAnalytics({
    enabled: isProvider || user?.role === 'ADMIN',
  });
  const { data: sellerAnalytics, isLoading: loadingSeller } = useSellerAnalytics({
    enabled: isSeller || user?.role === 'ADMIN',
  });

  const isLoading = (isProvider && loadingProvider) || (isSeller && loadingSeller);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

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
        {/* ============ VENDEUSE ============ */}
        {isSeller && sellerAnalytics && (
          <>
            {/* Revenus Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Revenus ce mois</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(sellerAnalytics.revenue.thisMonth, 'XOF')}</p>
                  {sellerAnalytics.revenue.growth !== 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {sellerAnalytics.revenue.growth > 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-200" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-200" />
                      )}
                      <span className={`text-sm ${sellerAnalytics.revenue.growth > 0 ? 'text-emerald-200' : 'text-red-200'}`}>
                        {sellerAnalytics.revenue.growth > 0 ? '+' : ''}{sellerAnalytics.revenue.growth}% vs mois dernier
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <CurrencyDollarIcon className="h-8 w-8" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-emerald-200 text-xs">Total (tous temps)</p>
                  <p className="text-lg font-bold">{formatCurrency(sellerAnalytics.revenue.total, 'XOF')}</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-xs">Cette semaine</p>
                  <p className="text-lg font-bold">{formatCurrency(sellerAnalytics.revenue.thisWeek, 'XOF')}</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <CubeIcon className="h-8 w-8 text-blue-500" />
                  <span className="text-2xl font-bold text-gray-900">{sellerAnalytics.products.total}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Produits</p>
                {sellerAnalytics.products.lowStock > 0 && (
                  <p className="text-xs text-orange-600 mt-1">⚠️ {sellerAnalytics.products.lowStock} stock bas</p>
                )}
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <ShoppingBagIcon className="h-8 w-8 text-purple-500" />
                  <span className="text-2xl font-bold text-gray-900">{sellerAnalytics.orders.total}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Commandes</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">⏳</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">{sellerAnalytics.orders.pending}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">En attente</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">✅</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{sellerAnalytics.orders.delivered}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Livrées</p>
              </div>
            </div>

            {/* Top produit */}
            {sellerAnalytics.products.topProduct && (
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg">
                <p className="text-yellow-100 text-xs font-medium mb-1">🏆 Meilleur produit</p>
                <p className="font-bold text-lg">{sellerAnalytics.products.topProduct.name}</p>
                <div className="flex justify-between mt-2 text-sm">
                  <span>{sellerAnalytics.products.topProduct.salesCount} ventes</span>
                  <span>{formatCurrency(sellerAnalytics.products.topProduct.revenue, 'XOF')}</span>
                </div>
              </div>
            )}

            {/* Charts */}
            {sellerAnalytics.chartData.last7Days.length > 0 && (
              <>
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-4">Commandes (7 jours)</h2>
                  <SalesChart 
                    data={sellerAnalytics.chartData.last7Days.map(d => ({
                      date: d.date,
                      sales: d.orders,
                      revenue: d.revenue
                    }))} 
                    type="bar" 
                  />
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-4">Revenus (7 jours)</h2>
                  <RevenueChart 
                    data={sellerAnalytics.chartData.last7Days.map(d => ({ 
                      period: d.date, 
                      revenue: d.revenue 
                    }))} 
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* ============ COIFFEUSE ============ */}
        {isProvider && providerAnalytics && (
          <>
            {/* Revenus Card */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Revenus ce mois</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(providerAnalytics.revenue.thisMonth, 'XOF')}</p>
                  {providerAnalytics.revenue.growth !== 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {providerAnalytics.revenue.growth > 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-purple-200" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-200" />
                      )}
                      <span className={`text-sm ${providerAnalytics.revenue.growth > 0 ? 'text-purple-200' : 'text-red-200'}`}>
                        {providerAnalytics.revenue.growth > 0 ? '+' : ''}{providerAnalytics.revenue.growth}% vs mois dernier
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <CurrencyDollarIcon className="h-8 w-8" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-purple-200 text-xs">Total (tous temps)</p>
                  <p className="text-lg font-bold">{formatCurrency(providerAnalytics.revenue.total, 'XOF')}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-xs">Cette semaine</p>
                  <p className="text-lg font-bold">{formatCurrency(providerAnalytics.revenue.thisWeek, 'XOF')}</p>
                </div>
              </div>
            </div>

            {/* Note moyenne */}
            {providerAnalytics.services.averageRating > 0 && (
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Note moyenne</p>
                  <p className="text-2xl font-bold mt-1">{providerAnalytics.services.averageRating.toFixed(1)} / 5</p>
                  <p className="text-yellow-100 text-xs mt-1">{providerAnalytics.services.totalReviews} avis</p>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon 
                      key={star}
                      className={`h-6 w-6 ${star <= Math.round(providerAnalytics.services.averageRating) ? 'text-white' : 'text-white/30'}`}
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
                  <span className="text-2xl font-bold text-gray-900">{providerAnalytics.services.total}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Services</p>
                <p className="text-xs text-green-600 mt-1">{providerAnalytics.services.active} actifs</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <CalendarDaysIcon className="h-8 w-8 text-blue-500" />
                  <span className="text-2xl font-bold text-gray-900">{providerAnalytics.bookings.total}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Réservations</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">⏳</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">{providerAnalytics.bookings.pending}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">En attente</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">✅</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{providerAnalytics.bookings.completed}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Terminées</p>
              </div>
            </div>

            {/* Statistiques détaillées */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3">Détails</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Aujourd'hui</span>
                  <span className="font-semibold">{providerAnalytics.bookings.todayCount} RDV</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cette semaine</span>
                  <span className="font-semibold">{providerAnalytics.bookings.weekCount} RDV</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ce mois</span>
                  <span className="font-semibold">{providerAnalytics.bookings.monthCount} RDV</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taux d'annulation</span>
                  <span className={`font-semibold ${providerAnalytics.bookings.cancellationRate > 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {providerAnalytics.bookings.cancellationRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Top service */}
            {providerAnalytics.services.topService && (
              <div className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl p-4 text-white shadow-lg">
                <p className="text-pink-100 text-xs font-medium mb-1">🏆 Service le plus populaire</p>
                <p className="font-bold text-lg">{providerAnalytics.services.topService.name}</p>
                <div className="flex justify-between mt-2 text-sm">
                  <span>{providerAnalytics.services.topService.bookingsCount} réservations</span>
                  <span>{formatCurrency(providerAnalytics.services.topService.revenue, 'XOF')}</span>
                </div>
              </div>
            )}

            {/* Charts */}
            {providerAnalytics.chartData.last7Days.length > 0 && (
              <>
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-4">Réservations (7 jours)</h2>
                  <BookingsChart data={providerAnalytics.chartData.last7Days} />
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-4">Revenus (7 jours)</h2>
                  <RevenueChart 
                    data={providerAnalytics.chartData.last7Days.map(d => ({ 
                      period: d.date, 
                      revenue: d.revenue 
                    }))} 
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute requiredRole={['VENDEUSE', 'COIFFEUSE', 'MANICURISTE']}>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}
