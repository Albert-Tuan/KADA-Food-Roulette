import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

import { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';

export default function RootLayout() {
  const { logout } = useAuthStore();

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('AUTH_EXPIRED', () => {
      logout();
      router.replace('/auth/login');
    });
    return () => sub.remove();
  }, [logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#FFF8E7' },
            headerTintColor: '#3D2314',
            headerTitleStyle: { fontWeight: '600' },
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: { backgroundColor: '#FFF8E7' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: 'Đăng nhập' }} />
          <Stack.Screen name="auth/register" options={{ title: 'Đăng ký' }} />
          <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
          <Stack.Screen name="restaurant/[id]" options={{ title: 'Chi tiết nhà hàng' }} />
          <Stack.Screen name="locket/capture" options={{ headerShown: false }} />
          <Stack.Screen name="locket/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="profile/edit" options={{ title: 'Chỉnh sửa hồ sơ' }} />
          <Stack.Screen name="profile/settings" options={{ title: 'Cài đặt' }} />
          <Stack.Screen name="spin/menu-capture" options={{ headerShown: false }} />
          <Stack.Screen name="spin/menu-review" options={{ headerShown: false }} />
          <Stack.Screen name="spin/menu-wheel" options={{ headerShown: false }} />
          <Stack.Screen name="spin/voice-pick" options={{ headerShown: false }} />
          <Stack.Screen name="spin/result" options={{ headerShown: false }} />
          <Stack.Screen name="spin/check-in" options={{ headerShown: false }} />
          <Stack.Screen name="spin/lucky-spin" options={{ headerShown: false }} />
          <Stack.Screen name="group-spin/lobby" options={{ headerShown: false }} />
          <Stack.Screen name="u/[public_id]" options={{ title: 'Profile công khai' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
