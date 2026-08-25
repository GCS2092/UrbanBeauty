import { useEffect, useState } from 'react';
import { sellersApi } from '../../api/sellers.api';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants';
import { formatPrice } from '../../utils/formatPrice';

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  
  useEffect(() => {
    loadOrders();
  }, [filter]);
  
  const loadOrders = async () => {
    try {
      const params = filter !== 'ALL' ? { status: filter } : {};
      const { data } = await sellersApi.getOrders(params);
      setOrders(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div className="text-stone-500">Chargement...</div>;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Commandes de mes produits</h1>
        <p className="text-stone-500 mt-1">Suivez les commandes contenant vos produits</p>
      </div>
      
      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-rose-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {status === 'ALL' ? 'Toutes' : ORDER_STATUS_LABELS[status]}
          </button>
        ))}
      </div>
      
      {/* Liste des commandes */}
      {orders.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p className="text-lg">Aucune commande pour le moment</p>
          <p className="text-sm mt-2">Les commandes contenant vos produits apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-semibold text-stone-800">#{order.orderNumber}</span>
          <span className="text-sm text-stone-500 ml-2">
            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>
      
      {/* Info client */}
      {order.user && (
        <div className="mb-3 p-3 bg-stone-50 rounded-lg">
          <p className="text-sm font-medium text-stone-800">{order.user.firstName} {order.user.lastName}</p>
          <p className="text-xs text-stone-500">{order.user.email}</p>
          <p className="text-xs text-stone-500">{order.user.phone}</p>
        </div>
      )}
      
      {/* Produits du vendeur dans cette commande */}
      <div className="space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm p-2 bg-stone-50 rounded">
            <div>
              <span className="font-medium text-stone-800">{item.productName}</span>
              {item.variantLabel && <span className="text-stone-500 ml-2">({item.variantLabel})</span>}
              <span className="text-stone-500 ml-2">x{item.quantity}</span>
            </div>
            <span className="font-medium text-stone-800">
              {formatPrice(item.subtotal)}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between">
        <span className="font-semibold text-stone-800">Total commande</span>
        <span className="font-bold text-stone-900">
          {formatPrice(order.total)}
        </span>
      </div>
    </div>
  );
}
