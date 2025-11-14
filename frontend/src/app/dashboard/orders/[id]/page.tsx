'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, TruckIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useOrder } from '@/hooks/useOrders';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';
import Image from 'next/image';

function OrderDetailContent() {
  const params = useParams();
  const orderId = typeof params?.id === 'string' ? params.id : '';
  const { data: order, isLoading, error } = useOrder(orderId);
  const currency = getSelectedCurrency();

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

  const getStatusIcon = (status: string) => {
    if (status === 'DELIVERED' || status === 'PAID') {
      return <CheckCircleIcon className="h-5 w-5" />;
    }
    if (status === 'CANCELLED') {
      return <XCircleIcon className="h-5 w-5" />;
    }
    return <TruckIcon className="h-5 w-5" />;
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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Commande introuvable</p>
          <Link href="/dashboard/orders" className="text-pink-600 hover:text-pink-700 mt-4 inline-block">
            Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/dashboard/orders" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux commandes
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Commande {order.orderNumber}
              </h1>
              <p className="text-sm text-gray-600">
                Passée le {format(new Date(order.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </p>
            </div>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              {getStatusLabel(order.status)}
            </span>
          </div>

          {order.trackingNumber && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Numéro de suivi</p>
              <p className="text-lg font-semibold text-blue-700">{order.trackingNumber}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Informations de livraison */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Adresse de livraison</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-medium text-gray-900">{order.customerName}</p>
              <p>{order.customerEmail}</p>
              {order.customerPhone && <p>{order.customerPhone}</p>}
              <p className="mt-2 whitespace-pre-line">{order.shippingAddress}</p>
            </div>
          </div>

          {/* Informations de facturation */}
          {order.billingAddress && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Adresse de facturation</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">{order.billingAddress}</p>
            </div>
          )}
        </div>

        {/* Articles de la commande */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Articles</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                {item.product?.images?.[0]?.url ? (
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name || 'Produit'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">✨</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.product?.name || 'Produit'}</h3>
                  <p className="text-sm text-gray-600">Quantité : {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity, currency)}</p>
                  <p className="text-sm text-gray-600">{formatCurrency(item.price, currency)} l'unité</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Résumé financier */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{formatCurrency(order.subtotal, currency)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Réduction</span>
                {order.coupon && (
                  <span className="text-xs text-gray-500">({order.coupon.code})</span>
                )}
                <span>-{formatCurrency(order.discount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span>{order.shippingCost === 0 ? 'Gratuite' : formatCurrency(order.shippingCost, currency)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(order.total, currency)}</span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}

