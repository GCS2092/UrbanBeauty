import api from '@/lib/api';

export interface RegisterTokenDto {
  token: string;
}

export interface SendNotificationDto {
  title: string;
  body: string;
  data?: Record<string, string>;
  userId?: string;
  topic?: string;
}

export const notificationsService = {
  registerToken: async (token: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/api/notifications/register-token',
      { token }
    );
    return response.data;
  },

  send: async (data: SendNotificationDto): Promise<any> => {
    const response = await api.post('/api/notifications/send', data);
    return response.data;
  },

  sendToMultiple: async (userIds: string[], data: Omit<SendNotificationDto, 'userId' | 'topic'>): Promise<any> => {
    const response = await api.post('/api/notifications/send-to-multiple', {
      ...data,
      userIds,
    });
    return response.data;
  },
};

