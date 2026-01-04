'use client';

import Link from 'next/link';
import { 
  EyeIcon, 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserIcon, 
  TrashIcon,
  ArrowLeftIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, ClockIcon as ClockIconSolid } from '@heroicons/react/24/solid';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useBookings, useClearProviderHistory, useDeleteProviderBooking } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';
import { useState, useMemo } from 'react';

function BookingsPageContent() {
  const { user } = useAuth();
  const isProvider = user?.role === 'COIFFEUSE';
  const { data: bookings = [], isLoading } = useBookings(isProvider);
  const { mutate: clearHistory, isPending: isClearing } = useClearProviderHistory();
  const { mutate: deleteBooking, isPending: isDeleting } = useDeleteProviderBooking();
  const notifications = useNotifications();
  const currency = getSelectedCurrency();
  
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Stats
  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  }), [bookings]);

  const canClearHistory = stats.completed + stats.cancelled > 0;

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; icon: React.ComponentType<any>; label: string }> = {
      PENDING: { color: 'text-orange-600', bg: 'bg-orange-100', icon: ClockIconSolid, label: 'En attente' },
      CONFIRMED: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircleIcon, label: 'Confirmée' },
      CANCELLED: { color: 'text-red-600', bg: 'bg-red-100', icon: XCircleIcon, label: 'Annulée' },
      COMPLETED: { color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircleIcon, label: 'Terminée' },
    };
    return configs[status] || configs.PENDING;
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return 'Demain';
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  // Filtrage
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (filter === 'all') return true;
      if (filter === 'pending') return b.status === 'PENDING';
      if (filter === 'confirmed') return b.status === 'CONFIRMED';
      if (filter === 'completed') return b.status === 'COMPLETED';
      if (filter === 'cancelled') return b.status === 'CANCELLED';
      return true;
    });
  }, [bookings, filter]);

  // Tri par date
  const sortedBookings = [...filteredBookings].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleClearHistory = () => {
    clearHistory(undefined, {
      onSuccess: (data) => {
        notifications.success('Historique vidé', data.message);
        setConfirmClear(false);
      },
      onError: (error: any) => {
        notifications.error('Erreur', error?.response?.data?.message || 'Erreur');
        setConfirmClear(false);
      },
    });
  };

  const handleDeleteBooking = (id: string) => {
    deleteBooking(id, {
      onSuccess: () => {
        notifications.success('Supprimé', 'Réservation supprimée');
        setDeleteId(null);
      },
      onError: (error: any) => {
        notifications.error('Erreur', error?.response?.data?.message || 'Erreur');
        setDeleteId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {isProvider ? 'Mes Réservations' : 'Mes Rendez-vous'}
                </h1>
                <p className="text-xs text-gray-500">
                  {stats.total} réservation{stats.total > 1 ? 's' : ''}
                  {stats.pending > 0 && <span className="text-orange-600 ml-1">• {stats.pending} en attente</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isProvider && canClearHistory && (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                  title="Vider l'historique"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <FunnelIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="px-4 pb-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
            {[
              { key: 'all', label: 'Toutes', count: stats.total },
              { key: 'pending', label: 'En attente', count: stats.pending },
              { key: 'confirmed', label: 'Confirmées', count: stats.confirmed },
              { key: 'completed', label: 'Terminées', count: stats.completed },
              { key: 'cancelled', label: 'Annulées', count: stats.cancelled },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === f.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats - Provider only */}
      {isProvider && (
        <div className="px-4 py-4 grid grid-cols-4 gap-2">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            <p className="text-[10px] text-gray-500">Total</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-orange-600">{stats.pending}</p>
            <p className="text-[10px] text-gray-500">En attente</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-[10px] text-gray-500">Confirmées</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-blue-600">{stats.completed}</p>
            <p className="text-[10px] text-gray-500">Terminées</p>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="px-4 space-y-3">
        {sortedBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Aucune réservation</h2>
            <p className="text-sm text-gray-500">
              {filter !== 'all' 
                ? 'Aucune réservation ne correspond à ce filtre'
                : isProvider 
                  ? "Vous n'avez pas encore reçu de réservation"
                  : "Vous n'avez pas encore de rendez-vous"
              }
            </p>
            {!isProvider && (
              <Link
                href="/services"
                className="inline-block mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium"
              >
                Réserver un service
              </Link>
            )}
          </div>
        ) : (
          sortedBookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const StatusIcon = statusConfig.icon;
            const bookingDate = new Date(booking.date);
            const canDelete = isProvider && ['COMPLETED', 'CANCELLED'].includes(booking.status);

            return (
              <div key={booking.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <Link href={`/dashboard/bookings/${booking.id}`} className="block p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">
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
                    <p className="font-bold text-purple-600 text-sm">
                      {booking.service ? formatCurrency(booking.service.price, currency) : 'N/A'}
                    </p>
                  </div>

                  {/* Infos */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{getDateLabel(bookingDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span>{format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}</span>
                    </div>
                    {isProvider && (booking.user || booking.clientName) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span>
                          {booking.user 
                            ? `${booking.user.profile?.firstName || ''} ${booking.user.profile?.lastName || ''}`.trim() || booking.user.email
                            : booking.clientName
                          }
                        </span>
                      </div>
                    )}
                    {booking.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span className="line-clamp-1">{booking.location}</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Footer avec actions */}
                <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {format(new Date(booking.createdAt), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                  <div className="flex items-center gap-2">
                    {canDelete && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setDeleteId(booking.id);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                    <Link
                      href={`/dashboard/bookings/${booking.id}`}
                      className="flex items-center gap-1 text-xs text-purple-600 font-medium"
                    >
                      <EyeIcon className="h-3.5 w-3.5" />
                      Détails
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Confirmer suppression historique */}
      {confirmClear && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Vider l'historique ?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Toutes les réservations terminées et annulées seront supprimées définitivement.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleClearHistory}
                disabled={isClearing}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {isClearing ? '...' : 'Vider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmer suppression individuelle */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer cette réservation ?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteBooking(deleteId)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {isDeleting ? '...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
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
