import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReviewCard } from '../../../src/components/ReviewCard';
import { useState, useEffect } from 'react';

// Mock data for MVP
const MOCK_REVIEWS = [
  {
    id: '1',
    user: { name: 'Nguyễn Văn A' },
    overall: 5,
    food: 5,
    service: 4,
    price: 5,
    text: 'Quán ăn rất ngon, phục vụ nhiệt tình. Sẽ quay lại nhiều lần nữa!',
    photos: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    user: { name: 'Trần Thị B' },
    overall: 4,
    food: 4,
    service: 5,
    price: 4,
    text: 'Giá hơi cao một xíu nhưng chất lượng món ăn rất xứng đáng.',
    photos: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

export default function RestaurantReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [reviews, setReviews] = useState(MOCK_REVIEWS);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá ({reviews.length})</Text>
        <View style={{ width: 80 }} /> {/* spacer */}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.list}>
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.writeButton}
          onPress={() => router.push(`/restaurant/${id}/review`)}
        >
          <Text style={styles.writeButtonText}>✍️ Viết đánh giá</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F4' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E7E5E4' },
  backButton: { padding: 8, marginLeft: -8 },
  backText: { color: '#D97706', fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#292524' },
  content: { flex: 1 },
  list: { padding: 16 },
  footer: { padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E7E5E4' },
  writeButton: { backgroundColor: '#D97706', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  writeButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
