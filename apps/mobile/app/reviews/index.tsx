import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { reviewsApi, Review, ReviewsListResponse } from '@/api';

type SortType = 'recent' | 'helpful' | 'rating_high' | 'rating_low';

const SORT_OPTIONS: { label: string; value: SortType }[] = [
  { label: 'Mới nhất', value: 'recent' },
  { label: 'Hữu ích', value: 'helpful' },
  { label: 'Cao → Thấp', value: 'rating_high' },
  { label: 'Thấp → Cao', value: 'rating_low' },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((s) => (
        <Text
          key={s}
          className={`text-lg ${s <= rating ? 'text-accent' : 'text-border'}`}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

export default function RestaurantReviewsScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const [data, setData] = useState<ReviewsListResponse | null>(null);
  const [sort, setSort] = useState<SortType>('recent');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res = await reviewsApi.listByRestaurant(restaurantId, sort);
      setData(res);
    } catch (error: any) {
      console.error('Load reviews error:', error);
      Alert.alert('Lỗi', 'Không thể tải reviews.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [restaurantId, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const handleHelpful = async (id: string) => {
    try {
      await reviewsApi.markHelpful(id);
      // Reload to get updated count
      await load();
    } catch (error) {
      console.error('Mark helpful error:', error);
    }
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View className="bg-surface rounded-2xl p-4 mb-3 border border-border">
      {/* Header */}
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 bg-accent-bg rounded-full items-center justify-center mr-3">
          <Text className="text-lg">👤</Text>
        </View>
        <View className="flex-1">
          <Text className="text-primary font-semibold">
            {item.author?.displayNamePublic ?? 'Người dùng'}
          </Text>
          <Text className="text-text-muted text-xs">
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            {item.isVerifiedVisit && '  ✓ Đã ghé'}
          </Text>
        </View>
        <View className="bg-accent/10 px-2 py-1 rounded-md flex-row items-center">
          <Text className="text-accent text-sm font-bold">★</Text>
          <Text className="text-accent text-sm font-bold ml-0.5">{item.overallRating}</Text>
        </View>
      </View>

      {/* Detail ratings */}
      {(item.tasteRating || item.serviceRating || item.ambienceRating || item.valueRating) && (
        <View className="flex-row flex-wrap gap-3 mb-2 px-1">
          {item.tasteRating && (
            <View>
              <Text className="text-text-muted text-xs">Vị</Text>
              <StarRow rating={item.tasteRating} />
            </View>
          )}
          {item.serviceRating && (
            <View>
              <Text className="text-text-muted text-xs">Phục vụ</Text>
              <StarRow rating={item.serviceRating} />
            </View>
          )}
          {item.ambienceRating && (
            <View>
              <Text className="text-text-muted text-xs">Không gian</Text>
              <StarRow rating={item.ambienceRating} />
            </View>
          )}
          {item.valueRating && (
            <View>
              <Text className="text-text-muted text-xs">Giá</Text>
              <StarRow rating={item.valueRating} />
            </View>
          )}
        </View>
      )}

      {/* Content */}
      {item.content && (
        <Text className="text-secondary-800 text-sm leading-5 mb-2">{item.content}</Text>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <View className="flex-row flex-wrap gap-1 mb-2">
          {item.tags.map((t) => (
            <View key={t} className="bg-accent-bg px-2 py-0.5 rounded">
              <Text className="text-primary text-xs">#{t}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Helpful */}
      <TouchableOpacity
        className="flex-row items-center self-start bg-background px-3 py-1.5 rounded-full border border-border"
        onPress={() => handleHelpful(item.id)}
      >
        <Text className="text-sm mr-1">👍</Text>
        <Text className="text-text-muted text-xs font-medium">
          Hữu ích ({item.helpfulCount})
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-5 py-3 flex-row items-center border-b border-border bg-card">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Text className="text-primary text-xl font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-primary">Đánh giá quán</Text>
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C68E17" size="large" />
        </View>
      ) : (
        <FlatList
          data={data?.reviews ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor="#C68E17"
            />
          }
          ListHeaderComponent={
            <View className="mb-4">
              <Text className="text-2xl font-bold text-primary mb-1">⭐ Reviews</Text>

              {data?.summary && (
                <View className="bg-surface rounded-2xl p-4 border border-border mb-3">
                  <View className="flex-row items-center">
                    <Text className="text-5xl font-bold text-primary">
                      {(data.summary.avgOverall ?? 0).toFixed(1)}
                    </Text>
                    <View className="ml-3">
                      <StarRow rating={Math.round(data.summary.avgOverall ?? 0)} />
                      <Text className="text-text-muted text-xs mt-1">
                        {data.summary.total} đánh giá
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Sort chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {SORT_OPTIONS.map((o) => (
                  <TouchableOpacity
                    key={o.value}
                    className={`px-3 py-1.5 rounded-full ${
                      sort === o.value
                        ? 'bg-primary'
                        : 'bg-surface border border-border'
                    }`}
                    onPress={() => setSort(o.value)}
                  >
                    <Text
                      className={`text-sm ${
                        sort === o.value ? 'text-white font-medium' : 'text-primary'
                      }`}
                    >
                      {o.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          }
          ListEmptyComponent={
            <View className="bg-surface rounded-2xl p-8 items-center border-2 border-dashed border-border">
              <Text className="text-4xl mb-2">💭</Text>
              <Text className="text-text-muted">Chưa có review nào</Text>
              <Text className="text-text-muted text-xs mt-1">Hãy là người đầu tiên!</Text>
            </View>
          }
        />
      )}

      {/* Floating write button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-accent rounded-full px-5 py-4 shadow-lg flex-row items-center"
        onPress={() =>
          router.push({
            pathname: '/reviews/write',
            params: { restaurantId },
          })
        }
      >
        <Text className="text-white text-lg font-bold mr-1">✍️</Text>
        <Text className="text-white font-semibold">Viết review</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Helper: ScrollView (avoid namespace clash)
import { ScrollView } from 'react-native';