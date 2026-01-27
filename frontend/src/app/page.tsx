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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white">
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

            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/products"
                className="px-8 py-3.5 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Découvrir les produits
              </Link>
              <Link
                href="/services"
                className="px-8 py-3.5 bg-white text-gray-900 font-medium rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Réserver un service
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
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
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Produits Populaires</h2>
            <p className="text-sm text-gray-500">Nos meilleures ventes</p>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-sm font-medium">
            Tout voir <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Services Coiffure</h2>
              <p className="text-sm text-gray-500">Réservez votre prochain rendez-vous</p>
            </div>
            <Link href="/services" className="flex items-center gap-1 text-sm font-medium">
              Tout voir <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Navigation */}
      {!isAuthenticated && (
        <>
          <div className="h-16 md:hidden" />
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
            <div className="flex justify-around h-14">
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
                  className="flex flex-col items-center justify-center flex-1 py-1 text-gray-400"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] mt-0.5 font-medium">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
