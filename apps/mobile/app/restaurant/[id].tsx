import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { restaurantApi, Restaurant } from '@/api';
import { formatCurrency } from '@/lib';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
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
    } finally {
      setLoading(false);
    }
  };

  const openMaps = () => {
    if (!restaurant?.lat || !restaurant?.lng) return;
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
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-secondary-500">Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-xl mb-4">😕</Text>
        <Text className="text-secondary-600">Không tìm thấy quán ăn</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-primary">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView>
        {/* Hero Image */}
        <View className="h-64 bg-secondary-200 relative">
          {restaurant.photos?.[0] ? (
            <Image
              source={{ uri: restaurant.photos[0] }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-6xl">🍜</Text>
            </View>
          )}
          
          {/* Back button */}
          <TouchableOpacity
            className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="p-4">
          {/* Name & Rating */}
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-secondary-800">{restaurant.name}</Text>
              {restaurant.category && (
                <Text className="text-secondary-500 mt-1">{restaurant.category}</Text>
              )}
            </View>
            {restaurant.ratingAvg && (
              <View className="bg-primary/10 rounded-lg px-3 py-1 flex-row items-center">
                <Text className="text-primary font-bold mr-1">★</Text>
                <Text className="text-primary font-semibold">{restaurant.ratingAvg.toFixed(1)}</Text>
                <Text className="text-secondary-400 ml-1">({restaurant.ratingCount})</Text>
              </View>
            )}
          </View>

          {/* Address */}
          {restaurant.address && (
            <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 flex-row items-start" onPress={openMaps}>
              <Text className="text-xl mr-3">📍</Text>
              <View className="flex-1">
                <Text className="text-secondary-800">{restaurant.address}</Text>
                {restaurant.distance && (
                  <Text className="text-secondary-500 text-sm mt-1">Cách bạn {restaurant.distance.toFixed(1)} km</Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Phone */}
          {restaurant.phone && (
            <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 flex-row items-center" onPress={callRestaurant}>
              <Text className="text-xl mr-3">📞</Text>
              <Text className="text-primary flex-1">{restaurant.phone}</Text>
              <Text className="text-primary">Gọi ngay</Text>
            </TouchableOpacity>
          )}

          {/* Price Level */}
          {restaurant.priceLevel && (
            <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center">
              <Text className="text-xl mr-3">💰</Text>
              <Text className="text-secondary-800">
                {restaurant.priceLevel === 1 && 'Bình dân (dưới 50k)'}
                {restaurant.priceLevel === 2 && 'Trung bình (50k - 150k)'}
                {restaurant.priceLevel === 3 && 'Hơi sang (150k - 300k)'}
                {restaurant.priceLevel === 4 && 'Sang trọng (trên 300k)'}
              </Text>
            </View>
          )}

          {/* Source */}
          <View className="bg-secondary-50 rounded-xl p-4 mb-6 flex-row items-center">
            <Text className="text-lg mr-2">
              {restaurant.source === 'GOOGLE_PLACES' ? '🏢' : '👤'}
            </Text>
            <Text className="text-secondary-500 text-sm flex-1">
              {restaurant.source === 'GOOGLE_PLACES' 
                ? 'Quán được xác minh từ Google Places'
                : 'Quán được thêm bởi người dùng'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center shadow-lg"
              onPress={openMaps}
            >
              <Text className="text-white font-bold text-lg">🗺️ Chỉ đường</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white border-2 border-primary rounded-xl py-4 items-center"
              onPress={() => router.push(`/spin?restaurantId=${restaurant.id}`)}
            >
              <Text className="text-primary font-bold text-lg">🎡 Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
