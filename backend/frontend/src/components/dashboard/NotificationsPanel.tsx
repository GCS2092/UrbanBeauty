'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '@/hooks/useNotifications';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notificationsData, isLoading } = useNotifications();
  const { data: unreadCountData } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const router = useRouter();

  // ✅ Valeurs par défaut sûres
  const notifications = notificationsData || [];
  const unreadCount = unreadCountData || 0;
  const recentNotifications = notifications.slice(0, 5);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: fr });
    }
    if (isYesterday(date)) {
      return 'Hier';
    }
    return format(date, 'dd/MM', { locale: fr });
  };

  const getNotificationIcon = (notification: any) => {
    try {
      const data = JSON.parse(notification.data || '{}');
      if (data.type === 'ORDER' || data.type === 'ORDER_UPDATE') {
        return <ShoppingBagIcon className="h-4 w-4" />;
      }
      if (data.type === 'BOOKING') {
        return <CalendarIcon className="h-4 w-4" />;
      }
      if (data.type === 'MESSAGE') {
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
      }
    } catch {}
    return <BellIcon className="h-4 w-4" />;
  };

  const getIconColor = (notification: any) => {
    try {
      const data = JSON.parse(notification.data || '{}');
      if (data.type === 'ORDER' || data.type === 'ORDER_UPDATE') return 'bg-blue-100 text-blue-600';
      if (data.type === 'BOOKING') return 'bg-purple-100 text-purple-600';
      if (data.type === 'MESSAGE') return 'bg-green-100 text-green-600';
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

    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-pink-600 transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-pink-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl z-50 border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-pink-600 font-medium">{unreadCount} non lue(s)</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Tout marquer comme lu"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Liste */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-pink-600 border-t-transparent mx-auto"></div>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellIcon className="h-10 w-10 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-500">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-pink-50/50' : ''
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${getIconColor(notification)}`}>
                        {getNotificationIcon(notification)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="h-1.5 w-1.5 bg-pink-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{notification.body}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{formatDate(notification.createdAt)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 p-3 border-t border-gray-100 text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors"
              >
                Voir toutes les notifications
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}