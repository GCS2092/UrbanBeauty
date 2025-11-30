'use client';

import Link from 'next/link';
import { EyeIcon, CalendarIcon, ClockIcon, MapPinIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, ClockIcon as ClockIconSolid } from '@heroicons/react/24/solid';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { format, isToday, isTomorrow, isThisWeek, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';
import { useState } from 'react';

function BookingsPageContent() {
  const { user } = useAuth();
  const isProvider = user?.role === 'COIFFEUSE';
  const { data: bookings = [], isLoading, error } = useBookings(isProvider);
  const currency = getSelectedCurrency();
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; icon: React.ComponentType<any>; label: string }> = {
      PENDING: { 
        color: 'text-orange-600', 
        bg: 'bg-orange-100', 
        icon: ClockIconSolid, 
        label: 'En attente' 
      },
      CONFIRMED: { 
        color: 'text-green-600', 
        bg: 'bg-green-100', 
        icon: CheckCircleIcon, 
        label: 'Confirmée' 
      },
      CANCELLED: { 
        color: 'text-red-600', 
        bg: 'bg-red-100', 
        icon: XCircleIcon, 
        label: 'Annulée' 
      },
      COMPLETED: { 
        color: 'text-blue-600', 
        bg: 'bg-blue-100', 
        icon: CheckCircleIcon, 
        label: 'Terminée' 
      },
    };
    return configs[status] || configs.PENDING;
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return 'Demain';
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  // Filtrage des réservations
  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'pending') return b.status === 'PENDING';
    if (filter === 'confirmed') return b.status === 'CONFIRMED';
    if (filter === 'completed') return b.status === 'COMPLETED';
    return true;
  });

  // Tri par date (plus récent en premier)
  const sortedBookings = [...filteredBookings].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Compter les réservations par statut
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-4">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            {isProvider ? 'Mes Réservations' : 'Mes Rendez-vous'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {bookings.length} réservation{bookings.length > 1 ? 's' : ''}
            {pendingCount > 0 && (
              <span className="text-orange-600 ml-2">• {pendingCount} en attente</span>
            )}
          </p>
        </div>

        {/* Filtres */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { key: 'all', label: 'Toutes', count: bookings.length },
            { key: 'pending', label: 'En attente', count: pendingCount },
            { key: 'confirmed', label: 'Confirmées', count: confirmedCount },
            { key: 'completed', label: 'Terminées', count: bookings.filter(b => b.status === 'COMPLETED').length },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all touch-manipulation ${
                filter === f.key
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              {f.label}
              {f.count > 0 && (
                <span className={`ml-1.5 ${filter === f.key ? 'text-white/80' : 'text-gray-400'}`}>
                  ({f.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {sortedBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="h-10 w-10 text-purple-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Aucune réservation</h2>
            <p className="text-sm text-gray-500 mb-6">
              {filter !== 'all' 
                ? `Aucune réservation ${filter === 'pending' ? 'en attente' : filter === 'confirmed' ? 'confirmée' : 'terminée'}`
                : isProvider 
                  ? "Vous n'avez pas encore reçu de réservation"
                  : "Vous n'avez pas encore de rendez-vous"
              }
            </p>
            {!isProvider && (
              <Link
                href="/services"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-200 active:scale-[0.98] transition-all touch-manipulation"
              >
                Réserver un service
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedBookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;
              const bookingDate = new Date(booking.date);
              const isOld = isPast(bookingDate) && booking.status !== 'COMPLETED';

              return (
                <Link 
                  key={booking.id} 
                  href={`/dashboard/bookings/${booking.id}`}
                  className={`block bg-white rounded-2xl shadow-sm overflow-hidden active:scale-[0.99] transition-transform ${
                    isOld && booking.status === 'PENDING' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="p-4">
                    {/* Header avec statut */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                          {booking.service?.name || 'Service'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </span>
                          {isToday(bookingDate) && booking.status === 'CONFIRMED' && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
                              AUJOURD'HUI
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="font-bold text-purple-600 text-sm">
                          {booking.service ? formatCurrency(booking.service.price, currency) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Infos */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">{getDateLabel(bookingDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span>
                          {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                        </span>
                      </div>
                      
                      {isProvider && booking.user && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{booking.user.profile?.firstName} {booking.user.profile?.lastName}</span>
                        </div>
                      )}
                      
                      {!isProvider && booking.service?.provider && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{booking.service.provider.firstName} {booking.service.provider.lastName}</span>
                        </div>
                      )}

                      {booking.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="line-clamp-1">{booking.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Réservé le {format(new Date(booking.createdAt), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                      <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                        Voir détails
                        <EyeIcon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
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
