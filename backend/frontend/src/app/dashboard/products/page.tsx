'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useProducts } from '@/hooks/useProducts';
import { useDeleteProduct } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { formatCurrency } from '@/utils/currency';
import Image from 'next/image';

type StockFilter = 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

function ProductsPageContent() {
  const { user } = useAuth();
  const { data: products = [], isLoading, refetch } = useProducts();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const notifications = useNotifications();
  
  // États
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Rafraîchir automatiquement
  useEffect(() => {
    const interval = setInterval(() => refetch(), 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Filtrer les produits de la vendeuse
  const myProducts = user?.role === 'VENDEUSE' 
    ? products.filter(p => p.sellerId === user.id)
    : products;

  // Appliquer les filtres
  const filteredProducts = useMemo(() => {
    return myProducts.filter(product => {
      // Filtre par recherche
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!product.name.toLowerCase().includes(query) && 
            !product.category?.name?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Filtre par stock
      if (stockFilter === 'IN_STOCK' && product.stock <= 0) return false;
      if (stockFilter === 'LOW_STOCK' && (product.stock === 0 || product.stock > (product.lowStockThreshold || 10))) return false;
      if (stockFilter === 'OUT_OF_STOCK' && product.stock > 0) return false;

      return true;
    });
  }, [myProducts, searchQuery, stockFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: myProducts.length,
    inStock: myProducts.filter(p => p.stock > (p.lowStockThreshold || 10)).length,
    lowStock: myProducts.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10)).length,
    outOfStock: myProducts.filter(p => p.stock === 0).length,
  }), [myProducts]);

  const handleDeleteConfirm = (id: string) => {
    deleteProduct(id, {
      onSuccess: () => {
        notifications.success('Produit supprimé', 'Le produit a été supprimé');
        setDeleteConfirmId(null);
      },
      onError: () => {
        notifications.error('Erreur', 'Impossible de supprimer le produit');
        setDeleteConfirmId(null);
      },
    });
  };

  const getStockBadge = (stock: number, threshold: number = 10) => {
    if (stock === 0) {
      return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Épuisé</span>;
    }
    if (stock <= threshold) {
      return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Stock bas ({stock})</span>;
    }
    return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">En stock ({stock})</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mes Produits</h1>
                <p className="text-xs text-gray-500">{filteredProducts.length} produit(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <FunnelIcon className="h-5 w-5" />
              </button>
              <Link
                href="/dashboard/products/new"
                className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl text-sm font-medium"
              >
                <PlusIcon className="h-4 w-4" />
                Ajouter
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Stock</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'ALL', label: 'Tous', count: stats.total },
                { key: 'IN_STOCK', label: 'En stock', count: stats.inStock, color: 'green' },
                { key: 'LOW_STOCK', label: 'Stock bas', count: stats.lowStock, color: 'orange' },
                { key: 'OUT_OF_STOCK', label: 'Épuisés', count: stats.outOfStock, color: 'red' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStockFilter(f.key as StockFilter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    stockFilter === f.key
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats cards */}
      <div className="px-4 py-4 grid grid-cols-4 gap-2">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-lg font-bold text-gray-900">{stats.total}</p>
          <p className="text-[10px] text-gray-500">Total</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center shadow-sm">
          <p className="text-lg font-bold text-green-600">{stats.inStock}</p>
          <p className="text-[10px] text-gray-500">En stock</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center shadow-sm">
          <p className="text-lg font-bold text-orange-600">{stats.lowStock}</p>
          <p className="text-[10px] text-gray-500">Stock bas</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center shadow-sm">
          <p className="text-lg font-bold text-red-600">{stats.outOfStock}</p>
          <p className="text-[10px] text-gray-500">Épuisés</p>
        </div>
      </div>

      {/* Products list */}
      <div className="px-4 space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <span className="text-5xl mb-4 block">📦</span>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit</h2>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery || stockFilter !== 'ALL'
                ? 'Aucun produit ne correspond à vos critères'
                : 'Commencez par ajouter votre premier produit'
              }
            </p>
            {!searchQuery && stockFilter === 'ALL' && (
              <Link
                href="/dashboard/products/new"
                className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl text-sm font-medium"
              >
                Ajouter un produit
              </Link>
            )}
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {deleteConfirmId === product.id ? (
                // Confirmation de suppression
                <div className="p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    Supprimer <strong>"{product.name}"</strong> ?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm"
                    >
                      Non
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(product.id)}
                      disabled={isDeleting}
                      className="flex-1 py-2 bg-red-600 text-white rounded-xl font-medium text-sm disabled:opacity-50"
                    >
                      {isDeleting ? 'Suppression...' : 'Oui, supprimer'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center p-3 gap-3">
                  {/* Image */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{product.category?.name || 'Sans catégorie'}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-bold text-pink-600 text-sm">
                        {formatCurrency(product.price, 'XOF')}
                      </span>
                      {getStockBadge(product.stock, product.lowStockThreshold)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirmId(product.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ProtectedRoute requiredRole={['VENDEUSE', 'ADMIN']}>
      <ProductsPageContent />
    </ProtectedRoute>
  );
}
