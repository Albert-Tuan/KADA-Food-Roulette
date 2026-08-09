import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setError('');
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🍜</Text>
            <Text style={styles.title}>Chào mừng!</Text>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#A8A29E"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#A8A29E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Login */}
            <TouchableOpacity style={styles.googleButton}>
              <Text style={styles.googleIcon}>🍎</Text>
              <Text style={styles.googleText}>Đăng nhập với Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <Link href="/auth/register">
              <Text style={styles.linkText}>Đăng ký ngay</Text>
            </Link>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 8,
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
  loginButton: {
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
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E7E5E4',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#A8A29E',
  },
  googleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  googleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#292524',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
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
