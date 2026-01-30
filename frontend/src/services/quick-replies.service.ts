import api from '@/lib/api';

export interface QuickReply {
  id: string;
  userId: string;
  title: string;
  content: string;
  shortcut?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuickReplyDto {
  title: string;
  content: string;
  shortcut?: string;
}

export interface UpdateQuickReplyDto {
  title?: string;
  content?: string;
  shortcut?: string;
  order?: number;
}

export const quickRepliesService = {
  getAll: async (): Promise<QuickReply[]> => {
    const response = await api.get('/api/quick-replies');
    return response.data;
  },

  getOne: async (id: string): Promise<QuickReply> => {
    const response = await api.get(`/api/quick-replies/${id}`);
    return response.data;
  },

  create: async (dto: CreateQuickReplyDto): Promise<QuickReply> => {
    const response = await api.post('/api/quick-replies', dto);
    return response.data;
  },

  createDefaults: async (): Promise<QuickReply[]> => {
const response = await api.post('/api/quick-replies/defaults', {});    return response.data;
  },

  update: async (id: string, dto: UpdateQuickReplyDto): Promise<QuickReply> => {
    const response = await api.patch(`/api/quick-replies/${id}`, dto);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/quick-replies/${id}`);
  },

  reorder: async (orderedIds: string[]): Promise<QuickReply[]> => {
    const response = await api.patch('/api/quick-replies/reorder', {
      orderedIds,
    });
    return response.data;
  },
};

