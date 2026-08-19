import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { restaurantApi } from '../../src/api';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRestaurant();
    }
  }, [id]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      const data = await restaurantApi.get(id);
      setRestaurant(data);
    } catch (error) {
      console.error('Load restaurant error:', error);
      // Mock data for demo
      setRestaurant({
        id,
        name: 'Phở Bò Hai',
        address: '123 Nguyễn Trãi, Quận 1, TP.HCM',
        ratingAvg: 4.5,
        ratingCount: 128,
        category: 'Phở',
        priceLevel: 1,
        phone: '028 1234 5678',
        distance: 0.5,
        source: 'GOOGLE_PLACES',
      });
    } finally {
      setLoading(false);
    }
  };

  const openMaps = () => {
    if (!restaurant?.lat || !restaurant?.lng) {
      // Open Google Maps web for demo
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant?.name + ' ' + (restaurant?.address || ''))}`);
      return;
    }
    
    const url = Platform.select({
      ios: `maps:?q=${restaurant.lat},${restaurant.lng}`,
      android: `geo:${restaurant.lat},${restaurant.lng}?q=${restaurant.lat},${restaurant.lng}(${encodeURIComponent(restaurant.name)})`,
      web: `https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lng}`,
      default: `https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lng}`
    });
    
    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback if the native app is not installed
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lng}`);
      });
    }
  };

  const callRestaurant = () => {
    if (restaurant?.phone) {
      Linking.openURL(`tel:${restaurant.phone}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>Không tìm thấy quán ăn</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroEmoji}>🍜</Text>
          </View>
          
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Name & Rating */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{restaurant.name}</Text>
              {restaurant.category && (
                <Text style={styles.category}>{restaurant.category}</Text>
              )}
            </View>
            {restaurant.ratingAvg && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingStar}>★</Text>
                <Text style={styles.ratingValue}>{restaurant.ratingAvg.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({restaurant.ratingCount})</Text>
              </View>
            )}
          </View>

          {/* Address */}
          {restaurant.address && (
            <TouchableOpacity style={styles.infoCard} onPress={openMaps}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>{restaurant.address}</Text>
                {restaurant.distance && (
                  <Text style={styles.infoSubtext}>Cách bạn {restaurant.distance.toFixed(1)} km</Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Phone */}
          {restaurant.phone && (
            <TouchableOpacity style={styles.infoCard} onPress={callRestaurant}>
              <Text style={styles.infoIcon}>📞</Text>
              <Text style={styles.phoneText}>{restaurant.phone}</Text>
              <Text style={styles.callLink}>Gọi ngay</Text>
            </TouchableOpacity>
          )}

          {/* Price Level */}
          {restaurant.priceLevel && (
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>💰</Text>
              <Text style={styles.priceText}>
                {restaurant.priceLevel === 1 && 'Bình dân (dưới 50k)'}
                {restaurant.priceLevel === 2 && 'Trung bình (50k - 150k)'}
                {restaurant.priceLevel === 3 && 'Hơi sang (150k - 300k)'}
                {restaurant.priceLevel === 4 && 'Sang trọng (trên 300k)'}
              </Text>
            </View>
          )}

          {/* Source */}
          <View style={styles.sourceCard}>
            <Text style={styles.sourceIcon}>
              {restaurant.source === 'GOOGLE_PLACES' ? '🏢' : '👤'}
            </Text>
            <Text style={styles.sourceText}>
              {restaurant.source === 'GOOGLE_PLACES' 
                ? 'Quán được xác minh từ Google Places'
                : 'Quán được thêm bởi người dùng'}
            </Text>
          </View>

          {/* Review Section */}
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Đánh giá</Text>
            <TouchableOpacity 
              style={styles.reviewActionCard} 
              onPress={() => router.push(`/restaurant/${id}/reviews`)}
            >
              <Text style={styles.reviewActionIcon}>⭐</Text>
              <View style={styles.reviewActionContent}>
                <Text style={styles.reviewActionTitle}>Xem các đánh giá</Text>
                <Text style={styles.reviewActionSub}>Đọc chia sẻ từ cộng đồng</Text>
              </View>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.reviewActionCard} 
              onPress={() => router.push(`/restaurant/${id}/review`)}
            >
              <Text style={styles.reviewActionIcon}>✍️</Text>
              <View style={styles.reviewActionContent}>
                <Text style={styles.reviewActionTitle}>Viết đánh giá</Text>
                <Text style={styles.reviewActionSub}>Chia sẻ trải nghiệm của bạn</Text>
              </View>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryButton} onPress={openMaps}>
              <Text style={styles.primaryButtonText}>🗺️ Chỉ đường</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>🎡 Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF5E6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9C8B7A',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#5C3317',
    marginBottom: 16,
    fontWeight: '600',
  },
  backLink: {
    fontSize: 16,
    color: '#C68E17',
    fontWeight: '700',
  },
  heroContainer: {
    height: 240,
    backgroundColor: '#FAF0E6',
    position: 'relative',
  },
  heroPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF0E6',
  },
  heroEmoji: {
    fontSize: 80,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(61,35,20,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C68E17',
  },
  backIcon: {
    color: '#FDF5E6',
    fontSize: 22,
    fontWeight: '800',
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#3D2314',
  },
  category: {
    fontSize: 14,
    color: '#9C8B7A',
    marginTop: 4,
    fontWeight: '600',
  },
  ratingBadge: {
    backgroundColor: '#F5DEB3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  ratingStar: {
    color: '#C68E17',
    fontWeight: '800',
    fontSize: 16,
  },
  ratingValue: {
    color: '#3D2314',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 4,
  },
  ratingCount: {
    color: '#5C3317',
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0EB',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4C5B5',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 15,
    color: '#3D2314',
    fontWeight: '600',
  },
  infoSubtext: {
    fontSize: 13,
    color: '#8B4513',
    marginTop: 2,
    fontWeight: '600',
  },
  phoneText: {
    flex: 1,
    fontSize: 15,
    color: '#3D2314',
    fontWeight: '600',
  },
  callLink: {
    fontSize: 14,
    color: '#C68E17',
    fontWeight: '800',
  },
  priceText: {
    flex: 1,
    fontSize: 15,
    color: '#3D2314',
    fontWeight: '600',
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF0E6',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8DDD0',
  },
  sourceIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sourceText: {
    flex: 1,
    fontSize: 13,
    color: '#9C8B7A',
    fontWeight: '500',
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3D2314',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C68E17',
    shadowColor: '#3D2314',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FDF5E6',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#F5F0EB',
    borderWidth: 1.5,
    borderColor: '#D4C5B5',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#3D2314',
    fontWeight: '800',
    fontSize: 16,
  },
  reviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 12,
  },
  reviewActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  reviewActionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  reviewActionContent: {
    flex: 1,
  },
  reviewActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#292524',
  },
  reviewActionSub: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 4,
  },
  arrowIcon: {
    fontSize: 20,
    color: '#D97706',
  }
});
