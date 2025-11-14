import Link from 'next/link';
import { ArrowLeftIcon, StarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function PrestataireDetailPage({ params }: { params: { id: string } }) {
  // Données d'exemple - à remplacer par un appel API
  const prestataire = {
    id: params.id,
    name: 'Marie K.',
    specialty: 'Tresses & Locks',
    rating: 4.8,
    reviews: 24,
    description: 'Coiffeuse professionnelle spécialisée dans les tresses africaines et l\'entretien des locks. Plus de 5 ans d\'expérience.',
    services: [
      { id: '1', name: 'Tresses Africaines', price: 80 },
      { id: '2', name: 'Locks Entretien', price: 95 },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/prestataires" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux prestataires
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👤</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">{prestataire.name}</h1>
              <p className="text-gray-600 text-center mb-4">{prestataire.specialty}</p>
              <div className="flex items-center justify-center mb-4">
                <StarIconSolid className="h-5 w-5 text-yellow-400" />
                <span className="ml-2 text-gray-900 font-medium">{prestataire.rating}</span>
                <span className="ml-2 text-gray-500 text-sm">({prestataire.reviews} avis)</span>
              </div>
              <button className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Réserver
              </button>
            </div>
          </div>

          {/* Détails */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">À propos</h2>
              <p className="text-gray-600">{prestataire.description}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Services proposés</h2>
              <div className="space-y-4">
                {prestataire.services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{service.name}</span>
                      <span className="text-pink-600 font-semibold">{service.price} €</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

