'use client';

import Hero from '@/components/shared/Hero';
import ProductCard from '@/components/shared/ProductCard';
import ServiceCard from '@/components/shared/ServiceCard';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useProducts } from '@/hooks/useProducts';
import { useServices } from '@/hooks/useServices';

export default function Home() {
  const { data: products = [] } = useProducts();
  const { data: services = [] } = useServices();

  // Prendre les 4 premiers produits et services
  const featuredProducts = products.slice(0, 4);
  const featuredServices = services.slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Produits Populaires</h2>
            <p className="mt-2 text-gray-600">Découvrez nos best-sellers</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center space-x-2 text-pink-600 hover:text-pink-700 font-medium transition-colors"
          >
            <span>Voir tout</span>
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 text-pink-600 hover:text-pink-700 font-medium"
          >
            <span>Voir tous les produits</span>
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Featured Services */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Services Tendance</h2>
              <p className="mt-2 text-gray-600">Réservez votre prochain rendez-vous beauté</p>
            </div>
            <Link
              href="/services"
              className="hidden sm:flex items-center space-x-2 text-pink-600 hover:text-pink-700 font-medium transition-colors"
            >
              <span>Voir tout</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/services"
              className="inline-flex items-center space-x-2 text-pink-600 hover:text-pink-700 font-medium"
            >
              <span>Voir tous les services</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-600 to-rose-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Rejoignez la communauté UrbanBeauty
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Inscrivez-vous pour recevoir nos offres exclusives et nos nouveautés
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 rounded-full px-6 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="rounded-full bg-white px-8 py-3 font-semibold text-pink-600 hover:bg-gray-100 transition-colors">
              S'inscrire
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
