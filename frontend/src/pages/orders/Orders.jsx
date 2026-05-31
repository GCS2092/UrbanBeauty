import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { ordersApi } from '../../api/orders.api';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import OrderStatusBadge from '../../components/shared/OrderStatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getMyOrders().then((r) => r.data),
  });

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">Mes commandes</h1>

      {!orders?.length ? (
        <EmptyState
          icon="??"
          title="Aucune commande"
          description="Vous n'avez pas encore passé de commande"
          action={<Link to="/products"><Button>Découvrir la boutique</Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.orderNumber}`}
              className="block bg-white rounded-2xl border border-stone-100 p-5 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-400 shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-stone-800 text-sm">#{order.orderNumber}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-stone-400">
                      {order.items?.length} article{order.items?.length > 1 ? 's' : ''} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-stone-900">{formatPrice(order.total)}</p>
                  <ChevronRight size={16} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
                </div>
              </div>

              {/* Aperçu articles */}
              {order.items?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-stone-50 flex gap-2">
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="text-xs text-stone-400 bg-stone-50 rounded-lg px-2 py-1 truncate max-w-[120px]">
                      {item.productName}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="text-xs text-stone-400 bg-stone-50 rounded-lg px-2 py-1">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
