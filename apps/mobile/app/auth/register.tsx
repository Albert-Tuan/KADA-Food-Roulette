import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api';

export default function RegisterScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.displayName) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await authApi.register({
        email: formData.email.trim(),
        password: formData.password,
        displayNamePrivate: formData.displayName.trim(),
        displayNamePublic: formData.displayName.trim(),
      });
      await login(formData.email.trim(), formData.password);
      router.replace('/onboarding' as any);
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24 }}>
            {/* Header */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-espresso border border-gold items-center justify-center mb-3 shadow-md">
                <Text className="text-3xl">🍜</Text>
              </View>
              <Text className="text-2xl font-extrabold text-espresso">Tạo Tài Khoản Mới</Text>
              <Text className="text-warmgray text-sm mt-1 text-center">Tham gia cộng đồng Food Roulette ngay hôm nay!</Text>
            </View>

            {/* Form */}
            <View className="space-y-3.5">
              <View>
                <Text className="text-espresso mb-1.5 font-bold">Tên hiển thị</Text>
                <TextInput
                  className="bg-cream-beige border border-borderbrown rounded-2xl px-4 py-3 text-espresso font-medium"
                  placeholder="Ví dụ: Hoàng Nam"
                  placeholderTextColor="#9C8B7A"
                  value={formData.displayName}
                  onChangeText={(v) => handleChange('displayName', v)}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-espresso mb-1.5 font-bold">Email</Text>
                <TextInput
                  className="bg-cream-beige border border-borderbrown rounded-2xl px-4 py-3 text-espresso font-medium"
                  placeholder="email@example.com"
                  placeholderTextColor="#9C8B7A"
                  value={formData.email}
                  onChangeText={(v) => handleChange('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View>
                <Text className="text-espresso mb-1.5 font-bold">Mật khẩu</Text>
                <TextInput
                  className="bg-cream-beige border border-borderbrown rounded-2xl px-4 py-3 text-espresso font-medium"
                  placeholder="Ít nhất 6 ký tự"
                  placeholderTextColor="#9C8B7A"
                  value={formData.password}
                  onChangeText={(v) => handleChange('password', v)}
                  secureTextEntry
                />
              </View>

              <View>
                <Text className="text-espresso mb-1.5 font-bold">Xác nhận mật khẩu</Text>
                <TextInput
                  className="bg-cream-beige border border-borderbrown rounded-2xl px-4 py-3 text-espresso font-medium"
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#9C8B7A"
                  value={formData.confirmPassword}
                  onChangeText={(v) => handleChange('confirmPassword', v)}
                  secureTextEntry
                />
              </View>

              {error ? (
                <Text className="text-red-700 font-bold text-sm text-center mt-1">{error}</Text>
              ) : null}

              <TouchableOpacity
                className="bg-espresso border border-gold rounded-2xl py-4 mt-3 shadow-lg disabled:opacity-50"
                onPress={handleRegister}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FDF5E6" />
                ) : (
                  <Text className="text-cream text-center font-bold text-lg">Đăng ký tài khoản</Text>
                )}
              </TouchableOpacity>

              {/* Terms */}
              <Text className="text-warmgray text-xs text-center mt-3">
                Bằng việc đăng ký, bạn đồng ý với{' '}
                <Text className="text-gold font-bold">Điều khoản</Text> và{' '}
                <Text className="text-gold font-bold">Chính sách bảo mật</Text>
              </Text>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center mt-6 pb-8">
              <Text className="text-warmgray font-medium">Đã có tài khoản? </Text>
              <Link href="/auth/login">
                <Text className="text-gold font-bold">Đăng nhập</Text>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaView>
  );
}
