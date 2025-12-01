'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRightIcon, 
  ShoppingBagIcon, 
  SparklesIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid,
} from '@heroicons/react/24/solid';
import { useProducts } from '@/hooks/useProducts';
import { useServices } from '@/hooks/useServices';
import { useAuth } from '@/hooks/useAuth';
import ProductCard from '@/components/shared/ProductCard';
import ServiceCard from '@/components/shared/ServiceCard';

export default function Home() {
  const { data: products = [] } = useProducts();
  const { data: services = [] } = useServices();
  const { isAuthenticated } = useAuth();

  const featuredProducts = products.slice(0, 8);
  const featuredServices = services.slice(0, 4);

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      {/* Hero Section - Clean & Minimal */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white">
        {/* Top bar with login */}
        {!isAuthenticated && (
          <div className="absolute top-4 right-4 z-10">
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              <UserIcon className="h-4 w-4" />
              Connexion
            </Link>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-medium text-pink-600 tracking-wide uppercase mb-3">
              Nouvelle Collection
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              Votre beauté,<br />
              <span className="text-pink-600">sublimée</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Produits cosmétiques premium et services coiffure professionnels
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/products"
                className="px-8 py-3.5 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Découvrir les produits
              </Link>
              <Link
                href="/services"
                className="px-8 py-3.5 bg-white text-gray-900 font-medium rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Réserver un service
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 divide-x divide-gray-100">
            {[
              { href: '/products', icon: ShoppingBagIcon, label: 'Produits' },
              { href: '/services', icon: SparklesIcon, label: 'Services' },
              { href: '/lookbook', icon: SparklesIcon, label: 'Lookbook' },
              { href: '/prestataires', icon: UserGroupIcon, label: 'Coiffeuses' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center py-5 hover:bg-gray-50 transition-colors"
              >
                <item.icon className="h-6 w-6 text-gray-700 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-900">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Produits Populaires</h2>
            <p className="text-sm text-gray-500 mt-1">Nos meilleures ventes</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-pink-600 transition-colors"
          >
            Tout voir
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
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

      {/* Banner - Simple & Elegant */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-900 rounded-2xl p-8 sm:p-12 text-center">
          <p className="text-pink-400 text-sm font-medium mb-2">Offre de bienvenue</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            -20% sur votre première commande
          </h3>
          <p className="text-gray-400 text-sm mb-6">Code : BIENVENUE20</p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-3 bg-white text-gray-900 font-medium rounded-full hover:bg-gray-100 transition-colors"
          >
            S'inscrire
          </Link>
        </div>
      </section>

      {/* Featured Services */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Services Coiffure</h2>
              <p className="text-sm text-gray-500 mt-1">Réservez votre prochain rendez-vous</p>
            </div>
            <Link
              href="/services"
              className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-pink-600 transition-colors"
            >
              Tout voir
              <ChevronRightIcon className="h-4 w-4" />
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

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { title: 'Livraison Rapide', desc: 'Sous 48h' },
            { title: 'Qualité Premium', desc: '100% authentique' },
            { title: 'Support Client', desc: '7j/7' },
            { title: 'Retours Gratuits', desc: 'Sous 14 jours' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Newsletter</h2>
            <p className="text-sm text-gray-500 mb-6">
              Recevez nos offres exclusives et nouveautés
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button className="px-6 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors">
                S'abonner
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Bottom Navigation - Clean Style */}
      {!isAuthenticated && (
        <>
          <div className="h-16 md:hidden" />
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-14">
              {[
                { href: '/', label: 'Accueil', icon: HomeIconSolid, active: true },
                { href: '/products', label: 'Produits', icon: ShoppingBagIcon },
                { href: '/services', label: 'Services', icon: SparklesIcon },
                { href: '/prestataires', label: 'Coiffeuses', icon: UserGroupIcon },
                { href: '/orders/track', label: 'Commande', icon: ClipboardDocumentListIcon },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 py-1 ${
                    item.active ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${item.active ? 'text-black' : ''}`} />
                  <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
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
