'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useServices } from '@/hooks/useServices';
import { useBookings } from '@/hooks/useBookings';
import OrdersChart from '@/components/charts/OrdersChart';
import RevenueChart from '@/components/charts/RevenueChart';
import SalesChart from '@/components/charts/SalesChart';

function AdminAnalyticsContent() {
  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts();
  const { data: services = [] } = useServices();
  const { data: bookings = [] } = useBookings();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour à l'administration
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Statistiques & Analytics</h1>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produits totaux</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-pink-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services actifs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{services.length}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Réservations</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{bookings.length}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commandes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Évolution des commandes (7 derniers jours)</h2>
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

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenus globaux (7 derniers jours)</h2>
            <RevenueChart data={(() => {
              const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                return date.toISOString().split('T')[0];
              });

              return last7Days.map(date => {
                const dayOrders = orders.filter(o => {
                  const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
                  return orderDate === date && (o.status === 'DELIVERED' || o.status === 'SHIPPED' || o.status === 'PAID');
                });

                return {
                  period: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                  revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
                };
              });
            })()} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Évolution des ventes et revenus</h2>
          <SalesChart data={(() => {
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
                date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                sales: dayOrders.length,
                revenue: dayOrders
                  .filter(o => o.status === 'DELIVERED' || o.status === 'SHIPPED' || o.status === 'PAID')
                  .reduce((sum, o) => sum + (o.total || 0), 0),
              };
            });
          })()} type="line" />
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminAnalyticsContent />
    </ProtectedRoute>
  );
}

