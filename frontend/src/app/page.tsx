'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRightIcon, 
  ShoppingBagIcon, 
  ScissorsIcon, 
  SparklesIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  StarIcon,
  ClipboardDocumentListIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { 
  ShoppingBagIcon as ShoppingBagIconSolid,
  ScissorsIcon as ScissorsIconSolid,
  SparklesIcon as SparklesIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  HomeIcon as HomeIconSolid,
} from '@heroicons/react/24/solid';
import { useProducts } from '@/hooks/useProducts';
import { useServices } from '@/hooks/useServices';
import { useAuth } from '@/hooks/useAuth';
import ProductCard from '@/components/shared/ProductCard';
import ServiceCard from '@/components/shared/ServiceCard';
import { useState } from 'react';

export default function Home() {
  const { data: products = [] } = useProducts();
  const { data: services = [] } = useServices();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'services' | 'lookbook' | 'prestataires'>('home');

  const featuredProducts = products.slice(0, 6);
  const featuredServices = services.slice(0, 4);

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      {/* Hero Section - Modern & Vibrant */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        {/* Floating circles */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-pink-300/20 rounded-full blur-xl animate-pulse delay-300"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Top bar with login button */}
          {!isAuthenticated && (
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors"
              >
                <UserIcon className="h-4 w-4" />
                <span>Connexion</span>
              </Link>
            </div>
          )}

          <div className="text-center">
            {/* Logo/Brand */}
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl"></div>
                <div className="relative bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Urban<span className="text-yellow-300">Beauty</span>
                  </span>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Votre beauté,
              <span className="block text-yellow-300 drop-shadow-lg">notre passion ✨</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Produits cosmétiques, services coiffure et inspiration lookbook.
              Tout ce dont vous avez besoin pour rayonner !
            </p>

            {/* Search bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher produits, services..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl shadow-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/50"
                />
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-6 sm:gap-12 text-white/90">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold">{products.length}+</p>
                <p className="text-xs sm:text-sm">Produits</p>
              </div>
              <div className="w-px h-10 bg-white/30"></div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold">{services.length}+</p>
                <p className="text-xs sm:text-sm">Services</p>
              </div>
              <div className="w-px h-10 bg-white/30"></div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold">50+</p>
                <p className="text-xs sm:text-sm">Coiffeuses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Quick Access Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {[
            { href: '/products', icon: ShoppingBagIcon, label: 'Produits', color: 'from-pink-500 to-rose-500', emoji: '🛍️' },
            { href: '/services', icon: ScissorsIcon, label: 'Services', color: 'from-purple-500 to-indigo-500', emoji: '💇‍♀️' },
            { href: '/lookbook', icon: SparklesIcon, label: 'Lookbook', color: 'from-orange-500 to-amber-500', emoji: '✨' },
            { href: '/prestataires', icon: UserGroupIcon, label: 'Coiffeuses', color: 'from-teal-500 to-cyan-500', emoji: '👩‍🦰' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl sm:text-3xl">{item.emoji}</span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">🔥 Produits Populaires</h2>
            <p className="text-sm text-gray-500 mt-1">Nos meilleures ventes</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-pink-600 hover:text-pink-700 font-medium text-sm"
          >
            Voir tout
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {featuredProducts.map((product) => (
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
      </section>

      {/* Promo Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-yellow-300 font-semibold text-sm mb-1">🎉 Offre Spéciale</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">-20% sur votre première commande !</h3>
              <p className="text-white/80 text-sm">Utilisez le code BIENVENUE20 au checkout</p>
            </div>
            <Link
              href="/auth/register"
              className="px-6 py-3 bg-white text-pink-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              S'inscrire maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">💇‍♀️ Services Tendance</h2>
              <p className="text-sm text-gray-500 mt-1">Réservez votre prochain RDV</p>
            </div>
            <Link
              href="/services"
              className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              Voir tout
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredServices.map((service) => (
              <ServiceCard 
                key={service.id}
                id={service.id}
                name={service.name}
                price={service.price}
                duration={service.duration}
                provider={service.provider ? `${service.provider.firstName} ${service.provider.lastName}` : undefined}
                rating={service.provider?.rating}
                image={service.images?.[0]?.url}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">Pourquoi UrbanBeauty ? 💖</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: '🚚', title: 'Livraison Rapide', desc: 'Sous 48h' },
            { icon: '✅', title: 'Qualité Premium', desc: '100% authentique' },
            { icon: '💬', title: 'Support 24/7', desc: 'Toujours là pour vous' },
            { icon: '↩️', title: 'Retours Faciles', desc: 'Satisfait ou remboursé' },
          ].map((item, i) => (
            <div key={i} className="text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <span className="text-3xl sm:text-4xl block mb-2">{item.icon}</span>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">{item.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl p-8 text-center">
          <span className="text-4xl mb-4 block">💌</span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Rejoignez notre communauté
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Recevez nos offres exclusives et les dernières tendances beauté
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-pink-500"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg">
              S'abonner
            </button>
          </div>
        </div>
      </section>

      {/* Mobile Bottom Navigation - WhatsApp Style (only for non-authenticated) */}
      {!isAuthenticated && (
        <>
          {/* Spacer */}
          <div className="h-20 md:hidden" />
          
          {/* Bottom Nav */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-around h-16 px-2">
              {[
                { href: '/', icon: HomeIconSolid, label: 'Accueil', active: true },
                { href: '/products', icon: ShoppingBagIcon, label: 'Produits' },
                { href: '/services', icon: ScissorsIcon, label: 'Services' },
                { href: '/lookbook', icon: SparklesIcon, label: 'Lookbook' },
                { href: '/orders/track', icon: ClipboardDocumentListIcon, label: 'Commande' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 py-2 relative transition-all ${
                    item.active ? 'text-pink-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {item.active && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-pink-600 rounded-full" />
                  )}
                  <item.icon className={`h-6 w-6 ${item.active ? 'scale-110' : ''} transition-transform`} />
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
            <style jsx global>{`
              .safe-area-bottom {
                padding-bottom: env(safe-area-inset-bottom, 0px);
              }
            `}</style>
          </nav>
        </>
      )}
    </div>
  );
}
