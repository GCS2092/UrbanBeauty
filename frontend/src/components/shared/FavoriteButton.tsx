'use client';

import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/hooks/useAuth';
import {
  useIsProductFavorite,
  useIsServiceFavorite,
  useToggleProductFavorite,
  useToggleServiceFavorite,
} from '@/hooks/useFavorites';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  productId?: string;
  serviceId?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showBackground?: boolean;
}

export default function FavoriteButton({
  productId,
  serviceId,
  size = 'md',
  className = '',
  showBackground = true,
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [localFavorite, setLocalFavorite] = useState(false);

  // Hooks pour produits
  const { data: isProductFav, isLoading: loadingProduct } = useIsProductFavorite(
    isAuthenticated && productId ? productId : ''
  );
  const { toggle: toggleProduct, isPending: pendingProduct } = useToggleProductFavorite();

  // Hooks pour services
  const { data: isServiceFav, isLoading: loadingService } = useIsServiceFavorite(
    isAuthenticated && serviceId ? serviceId : ''
  );
  const { toggle: toggleService, isPending: pendingService } = useToggleServiceFavorite();

  const isLoading = loadingProduct || loadingService;
  const isPending = pendingProduct || pendingService;

  // Mettre à jour l'état local quand les données sont chargées
  useEffect(() => {
    if (productId && isProductFav !== undefined) {
      setLocalFavorite(isProductFav);
    }
    if (serviceId && isServiceFav !== undefined) {
      setLocalFavorite(isServiceFav);
    }
  }, [isProductFav, isServiceFav, productId, serviceId]);

  const isFavorite = localFavorite;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    // Mise à jour optimiste
    setLocalFavorite(!isFavorite);

    if (productId) {
      toggleProduct(productId, isFavorite);
    } else if (serviceId) {
      toggleService(serviceId, isFavorite);
    }
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending || isLoading}
      className={`
        ${buttonSizeClasses[size]}
        ${showBackground ? 'bg-white/90 hover:bg-white shadow-sm' : 'bg-transparent'}
        rounded-full transition-all duration-200
        ${isPending ? 'opacity-50' : 'active:scale-90'}
        ${className}
      `}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {isFavorite ? (
        <HeartIconSolid className={`${sizeClasses[size]} text-red-500`} />
      ) : (
        <HeartIcon className={`${sizeClasses[size]} text-gray-600 hover:text-red-500`} />
      )}
    </button>
  );
}

