'use client';

import Link from 'next/link';
import { ArrowLeftIcon, EyeIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';

function BookingsPageContent() {
  const { user } = useAuth();
  const isProvider = user?.role === 'COIFFEUSE';
  const { data: bookings = [], isLoading, error } = useBookings(isProvider);
  const currency = getSelectedCurrency();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      CANCELLED: 'Annulée',
      COMPLETED: 'Terminée',
    };
    return labels[status] || status;
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {isProvider ? 'Mes Réservations Reçues' : 'Mes Réservations'}
        </h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">📅</span>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucune réservation</h2>
            <p className="text-gray-600 mb-6">
              {isProvider 
                ? 'Vous n\'avez pas encore reçu de réservation'
                : 'Vous n\'avez pas encore de réservation'}
            </p>
            {!isProvider && (
              <Link
                href="/services"
                className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
              >
                Réserver un service
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {booking.service?.name || 'Service'}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {format(new Date(booking.date), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4" />
                        <span>
                          {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                        </span>
                      </div>
                      {isProvider && booking.user && (
                        <p>
                          Client : {booking.user.profile?.firstName} {booking.user.profile?.lastName}
                        </p>
                      )}
                      {!isProvider && booking.service?.provider && (
                        <p>
                          Prestataire : {booking.service.provider.firstName} {booking.service.provider.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-900 text-lg mb-2">
                      {booking.service ? formatCurrency(booking.service.price, currency) : 'N/A'}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                </div>
                
                {booking.location && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Lieu :</span> {booking.location}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <Link
                    href={`/dashboard/bookings/${booking.id}`}
                    className="inline-flex items-center text-sm text-pink-600 hover:text-pink-700 font-medium"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Voir les détails
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <ProtectedRoute>
      <BookingsPageContent />
    </ProtectedRoute>
  );
}

