import Link from 'next/link';
import ServiceCard from '@/components/shared/ServiceCard';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ServicesPage() {
  // Données d'exemple - à remplacer par des appels API
  const services = [
    {
      id: '1',
      name: 'Tresses Africaines',
      price: 80,
      duration: 180,
      provider: 'Marie K.',
      rating: 4.8,
      image: undefined,
    },
    {
      id: '2',
      name: 'Pose de Perruque',
      price: 120,
      duration: 120,
      provider: 'Sophie L.',
      rating: 4.9,
      image: undefined,
    },
    {
      id: '3',
      name: 'Coiffure Événement',
      price: 65,
      duration: 90,
      provider: 'Amélie D.',
      rating: 4.7,
      image: undefined,
    },
    {
      id: '4',
      name: 'Locks Entretien',
      price: 95,
      duration: 150,
      provider: 'Julie M.',
      rating: 4.6,
      image: undefined,
    },
  ];

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
            <ServiceCard key={service.id} {...service} />
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

