import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { locketRepository } from './repositories';
import type { CreateLocketInput, Locket, LocketFeedFilter } from './types';

export function useLocketFeed(filter: LocketFeedFilter) {
  return useQuery({
    queryKey: ['lockets', 'feed', filter],
    queryFn: () => locketRepository.getFeed(filter),
    refetchOnMount: 'always',
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
    onSuccess: (created) => {
      queryClient.setQueryData(['lockets', 'detail', created.id], created);
      queryClient.invalidateQueries({ queryKey: ['lockets', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useSetLocketLiked() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) => locketRepository.setLiked(id, liked),
    onSuccess: (reaction, { id }) => {
      const applyReaction = (locket: Locket): Locket => locket.id === id
        ? { ...locket, likeCount: reaction.likeCount, isLiked: reaction.isLiked }
        : locket;
      queryClient.setQueriesData<Locket[]>({ queryKey: ['lockets', 'feed'] }, (current: Locket[] | undefined) => (
        current?.map(applyReaction)
      ));
      queryClient.setQueryData<Locket>(['lockets', 'detail', id], (current: Locket | undefined) => (
        current ? applyReaction(current) : current
      ));
    },
  });
}

export function useDeleteLocket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locketRepository.delete(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: ['lockets', 'detail', id], exact: true });
      queryClient.invalidateQueries({ queryKey: ['lockets', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
