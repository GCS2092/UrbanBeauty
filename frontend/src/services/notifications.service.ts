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
    const response = await api.get('/api/notifications');
    return response.data ?? [];
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/api/notifications/unread-count');
    return response.data?.count ?? 0;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/api/notifications/${id}/read`, {});
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/api/notifications/mark-all-read', {});
  },

  deleteOne: async (id: string): Promise<void> => {
    await api.delete(`/api/notifications/${id}`);
  },

  deleteAll: async (): Promise<{ message: string; count: number }> => {
    const response = await api.delete('/api/notifications');
    return response.data ?? { message: 'OK', count: 0 };
  },

  deleteRead: async (): Promise<{ message: string; count: number }> => {
    const response = await api.delete('/api/notifications/read/clear');
    return response.data ?? { message: 'OK', count: 0 };
  },
};
