'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quickRepliesService, CreateQuickReplyDto, UpdateQuickReplyDto } from '@/services/quick-replies.service';

export function useQuickReplies() {
  return useQuery({
    queryKey: ['quick-replies'],
    queryFn: () => quickRepliesService.getAll(),
  });
}

export function useQuickReply(id: string) {
  return useQuery({
    queryKey: ['quick-replies', id],
    queryFn: () => quickRepliesService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateQuickReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateQuickReplyDto) => quickRepliesService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] });
    },
  });
}

export function useCreateDefaultQuickReplies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => quickRepliesService.createDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] });
    },
  });
}

export function useUpdateQuickReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateQuickReplyDto }) =>
      quickRepliesService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] });
    },
  });
}

export function useDeleteQuickReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quickRepliesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] });
    },
  });
}

export function useReorderQuickReplies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) => quickRepliesService.reorder(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] });
    },
  });
}

