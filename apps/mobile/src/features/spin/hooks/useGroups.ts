import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../../../api';

export function useGroups() {
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.list,
  });

  const createGroupMutation = useMutation({
    mutationFn: ({ name, maxMembers }: { name?: string; maxMembers?: number }) =>
      groupsApi.create(name, maxMembers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  return {
    groups: groupsQuery.data ?? [],
    isLoading: groupsQuery.isLoading,
    error: groupsQuery.error,
    createGroup: createGroupMutation.mutateAsync,
    isCreating: createGroupMutation.isPending,
  };
}

export function useGroup(groupId: string) {
  const queryClient = useQueryClient();

  const groupQuery = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsApi.get(groupId),
    enabled: !!groupId,
  });

  const joinMutation = useMutation({
    mutationFn: () => groupsApi.join(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => groupsApi.leave(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const startSpinMutation = useMutation({
    mutationFn: (candidates: string[]) => groupsApi.startSpin(groupId, candidates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });

  return {
    group: groupQuery.data,
    isLoading: groupQuery.isLoading,
    error: groupQuery.error,
    join: joinMutation.mutateAsync,
    isJoining: joinMutation.isPending,
    leave: leaveMutation.mutateAsync,
    isLeaving: leaveMutation.isPending,
    startSpin: startSpinMutation.mutateAsync,
    isStartingSpin: startSpinMutation.isPending,
  };
}
