'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ClockIcon, StarIcon } from '@heroicons/react/24/solid';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';
import FavoriteButton from './FavoriteButton';

interface ServiceCardProps {
  id: string;
  name: string;
  price: number;
  duration: number;
  image?: string;
  provider?: string;
  rating?: number;
}

export default function ServiceCard({ 
  id, 
  name, 
  price, 
  duration, 
  image, 
  provider,
  rating = 4.5 
}: ServiceCardProps) {
  const currency = getSelectedCurrency();
  return (
    <Link href={`/services/${id}`} className="group flex flex-col h-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Image - format carré comme ProductCard */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 flex-shrink-0">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
            <span className="text-4xl sm:text-5xl">💇‍♀️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        {/* Bouton Favoris */}
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton serviceId={id} size="sm" />
        </div>
        {/* Badge durée */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 rounded-full text-white text-[10px] sm:text-xs">
          <ClockIcon className="h-3 w-3" />
          <span>{duration}min</span>
        </div>
        {/* Badge note */}
        {rating > 0 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-400 rounded-full text-[10px] sm:text-xs font-medium text-gray-900">
            <StarIcon className="h-3 w-3" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      {/* Contenu */}
      <div className="p-2 sm:p-3 flex flex-col flex-grow">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
          {name}
        </h3>
        {provider && (
          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">par {provider}</p>
        )}
        <p className="mt-1 sm:mt-2 text-sm sm:text-base font-bold text-purple-600">{formatCurrency(price, currency)}</p>
      </div>
    </Link>
  );
}

