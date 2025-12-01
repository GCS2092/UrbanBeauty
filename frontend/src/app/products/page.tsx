'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/shared/ProductCard';
import { 
  ArrowLeftIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ShoppingBagIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';

// Icônes emoji pour les catégories
const categoryEmojis: Record<string, string> = {
  'Cheveux': '💇‍♀️',
  'Soins': '✨',
  'Maquillage': '💄',
  'Parfum': '🌸',
  'Ongles': '💅',
  'Corps': '🧴',
  'Accessoires': '🎀',
  'default': '🛍️',
};

export default function ProductsPage() {
  const { data: products = [], isLoading, error } = useProducts();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Extraire les catégories uniques avec comptage
  const categories = useMemo(() => {
    const catMap = new Map<string, number>();
    products.forEach(product => {
      if (product.category?.name) {
        catMap.set(product.category.name, (catMap.get(product.category.name) || 0) + 1);
      }
    });
    return Array.from(catMap.entries()).map(([name, count]) => ({
      name,
      count,
      emoji: categoryEmojis[name] || categoryEmojis['default'],
    }));
  }, [products]);

  // Filtrer et trier les produits
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category?.name === selectedCategory);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category?.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }

    // Tri
    switch (sortBy) {
      case 'price_low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        // Déjà trié par défaut (plus récent en premier)
        break;
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-pink-50 to-white ${!isAuthenticated ? 'pb-20 md:pb-0' : ''}`}>
      {/* Header Hero */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-white/80 hover:text-white mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
              <ShoppingBagIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Produits Beauté 🛍️</h1>
              <p className="text-white/80 mt-1">Découvrez notre sélection premium</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-lg">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Categories - Horizontal scroll */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Catégories</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showFilters ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              Filtres
            </button>
          </div>
          
          <div className="overflow-x-auto -mx-4 px-4 pb-2">
            <div className="flex gap-2 w-max">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200'
                    : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
                }`}
              >
                <span>✨</span>
                Tous ({products.length})
              </button>
              
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.name
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200'
                      : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
                  }`}
                >
                  <span>{category.emoji}</span>
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Trier par</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'newest', label: 'Plus récents' },
                { value: 'price_low', label: 'Prix croissant' },
                { value: 'price_high', label: 'Prix décroissant' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as typeof sortBy)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === option.value
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active filters */}
        {(selectedCategory || searchQuery) && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Filtres :</span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
              >
                {categoryEmojis[selectedCategory] || '🛍️'} {selectedCategory}
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                🔍 "{searchQuery}"
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-gray-600 mb-4">
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
        </p>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-500 mb-6">
              Essayez avec d'autres critères de recherche
            </p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-xl"
            >
              Voir tous les produits
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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
        )}
      </div>

      {/* Mobile Bottom Navigation (non-authenticated only) */}
      {!isAuthenticated && (
        <>
          <div className="h-20 md:hidden" />
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-around h-16 px-2">
              {[
                { href: '/', label: 'Accueil', emoji: '🏠' },
                { href: '/products', label: 'Produits', emoji: '🛍️', active: true },
                { href: '/services', label: 'Services', emoji: '💇‍♀️' },
                { href: '/lookbook', label: 'Lookbook', emoji: '✨' },
                { href: '/prestataires', label: 'Coiffeuses', emoji: '👩‍🦰' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 py-2 relative ${
                    item.active ? 'text-pink-600' : 'text-gray-500'
                  }`}
                >
                  {item.active && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-pink-600 rounded-full" />
                  )}
                  <span className={`text-xl ${item.active ? 'scale-110' : ''} transition-transform`}>{item.emoji}</span>
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
