'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cart.store';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  stock?: number;
  description?: string;
}

export default function ProductCard({ id, name, price, image, category, stock = 0, description }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const notifications = useNotifications();
  const currency = getSelectedCurrency();

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

  return (
    <Link href={`/products/${id}`} className="group flex flex-col h-full bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-gray-100 flex-shrink-0">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-rose-100">
            <span className="text-6xl">✨</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        {category && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 line-clamp-1">{category}</p>
        )}
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-2 min-h-[2.5rem]">
          {name}
        </h3>
        {description && (
          <p className="mt-2 text-xs text-gray-600 line-clamp-2 flex-grow">
            {description}
          </p>
        )}
        <p className="mt-2 text-base sm:text-lg font-bold text-pink-600">{formatCurrency(price, currency)}</p>
        <button
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-pink-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBagIcon className="h-4 w-4" />
          {stock <= 0 ? 'Épuisé' : 'Ajouter'}
        </button>
      </div>
    </Link>
  );
}
