import Link from 'next/link';
import { ArrowLeftIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function LookbookDetailPage({ params }: { params: { id: string } }) {
  // Données d'exemple - à remplacer par un appel API
  const look = {
    id: params.id,
    name: 'Tresses Box Braids',
    description: 'Style de tresses box braids moderne et élégant, parfait pour tous les types d\'événements.',
    price: 80,
    duration: 180,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/lookbook" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour au lookbook
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-8xl">✨</span>
          </div>

          {/* Détails */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{look.name}</h1>
            <p className="text-gray-600 mb-6">{look.description}</p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-gray-600">
                <span className="font-medium mr-2">Prix indicatif :</span>
                <span className="text-pink-600 font-semibold">{look.price} €</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="font-medium mr-2">Durée estimée :</span>
                <span>{look.duration} minutes</span>
              </div>
            </div>

            <button className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Je veux cette coiffure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

