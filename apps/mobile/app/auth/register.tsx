import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
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
      setError('');
      await register(formData.email, formData.password, formData.displayName);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView contentContainerStyle="flex-grow px-6 pt-8">
            {/* Header */}
            <View className="items-center mb-8">
              <Text className="text-4xl mb-3">🍜</Text>
              <Text className="text-xl font-bold text-secondary-800">Tạo tài khoản</Text>
              <Text className="text-secondary-500 mt-1">Tham gia Food Roulette ngay!</Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <View>
                <Text className="text-secondary-700 mb-2 font-medium">Tên hiển thị</Text>
                <TextInput
                  className="bg-white border border-secondary-200 rounded-xl px-4 py-3 text-secondary-800"
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor="#A8A29E"
                  value={formData.displayName}
                  onChangeText={(v) => handleChange('displayName', v)}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-secondary-700 mb-2 font-medium">Email</Text>
                <TextInput
                  className="bg-white border border-secondary-200 rounded-xl px-4 py-3 text-secondary-800"
                  placeholder="email@example.com"
                  placeholderTextColor="#A8A29E"
                  value={formData.email}
                  onChangeText={(v) => handleChange('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View>
                <Text className="text-secondary-700 mb-2 font-medium">Mật khẩu</Text>
                <TextInput
                  className="bg-white border border-secondary-200 rounded-xl px-4 py-3 text-secondary-800"
                  placeholder="Ít nhất 6 ký tự"
                  placeholderTextColor="#A8A29E"
                  value={formData.password}
                  onChangeText={(v) => handleChange('password', v)}
                  secureTextEntry
                />
              </View>

              <View>
                <Text className="text-secondary-700 mb-2 font-medium">Xác nhận mật khẩu</Text>
                <TextInput
                  className="bg-white border border-secondary-200 rounded-xl px-4 py-3 text-secondary-800"
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#A8A29E"
                  value={formData.confirmPassword}
                  onChangeText={(v) => handleChange('confirmPassword', v)}
                  secureTextEntry
                />
              </View>

              {error ? (
                <Text className="text-red-500 text-sm text-center">{error}</Text>
              ) : null}

              <TouchableOpacity
                className="bg-primary rounded-xl py-4 mt-4 shadow-lg disabled:opacity-50"
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">Tạo tài khoản</Text>
                )}
              </TouchableOpacity>

              {/* Terms */}
              <Text className="text-secondary-400 text-xs text-center mt-4">
                Bằng việc đăng ký, bạn đồng ý với{' '}
                <Text className="text-primary">Điều khoản sử dụng</Text> và{' '}
                <Text className="text-primary">Chính sách bảo mật</Text>
              </Text>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center mt-6 pb-8">
              <Text className="text-secondary-500">Đã có tài khoản? </Text>
              <Link href="/auth/login">
                <Text className="text-primary font-semibold">Đăng nhập</Text>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaView>
  );
}
