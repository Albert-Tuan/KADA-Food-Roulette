import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FFF8E7' },
          headerTintColor: '#D97706',
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: '#FFF8E7' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: 'Đăng nhập' }} />
        <Stack.Screen name="auth/register" options={{ title: 'Đăng ký' }} />
        <Stack.Screen name="spin" options={{ title: 'Quay nào!' }} />
        <Stack.Screen name="restaurant/[id]" options={{ title: 'Chi tiết quán' }} />
        <Stack.Screen name="locket/[id]" options={{ title: 'Locket' }} />
        <Stack.Screen name="group/[id]" options={{ title: 'Nhóm' }} />
        <Stack.Screen name="profile/[id]" options={{ title: 'Hồ sơ' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
