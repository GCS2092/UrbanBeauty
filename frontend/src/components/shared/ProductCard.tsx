'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cart.store';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { formatCurrency, getCurrencyForRole } from '@/utils/currency';
import FavoriteButton from './FavoriteButton';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  stock?: number;
  description?: string;
  sellerId?: string; // ID du vendeur pour vérifier si c'est le produit de l'utilisateur
}

export default function ProductCard({ id, name, price, image, category, stock = 0, description, sellerId }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { user } = useAuth();
  const notifications = useNotifications();
  // Clients voient dans leur devise choisie, vendeurs/admin voient en XOF
  const currency = getCurrencyForRole(user?.role);
  
  // Masquer le bouton pour les admins et pour les vendeuses si c'est leur propre produit
  const canAddToCart = user?.role !== 'ADMIN' && !(user?.role === 'VENDEUSE' && sellerId === user?.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (stock <= 0) {
      notifications.warning('Stock épuisé', 'Ce produit n\'est plus disponible');
      return;
    }

    addItem({
      id,
      name,
      price,
      image,
      stock,
    }, 1);
    
    notifications.success('Ajouté au panier', `${name} a été ajouté à votre panier`);
  };

  const handleChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sellerId) {
      window.location.href = `/dashboard/chat?userId=${sellerId}`;
    }
  };

  return (
    <Link href={`/products/${id}`} className="group flex flex-row h-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Image à gauche */}
      <div className="relative w-24 sm:w-32 md:w-40 h-24 sm:h-32 md:h-40 flex-shrink-0 overflow-hidden bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 160px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-rose-100">
            <span className="text-2xl sm:text-3xl">✨</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        {/* Bouton Favoris */}
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10">
          <FavoriteButton productId={id} size="sm" />
        </div>
      </div>

      {/* Détails et boutons au centre */}
      <div className="flex-1 flex flex-col p-2 sm:p-3 min-w-0">
        {category && (
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 line-clamp-1">{category}</p>
        )}
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-2 mb-1">
          {name}
        </h3>
        
        {/* Stock et quantité */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded ${
            stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {stock > 0 ? `Stock: ${stock}` : 'Épuisé'}
          </span>
        </div>

        {/* Prix */}
        <p className="text-sm sm:text-base font-bold text-pink-600 mb-2">{formatCurrency(price, currency)}</p>

        {/* Boutons au milieu */}
        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
          {canAddToCart && stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1 bg-pink-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-[10px] sm:text-xs font-medium hover:bg-pink-700 transition-colors"
            >
              <ShoppingBagIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Panier</span>
            </button>
          )}
          {sellerId && canAddToCart && (
            <button
              onClick={handleChat}
              className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-[10px] sm:text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              <span className="hidden sm:inline">💬</span>
              <span className="text-[10px] sm:text-xs">Discuter</span>
            </button>
          )}
          {canAddToCart && stock <= 0 && (
            <div className="w-full text-center text-[10px] sm:text-xs text-gray-500 py-1.5 sm:py-2 bg-gray-100 rounded-md">
              Épuisé
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
