import { useEffect, useState } from 'react';
import { DeviceEventEmitter, ActivityIndicator, View } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
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

function useProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Run checkAuth on mount to restore session from storage
    useAuthStore.getState().checkAuth().finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady || isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in and not on auth screen -> go to login
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Logged in but still on auth screen -> check onboarding
      if (user && user.isOnboarded === false) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } else if (isAuthenticated && !inOnboarding && user && user.isOnboarded === false) {
      // Logged in, not onboarded, not already on onboarding -> go to onboarding
      router.replace('/onboarding');
    }
  }, [isAuthenticated, isLoading, isReady, segments, user]);

  return { isReady, isLoading };
}

export default function RootLayout() {
  const { logout } = useAuthStore();
  const { isReady, isLoading } = useProtectedRoute();

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('AUTH_EXPIRED', () => {
      logout();
      router.replace('/auth/login');
    });
    return () => sub.remove();
  }, [logout]);

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!isReady || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8E7' }}>
        <ActivityIndicator size="large" color="#b52330" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFF8E7' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
          <Stack.Screen name="restaurant/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="discover/index" options={{ headerShown: false }} />
          <Stack.Screen name="discover/add-restaurant" options={{ headerShown: false }} />
          <Stack.Screen name="locket/capture" options={{ headerShown: false }} />
          <Stack.Screen name="locket/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
          <Stack.Screen name="profile/settings" options={{ headerShown: false }} />
          <Stack.Screen name="spin/menu-capture" options={{ headerShown: false }} />
          <Stack.Screen name="spin/menu-review" options={{ headerShown: false }} />
          <Stack.Screen name="spin/menu-wheel" options={{ headerShown: false }} />
          <Stack.Screen name="spin/voice-pick" options={{ headerShown: false }} />
          <Stack.Screen name="spin/result" options={{ headerShown: false }} />
          <Stack.Screen name="spin/check-in" options={{ headerShown: false }} />
          <Stack.Screen name="spin/lucky-spin" options={{ headerShown: false }} />
          <Stack.Screen name="group-spin/lobby" options={{ headerShown: false }} />
          <Stack.Screen name="friends/index" options={{ headerShown: false }} />
          <Stack.Screen name="profile/taste-preferences" options={{ headerShown: false }} />
          <Stack.Screen name="u/[public_id]" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
