'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  EyeIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useOrders, useUpdateOrder } from '@/hooks/useOrders';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/utils/currency';

type StatusFilter = 'ALL' | 'PENDING' | 'PROCESSING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
type PeriodFilter = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';

function OrdersPageContent() {
  const { user } = useAuth();
  const isSeller = user?.role === 'VENDEUSE';
  const { data: orders = [], isLoading } = useOrders(false, isSeller);
  const { mutate: updateOrder } = useUpdateOrder();

  // Filtres
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal confirmation
  const [confirmAction, setConfirmAction] = useState<{ type: 'archive' | 'cancel'; orderId: string } | null>(null);

  // Filtrage des commandes
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filtre par statut
      if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;
      
      // Filtre par période
      if (periodFilter !== 'ALL') {
        const orderDate = new Date(order.createdAt);
        if (periodFilter === 'TODAY' && !isToday(orderDate)) return false;
        if (periodFilter === 'WEEK' && !isThisWeek(orderDate, { weekStartsOn: 1 })) return false;
        if (periodFilter === 'MONTH' && !isThisMonth(orderDate)) return false;
      }
      
      // Filtre par recherche
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(query);
        const matchesCustomer = order.customerName?.toLowerCase().includes(query) || 
                               order.customerEmail?.toLowerCase().includes(query);
        const matchesProduct = order.items.some(item => 
          item.product?.name?.toLowerCase().includes(query)
        );
        if (!matchesOrderNumber && !matchesCustomer && !matchesProduct) return false;
      }
      
      return true;
    });
  }, [orders, statusFilter, periodFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const pending = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;
    const completed = orders.filter(o => o.status === 'DELIVERED').length;
    const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
    return { pending, completed, cancelled, total: orders.length };
  }, [orders]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
      PAID: 'bg-green-100 text-green-800 border-green-200',
      SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
      DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    updateOrder({ id: orderId, data: { status: newStatus } });
    setConfirmAction(null);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isSeller ? 'Mes Commandes' : 'Commandes'}
                </h1>
                <p className="text-xs text-gray-500">{filteredOrders.length} commande(s)</p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par n°, client, produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
            {/* Status filters */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Statut</p>
              <div className="flex flex-wrap gap-2">
                {(['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'ALL' ? 'Toutes' : getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            {/* Period filters */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Période</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'ALL', label: 'Toutes' },
                  { value: 'TODAY', label: "Aujourd'hui" },
                  { value: 'WEEK', label: 'Cette semaine' },
                  { value: 'MONTH', label: 'Ce mois' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setPeriodFilter(value as PeriodFilter)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      periodFilter === value
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats - Seller only */}
      {isSeller && (
        <div className="px-4 py-4 grid grid-cols-4 gap-2">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            <p className="text-[10px] text-gray-500">Total</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-[10px] text-gray-500">En cours</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-green-600">{stats.completed}</p>
            <p className="text-[10px] text-gray-500">Livrées</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-[10px] text-gray-500">Annulées</p>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="px-4 space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <span className="text-5xl mb-4 block">📦</span>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucune commande</h2>
            <p className="text-sm text-gray-500">
              {searchQuery || statusFilter !== 'ALL' || periodFilter !== 'ALL'
                ? 'Aucune commande ne correspond à vos critères'
                : isSeller 
                  ? 'Aucune commande pour vos produits'
                  : "Vous n'avez pas encore de commande"
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {format(new Date(order.createdAt), 'dd MMM yyyy • HH:mm', { locale: fr })}
                    </p>
                    {isSeller && (
                      <p className="text-xs text-gray-600 mt-1">
                        👤 {order.customerName || order.user?.profile?.firstName || 'Client'}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(order.total, 'XOF')}</p>
                    <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 truncate flex-1 mr-2">
                        {item.product?.name || 'Produit'} <span className="text-gray-400">×{item.quantity}</span>
                      </span>
                      <span className="text-gray-900 font-medium whitespace-nowrap">
                        {formatCurrency(item.price * item.quantity, 'XOF')}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-gray-400 text-center">
                      +{order.items.length - 2} autre(s)
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-pink-600"
                >
                  <EyeIcon className="h-4 w-4" />
                  Détails
                </Link>

                {isSeller && (
                  <div className="flex items-center gap-2">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium"
                      >
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        Traiter
                      </button>
                    )}
                    {order.status === 'PROCESSING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium"
                      >
                        📦 Expédier
                      </button>
                    )}
                    {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                      <button
                        onClick={() => setConfirmAction({ type: 'cancel', orderId: order.id })}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Annuler"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmAction.type === 'cancel' ? 'Annuler la commande ?' : 'Archiver la commande ?'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {confirmAction.type === 'cancel' 
                ? 'Cette action ne peut pas être annulée. Le client sera notifié.'
                : 'La commande sera déplacée vers les archives.'
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                Non, garder
              </button>
              <button
                onClick={() => handleUpdateStatus(confirmAction.orderId, 'CANCELLED')}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium"
              >
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}
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
