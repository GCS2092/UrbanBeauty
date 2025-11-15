import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function LookbookPage() {
  // Données d'exemple - à remplacer par des appels API
  const looks = [
    { id: '1', name: 'Tresses Box Braids', image: undefined },
    { id: '2', name: 'Perruque Naturelle', image: undefined },
    { id: '3', name: 'Locks Entretien', image: undefined },
    { id: '4', name: 'Coiffure Événement', image: undefined },
    { id: '5', name: 'Tresses Cornrows', image: undefined },
    { id: '6', name: 'Style Bohème', image: undefined },
  ];

  return (
    <div className="min-h-screen bg-white">
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
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Lookbook</h1>
              <p className="mt-2 text-gray-600">Inspirez-vous de nos créations</p>
            </div>
          </div>
        </div>

        {/* Grille de looks */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {looks.map((look) => (
            <Link
              key={look.id}
              href={`/lookbook/${look.id}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-200 via-rose-200 to-purple-200">
                <span className="text-6xl">💇‍♀️</span>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-white font-medium">{look.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

