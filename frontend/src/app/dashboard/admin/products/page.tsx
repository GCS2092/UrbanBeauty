'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useNotifications } from '@/components/admin/NotificationProvider';
import Image from 'next/image';

function AdminProductsContent() {
  const router = useRouter();
  const { data: products = [], isLoading, error, refetch } = useProducts();
  const { mutate: deleteProduct } = useDeleteProduct();
  const notifications = useNotifications();

  // Rafraîchir automatiquement toutes les 30 secondes pour voir les mises à jour de stock
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erreur lors du chargement des produits</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour à l'administration
          </Link>
          <Link
            href="/dashboard/admin/products/new"
            className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouveau produit
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Gestion des Produits</h1>

        {/* Tableau des produits */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-16 w-16 relative rounded-lg overflow-hidden bg-gray-100">
                        {product.images?.[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-2xl">✨</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.brand || 'UrbanBeauty'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{product.category?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.price.toFixed(2)} €</div>
                      {product.isOnSale && (
                        <div className="text-xs text-red-600">
                          -{product.discountPercentage}%
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        product.stock <= (product.lowStockThreshold || 0) ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/dashboard/admin/products/${product.id}/edit`}
                          className="text-pink-600 hover:text-pink-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                              deleteProduct(product.id, {
                                onSuccess: () => {
                                  notifications.success('Produit supprimé', 'Le produit a été supprimé avec succès');
                                },
                                onError: (error: any) => {
                                  notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la suppression');
                                },
                              });
                            }
                          }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {products.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">📦</span>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucun produit</h2>
            <p className="text-gray-600 mb-6">Commencez par ajouter votre premier produit</p>
            <Link
              href="/dashboard/admin/products/new"
              className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              + Ajouter un produit
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminProductsContent />
    </ProtectedRoute>
  );
}

