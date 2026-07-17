import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ChevronLeft, MapPin, CreditCard, CheckCircle2, Package, Loader2, XCircle } from 'lucide-react';
import { ordersApi } from '../../api/orders.api';
import { paymentsApi } from '../../api/payments.api';
import { formatPrice } from '../../utils/formatPrice';
import { formatDateTime } from '../../utils/formatDate';
import { PAYMENT_METHOD_LABELS, ORDER_STATUS_LABELS } from '../../utils/constants';
import { getImageUrl } from '../../utils/imageUrl';
import OrderStatusBadge from '../../components/shared/OrderStatusBadge';
import Spinner from '../../components/ui/Spinner';

// ---------------------------------------------------------------------------
// Bandeau affiché pendant/après la vérification du paiement CinetPay
// ---------------------------------------------------------------------------
function PaymentVerificationBanner({ verificationState }) {
  if (verificationState === 'checking') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
        <Loader2 size={18} className="text-blue-500 animate-spin shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-700">Vérification du paiement en cours...</p>
          <p className="text-xs text-blue-600 mt-0.5">Merci de patienter quelques secondes.</p>
        </div>
      </div>
    );
  }

  if (verificationState === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
        <CheckCircle2 size={18} className="text-green-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-700">Paiement confirmé !</p>
          <p className="text-xs text-green-600 mt-0.5">Votre commande a été validée avec succès.</p>
        </div>
      </div>
    );
  }

  if (verificationState === 'failed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
        <XCircle size={18} className="text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-700">Le paiement n'a pas abouti</p>
          <p className="text-xs text-red-600 mt-0.5">
            Aucun montant n'a été débité, ou la transaction a échoué. Vous pouvez réessayer.
          </p>
        </div>
      </div>
    );
  }

  if (verificationState === 'timeout') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
        <Loader2 size={18} className="text-amber-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-700">Vérification en cours (opérateur lent)</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Le paiement met un peu plus de temps que prévu à se confirmer. Rechargez cette page
            dans une minute, ou contactez-nous si le statut ne change pas.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default function OrderDetail() {
  const { orderNumber } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // 'return' = le client revient d'une tentative de paiement CinetPay
  const isPaymentReturn = searchParams.get('payment') === 'return';

  // idle | checking | success | failed | timeout
  const [verificationState, setVerificationState] = useState(isPaymentReturn ? 'checking' : 'idle');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => ordersApi.getByNumber(orderNumber).then((r) => r.data),
  });

  // Vérification active + polling léger, uniquement au retour de CinetPay
  useEffect(() => {
    if (!isPaymentReturn || !order?.id) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 6; // 6 x 2s = 12 secondes max avant d'afficher le message "opérateur lent"

    const check = async () => {
      if (cancelled) return;
      attempts++;
      try {
        const { data } = await paymentsApi.verifier(order.id);

        if (data.status === 'PAID') {
          setVerificationState('success');
          queryClient.invalidateQueries({ queryKey: ['order', orderNumber] });
          searchParams.delete('payment');
          setSearchParams(searchParams, { replace: true });
          return;
        }

        if (data.status === 'REJECTED') {
          setVerificationState('failed');
          queryClient.invalidateQueries({ queryKey: ['order', orderNumber] });
          searchParams.delete('payment');
          setSearchParams(searchParams, { replace: true });
          return;
        }

        // Toujours PENDING → on retente, sauf si on a atteint la limite
        if (attempts < maxAttempts) {
          setTimeout(check, 2000);
        } else {
          setVerificationState('timeout');
        }
      } catch (err) {
        console.error('Erreur vérification paiement:', err.message);
        if (attempts < maxAttempts) {
          setTimeout(check, 2000);
        } else {
          setVerificationState('timeout');
        }
      }
    };

    check();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaymentReturn, order?.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24 text-stone-400">
        Commande introuvable
      </div>
    );
  }

  const addr = order.shippingAddress;

  return (
    <div className="space-y-5">

      {/* Back */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700 transition-colors"
      >
        <ChevronLeft size={15} /> Mes commandes
      </Link>

      {/* Bandeau de vérification du paiement, visible uniquement au retour de CinetPay */}
      {verificationState !== 'idle' && (
        <PaymentVerificationBanner verificationState={verificationState} />
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-400 shrink-0">
            <Package size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-800">
              Commande #{order.orderNumber}
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Left col ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Articles */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h2 className="text-sm font-semibold text-stone-700 mb-4">
              Articles commandés
            </h2>

            <div className="space-y-1">
              {order.items?.map((item) => {
                const imgUrl = getImageUrl(item.image?.url || item.productImage);
                return (
                  <div key={item.id} className="flex gap-3 items-center py-2.5 border-b border-stone-50 last:border-0">
                    {/* Image produit */}
                    <div className="w-11 h-11 rounded-xl bg-stone-50 flex items-center justify-center shrink-0 overflow-hidden">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="text-lg">🛍️</span>';
                          }}
                        />
                      ) : (
                        <span className="text-lg">🛍️</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">
                        {item.productName}
                      </p>
                      {item.variantLabel && (
                        <p className="text-xs text-stone-400">{item.variantLabel}</p>
                      )}
                      <p className="text-xs text-stone-400 mt-0.5">
                        x{item.quantity} · {formatPrice(item.price)} / unité
                      </p>
                    </div>
                    <p className="text-sm font-bold text-stone-800 shrink-0">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Totaux */}
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-2 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Livraison</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Réduction</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-stone-900 pt-3 border-t border-stone-100 text-base">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Tracking timeline */}
          {order.tracking?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h2 className="text-sm font-semibold text-stone-700 mb-4">
                Suivi de commande
              </h2>
              <div className="space-y-1">
                {[...order.tracking].reverse().map((track, i, arr) => (
                  <div key={track.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          i === 0
                            ? 'bg-rose-500 text-white'
                            : 'bg-stone-100 text-stone-400'
                        }`}
                      >
                        <CheckCircle2 size={13} />
                      </div>
                      {i < arr.length - 1 && (
                        <div className="w-px h-6 bg-stone-100 my-1" />
                      )}
                    </div>
                    <div className="pb-3">
                      <p className="text-sm font-semibold text-stone-800 leading-snug">
                        {ORDER_STATUS_LABELS[track.status]}
                      </p>
                      {track.message && (
                        <p className="text-xs text-stone-400 mt-0.5">{track.message}</p>
                      )}
                      <p className="text-xs text-stone-300 mt-0.5">
                        {formatDateTime(track.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Right col ── */}
        <div className="space-y-3">

          {/* Adresse */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-1.5 mb-3">
              <MapPin size={14} className="text-rose-400" /> Livraison
            </h2>
            <div className="text-sm text-stone-500 space-y-1 leading-relaxed">
              <p className="font-semibold text-stone-800">{addr?.fullName}</p>
              <p>{addr?.phone}</p>
              <p>{addr?.street}</p>
              <p>{addr?.city}, {addr?.country}</p>
            </div>
          </div>

          {/* Paiement */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-1.5 mb-3">
              <CreditCard size={14} className="text-rose-400" /> Paiement
            </h2>
            <p className="text-sm text-stone-500">
              {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
            </p>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">
                Notes
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">{order.notes}</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}