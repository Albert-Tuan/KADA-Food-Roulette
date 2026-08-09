import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, type LoginRequest, type RegisterRequest } from '@/api';
import { useUserStore } from '@/stores';
import { ROUTES } from '@/lib';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, login, logout, setUser } = useUserStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      login(response.token, response.user);
      queryClient.setQueryData(['user'], response.user);
      navigate(ROUTES.HOME);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      login(response.token, response.user);
      queryClient.setQueryData(['user'], response.user);
      navigate(ROUTES.HOME);
    },
  });

  const googleMutation = useMutation({
    mutationFn: (idToken: string) => authApi.google(idToken),
    onSuccess: (response) => {
      login(response.token, response.user);
      queryClient.setQueryData(['user'], response.user);
      navigate(ROUTES.HOME);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Call logout API if needed
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
  });

  const fetchUser = useMutation({
    mutationFn: async () => {
      const userData = await authApi.me();
      setUser(userData);
      return userData;
    },
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    loginWithGoogle: googleMutation.mutateAsync,
    logout: logoutMutation.mutate,
    fetchUser: fetchUser.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoading: loginMutation.isPending || registerMutation.isPending,
  };
}
