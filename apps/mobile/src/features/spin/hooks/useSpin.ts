import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rouletteApi } from '../../../api';

export function useSpin() {
  const queryClient = useQueryClient();

  const spinMutation = useMutation({
    mutationFn: rouletteApi.spin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  return {
    spin: spinMutation.mutateAsync,
    result: spinMutation.data,
    isSpinning: spinMutation.isPending,
    error: spinMutation.error,
    reset: spinMutation.reset,
  };
}
