'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, ClockIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useBooking, useUpdateBooking } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { useState } from 'react';

function BookingDetailContent() {
  const params = useParams();
  const bookingId = typeof params?.id === 'string' ? params.id : '';
  const { data: booking, isLoading, error } = useBooking(bookingId);
  const { user } = useAuth();
  const { mutate: updateBooking } = useUpdateBooking();
  const notifications = useNotifications();
  const currency = getSelectedCurrency();
  const [isUpdating, setIsUpdating] = useState(false);

  const isProvider = user?.role === 'COIFFEUSE';
  const canEdit = isProvider || user?.role === 'ADMIN';

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

  const handleStatusChange = (newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
    if (!booking) return;
    
    setIsUpdating(true);
    updateBooking(
      {
        id: bookingId,
        data: { status: newStatus },
      },
      {
        onSuccess: () => {
          notifications.success('Statut mis à jour', 'Le statut de la réservation a été mis à jour');
          setIsUpdating(false);
        },
        onError: (error: any) => {
          notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la mise à jour');
          setIsUpdating(false);
        },
      }
    );
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

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Réservation introuvable</p>
          <Link href="/dashboard/bookings" className="text-pink-600 hover:text-pink-700 mt-4 inline-block">
            Retour aux réservations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/dashboard/bookings" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux réservations
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Réservation {booking.bookingNumber}
              </h1>
              <p className="text-sm text-gray-600">
                Créée le {format(new Date(booking.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </p>
            </div>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : booking.status === 'CANCELLED' ? (
                <XCircleIcon className="h-5 w-5" />
              ) : (
                <ClockIcon className="h-5 w-5" />
              )}
              {getStatusLabel(booking.status)}
            </span>
          </div>

          {canEdit && (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Changer le statut :</p>
              <div className="flex gap-2">
                {booking.status === 'PENDING' && (
                  <button
                    onClick={() => handleStatusChange('CONFIRMED')}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Confirmer
                  </button>
                )}
                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                  <button
                    onClick={() => handleStatusChange('CANCELLED')}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                )}
                {booking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleStatusChange('COMPLETED')}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Marquer comme terminée
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Informations du service */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nom</p>
                <p className="font-medium text-gray-900">{booking.service?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prix</p>
                <p className="font-medium text-gray-900">
                  {booking.service ? formatCurrency(booking.service.price, currency) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Durée</p>
                <p className="font-medium text-gray-900">{booking.service?.duration || 'N/A'} minutes</p>
              </div>
            </div>
          </div>

          {/* Informations du rendez-vous */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails du rendez-vous</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(booking.date), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Heure</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                  </p>
                </div>
              </div>
              {booking.location && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Lieu</p>
                    <p className="font-medium text-gray-900">{booking.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informations client/prestataire */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isProvider ? 'Informations client' : 'Informations prestataire'}
          </h2>
          <div className="space-y-2 text-sm">
            {isProvider && booking.user ? (
              <>
                <p className="text-gray-600">
                  <span className="font-medium">Nom :</span>{' '}
                  {booking.user.profile?.firstName} {booking.user.profile?.lastName}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Email :</span> {booking.user.email}
                </p>
                {booking.user.profile?.phone && (
                  <p className="text-gray-600">
                    <span className="font-medium">Téléphone :</span> {booking.user.profile.phone}
                  </p>
                )}
                {booking.clientPhone && (
                  <p className="text-gray-600">
                    <span className="font-medium">Téléphone (réservation) :</span> {booking.clientPhone}
                  </p>
                )}
                {booking.clientEmail && (
                  <p className="text-gray-600">
                    <span className="font-medium">Email (réservation) :</span> {booking.clientEmail}
                  </p>
                )}
              </>
            ) : booking.service?.provider ? (
              <>
                <p className="text-gray-600">
                  <span className="font-medium">Prestataire :</span>{' '}
                  {booking.service.provider.firstName} {booking.service.provider.lastName}
                </p>
              </>
            ) : null}
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">{booking.notes}</p>
          </div>
        )}

        {/* Raison d'annulation */}
        {booking.cancellationReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Raison d'annulation</h2>
            <p className="text-sm text-red-700">{booking.cancellationReason}</p>
          </div>
        )}

        {/* Informations de paiement */}
        {booking.payment && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Paiement</h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Statut :</span> {booking.payment.status}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Montant :</span>{' '}
                {formatCurrency(booking.payment.amount, currency)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  return (
    <ProtectedRoute>
      <BookingDetailContent />
    </ProtectedRoute>
  );
}

