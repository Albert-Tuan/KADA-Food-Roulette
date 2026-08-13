import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSpinStore } from '../../src/stores/spinStore';

export default function PersonalCheckInScreen() {
  const router = useRouter();
  const { tasteBoardId: tasteBoardIdParam } = useLocalSearchParams<{ tasteBoardId?: string | string[] }>();
  const { currentResult } = useSpinStore();
  const tasteBoardId = Array.isArray(tasteBoardIdParam) ? tasteBoardIdParam[0] : tasteBoardIdParam;

  const restaurantName = currentResult?.name || 'Nhà hàng đã chọn';
  const restaurantCategory = currentResult?.category || 'Ẩm thực';
  const restaurantImage =
    currentResult?.imageUrl ||
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500';

  const handleConfirmCheckIn = () => {
    if (!tasteBoardId) return;
    router.push('/spin/lucky-spin');
  };

  const handleCreateTasteBoard = () => {
    if (!currentResult?.id) return;
    router.push({
      pathname: '/locket/capture',
      params: {
        restaurantId: currentResult.id,
        returnTo: 'spin-check-in',
      },
    });
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

        {/* Taste Board Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📸 Tạo Taste Board (Bắt buộc)</Text>
            <Text style={styles.rewardTag}>+500🪙 & Spin</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Chụp ảnh món ăn trực tiếp tại quán để xác thực review thật.
          </Text>

          {tasteBoardId ? (
            <View style={styles.completedCard}>
              <Text style={styles.completedTitle}>Taste Board đã tạo</Text>
              <Text style={styles.completedSubtitle}>Review đã được gửi qua LocketRepository.</Text>
              <TouchableOpacity style={styles.secondaryActionBtn} onPress={handleCreateTasteBoard}>
                <Text style={styles.secondaryActionText}>Tạo lại Taste Board</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.cameraBtn} onPress={handleCreateTasteBoard} disabled={!currentResult?.id}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.cameraBtnText}>Mở camera tạo Taste Board</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Review handoff */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⭐ Review món ăn</Text>
          <Text style={styles.sectionSubtitle}>
            {tasteBoardId
              ? 'Review đã được lưu. Bạn có thể hoàn tất check-in để nhận lượt quay.'
              : 'Bạn có thể ghi review và chọn đối tượng xem trong Taste Board.'}
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirmCheckIn} disabled={!tasteBoardId}>
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
  completedCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 14,
  },
  completedTitle: {
    color: '#047857',
    fontSize: 15,
    fontWeight: '700',
  },
  completedSubtitle: {
    color: '#065F46',
    fontSize: 13,
    marginTop: 4,
  },
  secondaryActionBtn: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  secondaryActionText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '700',
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
