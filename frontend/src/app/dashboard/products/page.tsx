'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useProducts } from '@/hooks/useProducts';
import { useDeleteProduct } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';
import Image from 'next/image';

function ProductsPageContent() {
  const { user } = useAuth();
  const { data: products = [], isLoading, refetch } = useProducts();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const notifications = useNotifications();
  const currency = getSelectedCurrency();
  
  // État pour la confirmation de suppression
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Rafraîchir automatiquement toutes les 30 secondes pour voir les mises à jour de stock
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Filtrer les produits de la vendeuse
  const myProducts = user?.role === 'VENDEUSE' 
    ? products.filter(p => p.sellerId === user.id)
    : products;

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = (id: string, name: string) => {
    deleteProduct(id, {
      onSuccess: () => {
        notifications.success('Produit supprimé', 'Le produit a été supprimé avec succès');
        setDeleteConfirmId(null);
      },
      onError: (error: any) => {
        notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la suppression');
        setDeleteConfirmId(null);
      },
    });
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Mes Produits</h1>
          </div>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center justify-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 active:bg-pink-800 transition-colors touch-manipulation"
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter un produit
          </Link>
        </div>

        {myProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">📦</span>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucun produit</h2>
            <p className="text-gray-600 mb-6">Commencez par ajouter votre premier produit</p>
            <Link
              href="/dashboard/products/new"
              className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Ajouter un produit
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow relative">
                {/* Modal de confirmation de suppression */}
                {deleteConfirmId === product.id && (
                  <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-5 max-w-xs w-full text-center shadow-xl">
                      <div className="text-4xl mb-3">🗑️</div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Supprimer ce produit ?</p>
                      <p className="text-xs text-gray-500 mb-4 line-clamp-2">"{product.name}"</p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          disabled={isDeleting}
                          className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg active:bg-gray-200 transition-colors touch-manipulation disabled:opacity-50"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteConfirm(product.id, product.name)}
                          disabled={isDeleting}
                          className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-lg active:bg-red-700 transition-colors touch-manipulation disabled:opacity-50"
                        >
                          {isDeleting ? 'Suppression...' : 'Supprimer'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {product.images?.[0]?.url ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                    <span className="text-4xl">✨</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category?.name}</p>
                  <p className="text-lg font-bold text-pink-600 mb-3">{formatCurrency(product.price, currency)}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                    {product.stock <= (product.lowStockThreshold || 10) && (
                      <span className="text-xs text-red-600 font-medium">⚠️ Stock bas</span>
                    )}
                  </div>
                  
                  {/* Boutons plus grands pour mobile */}
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="flex-1 text-center px-4 py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors inline-flex items-center justify-center touch-manipulation"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(product.id)}
                      className="px-4 py-3 text-sm font-medium bg-red-100 text-red-600 rounded-lg hover:bg-red-200 active:bg-red-300 transition-colors touch-manipulation"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ProtectedRoute requiredRole="VENDEUSE">
      <ProductsPageContent />
    </ProtectedRoute>
  );
}
