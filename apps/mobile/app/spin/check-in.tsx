import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSpinStore } from '../../src/stores/spinStore';

export default function PersonalCheckInScreen() {
  const router = useRouter();
  const { currentResult } = useSpinStore();

  const [rating, setRating] = useState(5);
  const [dishName, setDishName] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const restaurantName = currentResult?.name || 'Nhà hàng đã chọn';
  const restaurantCategory = currentResult?.category || 'Ẩm thực';
  const restaurantImage =
    currentResult?.imageUrl ||
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500';

  const handleTakePhoto = () => {
    // Simulated Locket photo capture with EXIF/GPS metadata strip simulation
    setCapturedPhoto('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600');
    Alert.alert('📸 Locket Photo Taken!', 'Ảnh đã gắn thẻ GPS & tự động ẩn EXIF cá nhân.');
  };

  const handleConfirmCheckIn = () => {
    router.push('/spin/lucky-spin');
  };

  const handleSkip = () => {
    Alert.alert(
      'Bỏ qua Check-in?',
      'Bạn sẽ không nhận được lượt quay Vòng Quay May Mắn nếu không check-in.',
      [
        { text: 'Quay lại', style: 'cancel' },
        { text: 'Bỏ qua', style: 'destructive', onPress: () => router.replace('/(tabs)') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Restaurant Header Card */}
        <View style={styles.restaurantCard}>
          <Image source={{ uri: restaurantImage }} style={styles.restaurantImage} />
          <View style={styles.restaurantInfo}>
            <View style={styles.badgeRow}>
              <Text style={styles.categoryBadge}>{restaurantCategory}</Text>
              <Text style={styles.gpsVerifiedBadge}>✅ Trong bán kính 100m</Text>
            </View>
            <Text style={styles.restaurantName}>{restaurantName}</Text>
            <Text style={styles.checkInSubtitle}>Xác nhận bạn đang ăn ở quán này!</Text>
          </View>
        </View>

        {/* Locket Photo Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📸 Chụp Locket (Bắt buộc)</Text>
            <Text style={styles.rewardTag}>+500🪙 & Spin</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Chụp ảnh món ăn trực tiếp tại quán để xác thực review thật.
          </Text>

          {capturedPhoto ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
              <TouchableOpacity style={styles.retakeBtn} onPress={handleTakePhoto}>
                <Text style={styles.retakeBtnText}>🔄 Chụp lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.cameraBtn} onPress={handleTakePhoto}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.cameraBtnText}>Mở Camera Chụp Locket</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Review & Rating Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⭐ Đánh giá món ăn</Text>
          <Text style={styles.sectionSubtitle}>Chia sẻ trải nghiệm ăn uống với cộng đồng</Text>

          {/* Star Rating */}
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Text style={[styles.starIcon, rating >= star ? styles.starSelected : styles.starUnselected]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.ratingText}>{rating}/5 điểm</Text>
          </View>

          {/* Dish Name Input */}
          <Text style={styles.inputLabel}>Tên món bạn ăn</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Phở Bò Tái Nạm, Trà Éch..."
            placeholderTextColor="#A8A29E"
            value={dishName}
            onChangeText={setDishName}
          />

          {/* Review Note Input */}
          <Text style={styles.inputLabel}>Cảm nhận / Review ngắn</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nước dùng đậm đà, thịt bò mềm thơm..."
            placeholderTextColor="#A8A29E"
            multiline
            numberOfLines={3}
            value={reviewNote}
            onChangeText={setReviewNote}
          />
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirmCheckIn}>
          <Text style={styles.primaryBtnText}>🎉 Hoàn Tất Check-in & Quay May Mắn</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipBtnText}>Bỏ qua (Không nhận voucher)</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  restaurantCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginBottom: 16,
  },
  restaurantImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  restaurantInfo: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#F5E6D3',
    color: '#8B4513',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gpsVerifiedBadge: {
    backgroundColor: '#DCFCE7',
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#292524',
    marginBottom: 2,
  },
  checkInSubtitle: {
    fontSize: 13,
    color: '#78716C',
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#292524',
  },
  rewardTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#78716C',
    marginBottom: 12,
  },
  cameraBtn: {
    backgroundColor: '#3D2314',
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  cameraBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  previewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  retakeBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retakeBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 10,
  },
  starIcon: {
    fontSize: 32,
  },
  starSelected: {
    color: '#F59E0B',
  },
  starUnselected: {
    color: '#D6D3D1',
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#78716C',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#44403C',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FAFAF9',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1C1917',
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    backgroundColor: '#B52330',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#B52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipBtnText: {
    fontSize: 13,
    color: '#A8A29E',
    textDecorationLine: 'underline',
  },
});
