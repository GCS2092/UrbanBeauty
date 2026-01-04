'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, CreateMessageDto, CreateConversationDto } from '@/services/chat.service';

export function useConversations() {
  return useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: () => chatService.getConversations(),
    refetchInterval: 5000, // Rafraîchir toutes les 5 secondes pour les notifications en temps réel
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: () => chatService.getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 3000, // Rafraîchir toutes les 3 secondes pour les nouveaux messages
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationDto) => chatService.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: CreateMessageDto }) =>
      chatService.sendMessage(conversationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });
}

