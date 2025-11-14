import Link from 'next/link';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  // Données d'exemple - à remplacer par un appel API
  const service = {
    id: params.id,
    name: 'Tresses Africaines',
    price: 80,
    duration: 180,
    provider: 'Marie K.',
    rating: 4.8,
    description: 'Création de tresses africaines traditionnelles avec des techniques modernes. Parfait pour tous les types de cheveux.',
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/services" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
            <span className="text-8xl">💇‍♀️</span>
          </div>

          {/* Détails */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{service.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIconSolid
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(service.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">{service.rating}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">par {service.provider}</span>
            </div>

            <p className="text-3xl font-bold text-pink-600 mb-6">{service.price.toFixed(2)} €</p>
            
            <p className="text-gray-600 mb-6">{service.description}</p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-gray-600">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span>Durée : {service.duration} minutes</span>
              </div>
            </div>

            <button className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Réserver maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

