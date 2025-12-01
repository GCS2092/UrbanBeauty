'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ServiceCard from '@/components/shared/ServiceCard';
import { ArrowLeftIcon, MagnifyingGlassIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useServices } from '@/hooks/useServices';
import { useAuth } from '@/hooks/useAuth';

export default function ServicesPage() {
  const { data: services = [], isLoading } = useServices();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Extraire les catégories
  const categories = useMemo(() => {
    const catMap = new Map<string, number>();
    services.forEach(service => {
      if (service.category) {
        catMap.set(service.category, (catMap.get(service.category) || 0) + 1);
      }
    });
    return Array.from(catMap.entries()).map(([name, count]) => ({ name, count }));
  }, [services]);

  // Filtrer
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
        service.provider?.firstName?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [services, selectedCategory, searchQuery]);

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
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">Services</h1>
            </div>
          </div>

          {/* Search */}
          <div className="pb-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border-0 text-sm focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Catégories</h2>
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-2 w-max">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === null
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous ({services.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filters */}
        {(selectedCategory || searchQuery) && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {selectedCategory}
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
        <p className="text-sm text-gray-500 mb-4">{filteredServices.length} service(s)</p>

        {/* Services */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun service trouvé</p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className="mt-4 text-sm font-medium text-gray-900 hover:text-pink-600"
            >
              Voir tous les services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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

      {/* Mobile Nav */}
      {!isAuthenticated && (
        <>
          <div className="h-14 md:hidden" />
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-14">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/products', label: 'Produits' },
                { href: '/services', label: 'Services', active: true },
                { href: '/prestataires', label: 'Coiffeuses' },
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
