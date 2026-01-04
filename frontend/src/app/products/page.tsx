'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/shared/ProductCard';
import { 
  ArrowLeftIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ShoppingBagIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';

export default function ProductsPage() {
  const { data: products = [], isLoading } = useProducts();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Extraire les catégories
  const categories = useMemo(() => {
    const catMap = new Map<string, number>();
    products.forEach(product => {
      if (product.category?.name) {
        catMap.set(product.category.name, (catMap.get(product.category.name) || 0) + 1);
      }
    });
    return Array.from(catMap.entries()).map(([name, count]) => ({ name, count }));
  }, [products]);

  // Filtrer et trier
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category?.name === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category?.name?.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'price_low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white ${!isAuthenticated ? 'pb-16 md:pb-0' : ''}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">Produits</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <FunnelIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="pb-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border-0 text-sm focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
            <div className="mx-auto max-w-7xl space-y-3">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-12">Trier</span>
                <div className="flex gap-2 flex-1 overflow-x-auto">
                  {[
                    { value: 'newest', label: 'Récents' },
                    { value: 'price_low', label: 'Prix ↑' },
                    { value: 'price_high', label: 'Prix ↓' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value as typeof sortBy)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        sortBy === opt.value
                          ? 'bg-gray-900 text-white'
                          : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        {/* Categories */}
        <div className="mb-4 overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 w-max">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Active filters */}
        {(selectedCategory || searchQuery) && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {selectedCategory}
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                "{searchQuery}"
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Count */}
        <p className="text-sm text-gray-500 mb-4">{filteredProducts.length} produit(s)</p>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun produit trouvé</p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className="mt-4 text-sm font-medium text-gray-900 hover:text-pink-600"
            >
              Voir tous les produits
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                category={product.category?.name}
                image={product.images?.[0]?.url}
                stock={product.stock}
                sellerId={product.sellerId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Nav */}
      {!isAuthenticated && (
        <>
          <div className="h-14 md:hidden" />
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-14">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/products', label: 'Produits', active: true },
                { href: '/services', label: 'Services' },
                { href: '/prestataires', label: 'Coiffeuses' },
                { href: '/orders/track', label: 'Commande' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium ${
                    item.active ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
