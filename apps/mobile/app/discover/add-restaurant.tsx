import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { restaurantApi } from '@/api';

export default function AddRestaurantScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    address: '',
    category: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.address) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên và địa chỉ quán');
      return;
    }

    setLoading(true);
    try {
      // Mock API call to submit restaurant
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (Platform.OS === 'web') {
        window.alert('Thành công: Cảm ơn bạn đã đóng góp! Đội ngũ Steward sẽ kiểm duyệt thông tin.');
        router.back();
      } else {
        Alert.alert('Thành công', 'Cảm ơn bạn đã đóng góp! Đội ngũ Steward sẽ kiểm duyệt thông tin.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Lỗi: Không thể gửi thông tin lúc này');
      } else {
        Alert.alert('Lỗi', 'Không thể gửi thông tin lúc này');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream-beige">
      <View className="px-6 py-4 flex-row items-center border-b border-borderbrown bg-cream">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-espresso font-bold text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-espresso font-extrabold text-xl">Thêm Quán Mới</Text>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <Text className="text-warmgray text-sm mb-6">
          Biết quán ngon mà chưa có trên bản đồ? Đóng góp ngay để nhận điểm thưởng nhé!
        </Text>

        <View className="mb-4">
          <Text className="text-espresso font-bold mb-2">Tên quán ăn <Text className="text-red-500">*</Text></Text>
          <TextInput
            className="bg-cream border border-borderbrown rounded-2xl p-4 text-espresso font-semibold"
            placeholder="VD: Phở Hòa Pasteur"
            placeholderTextColor="#a8a29e"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
        </View>

        <View className="mb-4">
          <Text className="text-espresso font-bold mb-2">Địa chỉ <Text className="text-red-500">*</Text></Text>
          <TextInput
            className="bg-cream border border-borderbrown rounded-2xl p-4 text-espresso font-semibold"
            placeholder="VD: 260C Pasteur, Quận 3, TP.HCM"
            placeholderTextColor="#a8a29e"
            value={form.address}
            onChangeText={(text) => setForm({ ...form, address: text })}
          />
        </View>

        <View className="mb-4">
          <Text className="text-espresso font-bold mb-2">Danh mục món</Text>
          <TextInput
            className="bg-cream border border-borderbrown rounded-2xl p-4 text-espresso font-semibold"
            placeholder="VD: Phở, Bún, Cơm..."
            placeholderTextColor="#a8a29e"
            value={form.category}
            onChangeText={(text) => setForm({ ...form, category: text })}
          />
        </View>

        <View className="mb-8">
          <Text className="text-espresso font-bold mb-2">Mô tả thêm (Không bắt buộc)</Text>
          <TextInput
            className="bg-cream border border-borderbrown rounded-2xl p-4 text-espresso font-semibold min-h-[100px]"
            placeholder="Quán có đặc sản gì, chỗ để xe rộng không?..."
            placeholderTextColor="#a8a29e"
            multiline
            textAlignVertical="top"
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
          />
        </View>
      </ScrollView>

      <View className="p-6 bg-cream border-t border-borderbrown">
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center ${
            !form.name || !form.address ? 'bg-borderbrown' : 'bg-gold'
          }`}
          disabled={!form.name || !form.address || loading}
          onPress={handleSubmit}
        >
          {loading ? (
            <ActivityIndicator color="#4A3424" />
          ) : (
            <Text className={`font-extrabold text-lg ${
              !form.name || !form.address ? 'text-warmgray' : 'text-espresso'
            }`}>
              Gửi Thông Tin
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
