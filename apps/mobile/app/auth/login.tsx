import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api';

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
      const response = await authApi.login({ email: email.trim(), password });
      await login(response.token, response.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12">
          {/* Header */}
          <View className="items-center mb-10">
            <Text className="text-5xl mb-4">🍜</Text>
            <Text className="text-2xl font-bold text-secondary-800">Chào mừng!</Text>
            <Text className="text-secondary-500 mt-2">Đăng nhập để tiếp tục</Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-secondary-700 mb-2 font-medium">Email</Text>
              <TextInput
                className="bg-white border border-secondary-200 rounded-xl px-4 py-3 text-secondary-800"
                placeholder="email@example.com"
                placeholderTextColor="#A8A29E"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View>
              <Text className="text-secondary-700 mb-2 font-medium">Mật khẩu</Text>
              <TextInput
                className="bg-white border border-secondary-200 rounded-xl px-4 py-3 text-secondary-800"
                placeholder="••••••••"
                placeholderTextColor="#A8A29E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? (
              <Text className="text-red-500 text-sm text-center">{error}</Text>
            ) : null}

            <TouchableOpacity
              className="bg-primary rounded-xl py-4 mt-4 shadow-lg disabled:opacity-50"
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">Đăng nhập</Text>
              )}
            </TouchableOpacity>

            {/* Social Login */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-secondary-200" />
              <Text className="mx-4 text-secondary-400">hoặc</Text>
              <View className="flex-1 h-px bg-secondary-200" />
            </View>

            <TouchableOpacity className="bg-white border border-secondary-200 rounded-xl py-4 flex-row items-center justify-center">
              <Text className="text-xl mr-3">🍎</Text>
              <Text className="text-secondary-800 font-medium">Đăng nhập với Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-secondary-500">Chưa có tài khoản? </Text>
            <Link href="/auth/register">
              <Text className="text-primary font-semibold">Đăng ký ngay</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
