import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, MapPin, CreditCard, CheckCircle2 } from 'lucide-react';
import { ordersApi } from '../../api/orders.api';
import { formatPrice } from '../../utils/formatPrice';
import { formatDateTime } from '../../utils/formatDate';
import { PAYMENT_METHOD_LABELS, ORDER_STATUS_LABELS } from '../../utils/constants';
import OrderStatusBadge from '../../components/shared/OrderStatusBadge';
import Spinner from '../../components/ui/Spinner';

export default function OrderDetail() {
  const { orderNumber } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => ordersApi.getByNumber(orderNumber).then((r) => r.data),
  });

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!order) return <div className="text-center py-24 text-stone-400">Commande introuvable</div>;

  const addr = order.shippingAddress;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700 mb-6 transition-colors">
        <ChevronLeft size={16} /> Mes commandes
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Commande #{order.orderNumber}</h1>
          <p className="text-sm text-stone-400 mt-0.5">{formatDateTime(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Articles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h2 className="font-semibold text-stone-800 mb-4">Articles command�s</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center text-xl shrink-0">???</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 text-sm">{item.productName}</p>
                    {item.variantLabel && <p className="text-xs text-stone-400">{item.variantLabel}</p>}
                    <p className="text-xs text-stone-400 mt-0.5">x{item.quantity} � {formatPrice(item.price)} / unit�</p>
                  </div>
                  <p className="font-semibold text-stone-800 text-sm shrink-0">{formatPrice(item.subtotal)}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-stone-100 space-y-2 text-sm">
              <div className="flex justify-between text-stone-600"><span>Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-stone-600"><span>Livraison</span><span>{formatPrice(order.shippingCost)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600"><span>R�duction</span><span>-{formatPrice(order.discount)}</span></div>
              )}
              <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-100 text-base">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Suivi */}
          {order.tracking?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h2 className="font-semibold text-stone-800 mb-4">Suivi de commande</h2>
              <div className="space-y-3">
                {[...order.tracking].reverse().map((track, i) => (
                  <div key={track.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? 'bg-rose-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                        <CheckCircle2 size={14} />
                      </div>
                      {i < order.tracking.length - 1 && <div className="w-0.5 h-6 bg-stone-100 my-1" />}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-medium text-stone-800">{ORDER_STATUS_LABELS[track.status]}</p>
                      <p className="text-xs text-stone-400">{track.message}</p>
                      <p className="text-xs text-stone-300 mt-0.5">{formatDateTime(track.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Infos livraison & paiement */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h2 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-rose-400" /> Livraison
            </h2>
            <div className="text-sm text-stone-600 space-y-1">
              <p className="font-medium text-stone-800">{addr?.fullName}</p>
              <p>{addr?.phone}</p>
              <p>{addr?.street}</p>
              <p>{addr?.city}, {addr?.country}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h2 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <CreditCard size={16} className="text-rose-400" /> Paiement
            </h2>
            <p className="text-sm text-stone-600">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
          </div>

          {order.notes && (
            <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4">
              <p className="text-xs font-medium text-stone-500 mb-1">Notes</p>
              <p className="text-sm text-stone-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}