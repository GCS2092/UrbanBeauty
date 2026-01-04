'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  BellIcon,
  CheckIcon,
  TrashIcon,
  FunnelIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
  useDeleteReadNotifications,
} from '@/hooks/useNotifications';
import { useNotifications as useToast } from '@/components/admin/NotificationProvider';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

type FilterType = 'ALL' | 'UNREAD' | 'READ' | 'ORDER' | 'BOOKING' | 'MESSAGE';

function NotificationsPageContent() {
  const router = useRouter();
  const toast = useToast();
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: deleteAll, isPending: isDeletingAll } = useDeleteAllNotifications();
  const { mutate: deleteRead, isPending: isDeletingRead } = useDeleteReadNotifications();

  const [filter, setFilter] = useState<FilterType>('ALL');
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<'all' | 'read' | null>(null);

  // Filtrage des notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'UNREAD') return !n.isRead;
      if (filter === 'READ') return n.isRead;
      if (filter === 'ORDER') {
        try {
          const data = JSON.parse(n.data || '{}');
          return data.type === 'ORDER' || data.type === 'ORDER_UPDATE';
        } catch { return false; }
      }
      if (filter === 'BOOKING') {
        try {
          const data = JSON.parse(n.data || '{}');
          return data.type === 'BOOKING';
        } catch { return false; }
      }
      if (filter === 'MESSAGE') {
        try {
          const data = JSON.parse(n.data || '{}');
          return data.type === 'MESSAGE';
        } catch { return false; }
      }
      return true;
    });
  }, [notifications, filter]);

  // Stats
  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    read: notifications.filter(n => n.isRead).length,
  }), [notifications]);

  // Grouper par date
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: typeof filteredNotifications } = {};
    
    filteredNotifications.forEach((n) => {
      const date = new Date(n.createdAt);
      let key: string;
      
      if (isToday(date)) {
        key = "Aujourd'hui";
      } else if (isYesterday(date)) {
        key = 'Hier';
      } else if (isThisWeek(date, { weekStartsOn: 1 })) {
        key = 'Cette semaine';
      } else {
        key = format(date, 'MMMM yyyy', { locale: fr });
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    
    return groups;
  }, [filteredNotifications]);

  const getNotificationIcon = (notification: any) => {
    try {
      const data = JSON.parse(notification.data || '{}');
      if (data.type === 'ORDER' || data.type === 'ORDER_UPDATE') {
        return <ShoppingBagIcon className="h-5 w-5" />;
      }
      if (data.type === 'BOOKING') {
        return <CalendarIcon className="h-5 w-5" />;
      }
      if (data.type === 'MESSAGE') {
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      }
      if (data.type === 'REVIEW') {
        return <StarIcon className="h-5 w-5" />;
      }
    } catch {}
    return <MegaphoneIcon className="h-5 w-5" />;
  };

  const getNotificationColor = (notification: any) => {
    try {
      const data = JSON.parse(notification.data || '{}');
      if (data.type === 'ORDER' || data.type === 'ORDER_UPDATE') {
        return 'bg-blue-100 text-blue-600';
      }
      if (data.type === 'BOOKING') {
        return 'bg-purple-100 text-purple-600';
      }
      if (data.type === 'MESSAGE') {
        return 'bg-green-100 text-green-600';
      }
      if (data.type === 'REVIEW') {
        return 'bg-yellow-100 text-yellow-600';
      }
    } catch {}
    return 'bg-gray-100 text-gray-600';
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    try {
      const data = JSON.parse(notification.data || '{}');
      if (data.type === 'ORDER' && data.orderId) {
        router.push(`/dashboard/orders/${data.orderId}`);
      } else if (data.type === 'ORDER_UPDATE' && data.orderId) {
        router.push(`/dashboard/orders/${data.orderId}`);
      } else if (data.type === 'MESSAGE' && data.conversationId) {
        router.push(`/dashboard/chat?conversationId=${data.conversationId}`);
      } else if (data.type === 'BOOKING' && data.bookingId) {
        router.push(`/dashboard/bookings/${data.bookingId}`);
      }
    } catch {}
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(id, {
      onSuccess: () => toast.success('Supprimé', 'Notification supprimée'),
    });
  };

  const handleDeleteAll = () => {
    deleteAll(undefined, {
      onSuccess: (data) => {
        toast.success('Terminé', data.message);
        setConfirmDelete(null);
      },
    });
  };

  const handleDeleteRead = () => {
    deleteRead(undefined, {
      onSuccess: (data) => {
        toast.success('Terminé', data.message);
        setConfirmDelete(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
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
                <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
                <p className="text-xs text-gray-500">{stats.unread} non lue(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {stats.unread > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="p-2 rounded-lg bg-pink-50 text-pink-600"
                  title="Tout marquer comme lu"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => setShowActions(!showActions)}
                className={`p-2 rounded-lg transition-colors ${showActions ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <FunnelIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions et Filtres */}
        {showActions && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
            {/* Filtres */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'ALL', label: 'Toutes' },
                { value: 'UNREAD', label: 'Non lues' },
                { value: 'READ', label: 'Lues' },
                { value: 'ORDER', label: 'Commandes' },
                { value: 'BOOKING', label: 'RDV' },
                { value: 'MESSAGE', label: 'Messages' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value as FilterType)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filter === value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Actions de suppression */}
            {notifications.length > 0 && (
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {stats.read > 0 && (
                  <button
                    onClick={() => setConfirmDelete('read')}
                    className="flex-1 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Supprimer les lues ({stats.read})
                  </button>
                )}
                <button
                  onClick={() => setConfirmDelete('all')}
                  className="flex-1 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  Tout supprimer ({stats.total})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-4 grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-gray-900">{stats.total}</p>
          <p className="text-[10px] text-gray-500">Total</p>
        </div>
        <div className="bg-pink-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-pink-600">{stats.unread}</p>
          <p className="text-[10px] text-gray-500">Non lues</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-gray-600">{stats.read}</p>
          <p className="text-[10px] text-gray-500">Lues</p>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="px-4 space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <BellIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {filter === 'ALL' ? 'Aucune notification' : 'Aucun résultat'}
            </h2>
            <p className="text-sm text-gray-500">
              {filter === 'ALL'
                ? "Vous n'avez pas encore de notification"
                : 'Aucune notification ne correspond à ce filtre'
              }
            </p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([date, notifs]) => (
            <div key={date}>
              <p className="text-xs font-medium text-gray-500 mb-2 px-1">{date}</p>
              <div className="bg-white rounded-xl overflow-hidden divide-y divide-gray-100">
                {notifs.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-pink-50/50' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-xl flex-shrink-0 ${getNotificationColor(notification)}`}>
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="h-2 w-2 bg-pink-500 rounded-full flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{notification.body}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(notification.createdAt), 'HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Marquer comme lu"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(notification.id, e)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmDelete === 'all' ? 'Tout supprimer ?' : 'Supprimer les notifications lues ?'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {confirmDelete === 'all'
                ? 'Toutes vos notifications seront supprimées définitivement.'
                : 'Les notifications déjà lues seront supprimées définitivement.'
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete === 'all' ? handleDeleteAll : handleDeleteRead}
                disabled={isDeletingAll || isDeletingRead}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {isDeletingAll || isDeletingRead ? '...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsPageContent />
    </ProtectedRoute>
  );
}

