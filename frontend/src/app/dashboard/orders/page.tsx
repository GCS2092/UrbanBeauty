'use client';

import Link from 'next/link';
import { ArrowLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/utils/currency';

function OrdersPageContent() {
  const { user } = useAuth();
  const isSeller = user?.role === 'VENDEUSE';
  const { data: orders = [], isLoading, error } = useOrders(false, isSeller);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      PROCESSING: 'En traitement',
      PAID: 'Payée',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {isSeller ? 'Commandes de mes produits' : 'Mes Commandes'}
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">📦</span>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucune commande</h2>
            <p className="text-gray-600 mb-6">
              {isSeller 
                ? 'Aucune commande n\'a été passée pour vos produits pour le moment'
                : 'Vous n\'avez pas encore passé de commande'}
            </p>
            <Link
              href="/products"
              className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Découvrir les produits
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Commande {order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {format(new Date(order.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.items.length} article{order.items.length > 1 ? 's' : ''}
                    </p>
                    {isSeller && order.user && (
                      <p className="text-sm text-gray-600 mt-1">
                        Client : {order.user.profile?.firstName} {order.user.profile?.lastName} ({order.customerEmail})
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-lg mb-2">{formatCurrency(order.total, 'XOF')}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
                
                {order.items.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.product?.name || 'Produit'} x{item.quantity}
                          </span>
                          <span className="text-gray-900 font-medium">
                            {formatCurrency(item.price * item.quantity, 'XOF')}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{order.items.length - 3} autre{order.items.length - 3 > 1 ? 's' : ''} article{order.items.length - 3 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="inline-flex items-center text-sm text-pink-600 hover:text-pink-700 font-medium"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Voir les détails
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersPageContent />
    </ProtectedRoute>
  );
}

