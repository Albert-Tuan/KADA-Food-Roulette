import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import * as Location from 'expo-location';
import { restaurantApi, stewardApi, DuplicateCheckResult } from '@/api';

const CUISINE_OPTIONS = [
  'Cơm',
  'Phở',
  'Bún',
  'Bánh mì',
  'Món chay',
  'Lẩu',
  'BBQ',
  'Hải sản',
  'Cafe',
  'Tráng miệng',
  'Khác',
];

const PRICE_LEVELS = [
  { label: '$ (< 50k)', value: 1 },
  { label: '$$ (50k-150k)', value: 2 },
  { label: '$$$ (150k-300k)', value: 3 },
  { label: '$$$$ (> 300k)', value: 4 },
];

export default function AddRestaurantScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [priceLevel, setPriceLevel] = useState(2);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheckResult | null>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const requestGPS = async () => {
    setLoadingGPS(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền GPS', 'Vui lòng bật quyền vị trí trong cài đặt.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setLat(location.coords.latitude);
      setLng(location.coords.longitude);
    } catch (error: any) {
      Alert.alert('Lỗi GPS', error.message);
    } finally {
      setLoadingGPS(false);
    }
  };

  // Auto-check duplicate when lat/lng/name filled
  useEffect(() => {
    if (lat !== null && lng !== null && name.trim().length > 2) {
      const timer = setTimeout(async () => {
        setCheckingDuplicate(true);
        try {
          const result = await stewardApi.checkDuplicate(lat, lng, name);
          setDuplicateCheck(result);
        } catch (error) {
          console.error('Duplicate check error:', error);
        } finally {
          setCheckingDuplicate(false);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
    setDuplicateCheck(null);
  }, [lat, lng, name]);

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên quán và địa chỉ.');
      return;
    }

    if (duplicateCheck?.hasDuplicate) {
      Alert.alert(
        'Quán có thể đã tồn tại',
        `Có ${duplicateCheck.duplicates.length} quán gần vị trí này. Bạn có chắc muốn tiếp tục?`,
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Vẫn gửi', onPress: submitRestaurant },
        ]
      );
      return;
    }

    submitRestaurant();
  };

  const submitRestaurant = async () => {
    setSubmitting(true);
    try {
      const result = await restaurantApi.create({
        name,
        address,
        lat: lat ?? undefined,
        lng: lng ?? undefined,
        phone,
        category,
        priceLevel,
      });
      Alert.alert(
        'Thành công! 🎉',
        'Đề xuất của bạn đã được gửi. Steward sẽ duyệt sớm!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi đề xuất.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-5 py-3 flex-row items-center border-b border-border bg-card">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Text className="text-primary text-xl font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-primary">Thêm quán mới</Text>
      </View>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <Text className="text-text-muted text-sm mb-6">
            Quán sẽ được Steward duyệt trước khi hiển thị trong Roulette
          </Text>

          {/* Tên quán */}
          <View className="mb-4">
            <Text className="text-primary font-semibold mb-2">Tên quán *</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-primary"
              placeholder="VD: Bún Chả Hà Nội"
              placeholderTextColor="#9C8B7A"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Địa chỉ */}
          <View className="mb-4">
            <Text className="text-primary font-semibold mb-2">Địa chỉ *</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-primary"
              placeholder="VD: 23 Nguyễn Văn Cừ, Quận 1"
              placeholderTextColor="#9C8B7A"
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>

          {/* GPS */}
          <View className="mb-4">
            <Text className="text-primary font-semibold mb-2">Vị trí GPS</Text>
            <TouchableOpacity
              className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 flex-row items-center"
              onPress={requestGPS}
              disabled={loadingGPS}
            >
              {loadingGPS ? (
                <ActivityIndicator color="#C68E17" size="small" />
              ) : (
                <>
                  <Text className="text-2xl mr-2">📍</Text>
                  <Text className="text-accent font-medium">
                    {lat !== null && lng !== null
                      ? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
                      : 'Lấy vị trí hiện tại'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Duplicate warning */}
          {checkingDuplicate && (
            <View className="bg-accent-bg rounded-xl p-3 mb-4 flex-row items-center">
              <ActivityIndicator color="#C68E17" size="small" />
              <Text className="text-primary text-sm ml-2">Đang kiểm tra trùng lặp...</Text>
            </View>
          )}

          {duplicateCheck?.hasDuplicate && (
            <View className="bg-warning/10 border border-warning rounded-xl p-3 mb-4">
              <Text className="text-primary font-semibold mb-2">
                ⚠️ Có {duplicateCheck.duplicates.length} quán gần đây:
              </Text>
              {duplicateCheck.duplicates.map((d) => (
                <Text key={d.id} className="text-text-muted text-sm">
                  • {d.name} ({d.distanceMeters}m) - {d.source}
                </Text>
              ))}
            </View>
          )}

          {/* Số điện thoại */}
          <View className="mb-4">
            <Text className="text-primary font-semibold mb-2">Số điện thoại</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-primary"
              placeholder="VD: 0901234567"
              placeholderTextColor="#9C8B7A"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Loại món */}
          <View className="mb-4">
            <Text className="text-primary font-semibold mb-2">Loại món</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {CUISINE_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  className={`px-4 py-2 rounded-full ${
                    category === c ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                  onPress={() => setCategory(c)}
                >
                  <Text
                    className={`text-sm ${
                      category === c ? 'text-white font-medium' : 'text-primary'
                    }`}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Mức giá */}
          <View className="mb-6">
            <Text className="text-primary font-semibold mb-2">Mức giá</Text>
            <View className="flex-row flex-wrap gap-2">
              {PRICE_LEVELS.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  className={`px-4 py-2 rounded-full ${
                    priceLevel === p.value
                      ? 'bg-primary'
                      : 'bg-surface border border-border'
                  }`}
                  onPress={() => setPriceLevel(p.value)}
                >
                  <Text
                    className={`text-sm ${
                      priceLevel === p.value ? 'text-white font-medium' : 'text-primary'
                    }`}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            className={`rounded-xl py-4 items-center ${
              submitting ? 'bg-primary/50' : 'bg-primary'
            }`}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Gửi đề xuất</Text>
            )}
          </TouchableOpacity>

          <Text className="text-text-muted text-xs text-center mt-3">
            Quán sẽ được Steward duyệt trong vòng 24h
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}