import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { locketRepository } from './mockLocketRepository';
import type { CreateLocketInput, LocketFeedFilter } from './types';

export function useLocketFeed(filter: LocketFeedFilter) {
  return useQuery({
    queryKey: ['lockets', 'feed', filter],
    queryFn: () => locketRepository.getFeed(filter),
  });
}

export function useLocket(id?: string) {
  return useQuery({
    queryKey: ['lockets', 'detail', id],
    queryFn: () => locketRepository.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateLocket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLocketInput) => locketRepository.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lockets'] }),
  });
}

export function useDeleteLocket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locketRepository.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lockets'] }),
  });
}
