import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
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
      // TODO: Implement actual registration via API
      // For now, just login with the new credentials
      await login(formData.email, formData.password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🍜</Text>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>Tham gia Food Roulette ngay!</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên hiển thị</Text>
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#A8A29E"
                value={formData.displayName}
                onChangeText={(v) => handleChange('displayName', v)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#A8A29E"
                value={formData.email}
                onChangeText={(v) => handleChange('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                style={styles.input}
                placeholder="Ít nhất 6 ký tự"
                placeholderTextColor="#A8A29E"
                value={formData.password}
                onChangeText={(v) => handleChange('password', v)}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#A8A29E"
                value={formData.confirmPassword}
                onChangeText={(v) => handleChange('confirmPassword', v)}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.registerButtonText}>Tạo tài khoản</Text>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.terms}>
              Bằng việc đăng ký, bạn đồng ý với{' '}
              <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và{' '}
              <Text style={styles.termsLink}>Chính sách bảo mật</Text>
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <Link href="/auth/login">
              <Text style={styles.linkText}>Đăng nhập</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#78716C',
  },
  form: {
    gap: 16,
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44403C',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#292524',
  },
  registerButton: {
    backgroundColor: '#D97706',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  terms: {
    fontSize: 12,
    color: '#A8A29E',
    textAlign: 'center',
    marginTop: 16,
  },
  termsLink: {
    color: '#D97706',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#78716C',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
});
