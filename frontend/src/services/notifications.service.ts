import api from '@/lib/api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type?: string;
  data?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsService = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/api/notifications');
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ count: number }>('/api/notifications/unread-count');
    return response.data.count;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/api/notifications/mark-all-read');
  },
};
