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
  const { isAuthenticated } = useAuth();
  const [sortBy, setSortBy] = useState<'rating' | 'bookings' | 'name'>('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const { data: providers = [], isLoading, error } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await api.get('/api/profile/providers');
      return response.data;
    },
  });

  // Extraire les villes uniques
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    providers.forEach(p => {
      if (p.city) citySet.add(p.city);
    });
    return Array.from(citySet);
  }, [providers]);

  // Filtrer et trier les prestataires
  const filteredAndSortedProviders = useMemo(() => {
    let filtered = providers;

    // Filtre par ville
    if (selectedCity) {
      filtered = filtered.filter(p => p.city === selectedCity);
    }

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
  }, [providers, sortBy, searchQuery, selectedCity]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-teal-50 to-white ${!isAuthenticated ? 'pb-20 md:pb-0' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-white/80 hover:text-white mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
              <UserGroupIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Nos Coiffeuses 👩‍🦰</h1>
              <p className="text-white/80 mt-1">Professionnelles de la beauté à votre service</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-lg">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une coiffeuse, spécialité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Trier :</span>
            <div className="flex gap-1">
              {[
                { value: 'rating', label: '⭐ Note' },
                { value: 'bookings', label: '📅 RDV' },
                { value: 'name', label: '🔤 Nom' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as typeof sortBy)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sortBy === opt.value
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* City filter */}
          {cities.length > 0 && (
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCity || ''}
                onChange={(e) => setSelectedCity(e.target.value || null)}
                className="px-3 py-1.5 bg-white border-0 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Toutes les villes</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Active filters */}
        {(selectedCity || searchQuery) && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Filtres :</span>
            {selectedCity && (
              <button
                onClick={() => setSelectedCity(null)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium"
              >
                📍 {selectedCity}
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                🔍 "{searchQuery}"
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Results */}
        <p className="text-sm text-gray-600 mb-4">
          {filteredAndSortedProviders.length} coiffeuse{filteredAndSortedProviders.length > 1 ? 's' : ''} trouvée{filteredAndSortedProviders.length > 1 ? 's' : ''}
        </p>

        {/* Grid */}
        {filteredAndSortedProviders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">🔍</span>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune coiffeuse trouvée</h2>
            <p className="text-gray-500 mb-4">Essayez avec d'autres critères</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity(null);
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl"
            >
              Voir toutes les coiffeuses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedProviders.map((provider) => {
              const fullName = `${provider.firstName} ${provider.lastName}`;
              const rating = provider.rating || 0;
              const isTopRated = rating >= 4.5 && provider.totalBookings >= 10;

              return (
                <Link
                  key={provider.id}
                  href={`/prestataires/${provider.id}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
                >
                  {/* Avatar */}
                  <div className="relative h-48 bg-gradient-to-br from-teal-100 to-cyan-100">
                    {provider.avatar ? (
                      <Image
                        src={provider.avatar}
                        alt={fullName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-7xl">👩‍🦰</span>
                      </div>
                    )}
                    
                    {/* Top rated badge */}
                    {isTopRated && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                        <CheckBadgeIcon className="h-3.5 w-3.5" />
                        Top
                      </div>
                    )}

                    {/* Rating overlay */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur rounded-full">
                      <StarIconSolid className="h-4 w-4 text-yellow-400" />
                      <span className="text-white text-sm font-bold">{rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-teal-600 transition-colors">
                      {fullName}
                    </h3>
                    
                    {provider.city && (
                      <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        {provider.city}
                      </p>
                    )}

                    {/* Specialties */}
                    {provider.specialties && provider.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {provider.specialties.slice(0, 3).map((specialty, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-teal-50 text-teal-700 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <span>{provider.totalBookings} RDV</span>
                      {provider.experience && (
                        <span>{provider.experience} an{provider.experience > 1 ? 's' : ''} d'exp.</span>
                      )}
                      <span>{provider.servicesCount} service{provider.servicesCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {!isAuthenticated && (
        <>
          <div className="h-20 md:hidden" />
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-around h-16 px-2">
              {[
                { href: '/', label: 'Accueil', emoji: '🏠' },
                { href: '/products', label: 'Produits', emoji: '🛍️' },
                { href: '/services', label: 'Services', emoji: '💇‍♀️' },
                { href: '/lookbook', label: 'Lookbook', emoji: '✨' },
                { href: '/prestataires', label: 'Coiffeuses', emoji: '👩‍🦰', active: true },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 py-2 relative ${
                    item.active ? 'text-teal-600' : 'text-gray-500'
                  }`}
                >
                  {item.active && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-teal-600 rounded-full" />
                  )}
                  <span className={`text-xl ${item.active ? 'scale-110' : ''}`}>{item.emoji}</span>
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
