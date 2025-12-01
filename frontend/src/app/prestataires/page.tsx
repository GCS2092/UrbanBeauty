'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeftIcon, 
  MagnifyingGlassIcon, 
  MapPinIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

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
  const { isAuthenticated } = useAuth();
  const [sortBy, setSortBy] = useState<'rating' | 'bookings' | 'name'>('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const { data: providers = [], isLoading } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await api.get('/api/profile/providers');
      return response.data;
    },
  });

  const cities = useMemo(() => {
    const citySet = new Set<string>();
    providers.forEach(p => {
      if (p.city) citySet.add(p.city);
    });
    return Array.from(citySet);
  }, [providers]);

  const filteredProviders = useMemo(() => {
    let filtered = providers;

    if (selectedCity) {
      filtered = filtered.filter(p => p.city === selectedCity);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(provider => 
        `${provider.firstName} ${provider.lastName}`.toLowerCase().includes(query) ||
        provider.specialties?.some(s => s.toLowerCase().includes(query)) ||
        provider.city?.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
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
  }, [providers, sortBy, searchQuery, selectedCity]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white ${!isAuthenticated ? 'pb-16 md:pb-0' : ''}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="ml-4 text-lg font-semibold text-gray-900">Coiffeuses</h1>
          </div>

          {/* Search */}
          <div className="pb-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border-0 text-sm focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Trier:</span>
            <div className="flex gap-1">
              {[
                { value: 'rating', label: 'Note' },
                { value: 'bookings', label: 'RDV' },
                { value: 'name', label: 'Nom' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as typeof sortBy)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    sortBy === opt.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          {cities.length > 0 && (
            <select
              value={selectedCity || ''}
              onChange={(e) => setSelectedCity(e.target.value || null)}
              className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium focus:ring-2 focus:ring-gray-900 border-0"
            >
              <option value="">Toutes les villes</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          )}
        </div>

        {/* Active filters */}
        {(selectedCity || searchQuery) && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            {selectedCity && (
              <button
                onClick={() => setSelectedCity(null)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {selectedCity}
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                "{searchQuery}"
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Count */}
        <p className="text-sm text-gray-500 mb-4">{filteredProviders.length} coiffeuse(s)</p>

        {/* Grid */}
        {filteredProviders.length === 0 ? (
          <div className="text-center py-16">
            <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune coiffeuse trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProviders.map((provider) => {
              const fullName = `${provider.firstName} ${provider.lastName}`;
              const rating = provider.rating || 0;
              const isTopRated = rating >= 4.5 && provider.totalBookings >= 10;

              return (
                <Link
                  key={provider.id}
                  href={`/prestataires/${provider.id}`}
                  className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Avatar */}
                  <div className="relative aspect-[4/5] bg-gray-100">
                    {provider.avatar ? (
                      <Image
                        src={provider.avatar}
                        alt={fullName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-4xl text-gray-400 font-bold">
                          {provider.firstName.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    {isTopRated && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/80 text-white rounded-full text-[10px] font-medium">
                        <CheckBadgeIcon className="h-3 w-3" />
                        Top
                      </div>
                    )}

                    <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur rounded-full">
                      <StarIconSolid className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs font-medium">{rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm truncate">
                      {fullName}
                    </h3>
                    
                    {provider.city && (
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3" />
                        {provider.city}
                      </p>
                    )}

                    {provider.specialties && provider.specialties.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {provider.specialties.slice(0, 2).map((specialty, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 text-[10px] text-gray-400">
                      {provider.totalBookings} RDV • {provider.servicesCount} services
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Nav */}
      {!isAuthenticated && (
        <>
          <div className="h-14 md:hidden" />
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-14">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/products', label: 'Produits' },
                { href: '/services', label: 'Services' },
                { href: '/prestataires', label: 'Coiffeuses', active: true },
                { href: '/orders/track', label: 'Commande' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium ${
                    item.active ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
