import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Restaurant } from '@/api';

interface RestaurantListProps {
  restaurants: Restaurant[];
  visible: boolean;
}

export default function RestaurantList({ restaurants, visible }: RestaurantListProps) {
  const router = useRouter();

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-cream">
      <View className="px-6 py-4 border-b border-borderbrown bg-cream-beige">
        <Text className="text-espresso font-extrabold text-xl">Danh sách Quán ăn</Text>
        <Text className="text-warmgray text-sm">{restaurants.length} địa điểm gần bạn</Text>
      </View>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/restaurant/${item.id}`)}>
            <View className="bg-white rounded-3xl p-4 shadow-sm border border-borderbrown">
              <View className="flex-row">
                <View className="w-24 h-24 bg-cream-linen rounded-2xl overflow-hidden mr-4">
                  {item.photos && item.photos.length > 0 ? (
                    <Image source={{ uri: item.photos[0] }} className="w-full h-full" />
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <Text className="text-2xl">🍽️</Text>
                    </View>
                  )}
                </View>
                <View className="flex-1 justify-center">
                  <Text className="text-espresso font-extrabold text-lg" numberOfLines={1}>{item.name}</Text>
                  <Text className="text-warmgray text-sm mt-1" numberOfLines={2}>{item.address}</Text>
                  <View className="flex-row items-center mt-2 gap-2">
                    {item.ratingAvg && (
                      <View className="bg-gold-soft px-2 py-1 rounded-lg border border-gold-light flex-row items-center">
                        <Text className="text-gold font-bold text-xs mr-1">★</Text>
                        <Text className="text-espresso text-xs font-bold">{item.ratingAvg.toFixed(1)}</Text>
                      </View>
                    )}
                    {item.distance !== undefined && (
                      <Text className="text-espresso-dark font-semibold text-xs">{(item.distance).toFixed(1)} km</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
