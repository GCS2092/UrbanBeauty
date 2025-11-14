import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

export default function PrestatairesPage() {
  // Données d'exemple - à remplacer par des appels API
  const prestataires = [
    {
      id: '1',
      name: 'Marie K.',
      specialty: 'Tresses & Locks',
      rating: 4.8,
      reviews: 24,
      image: undefined,
    },
    {
      id: '2',
      name: 'Sophie L.',
      specialty: 'Perruques & Extensions',
      rating: 4.9,
      reviews: 18,
      image: undefined,
    },
    {
      id: '3',
      name: 'Amélie D.',
      specialty: 'Coiffures Événements',
      rating: 4.7,
      reviews: 32,
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
          <h1 className="text-4xl font-bold text-gray-900">Nos Prestataires</h1>
          <p className="mt-2 text-gray-600">Découvrez nos professionnels de la beauté</p>
        </div>

        {/* Grille de prestataires */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prestataires.map((prestataire) => (
            <Link
              key={prestataire.id}
              href={`/prestataires/${prestataire.id}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{prestataire.name}</h3>
                  <p className="text-sm text-gray-600">{prestataire.specialty}</p>
                  <div className="flex items-center mt-2">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-600 ml-1">
                      {prestataire.rating} ({prestataire.reviews} avis)
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

