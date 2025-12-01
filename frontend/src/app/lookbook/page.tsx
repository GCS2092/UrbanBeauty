'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  SparklesIcon,
  HeartIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/hooks/useAuth';

const looks = [
  { id: '1', name: 'Box Braids Goddess', category: 'Tresses', likes: 234 },
  { id: '2', name: 'Perruque Wavy', category: 'Perruques', likes: 189 },
  { id: '3', name: 'Locks Élégants', category: 'Locks', likes: 156 },
  { id: '4', name: 'Coiffure Mariage', category: 'Événements', likes: 312 },
  { id: '5', name: 'Cornrows Design', category: 'Tresses', likes: 98 },
  { id: '6', name: 'Afro Naturel', category: 'Natural', likes: 267 },
  { id: '7', name: 'Fulani Braids', category: 'Tresses', likes: 145 },
  { id: '8', name: 'Twist Out', category: 'Natural', likes: 201 },
  { id: '9', name: 'Silk Press', category: 'Lissage', likes: 178 },
];

const categories = ['Tous', 'Tresses', 'Perruques', 'Locks', 'Natural', 'Événements', 'Lissage'];

export default function LookbookPage() {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedLooks, setLikedLooks] = useState<Set<string>>(new Set());

  const filteredLooks = looks.filter(look => {
    if (selectedCategory !== 'Tous' && look.category !== selectedCategory) return false;
    if (searchQuery.trim() && !look.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedLooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className={`min-h-screen bg-white ${!isAuthenticated ? 'pb-16 md:pb-0' : ''}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="ml-4 text-lg font-semibold text-gray-900">Lookbook</h1>
          </div>

          {/* Search */}
          <div className="pb-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border-0 text-sm focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        {/* Categories */}
        <div className="mb-6 overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500 mb-4">{filteredLooks.length} style(s)</p>

        {/* Grid */}
        {filteredLooks.length === 0 ? (
          <div className="text-center py-16">
            <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun look trouvé</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filteredLooks.map((look, index) => {
              const heights = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]'];
              const height = heights[index % heights.length];
              const isLiked = likedLooks.has(look.id);

              return (
                <Link
                  key={look.id}
                  href={`/lookbook/${look.id}`}
                  className={`group block break-inside-avoid ${height} relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200`}
                >
                  {/* Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SparklesIcon className="h-12 w-12 text-gray-300 group-hover:scale-110 transition-transform" />
                  </div>

                  {/* Category */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-gray-700">
                    {look.category}
                  </div>

                  {/* Like */}
                  <button
                    onClick={(e) => toggleLike(look.id, e)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
                      isLiked ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur text-gray-700 hover:bg-white'
                    }`}
                  >
                    {isLiked ? (
                      <HeartIconSolid className="h-4 w-4" />
                    ) : (
                      <HeartIcon className="h-4 w-4" />
                    )}
                  </button>

                  {/* Bottom overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-white font-medium text-sm mb-1">{look.name}</h3>
                    <div className="flex items-center gap-1 text-white/80 text-xs">
                      <HeartIconSolid className="h-3 w-3" />
                      <span>{isLiked ? look.likes + 1 : look.likes}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center py-8 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Vous avez trouvé votre style ?</h3>
          <p className="text-sm text-gray-500 mb-4">Réservez avec une de nos coiffeuses</p>
          <Link
            href="/services"
            className="inline-block px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Réserver un service
          </Link>
        </div>
      </div>

      {/* Mobile Nav */}
      {!isAuthenticated && (
        <>
          <div className="h-14 md:hidden" />
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-14">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/products', label: 'Produits' },
                { href: '/services', label: 'Services' },
                { href: '/lookbook', label: 'Lookbook', active: true },
                { href: '/prestataires', label: 'Coiffeuses' },
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
