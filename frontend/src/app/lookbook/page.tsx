'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeftIcon, 
  SparklesIcon,
  HeartIcon,
  ShareIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/hooks/useAuth';

// Données d'exemple - en production, ces données viendraient de l'API
const looks = [
  { id: '1', name: 'Box Braids Goddess', image: undefined, likes: 234, category: 'Tresses', emoji: '🎀' },
  { id: '2', name: 'Perruque Wavy', image: undefined, likes: 189, category: 'Perruques', emoji: '👩‍🦱' },
  { id: '3', name: 'Locks Élégants', image: undefined, likes: 156, category: 'Locks', emoji: '🔥' },
  { id: '4', name: 'Coiffure Mariage', image: undefined, likes: 312, category: 'Événements', emoji: '💍' },
  { id: '5', name: 'Cornrows Design', image: undefined, likes: 98, category: 'Tresses', emoji: '✨' },
  { id: '6', name: 'Afro Naturel', image: undefined, likes: 267, category: 'Natural', emoji: '🌸' },
  { id: '7', name: 'Fulani Braids', image: undefined, likes: 145, category: 'Tresses', emoji: '💫' },
  { id: '8', name: 'Twist Out', image: undefined, likes: 201, category: 'Natural', emoji: '🌀' },
  { id: '9', name: 'Silk Press', image: undefined, likes: 178, category: 'Lissage', emoji: '💎' },
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
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-orange-50 to-white ${!isAuthenticated ? 'pb-20 md:pb-0' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white">
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
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Lookbook ✨</h1>
              <p className="text-white/80 mt-1">Inspirez-vous de nos créations</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-lg">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Categories */}
        <div className="mb-6 overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredLooks.length} style{filteredLooks.length > 1 ? 's' : ''} trouvé{filteredLooks.length > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-400">
            Tapez sur ❤️ pour sauvegarder
          </p>
        </div>

        {/* Masonry Grid */}
        {filteredLooks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">🔍</span>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun look trouvé</h2>
            <p className="text-gray-500">Essayez une autre catégorie</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filteredLooks.map((look, index) => {
              // Vary heights for masonry effect
              const heights = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/4]'];
              const height = heights[index % heights.length];
              const isLiked = likedLooks.has(look.id);

              return (
                <Link
                  key={look.id}
                  href={`/lookbook/${look.id}`}
                  className={`group block break-inside-avoid ${height} relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100 shadow-sm hover:shadow-xl transition-all duration-300`}
                >
                  {/* Placeholder with gradient and emoji */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl sm:text-7xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                      {look.emoji}
                    </span>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/80 backdrop-blur rounded-full text-xs font-medium text-gray-700">
                    {look.category}
                  </div>

                  {/* Like button */}
                  <button
                    onClick={(e) => toggleLike(look.id, e)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
                      isLiked 
                        ? 'bg-red-500 text-white scale-110' 
                        : 'bg-white/80 backdrop-blur text-gray-700 hover:bg-white'
                    }`}
                  >
                    {isLiked ? (
                      <HeartIconSolid className="h-5 w-5" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                  </button>

                  {/* Bottom overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{look.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <HeartIconSolid className="h-4 w-4 text-red-400" />
                        <span>{isLiked ? look.likes + 1 : look.likes}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Share logic
                        }}
                        className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                      >
                        <ShareIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl p-8 text-center">
          <span className="text-4xl mb-4 block">💇‍♀️</span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Vous avez trouvé votre style ?</h3>
          <p className="text-gray-600 mb-4">Réservez maintenant avec l'une de nos coiffeuses</p>
          <Link
            href="/services"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
          >
            Réserver un service
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {!isAuthenticated && (
        <>
          <div className="h-20 md:hidden" />
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-around h-16 px-2">
              {[
                { href: '/', label: 'Accueil', emoji: '🏠' },
                { href: '/products', label: 'Produits', emoji: '🛍️' },
                { href: '/services', label: 'Services', emoji: '💇‍♀️' },
                { href: '/lookbook', label: 'Lookbook', emoji: '✨', active: true },
                { href: '/prestataires', label: 'Coiffeuses', emoji: '👩‍🦰' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 py-2 relative ${
                    item.active ? 'text-orange-600' : 'text-gray-500'
                  }`}
                >
                  {item.active && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-600 rounded-full" />
                  )}
                  <span className={`text-xl ${item.active ? 'scale-110' : ''}`}>{item.emoji}</span>
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
