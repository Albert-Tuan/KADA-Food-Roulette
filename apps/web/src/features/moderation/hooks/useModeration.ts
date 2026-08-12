/**
 * Moderation hooks (TanStack Query)
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { moderationApi, ModerationQueueFilters } from '../api/moderation.api';

export const moderationKeys = {
  all: ['moderation'] as const,
  queue: (filters: ModerationQueueFilters) =>
    [...moderationKeys.all, 'queue', filters] as const,
  item: (id: string) => [...moderationKeys.all, 'item', id] as const,
  stats: () => [...moderationKeys.all, 'stats'] as const,
};

export function useModerationQueue(filters: ModerationQueueFilters) {
  return useQuery({
    queryKey: moderationKeys.queue(filters),
    queryFn: () => moderationApi.getQueue(filters),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useModerationItem(id: string | undefined) {
  return useQuery({
    queryKey: moderationKeys.item(id ?? ''),
    queryFn: () => moderationApi.getItem(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useModerationStats() {
  return useQuery({
    queryKey: moderationKeys.stats(),
    queryFn: () => moderationApi.getStats(),
    staleTime: 60 * 1000,
  });
}

export function useApproveModeration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      moderationApi.approve(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: moderationKeys.all });
    },
  });
}

export function useRejectModeration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      moderationApi.reject(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: moderationKeys.all });
    },
  });
}

export function useAutoHideModeration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      moderationApi.autoHide(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: moderationKeys.all });
    },
  });
}