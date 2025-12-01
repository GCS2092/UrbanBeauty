'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, StarIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';

interface ProviderProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  avatar?: string;
  bio?: string;
  specialties?: string[];
  experience?: number;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  rating?: number;
  totalBookings: number;
  completedBookings: number;
  cancellationRate?: number;
  user: {
    id: string;
    email: string;
    role: string;
  };
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
    images?: Array<{ url: string }>;
  }>;
  portfolio: Array<{
    id: string;
    url: string;
    alt?: string;
    title?: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user: {
      profile?: {
        firstName: string;
        lastName: string;
        avatar?: string;
      };
    };
    service: {
      name: string;
    };
  }>;
}

function ProviderProfileContent() {
  const params = useParams();
  const providerId = typeof params?.id === 'string' ? params.id : '';
  const currency = getSelectedCurrency();

  const { data: provider, isLoading, error } = useQuery<ProviderProfile>({
    queryKey: ['provider', providerId],
    queryFn: async () => {
      const response = await api.get(`/api/profile/provider/${providerId}`);
      return response.data;
    },
    enabled: !!providerId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Prestataire introuvable</p>
          <Link href="/services" className="text-pink-600 hover:text-pink-700 mt-4 inline-block">
            Retour aux services
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = provider.rating || 0;
  const completionRate = provider.totalBookings > 0 
    ? Math.round((provider.completedBookings / provider.totalBookings) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/services"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux services
        </Link>

        {/* En-tête du profil */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {provider.avatar ? (
                <div className="relative h-32 w-32 rounded-full overflow-hidden">
                  <Image
                    src={provider.avatar}
                    alt={`${provider.firstName} ${provider.lastName}`}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                  <span className="text-5xl">
                    {provider.firstName[0]}{provider.lastName[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {provider.firstName} {provider.lastName}
              </h1>
              
              {provider.specialties && provider.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(averageRating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {averageRating.toFixed(1)} ({provider.reviews.length} avis)
                  </span>
                </div>
                {provider.experience && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">
                      {provider.experience} ans d'expérience
                    </span>
                  </>
                )}
              </div>

              {provider.bio && (
                <p className="text-gray-600 mb-4">{provider.bio}</p>
              )}

              {/* Statistiques */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-gray-900">{provider.totalBookings}</p>
                  <p className="text-xs text-gray-600">Réservations</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
                  <p className="text-xs text-gray-600">Taux de complétion</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-pink-600">{provider.services.length}</p>
                  <p className="text-xs text-gray-600">Services</p>
                </div>
              </div>

              {/* Contact */}
              <div className="mt-6 flex flex-wrap gap-4">
                {provider.phone && (
                  <a
                    href={`tel:${provider.phone}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    {provider.phone}
                  </a>
                )}
                {provider.user.email && (
                  <a
                    href={`mailto:${provider.user.email}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                    {provider.user.email}
                  </a>
                )}
                {provider.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4" />
                    {provider.address}
                    {provider.city && `, ${provider.city}`}
                  </div>
                )}
              </div>

              {/* Réseaux sociaux */}
              {(provider.website || provider.instagram || provider.facebook || provider.tiktok) && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {provider.website && (
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600"
                    >
                      <GlobeAltIcon className="h-4 w-4" />
                      Site web
                    </a>
                  )}
                  {provider.instagram && (
                    <a
                      href={`https://instagram.com/${provider.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-pink-600"
                    >
                      📷 Instagram
                    </a>
                  )}
                  {provider.facebook && (
                    <a
                      href={provider.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-pink-600"
                    >
                      📘 Facebook
                    </a>
                  )}
                  {provider.tiktok && (
                    <a
                      href={`https://tiktok.com/@${provider.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-pink-600"
                    >
                      🎵 TikTok
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services */}
        {provider.services.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Services proposés</h2>
            <div className="space-y-4">
              {provider.services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="flex flex-col sm:flex-row bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Image à gauche */}
                  <div className="w-full sm:w-32 md:w-40 lg:w-48 h-48 sm:h-auto sm:flex-shrink-0">
                    {service.images?.[0]?.url ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={service.images[0].url}
                          alt={service.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 160px"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <span className="text-4xl">💇‍♀️</span>
                      </div>
                    )}
                  </div>

                  {/* Détails et boutons au centre */}
                  <div className="flex-1 flex flex-col p-4 sm:p-6">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                      )}
                      <div className="flex items-center gap-4 mb-3">
                        <p className="text-lg sm:text-xl font-bold text-pink-600">
                          {formatCurrency(service.price, currency)}
                        </p>
                        <span className="text-xs sm:text-sm text-gray-500">•</span>
                        <p className="text-sm text-gray-500">{service.duration} min</p>
                      </div>
                    </div>
                    
                    {/* Bouton au centre */}
                    <div className="mt-auto">
                      <span className="inline-block text-sm font-medium text-pink-600 group-hover:text-pink-700 transition-colors">
                        Voir les détails →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {provider.portfolio.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {provider.portfolio.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <Image
                    src={image.url}
                    alt={image.alt || image.title || 'Portfolio'}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avis */}
        {provider.reviews.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Avis clients</h2>
            <div className="space-y-4">
              {provider.reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {review.user.profile?.avatar ? (
                        <div className="relative h-10 w-10 rounded-full overflow-hidden">
                          <Image
                            src={review.user.profile.avatar}
                            alt={review.user.profile.firstName}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {review.user.profile?.firstName[0]}{review.user.profile?.lastName[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.user.profile?.firstName} {review.user.profile?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{review.service.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProviderProfilePage() {
  return <ProviderProfileContent />;
}
