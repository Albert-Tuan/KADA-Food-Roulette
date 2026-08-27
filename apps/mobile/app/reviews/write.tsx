import { useState } from 'react';
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { reviewsApi } from '@/api';

function StarPicker({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <View className="mb-3">
      <Text className="text-primary font-medium mb-1">{label}</Text>
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((s) => (
          <TouchableOpacity key={s} onPress={() => onChange(s)} className="pr-1">
            <Text className={`text-3xl ${s <= value ? 'text-accent' : 'text-border'}`}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
        <Text className="text-text-muted ml-2 self-center text-sm">{value}/5</Text>
      </View>
    </View>
  );
}

const COMMON_TAGS = [
  'Ngon',
  'Rẻ',
  'Phục vụ tốt',
  'Không gian đẹp',
  'Đông',
  'Yên tĩnh',
  'Ngoài trời',
  'Đỗ xe',
  'Giao hàng',
  'Đặt bàn',
];

export default function WriteReviewScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const [overallRating, setOverallRating] = useState(0);
  const [tasteRating, setTasteRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [ambienceRating, setAmbienceRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map(a => a.uri);
      setPhotos([...photos, ...newPhotos].slice(0, 3));
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else if (tags.length < 5) {
      setTags([...tags, tag]);
    } else {
      Alert.alert('Tối đa 5 tag');
    }
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      Alert.alert('Thiếu rating', 'Vui lòng chọn số sao tổng thể.');
      return;
    }

    if (!restaurantId) {
      Alert.alert('Lỗi', 'Không tìm thấy quán.');
      return;
    }

    setSubmitting(true);
    try {
      await reviewsApi.create({
        restaurantId,
        overallRating,
        tasteRating: tasteRating || undefined,
        serviceRating: serviceRating || undefined,
        ambienceRating: ambienceRating || undefined,
        valueRating: valueRating || undefined,
        content,
        tags,
        imageUrl: photos[0],
      });
      Alert.alert('Cảm ơn bạn! ⭐', 'Review đã được đăng.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đăng review.');
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
        <Text className="text-lg font-bold text-primary">Viết review</Text>
      </View>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <Text className="text-text-muted text-sm mb-6">
            Chia sẻ trải nghiệm của bạn để giúp cộng đồng
          </Text>

          <StarPicker
            label="Đánh giá tổng thể *"
            value={overallRating}
            onChange={setOverallRating}
          />

          <View className="h-px bg-border my-3" />

          <Text className="text-primary font-semibold mb-3">
            Đánh giá chi tiết (không bắt buộc)
          </Text>
          <StarPicker label="Vị" value={tasteRating} onChange={setTasteRating} />
          <StarPicker label="Phục vụ" value={serviceRating} onChange={setServiceRating} />
          <StarPicker label="Không gian" value={ambienceRating} onChange={setAmbienceRating} />
          <StarPicker label="Giá cả" value={valueRating} onChange={setValueRating} />

          <View className="h-px bg-border my-3" />

          <Text className="text-primary font-semibold mb-2">Nội dung</Text>
          <TextInput
            className="bg-surface border border-border rounded-xl px-4 py-3 text-primary min-h-24"
            placeholder="Chia sẻ trải nghiệm của bạn..."
            placeholderTextColor="#9C8B7A"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <Text className="text-text-muted text-xs mt-1 mb-4">{content.length}/500</Text>

          <Text className="text-primary font-semibold mb-2">Tags ({tags.length}/5)</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {COMMON_TAGS.map((t) => (
              <TouchableOpacity
                key={t}
                className={`px-3 py-1.5 rounded-full ${
                  tags.includes(t)
                    ? 'bg-primary'
                    : 'bg-surface border border-border'
                }`}
                onPress={() => toggleTag(t)}
              >
                <Text
                  className={`text-sm ${
                    tags.includes(t) ? 'text-white font-medium' : 'text-primary'
                  }`}
                >
                  #{t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-primary font-semibold mb-2">Ảnh ({photos.length}/3)</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {photos.map((uri, i) => (
              <View key={i} className="w-20 h-20 bg-surface rounded-xl overflow-hidden">
                <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
              </View>
            ))}
            {photos.length < 3 && (
              <TouchableOpacity
                onPress={pickImage}
                className="w-20 h-20 bg-surface border-2 border-dashed border-border rounded-xl items-center justify-center"
              >
                <Text className="text-3xl text-border">+</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            className={`rounded-xl py-4 items-center ${
              submitting || overallRating === 0 ? 'bg-primary/40' : 'bg-primary'
            }`}
            onPress={handleSubmit}
            disabled={submitting || overallRating === 0}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Đăng review</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}