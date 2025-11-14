'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ServiceCard from '@/components/shared/ServiceCard';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useServices } from '@/hooks/useServices';

export default function ServicesPage() {
  const { data: services = [], isLoading, error } = useServices();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set<string>();
    services.forEach(service => {
      if (service.category) {
        cats.add(service.category);
      }
    });
    return Array.from(cats);
  }, [services]);

  // Filtrer les services par catégorie
  const filteredServices = useMemo(() => {
    if (!selectedCategory) return services;
    return services.filter(service => service.category === selectedCategory);
  }, [services, selectedCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Nos Services</h1>
          <p className="mt-2 text-gray-600">Réservez votre prochain rendez-vous beauté</p>
        </div>

        {/* Filtres */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({services.length})
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category} ({services.filter(s => s.category === category).length})
            </button>
          ))}
        </div>

        {/* Grille de services */}
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

        {/* Message si pas de services */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {selectedCategory 
                ? `Aucun service dans la catégorie "${selectedCategory}".`
                : 'Aucun service disponible pour le moment.'}
            </p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
              >
                Voir tous les services
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

