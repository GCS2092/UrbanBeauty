import Link from 'next/link';
import ProductCard from '@/components/shared/ProductCard';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ProductsPage() {
  // Données d'exemple - à remplacer par des appels API
  const products = [
    {
      id: '1',
      name: 'Masque Hydratant Intensif',
      price: 29.99,
      category: 'Soin Visage',
      image: undefined,
    },
    {
      id: '2',
      name: 'Sérum Vitamine C',
      price: 45.00,
      category: 'Soin Visage',
      image: undefined,
    },
    {
      id: '3',
      name: 'Shampooing Réparateur',
      price: 18.50,
      category: 'Soin Cheveux',
      image: undefined,
    },
    {
      id: '4',
      name: 'Crème Mains Nourrissante',
      price: 12.99,
      category: 'Soin Corps',
      image: undefined,
    },
    {
      id: '5',
      name: 'Baume à Lèvres Réparateur',
      price: 8.99,
      category: 'Soin Visage',
      image: undefined,
    },
    {
      id: '6',
      name: 'Huile Capillaire Nourrissante',
      price: 24.99,
      category: 'Soin Cheveux',
      image: undefined,
    },
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
          <h1 className="text-4xl font-bold text-gray-900">Nos Produits</h1>
          <p className="mt-2 text-gray-600">Découvrez notre sélection de produits beauté</p>
        </div>

        {/* Filtres (placeholder) */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-pink-600 text-white rounded-full text-sm font-medium">
            Tous
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200">
            Soin Visage
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200">
            Soin Cheveux
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200">
            Soin Corps
          </button>
        </div>

        {/* Grille de produits */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* Message si pas de produits */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun produit disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

