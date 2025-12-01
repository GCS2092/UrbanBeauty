'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeftIcon, TruckIcon, CheckCircleIcon, XCircleIcon, StarIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useOrder, useUpdateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { useCreateReview } from '@/hooks/useReviews';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency, formatCurrencyDual, getCurrencyForRole } from '@/utils/currency';
import Image from 'next/image';

function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = typeof params?.id === 'string' ? params.id : '';
  const { data: order, isLoading, error } = useOrder(orderId);
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrder();
  const { mutate: createReview, isPending: isReviewing } = useCreateReview();
  const { user } = useAuth();
  const notifications = useNotifications();
  
  const currency = getCurrencyForRole(user?.role);
  const isSellerOrAdmin = user?.role === 'ADMIN' || user?.role === 'VENDEUSE' || user?.role === 'COIFFEUSE';
  const isClient = user?.role === 'CLIENT';
  
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  
  // Review state
  const [reviewingProductId, setReviewingProductId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const handleSubmitReview = () => {
    if (reviewRating === 0 || !reviewingProductId) return;
    
    createReview(
      { rating: reviewRating, comment: reviewComment || undefined, productId: reviewingProductId },
      {
        onSuccess: () => {
          notifications.success('Merci !', 'Votre avis a été publié');
          setReviewingProductId(null);
          setReviewRating(0);
          setReviewComment('');
        },
        onError: (err: any) => {
          notifications.error('Erreur', err?.response?.data?.message || 'Erreur lors de la publication');
        },
      }
    );
  };

  const canUpdateStatus = user?.role === 'ADMIN' || user?.role === 'VENDEUSE';
  
  const displayPrice = (amountInXOF: number) => {
    if (isSellerOrAdmin) {
      return formatCurrencyDual(amountInXOF, 'EUR');
    }
    return formatCurrency(amountInXOF, currency);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-emerald-100 text-emerald-800',
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
      return <CheckCircleIcon className="h-4 w-4" />;
    }
    if (status === 'CANCELLED') {
      return <XCircleIcon className="h-4 w-4" />;
    }
    return <TruckIcon className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 mb-4">Commande introuvable</p>
        <Link href="/dashboard/orders" className="text-pink-600 font-medium">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixe */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/orders" className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-gray-900 truncate">
                {order.orderNumber}
              </h1>
              <p className="text-xs text-gray-500">
                {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: fr })}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* Numéro de suivi */}
        {order.trackingNumber && (
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs font-medium text-blue-600 mb-1">Numéro de suivi</p>
            <p className="text-sm font-semibold text-blue-900">{order.trackingNumber}</p>
          </div>
        )}

        {/* Bouton modifier statut - Vendeur */}
        {canUpdateStatus && (
          <button
            onClick={() => {
              setNewStatus(order.status);
              setTrackingNumber(order.trackingNumber || '');
              setShowStatusModal(true);
            }}
            className="w-full py-3 bg-black text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            Modifier le statut
          </button>
        )}

        {/* Client Info */}
        <div className="bg-white rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Client</h2>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{order.customerEmail}</span>
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                <a href={`tel:${order.customerPhone}`} className="text-pink-600">{order.customerPhone}</a>
              </div>
            )}
            <div className="flex items-start gap-2 text-sm text-gray-600 pt-2 border-t border-gray-100 mt-2">
              <MapPinIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="whitespace-pre-line">{order.shippingAddress}</span>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Articles ({order.items.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex gap-3">
                  {item.product?.images?.[0]?.url ? (
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name || 'Produit'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl text-gray-400">📦</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.product?.name || 'Produit'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Qté: {item.quantity}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {displayPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
                
                {/* Bouton Avis */}
                {order.status === 'DELIVERED' && isClient && item.productId && (
                  <div className="mt-3">
                    {reviewingProductId === item.productId ? (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setReviewHover(star)}
                              onMouseLeave={() => setReviewHover(0)}
                            >
                              {star <= (reviewHover || reviewRating) ? (
                                <StarIconSolid className="h-6 w-6 text-yellow-400" />
                              ) : (
                                <StarIcon className="h-6 w-6 text-gray-300" />
                              )}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Commentaire (optionnel)"
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setReviewingProductId(null);
                              setReviewRating(0);
                              setReviewComment('');
                            }}
                            className="px-3 py-1.5 text-sm text-gray-600"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleSubmitReview}
                            disabled={reviewRating === 0 || isReviewing}
                            className="px-3 py-1.5 text-sm bg-black text-white rounded-lg disabled:opacity-50"
                          >
                            {isReviewing ? '...' : 'Publier'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewingProductId(item.productId!)}
                        className="inline-flex items-center gap-1 text-xs text-pink-600 font-medium"
                      >
                        <StarIcon className="h-3.5 w-3.5" />
                        Laisser un avis
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Résumé */}
        <div className="bg-white rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Résumé</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{displayPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Réduction {order.coupon && <span className="text-xs">({order.coupon.code})</span>}</span>
                <span>-{displayPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span>{order.shippingCost === 0 ? 'Gratuite' : displayPrice(order.shippingCost)}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>{displayPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Notes</h2>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Modal statut */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl p-6 safe-area-bottom">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Modifier le statut</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900"
                >
                  <option value="PENDING">En attente</option>
                  <option value="PROCESSING">En traitement</option>
                  <option value="PAID">Payée</option>
                  <option value="SHIPPED">Expédiée</option>
                  <option value="DELIVERED">Livrée</option>
                  <option value="CANCELLED">Annulée</option>
                </select>
              </div>

              {newStatus === 'SHIPPED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de suivi</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="TRACK123456"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    updateOrder(
                      {
                        id: orderId,
                        data: {
                          status: newStatus as any,
                          ...(newStatus === 'SHIPPED' && trackingNumber ? { trackingNumber } : {}),
                        },
                      },
                      {
                        onSuccess: () => {
                          notifications.success('Mis à jour', 'Statut modifié');
                          setShowStatusModal(false);
                        },
                        onError: (error: any) => {
                          notifications.error('Erreur', error?.response?.data?.message || 'Erreur');
                        },
                      }
                    );
                  }}
                  disabled={isUpdating}
                  className="flex-1 py-3 bg-black text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {isUpdating ? '...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
