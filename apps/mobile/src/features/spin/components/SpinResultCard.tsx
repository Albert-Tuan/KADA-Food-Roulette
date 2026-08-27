import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Linking, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import type { Restaurant } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SpinResultCardProps {
  restaurant: Restaurant;
  onSpinAgain: () => void;
  onAccept: () => void;
  onClose?: () => void;
}

export function SpinResultCard({ restaurant, onSpinAgain, onAccept, onClose }: SpinResultCardProps) {
  const router = useRouter();

  const handleDirections = () => {
    const query = encodeURIComponent(`${restaurant.name} ${restaurant.address || ''}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ.')
    );
  };

  const handleSaveToLocket = () => {
    router.push('/(tabs)/lockets');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Đi ăn ${restaurant.name} cùng mình nhé!`,
        message: `Vòng quay Food Roulette đã chọn: ${restaurant.name} (${restaurant.category})!\nĐịa chỉ: ${restaurant.address || 'TP.HCM'}\nCùng đi ăn với mình nào! 🍜`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const priceLabel = restaurant.priceLevel === 1 
    ? 'Bình dân ($)' 
    : restaurant.priceLevel === 2 
    ? 'Trung bình ($$)' 
    : restaurant.priceLevel === 3 
    ? 'Hơi sang ($$$)' 
    : 'Cao cấp ($$$$)';

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose || onSpinAgain}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.topTitleContainer}>
          <Text style={styles.topBadge}>🎉 KẾT QUẢ VÒNG QUAY</Text>
          <Text style={styles.topSubtitle}>Quán ăn hoàn hảo cho bữa ăn hôm nay!</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Hero Restaurant Card */}
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: restaurant.imageUrl }} style={styles.heroImage} />
          
          <View style={styles.floatingTag}>
            <Text style={styles.floatingTagText}>🔥 QUÁN ĐẮC CỬ</Text>
          </View>

          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{restaurant.category || 'Ẩm thực'}</Text>
          </View>
        </View>

        {/* Restaurant Details */}
        <View style={styles.cardDetails}>
          <Text style={styles.restaurantName} numberOfLines={2}>{restaurant.name}</Text>
          
          {restaurant.address && (
            <Text style={styles.restaurantAddress} numberOfLines={2}>
              📍 {restaurant.address}
            </Text>
          )}

          {/* Quick Metrics Badges */}
          <View style={styles.metricsRow}>
            <View style={styles.metricBadgeGold}>
              <Text style={styles.metricTextGold}>⭐ {restaurant.rating.toFixed(1)}</Text>
              <Text style={styles.metricSubText}>({restaurant.totalReviews || 120})</Text>
            </View>
            <View style={styles.metricBadgeWarm}>
              <Text style={styles.metricTextWarm}>🚶 {(restaurant.distance / 1000).toFixed(1)} km</Text>
            </View>
            <View style={styles.metricBadgeWarm}>
              <Text style={styles.metricTextWarm}>💰 {priceLabel}</Text>
            </View>
          </View>

          {/* AI Taste Insight */}
          <View style={styles.tasteBox}>
            <Text style={styles.tasteBoxTitle}>💡 ĐẶC SẮC CỦA QUÁN:</Text>
            <Text style={styles.tasteBoxText}>
              "Hương vị đậm đà chuẩn vị, nguyên liệu tươi ngon và được cộng đồng Food Roulette đánh giá cao quanh khu vực này!"
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons Section */}
      <View style={styles.actionsSection}>
        {/* Primary CTA */}
        <TouchableOpacity
          onPress={onAccept}
          style={styles.primaryCtaBtn}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryCtaText}>🚀 ĐI ĂN NGAY - MỞ QUÀ MAY MẮN!</Text>
        </TouchableOpacity>

        {/* Secondary Action Row */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            onPress={handleDirections}
            style={styles.directionBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.directionBtnText}>🧭 Xem Chỉ Đường</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSpinAgain}
            style={styles.respinBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.respinBtnText}>🔄 Quay Lại Món Khác</Text>
          </TouchableOpacity>
        </View>

        {/* Social / Sharing Row */}
        <View style={styles.socialStrip}>
          <TouchableOpacity
            style={styles.socialActionBtn}
            onPress={handleSaveToLocket}
            activeOpacity={0.75}
          >
            <View style={styles.socialIconBubble}>
              <Text style={styles.socialIcon}>📸</Text>
            </View>
            <Text style={styles.socialActionLabel}>Đăng Locket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialActionBtn}
            onPress={handleShare}
            activeOpacity={0.75}
          >
            <View style={styles.socialIconBubble}>
              <Text style={styles.socialIcon}>🔗</Text>
            </View>
            <Text style={styles.socialActionLabel}>Rủ Bạn Bè</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialActionBtn}
            onPress={() => {
              if (restaurant.id) {
                router.push(`/restaurant/${restaurant.id}` as any);
              } else {
                Alert.alert('Thực đơn', 'Xem toàn bộ các món nổi bật của quán.');
              }
            }}
            activeOpacity={0.75}
          >
            <View style={styles.socialIconBubble}>
              <Text style={styles.socialIcon}>📖</Text>
            </View>
            <Text style={styles.socialActionLabel}>Xem Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8ef',
    paddingBottom: 30,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#b52330',
  },
  topTitleContainer: {
    alignItems: 'center',
  },
  topBadge: {
    fontSize: 13,
    fontWeight: '900',
    color: '#b52330',
    letterSpacing: 0.5,
  },
  topSubtitle: {
    fontSize: 11.5,
    color: '#8e4e14',
    fontWeight: '600',
    marginTop: 2,
  },

  // Hero Card
  card: {
    marginHorizontal: 16,
    marginTop: 6,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  imageWrapper: {
    width: '100%',
    height: SCREEN_WIDTH * 0.55,
    position: 'relative',
    backgroundColor: '#fff0d4',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  floatingTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#b52330',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  floatingTagText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  categoryTag: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(61, 35, 20, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },

  // Details
  cardDetails: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3d2314',
    lineHeight: 28,
  },
  restaurantAddress: {
    fontSize: 12.5,
    color: '#8e4e14',
    fontWeight: '600',
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  metricBadgeGold: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0d4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c68e17',
    gap: 4,
  },
  metricTextGold: {
    fontSize: 12,
    fontWeight: '900',
    color: '#c68e17',
  },
  metricSubText: {
    fontSize: 11,
    color: '#8e4e14',
    fontWeight: '700',
  },
  metricBadgeWarm: {
    backgroundColor: '#fbf3e4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2bebc',
  },
  metricTextWarm: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#5a403f',
  },

  // Taste Box
  tasteBox: {
    marginTop: 14,
    backgroundColor: '#fff8ef',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fbf3e4',
  },
  tasteBoxTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#b52330',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tasteBoxText: {
    fontSize: 12,
    color: '#5a403f',
    fontStyle: 'italic',
    lineHeight: 17,
  },

  // Actions
  actionsSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  primaryCtaBtn: {
    backgroundColor: '#b52330',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#61000e',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 10,
  },
  primaryCtaText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  directionBtn: {
    flex: 1,
    backgroundColor: '#fff0d4',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#c68e17',
    alignItems: 'center',
  },
  directionBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#8e4e14',
  },
  respinBtn: {
    flex: 1,
    backgroundColor: '#fbf3e4',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    alignItems: 'center',
  },
  respinBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5a403f',
  },

  // Social Strip
  socialStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
  },
  socialActionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  socialIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff8ef',
    borderWidth: 1,
    borderColor: '#e2bebc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    fontSize: 18,
  },
  socialActionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5a403f',
  },
});
