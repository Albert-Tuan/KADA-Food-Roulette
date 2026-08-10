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

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#FDF5E6' },
            headerTintColor: '#3D2314',
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: '#FDF5E6' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: 'Đăng nhập' }} />
          <Stack.Screen name="auth/register" options={{ title: 'Đăng ký' }} />
          <Stack.Screen name="restaurant/[id]" options={{ title: 'Chi tiết nhà hàng' }} />
          <Stack.Screen name="locket/capture" options={{ headerShown: false }} />
          <Stack.Screen name="locket/[id]" options={{ title: 'Taste Board' }} />
          <Stack.Screen name="profile/edit" options={{ title: 'Chỉnh sửa hồ sơ' }} />
          <Stack.Screen name="profile/settings" options={{ title: 'Cài đặt' }} />
          <Stack.Screen name="u/[public_id]" options={{ title: 'Profile công khai' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
