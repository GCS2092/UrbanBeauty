import {
  useParams,
  Link,
  useSearchParams,
} from 'react-router-dom';

import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  useEffect,
  useState,
} from 'react';

import {
  ChevronLeft,
  MapPin,
  CreditCard,
  CheckCircle2,
  Package,
  Loader2,
  XCircle,
} from 'lucide-react';

import { ordersApi } from '../../api/orders.api';
import { paymentsApi } from '../../api/payments.api';

import { formatPrice } from '../../utils/formatPrice';
import { formatDateTime } from '../../utils/formatDate';

import {
  PAYMENT_METHOD_LABELS,
  ORDER_STATUS_LABELS,
} from '../../utils/constants';

import { getImageUrl } from '../../utils/imageUrl';

import OrderStatusBadge from '../../components/shared/OrderStatusBadge';
import Spinner from '../../components/ui/Spinner';
import { trackMetaEvent } from '../../utils/metaPixel';

function PaymentVerificationBanner({
  verificationState,
}) {
  if (verificationState === 'checking') {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
        <Loader2
          size={20}
          className="text-amber-500 animate-spin shrink-0 mt-0.5"
        />

        <div>
          <p className="text-sm font-semibold text-amber-800">
            Vérification du paiement en cours...
          </p>

          <p className="text-xs text-amber-600 mt-1">
            Merci de patienter quelques secondes.
          </p>
        </div>
      </div>
    );
  }

  if (verificationState === 'success') {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex items-start gap-3">
        <CheckCircle2
          size={20}
          className="text-green-500 shrink-0 mt-0.5"
        />

        <div>
          <p className="text-sm font-semibold text-green-800">
            Paiement confirmé !
          </p>

          <p className="text-xs text-green-600 mt-1">
            Votre commande a été validée avec succès.
          </p>
        </div>
      </div>
    );
  }

  if (verificationState === 'failed') {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3">
        <XCircle
          size={20}
          className="text-red-500 shrink-0 mt-0.5"
        />

        <div>
          <p className="text-sm font-semibold text-red-800">
            Le paiement n'a pas abouti
          </p>

          <p className="text-xs text-red-600 mt-1">
            Aucun montant n'a été débité, ou la transaction a échoué.
            Vous pouvez réessayer.
          </p>
        </div>
      </div>
    );
  }

  if (verificationState === 'timeout') {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
        <Loader2
          size={20}
          className="text-amber-500 shrink-0 mt-0.5"
        />

        <div>
          <p className="text-sm font-semibold text-amber-800">
            Vérification en cours (opérateur lent)
          </p>

          <p className="text-xs text-amber-600 mt-1 leading-relaxed">
            Le paiement met un peu plus de temps que prévu à se
            confirmer. Rechargez cette page dans une minute, ou
            contactez-nous si le statut ne change pas.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default function OrderDetail() {
  const { orderNumber } = useParams();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const queryClient = useQueryClient();

  const isPaymentReturn =
    searchParams.get('payment') === 'return';

  const [
    verificationState,
    setVerificationState,
  ] = useState(
    isPaymentReturn
      ? 'checking'
      : 'idle'
  );

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      'order',
      orderNumber,
    ],

    queryFn: () =>
      ordersApi
        .getByNumber(orderNumber)
        .then((response) => response.data),

    enabled: Boolean(orderNumber),
  });

  /*
   * Retour depuis CinetPay
   *
   * On vérifie activement le statut auprès du backend.
   *
   * Le backend vérifie ensuite directement auprès de CinetPay.
   */
  useEffect(() => {
    if (
      !isPaymentReturn ||
      !order?.id
    ) {
      return undefined;
    }

    let cancelled = false;
    let timer = null;

    let attempts = 0;

    const maxAttempts = 10;
    const delay = 2000;

    const checkPayment = async () => {
      if (cancelled) {
        return;
      }

      attempts += 1;

      try {
        console.log(
          `[CinetPay] Vérification ${attempts}/${maxAttempts}`
        );

        const {
          data,
        } = await paymentsApi.verifier(
          order.id
        );

        console.log(
          '[CinetPay] Statut reçu:',
          data
        );

        if (cancelled) {
          return;
        }

        if (data.status === 'PAID') {
          trackMetaEvent('Purchase', {
            content_ids: order.items?.map((item) => item.productId) || [],
            content_type: 'product',
            value: order.total,
            currency: 'XOF',
            num_items: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
          }, order.metaPurchaseEventId);
          setVerificationState(
            'success'
          );

          await queryClient.invalidateQueries({
            queryKey: [
              'order',
              orderNumber,
            ],
          });

          const nextParams =
            new URLSearchParams(
              searchParams
            );

          nextParams.delete(
            'payment'
          );

          setSearchParams(
            nextParams,
            {
              replace: true,
            }
          );

          return;
        }

        if (
          data.status === 'REJECTED'
        ) {
          setVerificationState(
            'failed'
          );

          await queryClient.invalidateQueries({
            queryKey: [
              'order',
              orderNumber,
            ],
          });

          const nextParams =
            new URLSearchParams(
              searchParams
            );

          nextParams.delete(
            'payment'
          );

          setSearchParams(
            nextParams,
            {
              replace: true,
            }
          );

          return;
        }

        if (
          attempts < maxAttempts
        ) {
          timer = setTimeout(
            checkPayment,
            delay
          );
        } else {
          setVerificationState(
            'timeout'
          );
        }
      } catch (error) {
        console.error(
          '[CinetPay] Erreur vérification paiement:',
          error
        );

        if (cancelled) {
          return;
        }

        if (
          attempts < maxAttempts
        ) {
          timer = setTimeout(
            checkPayment,
            delay
          );
        } else {
          setVerificationState(
            'timeout'
          );
        }
      }
    };

    checkPayment();

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [
    isPaymentReturn,
    order?.id,
    orderNumber,
    queryClient,
    searchParams,
    setSearchParams,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (
    isError ||
    !order
  ) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center">
          <p className="text-stone-600">
            Commande introuvable
          </p>

          <Link
            to="/orders"
            className="inline-flex items-center gap-1 mt-4 text-sm text-rose-500 hover:text-rose-600"
          >
            <ChevronLeft size={15} />
            Mes commandes
          </Link>
        </div>
      </div>
    );
  }

  const addr =
    order.shippingAddress;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

      {/* Back */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700 transition-colors"
      >
        <ChevronLeft size={15} />
        Mes commandes
      </Link>

      {/* Vérification CinetPay */}
      {verificationState !== 'idle' && (
        <PaymentVerificationBanner
          verificationState={
            verificationState
          }
        />
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
              {formatDateTime(
                order.createdAt
              )}
            </p>
          </div>

        </div>

        <OrderStatusBadge
          status={order.status}
        />
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left */}
        <div className="lg:col-span-2 space-y-4">

          {/* Articles */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">

            <h2 className="text-sm font-semibold text-stone-700 mb-4">
              Articles commandés
            </h2>

            <div className="space-y-1">

              {order.items?.map(
                (item) => {
                  const imgUrl =
                    getImageUrl(
                      item.image?.url ||
                      item.productImage
                    );

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 items-center py-2.5 border-b border-stone-50 last:border-0"
                    >

                      <div className="w-11 h-11 rounded-xl bg-stone-50 flex items-center justify-center shrink-0 overflow-hidden">

                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={
                              item.productName
                            }
                            className="w-full h-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display =
                                'none';

                              const parent =
                                event.currentTarget.parentElement;

                              if (parent) {
                                parent.innerHTML =
                                  '<span class="text-lg">🛍️</span>';
                              }
                            }}
                          />
                        ) : (
                          <span className="text-lg">
                            🛍️
                          </span>
                        )}

                      </div>

                      <div className="flex-1 min-w-0">

                        <p className="text-sm font-semibold text-stone-800 truncate">
                          {item.productName}
                        </p>

                        {item.variantLabel && (
                          <p className="text-xs text-stone-400">
                            {item.variantLabel}
                          </p>
                        )}

                        <p className="text-xs text-stone-400 mt-0.5">
                          x{item.quantity} ·{' '}
                          {formatPrice(
                            item.price
                          )}{' '}
                          / unité
                        </p>

                      </div>

                      <p className="text-sm font-bold text-stone-800 shrink-0">
                        {formatPrice(
                          item.subtotal
                        )}
                      </p>

                    </div>
                  );
                }
              )}

            </div>

            {/* Totaux */}
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-2 text-sm">

              <div className="flex justify-between text-stone-500">
                <span>
                  Sous-total
                </span>

                <span>
                  {formatPrice(
                    order.subtotal
                  )}
                </span>
              </div>

              <div className="flex justify-between text-stone-500">
                <span>
                  Livraison
                </span>

                <span>
                  {formatPrice(
                    order.shippingCost
                  )}
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>
                    Réduction
                  </span>

                  <span>
                    -
                    {formatPrice(
                      order.discount
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-bold text-stone-900 pt-3 border-t border-stone-100 text-base">
                <span>
                  Total
                </span>

                <span>
                  {formatPrice(
                    order.total
                  )}
                </span>
              </div>

            </div>
          </div>

          {/* Tracking */}
          {order.tracking?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">

              <h2 className="text-sm font-semibold text-stone-700 mb-4">
                Suivi de commande
              </h2>

              <div className="space-y-1">

                {[...order.tracking]
                  .reverse()
                  .map(
                    (
                      track,
                      index,
                      array
                    ) => (
                      <div
                        key={track.id}
                        className="flex gap-3"
                      >

                        <div className="flex flex-col items-center">

                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              index === 0
                                ? 'bg-rose-500 text-white'
                                : 'bg-stone-100 text-stone-400'
                            }`}
                          >
                            <CheckCircle2 size={13} />
                          </div>

                          {index <
                            array.length -
                              1 && (
                            <div className="w-px h-6 bg-stone-100 my-1" />
                          )}

                        </div>

                        <div className="pb-3">

                          <p className="text-sm font-semibold text-stone-800 leading-snug">
                            {
                              ORDER_STATUS_LABELS[
                                track.status
                              ]
                            }
                          </p>

                          {track.message && (
                            <p className="text-xs text-stone-400 mt-0.5">
                              {track.message}
                            </p>
                          )}

                          <p className="text-xs text-stone-300 mt-0.5">
                            {formatDateTime(
                              track.createdAt
                            )}
                          </p>

                        </div>

                      </div>
                    )
                  )}

              </div>
            </div>
          )}

        </div>

        {/* Right */}
        <div className="space-y-3">

          {/* Adresse */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">

            <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-1.5 mb-3">
              <MapPin
                size={14}
                className="text-rose-400"
              />
              Livraison
            </h2>

            <div className="text-sm text-stone-500 space-y-1 leading-relaxed">

              <p className="font-semibold text-stone-800">
                {addr?.fullName}
              </p>

              <p>
                {addr?.phone}
              </p>

              <p>
                {addr?.street}
              </p>

              <p>
                {addr?.city},{' '}
                {addr?.country}
              </p>

            </div>
          </div>

          {/* Paiement */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">

            <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-1.5 mb-3">
              <CreditCard
                size={14}
                className="text-rose-400"
              />
              Paiement
            </h2>

            <p className="text-sm text-stone-500">
              {PAYMENT_METHOD_LABELS[
                order.paymentMethod
              ] ||
                order.paymentMethod}
            </p>

          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4">

              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">
                Notes
              </p>

              <p className="text-sm text-stone-600 leading-relaxed">
                {order.notes}
              </p>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
