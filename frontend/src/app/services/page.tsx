'use client';

import Link from 'next/link';
import ServiceCard from '@/components/shared/ServiceCard';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useServices } from '@/hooks/useServices';

export default function ServicesPage() {
  const { data: services = [], isLoading, error } = useServices();

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

        {/* Grille de services */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
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
        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun service disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

