import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { restaurantApi } from '../../src/api';
import { formatCurrency } from '../../src/lib/utils';

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
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant?.name + ' ' + restaurant?.address)}`);
      return;
    }
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const url = Platform.select({
      ios: `${scheme}?q=${restaurant.lat},${restaurant.lng}`,
      android: `${scheme}${restaurant.lat},${restaurant.lng}?q=${restaurant.lat},${restaurant.lng}(${restaurant.name})`,
    });
    if (url) Linking.openURL(url);
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
    backgroundColor: '#FFF8E7',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#78716C',
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
    color: '#57534E',
    marginBottom: 16,
  },
  backLink: {
    fontSize: 16,
    color: '#D97706',
    fontWeight: '600',
  },
  heroContainer: {
    height: 256,
    backgroundColor: '#E7E5E4',
    position: 'relative',
  },
  heroPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F4',
  },
  heroEmoji: {
    fontSize: 80,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: 'white',
    fontSize: 20,
  },
  content: {
    padding: 16,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#292524',
  },
  category: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 4,
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 16,
  },
  ratingValue: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 4,
  },
  ratingCount: {
    color: '#A8A29E',
    fontSize: 13,
    marginLeft: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#292524',
  },
  infoSubtext: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 2,
  },
  phoneText: {
    flex: 1,
    fontSize: 14,
    color: '#D97706',
  },
  callLink: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: '600',
  },
  priceText: {
    flex: 1,
    fontSize: 14,
    color: '#292524',
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sourceIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sourceText: {
    flex: 1,
    fontSize: 13,
    color: '#78716C',
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#D97706',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#D97706',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 16,
  },
});
