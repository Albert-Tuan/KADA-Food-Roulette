import { View, Text, StyleSheet } from 'react-native';
import { StarRating } from './StarRating';

interface Review {
  id: string;
  user: { name: string; avatarUrl?: string };
  overall: number;
  food: number;
  service: number;
  price: number;
  text: string;
  photos: string[];
  createdAt: string;
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{review.user.name.charAt(0)}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{review.user.name}</Text>
          <Text style={styles.date}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</Text>
        </View>
        <StarRating rating={review.overall} size={16} disabled />
      </View>
      <Text style={styles.reviewText}>{review.text}</Text>
      
      {/* Ratings breakdown */}
      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Vị:</Text>
          <Text style={styles.breakdownValue}>{review.food}</Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Phục vụ:</Text>
          <Text style={styles.breakdownValue}>{review.service}</Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Giá:</Text>
          <Text style={styles.breakdownValue}>{review.price}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#D97706', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  userInfo: { flex: 1 },
  userName: { fontWeight: '600', fontSize: 16, color: '#292524' },
  date: { color: '#78716C', fontSize: 12 },
  reviewText: { fontSize: 14, color: '#292524', marginBottom: 12, lineHeight: 20 },
  breakdown: { flexDirection: 'row', gap: 16, backgroundColor: '#F5F5F4', padding: 8, borderRadius: 8 },
  breakdownItem: { flexDirection: 'row', gap: 4 },
  breakdownLabel: { color: '#78716C', fontSize: 12 },
  breakdownValue: { fontWeight: '700', color: '#D97706', fontSize: 12 },
});
