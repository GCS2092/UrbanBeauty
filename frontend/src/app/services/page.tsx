'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ServiceCard from '@/components/shared/ServiceCard';
import { ArrowLeftIcon, SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useServices } from '@/hooks/useServices';

// Icônes pour les catégories
const categoryIcons: Record<string, string> = {
  'Coiffure': '💇‍♀️',
  'Tresses': '🎀',
  'Maquillage': '💄',
  'Manucure': '💅',
  'Soins': '✨',
  'Massage': '💆‍♀️',
  'Épilation': '🌸',
  'Extensions': '💫',
  'Coloration': '🎨',
  'default': '💎',
};

export default function ServicesPage() {
  const { data: services = [], isLoading, error } = useServices();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Extraire les catégories uniques avec comptage
  const categories = useMemo(() => {
    const catMap = new Map<string, number>();
    services.forEach(service => {
      if (service.category) {
        catMap.set(service.category, (catMap.get(service.category) || 0) + 1);
      }
    });
    return Array.from(catMap.entries()).map(([name, count]) => ({
      name,
      count,
      icon: categoryIcons[name] || categoryIcons['default'],
    }));
  }, [services]);

  // Filtrer les services
  const filteredServices = useMemo(() => {
    let filtered = services;
    
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.category?.toLowerCase().includes(query) ||
        service.provider?.firstName?.toLowerCase().includes(query) ||
        service.provider?.lastName?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [services, selectedCategory, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erreur lors du chargement des services</p>
          <Link href="/" className="text-pink-600 hover:text-pink-700 mt-4 inline-block">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white">
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
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Services Beauté</h1>
              <p className="text-white/80 mt-1">Réservez votre prochain rendez-vous</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un service, une coiffeuse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Categories - Horizontal scroll on mobile, grid on desktop */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Catégories</h2>
          
          {/* Mobile: Horizontal scroll */}
          <div className="md:hidden overflow-x-auto -mx-4 px-4 pb-2">
            <div className="flex gap-3 w-max">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex flex-col items-center p-3 rounded-2xl min-w-[80px] transition-all ${
                  selectedCategory === null
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200'
                    : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
                }`}
              >
                <span className="text-2xl mb-1">✨</span>
                <span className="text-xs font-medium">Tous</span>
                <span className="text-[10px] opacity-70">{services.length}</span>
              </button>
              
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex flex-col items-center p-3 rounded-2xl min-w-[80px] transition-all ${
                    selectedCategory === category.name
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200'
                      : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
                  }`}
                >
                  <span className="text-2xl mb-1">{category.icon}</span>
                  <span className="text-xs font-medium truncate max-w-[70px]">{category.name}</span>
                  <span className="text-[10px] opacity-70">{category.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
                selectedCategory === null
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200'
                  : 'bg-white text-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <span className="text-3xl mb-2">✨</span>
              <span className="text-sm font-medium">Tous</span>
              <span className="text-xs opacity-70">{services.length} services</span>
            </button>
            
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
                  selectedCategory === category.name
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200'
                    : 'bg-white text-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                <span className="text-3xl mb-2">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-xs opacity-70">{category.count} services</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active filter indicator */}
        {(selectedCategory || searchQuery) && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Filtres actifs :</span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
              >
                {categoryIcons[selectedCategory] || '💎'} {selectedCategory}
                <span className="ml-1">×</span>
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                🔍 "{searchQuery}"
                <span className="ml-1">×</span>
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''} trouvé{filteredServices.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun service trouvé</h3>
            <p className="text-gray-500 mb-6">
              {selectedCategory 
                ? `Aucun service dans la catégorie "${selectedCategory}"`
                : 'Essayez avec d\'autres mots-clés'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              Voir tous les services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredServices.map((service) => (
              <ServiceCard 
                key={service.id}
                id={service.id}
                name={service.name}
                price={service.price}
                duration={service.duration}
                provider={service.provider ? `${service.provider.firstName} ${service.provider.lastName}` : undefined}
                rating={service.provider?.rating}
                image={service.images?.[0]?.url}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
