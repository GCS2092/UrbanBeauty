'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeftIcon,
  HeartIcon,
  TrashIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useFavorites, useRemoveFavorite, useClearFavorites } from '@/hooks/useFavorites';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';

type FilterType = 'all' | 'products' | 'services';

function FavoritesPageContent() {
  const { data: favorites = [], isLoading } = useFavorites();
  const { mutate: removeFavorite, isPending: isRemoving } = useRemoveFavorite();
  const { mutate: clearAll, isPending: isClearing } = useClearFavorites();
  const notifications = useNotifications();
  const currency = getSelectedCurrency();

  const [filter, setFilter] = useState<FilterType>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  // Filtrage
  const filteredFavorites = favorites.filter((fav) => {
    if (filter === 'products') return fav.productId != null;
    if (filter === 'services') return fav.serviceId != null;
    return true;
  });

  // Compteurs
  const productsCount = favorites.filter((f) => f.productId).length;
  const servicesCount = favorites.filter((f) => f.serviceId).length;

  const handleRemove = (favoriteId: string) => {
    removeFavorite(favoriteId, {
      onSuccess: () => {
        notifications.success('Retiré', 'Retiré des favoris');
      },
    });
  };

  const handleClearAll = () => {
    clearAll(undefined, {
      onSuccess: (data) => {
        notifications.success('Terminé', data.message);
        setConfirmClear(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <HeartIconSolid className="h-5 w-5 text-red-500" />
                  Mes Favoris
                </h1>
                <p className="text-xs text-gray-500">{favorites.length} article(s)</p>
              </div>
            </div>
            {favorites.length > 0 && (
              <button
                onClick={() => setConfirmClear(true)}
                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                title="Vider les favoris"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filtres */}
        {favorites.length > 0 && (
          <div className="px-4 pb-3 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Tous ({favorites.length})
            </button>
            <button
              onClick={() => setFilter('products')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                filter === 'products'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <ShoppingBagIcon className="h-4 w-4" />
              Produits ({productsCount})
            </button>
            <button
              onClick={() => setFilter('services')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                filter === 'services'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <SparklesIcon className="h-4 w-4" />
              Services ({servicesCount})
            </button>
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="px-4 py-4">
        {filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <HeartIcon className="h-16 w-16 mx-auto text-gray-200 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {favorites.length === 0 ? 'Aucun favori' : 'Aucun résultat'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {favorites.length === 0
                ? 'Ajoutez des produits ou services à vos favoris pour les retrouver facilement'
                : 'Aucun favori ne correspond à ce filtre'
              }
            </p>
            {favorites.length === 0 && (
              <div className="flex gap-3 justify-center">
                <Link
                  href="/products"
                  className="px-4 py-2 bg-pink-600 text-white rounded-xl font-medium text-sm"
                >
                  Voir les produits
                </Link>
                <Link
                  href="/services"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium text-sm"
                >
                  Voir les services
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredFavorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-100">
                  {favorite.product ? (
                    <Link href={`/products/${favorite.product.id}`}>
                      {favorite.product.images?.[0]?.url ? (
                        <Image
                          src={favorite.product.images[0].url}
                          alt={favorite.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBagIcon className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                      {favorite.product.isOnSale && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                          PROMO
                        </span>
                      )}
                    </Link>
                  ) : favorite.service ? (
                    <Link href={`/services/${favorite.service.id}`}>
                      {favorite.service.images?.[0]?.url ? (
                        <Image
                          src={favorite.service.images[0].url}
                          alt={favorite.service.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                          <SparklesIcon className="h-12 w-12 text-purple-400" />
                        </div>
                      )}
                    </Link>
                  ) : null}

                  {/* Bouton supprimer */}
                  <button
                    onClick={() => handleRemove(favorite.id)}
                    disabled={isRemoving}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                  >
                    <HeartIconSolid className="h-5 w-5 text-red-500" />
                  </button>
                </div>

                {/* Infos */}
                <div className="p-3">
                  {favorite.product ? (
                    <Link href={`/products/${favorite.product.id}`}>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {favorite.product.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {favorite.product.isOnSale && favorite.product.discountPrice ? (
                          <>
                            <span className="text-sm font-bold text-red-600">
                              {formatCurrency(favorite.product.discountPrice, currency)}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              {formatCurrency(favorite.product.price, currency)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(favorite.product.price, currency)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ) : favorite.service ? (
                    <Link href={`/services/${favorite.service.id}`}>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {favorite.service.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-purple-600">
                          {formatCurrency(favorite.service.price, currency)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {favorite.service.duration} min
                        </span>
                      </div>
                      {favorite.service.provider && (
                        <p className="text-xs text-gray-500 mt-1">
                          par {favorite.service.provider.firstName}
                        </p>
                      )}
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal confirmation */}
      {confirmClear && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Vider les favoris ?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Tous vos favoris seront supprimés. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {isClearing ? '...' : 'Vider'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <FavoritesPageContent />
    </ProtectedRoute>
  );
}

