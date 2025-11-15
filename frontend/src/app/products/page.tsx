'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/shared/ProductCard';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useProducts } from '@/hooks/useProducts';

export default function ProductsPage() {
  const { data: products = [], isLoading, error } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(product => {
      if (product.category?.name) {
        cats.add(product.category.name);
      }
    });
    return Array.from(cats);
  }, [products]);

  // Filtrer les produits par catégorie
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(product => product.category?.name === selectedCategory);
  }, [products, selectedCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erreur lors du chargement des produits</p>
          <Link href="/" className="text-pink-600 hover:text-pink-700 mt-4 inline-block">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

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
            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Nos Produits</h1>
              <p className="mt-2 text-gray-600">Découvrez notre sélection de produits beauté</p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-8 flex flex-wrap gap-2 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({products.length})
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category} ({products.filter(p => p.category?.name === category).length})
            </button>
          ))}
        </div>

        {/* Grille de produits - Style Shein : plus de produits par ligne pour économiser l'espace */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              category={product.category?.name}
              image={product.images?.[0]?.url}
              stock={product.stock}
              description={product.description}
              sellerId={product.sellerId}
            />
          ))}
        </div>

        {/* Message si pas de produits */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {selectedCategory 
                ? `Aucun produit dans la catégorie "${selectedCategory}".`
                : 'Aucun produit disponible pour le moment.'}
            </p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
              >
                Voir tous les produits
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

