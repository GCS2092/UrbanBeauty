'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, StarIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  city?: string;
  country?: string;
  avatar?: string;
  bio?: string;
  specialties?: string[];
  experience?: number;
  rating?: number;
  totalBookings: number;
  completedBookings: number;
  cancellationRate?: number;
  servicesCount: number;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    images?: Array<{ url: string }>;
  }>;
}

export default function PrestatairesPage() {
  const [sortBy, setSortBy] = useState<'rating' | 'bookings' | 'name'>('rating');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: providers = [], isLoading, error } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await api.get('/api/profile/providers');
      return response.data;
    },
  });

  // Filtrer et trier les prestataires
  const filteredAndSortedProviders = useMemo(() => {
    let filtered = providers;

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(provider => 
        `${provider.firstName} ${provider.lastName}`.toLowerCase().includes(query) ||
        provider.specialties?.some(s => s.toLowerCase().includes(query)) ||
        provider.city?.toLowerCase().includes(query) ||
        provider.bio?.toLowerCase().includes(query)
      );
    }

    // Tri
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'bookings':
          return b.totalBookings - a.totalBookings;
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        default:
          return 0;
      }
    });

    return sorted;
  }, [providers, sortBy, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des prestataires...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erreur lors du chargement des prestataires</p>
          <Link href="/" className="text-pink-600 hover:text-pink-700 mt-4 inline-block">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Nos Prestataires</h1>
          <p className="mt-2 text-gray-600">Découvrez nos professionnels de la beauté</p>
        </div>

        {/* Filtres et recherche */}
        <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher un prestataire, une spécialité, une ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          {/* Tri */}
          <div className="flex items-center gap-2 sm:gap-4">
            <FunnelIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'bookings' | 'name')}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent text-sm sm:text-base bg-white"
            >
              <option value="rating">Trier par note</option>
              <option value="bookings">Trier par réservations</option>
              <option value="name">Trier par nom</option>
            </select>
          </div>
        </div>

        {/* Résultats */}
        <p className="text-sm text-gray-600 mb-4 sm:mb-6">
          {filteredAndSortedProviders.length} prestataire{filteredAndSortedProviders.length > 1 ? 's' : ''} trouvé{filteredAndSortedProviders.length > 1 ? 's' : ''}
        </p>

        {/* Grille de prestataires - Responsive */}
        {filteredAndSortedProviders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <span className="text-6xl mb-4 block">🔍</span>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Aucun prestataire trouvé</h2>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Aucun prestataire disponible pour le moment'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredAndSortedProviders.map((provider) => {
              const fullName = `${provider.firstName} ${provider.lastName}`;
              const rating = provider.rating || 0;
              const completionRate = provider.totalBookings > 0
                ? Math.round((provider.completedBookings / provider.totalBookings) * 100)
                : 0;

              return (
                <Link
                  key={provider.id}
                  href={`/prestataires/${provider.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                >
                  {/* Avatar */}
                  <div className="relative h-48 sm:h-56 w-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center overflow-hidden">
                    {provider.avatar ? (
                      <Image
                        src={provider.avatar}
                        alt={fullName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                    ) : (
                      <span className="text-6xl sm:text-7xl">💇‍♀️</span>
                    )}
                  </div>

                  {/* Informations */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 text-lg sm:text-xl mb-1 line-clamp-1">
                      {fullName}
                    </h3>
                    
                    {provider.city && (
                      <p className="text-xs sm:text-sm text-gray-500 mb-2 flex items-center">
                        <span className="mr-1">📍</span>
                        {provider.city}{provider.country && `, ${provider.country}`}
                      </p>
                    )}

                    {/* Spécialités */}
                    {provider.specialties && provider.specialties.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {provider.specialties.slice(0, 2).map((specialty, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 text-xs bg-pink-50 text-pink-700 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                        {provider.specialties.length > 2 && (
                          <span className="text-xs text-gray-500">+{provider.specialties.length - 2}</span>
                        )}
                      </div>
                    )}

                    {/* Note et statistiques */}
                    <div className="mt-auto space-y-2">
                      <div className="flex items-center gap-1">
                        <StarIconSolid className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {rating.toFixed(1)}
                        </span>
                        {provider.totalBookings > 0 && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({provider.totalBookings} réservation{provider.totalBookings > 1 ? 's' : ''})
                          </span>
                        )}
                      </div>

                      {provider.experience && (
                        <p className="text-xs text-gray-600">
                          {provider.experience} an{provider.experience > 1 ? 's' : ''} d'expérience
                        </p>
                      )}

                      {provider.servicesCount > 0 && (
                        <p className="text-xs text-gray-600">
                          {provider.servicesCount} service{provider.servicesCount > 1 ? 's' : ''} disponible{provider.servicesCount > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
