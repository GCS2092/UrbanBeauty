'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cart.store';
import { useNotifications } from '@/components/admin/NotificationProvider';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  stock?: number;
}

export default function ProductCard({ id, name, price, image, category, stock = 0 }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const notifications = useNotifications();

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
    <Link href={`/products/${id}`} className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-100 to-rose-100">
            <span className="text-4xl">✨</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>
      <div className="mt-4">
        {category && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{category}</p>
        )}
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
          {name}
        </h3>
        <p className="mt-1 text-sm font-semibold text-gray-900">{price.toFixed(2)} €</p>
        <button
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBagIcon className="h-4 w-4" />
          {stock <= 0 ? 'Épuisé' : 'Ajouter'}
        </button>
      </div>
    </Link>
  );
}

