'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ClockIcon, StarIcon } from '@heroicons/react/24/solid';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';

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
    <Link href={`/services/${id}`} className="group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
            <span className="text-4xl">💇‍♀️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-1">
              <StarIcon className="h-4 w-4 fill-yellow-400" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <ClockIcon className="h-4 w-4" />
              <span>{duration}min</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
          {name}
        </h3>
        {provider && (
          <p className="mt-1 text-xs text-gray-500">par {provider}</p>
        )}
        <p className="mt-2 text-sm font-semibold text-gray-900">{formatCurrency(price, currency)}</p>
      </div>
    </Link>
  );
}

