'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MapPinIcon, UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useService } from '@/hooks/useServices';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCreateBooking } from '@/hooks/useBookings';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';
import { useQuery } from '@tanstack/react-query';
import { bookingsService } from '@/services/bookings.service';

function ServiceDetailContent() {
  const params = useParams();
  const router = useRouter();
  const serviceId = typeof params?.id === 'string' ? params.id : '';
  const { data: service, isLoading, error } = useService(serviceId);
  const { user, isAuthenticated } = useAuth();
  const { mutate: createBooking, isPending } = useCreateBooking();
  const notifications = useNotifications();
  const currency = getSelectedCurrency();

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    location: '',
    clientPhone: user?.profile?.phone || '',
    clientEmail: user?.email || '',
    notes: '',
  });

  // Récupérer les créneaux disponibles pour la date sélectionnée
  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['availability', serviceId, bookingData.date],
    queryFn: () => bookingsService.getAvailability(serviceId, bookingData.date),
    enabled: !!serviceId && !!bookingData.date && showBookingForm,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Service introuvable</p>
          <Link href="/services" className="text-pink-600 hover:text-pink-700 mt-4 inline-block">
            Retour aux services
          </Link>
        </div>
      </div>
    );
  }

  const rating = service.provider?.rating || 4.5;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      notifications.error('Connexion requise', 'Veuillez vous connecter pour réserver un service');
      router.push('/auth/login');
      return;
    }

    if (!bookingData.date || !bookingData.startTime) {
      notifications.error('Champs requis', 'Veuillez remplir la date et l\'heure');
      return;
    }

    // Vérifier que le créneau est disponible
    if (!availability?.slots?.find((s: { time: string; available: boolean }) => s.time === bookingData.startTime && s.available)) {
      notifications.error('Créneau indisponible', 'Ce créneau n\'est plus disponible. Veuillez en choisir un autre.');
      return;
    }

    // Calculer l'heure de fin (convertir HH:MM en ISO string)
    const [hours, minutes] = bookingData.startTime.split(':');
    const startTime = new Date(`${bookingData.date}T${hours}:${minutes}:00`);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    createBooking(
      {
        serviceId: service.id,
        date: bookingData.date,
        startTime: startTime.toISOString(),
        location: bookingData.location,
        clientPhone: bookingData.clientPhone,
        clientEmail: bookingData.clientEmail,
        notes: bookingData.notes,
      },
      {
        onSuccess: (booking) => {
          notifications.success('Réservation créée', `Votre réservation #${booking.bookingNumber} a été créée avec succès !`);
          router.push(`/dashboard/bookings/${booking.id}`);
        },
        onError: (error: any) => {
          notifications.error('Erreur', error?.response?.data?.message || 'Une erreur est survenue lors de la réservation');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/services" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center overflow-hidden">
            {service.images?.[0]?.url ? (
              <img src={service.images[0].url} alt={service.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl">💇‍♀️</span>
            )}
          </div>

          {/* Détails */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{service.name}</h1>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIconSolid
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">{rating}</span>
              </div>
              {service.provider && (
                <>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <Link
                    href={`/prestataires/${service.provider.id}`}
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                  >
                    <UserIcon className="h-4 w-4" />
                    {service.provider.firstName} {service.provider.lastName}
                  </Link>
                </>
              )}
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-pink-600 mb-6">{formatCurrency(service.price, currency)}</p>
            
            <p className="text-gray-600 mb-6">{service.description || 'Aucune description disponible'}</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600">
                <ClockIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Durée : {service.duration} minutes</span>
              </div>
            </div>

            {!showBookingForm ? (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    notifications.error('Connexion requise', 'Veuillez vous connecter pour réserver un service');
                    router.push('/auth/login');
                    return;
                  }
                  setShowBookingForm(true);
                }}
                className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center"
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                Réserver maintenant
              </button>
            ) : (
              <form onSubmit={handleBookingSubmit} className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Formulaire de réservation</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.date}
                    onChange={(e) => {
                      setBookingData({ ...bookingData, date: e.target.value, startTime: '' });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  />
                </div>

                {/* Planning des créneaux disponibles */}
                {bookingData.date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sélectionnez un créneau horaire *
                    </label>
                    {isLoadingAvailability ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                        <span className="ml-3 text-gray-600">Chargement des créneaux...</span>
                      </div>
                    ) : availability?.slots && availability.slots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-white">
                        {availability.slots.map((slot: { time: string; available: boolean }) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setBookingData({ ...bookingData, startTime: slot.time })}
                            className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                              bookingData.startTime === slot.time
                                ? 'bg-pink-600 text-white'
                                : slot.available
                                ? 'bg-gray-100 text-gray-700 hover:bg-pink-100 hover:text-pink-700 border border-gray-300'
                                : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200 line-through'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        Aucun créneau disponible pour cette date. Veuillez choisir une autre date.
                      </div>
                    )}
                    {availability?.slots && availability.slots.filter((s: { available: boolean }) => s.available).length === 0 && bookingData.date && (
                      <p className="mt-2 text-sm text-gray-500">
                        Tous les créneaux sont occupés pour cette date.
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPinIcon className="h-4 w-4 inline mr-1" />
                    Lieu (optionnel)
                  </label>
                  <input
                    type="text"
                    value={bookingData.location}
                    onChange={(e) => setBookingData({ ...bookingData, location: e.target.value })}
                    placeholder="Adresse ou lieu de rendez-vous"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <PhoneIcon className="h-4 w-4 inline mr-1" />
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={bookingData.clientPhone}
                      onChange={(e) => setBookingData({ ...bookingData, clientPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={bookingData.clientEmail}
                      onChange={(e) => setBookingData({ ...bookingData, clientEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    rows={3}
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    placeholder="Instructions spéciales, préférences..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? 'Réservation...' : 'Confirmer la réservation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetailPage() {
  return <ServiceDetailContent />;
}

