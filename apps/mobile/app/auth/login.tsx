import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await login(email.trim(), password);
      // Auth gate in _layout.tsx will handle routing based on isOnboarded
    } catch (err: any) {
      const message = err?.response?.data?.error || err.message || 'Đăng nhập thất bại';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-espresso border-2 border-gold items-center justify-center mb-4 shadow-md">
              <Text className="text-4xl">🎰</Text>
            </View>
            <Text className="text-3xl font-extrabold text-espresso">Food Roulette</Text>
            <Text className="text-warmgray text-sm mt-2 text-center">Đăng nhập để vòng quay chọn ngay quán ngon!</Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-espresso mb-2 font-bold">Email</Text>
              <TextInput
                className="bg-cream-beige border border-borderbrown rounded-2xl px-4 py-3.5 text-espresso font-medium"
                placeholder="email@example.com"
                placeholderTextColor="#9C8B7A"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View>
              <Text className="text-espresso mb-2 font-bold">Mật khẩu</Text>
              <TextInput
                className="bg-cream-beige border border-borderbrown rounded-2xl px-4 py-3.5 text-espresso font-medium"
                placeholder="••••••••"
                placeholderTextColor="#9C8B7A"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? (
              <Text className="text-red-700 font-bold text-sm text-center mt-1">{error}</Text>
            ) : null}

            <TouchableOpacity
              className="bg-espresso border border-gold rounded-2xl py-4 mt-4 shadow-lg disabled:opacity-50"
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FDF5E6" />
              ) : (
                <Text className="text-cream text-center font-bold text-lg">Đăng nhập</Text>
              )}
            </TouchableOpacity>

            {/* Social Login */}
            <View className="flex-row items-center my-5">
              <View className="flex-1 h-px bg-borderbrown" />
              <Text className="mx-4 text-warmgray font-semibold">hoặc</Text>
              <View className="flex-1 h-px bg-borderbrown" />
            </View>

            <TouchableOpacity className="bg-cream-beige border border-borderbrown rounded-2xl py-4 flex-row items-center justify-center shadow-xs">
              <Text className="text-xl mr-3">🌐</Text>
              <Text className="text-espresso font-bold text-base">Đăng nhập với Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-warmgray font-medium">Chưa có tài khoản? </Text>
            <Link href="/auth/register">
              <Text className="text-gold font-bold">Đăng ký ngay</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
