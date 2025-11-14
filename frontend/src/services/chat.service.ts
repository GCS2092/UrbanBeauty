import api from '@/lib/api';

export interface Conversation {
  id: string;
  otherParticipant: {
    id: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateMessageDto {
  content: string;
}

export interface CreateConversationDto {
  participant2Id: string;
}

export const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get<Conversation[]>('/api/chat/conversations');
    return response.data;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await api.get<Message[]>(`/api/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  createConversation: async (data: CreateConversationDto): Promise<Conversation> => {
    const response = await api.post<Conversation>('/api/chat/conversations', data);
    return response.data;
  },

  sendMessage: async (conversationId: string, data: CreateMessageDto): Promise<Message> => {
    const response = await api.post<Message>(`/api/chat/conversations/${conversationId}/messages`, data);
    return response.data;
  },
};

