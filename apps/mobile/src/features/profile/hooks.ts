import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileRepository } from './repositories';
import type { UpdateProfileInput } from './types';

export function useMyProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileRepository.getMyProfile(),
  });
}

export function usePublicProfile(publicId?: string) {
  return useQuery({
    queryKey: ['profile', 'public', publicId],
    queryFn: () => profileRepository.getPublicProfile(publicId!),
    enabled: Boolean(publicId),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profileRepository.updateProfile(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile', 'me'], profile);
      queryClient.invalidateQueries({ queryKey: ['profile', 'public', profile.publicId] });
    },
  });
}
