'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function AdminOrdersContent() {
  const { data: orders = [], isLoading } = useOrders(true);
  // Admin voit toujours en Franc CFA

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-4 sm:mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour à l'administration
        </Link>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Gestion des Commandes</h1>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">📦</span>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucune commande</h2>
            <p className="text-gray-600">Aucune commande n'a été passée pour le moment</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Commande
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Client
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Date
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
                          <span className="text-xs text-gray-500 sm:hidden mt-1">{order.customerName || order.customerEmail}</span>
                          <span className="text-xs text-gray-500 md:hidden mt-1">{format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: fr })}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                        <div className="text-sm text-gray-900">{order.customerName || order.customerEmail}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(order.total, 'XOF')}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'DELIVERED' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status === 'PENDING' ? 'En attente' :
                           order.status === 'PROCESSING' ? 'En traitement' :
                           order.status === 'PAID' ? 'Payée' :
                           order.status === 'SHIPPED' ? 'Expédiée' :
                           order.status === 'DELIVERED' ? 'Livrée' :
                           'Annulée'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <span className="text-sm text-gray-500">
                          {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/dashboard/admin/orders/${order.id}`}
                          className="text-pink-600 hover:text-pink-900"
                        >
                          Voir détails
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminOrdersContent />
    </ProtectedRoute>
  );
}

