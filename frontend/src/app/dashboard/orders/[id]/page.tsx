'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeftIcon, TruckIcon, CheckCircleIcon, XCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useOrder, useUpdateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { useCreateReview } from '@/hooks/useReviews';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency, formatCurrencyDual, getSelectedCurrency, getCurrencyForRole } from '@/utils/currency';
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
  
  // Pour les vendeurs/coiffeuses/admins : toujours XOF
  // Pour les clients : leur devise choisie
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
  
  // Fonction d'affichage des prix selon le rôle
  // Vendeurs voient : "15 000 FCFA (≈ 22,87 €)" si client a payé en EUR
  // Clients voient dans leur devise choisie
  const displayPrice = (amountInXOF: number) => {
    if (isSellerOrAdmin) {
      // Pour les vendeurs : toujours CFA, avec équivalent EUR si pertinent
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
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {getStatusLabel(order.status)}
              </span>
              {canUpdateStatus && (
                <button
                  onClick={() => {
                    setNewStatus(order.status);
                    setTrackingNumber(order.trackingNumber || '');
                    setShowStatusModal(true);
                  }}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
                >
                  Modifier le statut
                </button>
              )}
            </div>
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
              <div key={item.id} className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
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
                    <p className="font-semibold text-gray-900">{displayPrice(item.price * item.quantity)}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(item.price, 'XOF')} l'unité</p>
                  </div>
                </div>
                
                {/* Bouton Laisser un avis - Seulement pour commandes livrées et clients */}
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
                              className="transition-transform hover:scale-110"
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
                          placeholder="Votre commentaire (optionnel)"
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 resize-none"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setReviewingProductId(null);
                              setReviewRating(0);
                              setReviewComment('');
                            }}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleSubmitReview}
                            disabled={reviewRating === 0 || isReviewing}
                            className="px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                          >
                            {isReviewing ? '...' : 'Publier'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewingProductId(item.productId!)}
                        className="inline-flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-700 font-medium"
                      >
                        <StarIcon className="h-4 w-4" />
                        Laisser un avis
                      </button>
                    )}
                  </div>
                )}
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
              <span>{displayPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Réduction</span>
                {order.coupon && (
                  <span className="text-xs text-gray-500">({order.coupon.code})</span>
                )}
                <span>-{displayPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span>{order.shippingCost === 0 ? 'Gratuite' : displayPrice(order.shippingCost)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>{displayPrice(order.total)}</span>
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

        {/* Modal de modification de statut */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Modifier le statut de la commande</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau statut *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de suivi
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Ex: TRACK123456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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
                            notifications.success('Statut mis à jour', 'Le statut de la commande a été mis à jour avec succès');
                            setShowStatusModal(false);
                          },
                          onError: (error: any) => {
                            notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la mise à jour');
                          },
                        }
                      );
                    }}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Mise à jour...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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

