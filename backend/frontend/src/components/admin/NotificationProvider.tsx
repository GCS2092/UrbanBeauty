'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import NotificationComponent, { Notification, NotificationType } from './Notification';

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, message?: string, duration?: number) => string;
  removeNotification: (id: string) => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    // Fallback si le contexte n'est pas disponible
    return {
      showNotification: () => '',
      removeNotification: () => {},
      success: () => '',
      error: () => '',
      warning: () => '',
      info: () => '',
    };
  }
  return context;
}

export default function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((
    type: NotificationType,
    title: string,
    message?: string,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const value: NotificationContextType = {
    showNotification,
    removeNotification,
    success: (title: string, message?: string) => showNotification('success', title, message),
    error: (title: string, message?: string) => showNotification('error', title, message),
    warning: (title: string, message?: string) => showNotification('warning', title, message),
    info: (title: string, message?: string) => showNotification('info', title, message),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {notifications.map(notification => (
          <NotificationComponent
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

