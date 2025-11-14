'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export default function ProductCard({ id, name, price, image, category }: ProductCardProps) {
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
      </div>
    </Link>
  );
}

