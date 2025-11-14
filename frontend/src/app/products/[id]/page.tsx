'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useProduct } from '@/hooks/useProducts';
import { useParams } from 'next/navigation';
import { useCartStore } from '@/store/cart.store';
import { useNotifications } from '@/components/admin/NotificationProvider';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = typeof params?.id === 'string' ? params.id : '';
  const { data: product, isLoading, error } = useProduct(productId);
  const addItem = useCartStore((state) => state.addItem);
  const notifications = useNotifications();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.stock <= 0) {
      notifications.warning('Stock épuisé', 'Ce produit n\'est plus disponible');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      stock: product.stock,
    }, quantity);
    
    notifications.success('Ajouté au panier', `${product.name} a été ajouté à votre panier`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Produit introuvable</p>
          <Link href="/products" className="text-pink-600 hover:text-pink-700 mt-4 inline-block">
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/products" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux produits
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center overflow-hidden">
            {product.images?.[0]?.url ? (
              <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl">✨</span>
            )}
          </div>

          {/* Détails */}
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">{product.category?.name || 'Produit'}</p>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-pink-600 mb-6">{product.price.toFixed(2)} €</p>
            
            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Stock disponible : <span className="text-gray-900 font-medium">{product.stock}</span></p>
            </div>

            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                {product.stock <= 0 ? 'Épuisé' : 'Ajouter au panier'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

