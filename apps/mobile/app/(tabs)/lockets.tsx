import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocketFeed, type Locket, type LocketFeedFilter } from '@/features/lockets';
import { formatRelativeTime } from '@/lib';
import { Ionicons } from '@expo/vector-icons';

const FILTERS: { value: LocketFeedFilter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'ALL', label: 'Tất cả', icon: 'grid-outline' },
  { value: 'MINE', label: 'Của tôi', icon: 'person-outline' },
  { value: 'FRIENDS', label: 'Bạn bè', icon: 'people-outline' },
  { value: 'DISCOVER', label: 'Khám phá', icon: 'compass-outline' },
];

const TRENDING_CATEGORIES = [
  { id: 'all', label: '🔥 Phổ biến' },
  { id: 'pho', label: '🍜 Phở & Bún' },
  { id: 'banhmi', label: '🥖 Bánh Mì' },
  { id: 'cuon', label: '🥗 Món Cuốn' },
  { id: 'drink', label: '🧋 Trà Sữa & Cafe' },
  { id: 'bbq', label: '🥩 Lẩu Nướng' },
];

export default function LocketsScreen() {
  const [filter, setFilter] = useState<LocketFeedFilter>('ALL');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const feed = useLocketFeed(filter);

  return (
    <SafeAreaView testID="locket-feed-screen" className="flex-1 bg-surface" edges={['top']}>
      <FlatList
        testID="locket-feed-list"
        data={feed.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LocketCard locket={item} />}
        contentContainerStyle={{ paddingBottom: 90, flexGrow: 1 }}
        refreshing={feed.isRefetching}
        onRefresh={feed.refetch}
        ListHeaderComponent={
          <View className="mb-2">
            {/* Top Title Header */}
            <View className="px-5 pt-3 pb-2">
              <Text className="text-3xl font-black text-primary tracking-tight">Taste Board Live</Text>
              <Text className="font-semibold text-sm mt-0.5 text-secondary">
                Món ngon chân thực từ camera • Đã xác minh GPS
              </Text>
            </View>

            {/* Scope Filter Tabs - 4 Columns Equal Layout (Fix BUG #12) */}
            <View className="flex-row items-center justify-between px-5 pt-2 pb-3 gap-2">
              {FILTERS.map((item) => {
                const isActive = filter === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    testID={`locket-filter-${item.value.toLowerCase()}`}
                    onPress={() => setFilter(item.value)}
                    style={{
                      backgroundColor: isActive ? '#b52330' : '#ffffff',
                      borderColor: isActive ? '#b52330' : '#e2bebc',
                      minHeight: 44,
                    }}
                    className="flex-1 rounded-full border-1.5 py-2.5 px-2 shadow-xs flex-row items-center justify-center gap-1 active:translate-y-0.5"
                  >
                    <Ionicons 
                      name={item.icon} 
                      size={15} 
                      color={isActive ? '#ffffff' : '#8e4e14'} 
                    />
                    <Text 
                      style={{ color: isActive ? '#ffffff' : '#8e4e14' }} 
                      className="font-extrabold text-xs"
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Trending Category Pills */}
            <FlatList
              horizontal
              data={TRENDING_CATEGORIES}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8, gap: 8 }}
              renderItem={({ item }) => {
                const isSelected = selectedCategory === item.id;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(item.id)}
                    className={`rounded-full px-3.5 py-1.5 border ${
                      isSelected 
                        ? 'bg-amber-100/90 border-amber-300' 
                        : 'bg-white/80 border-outline-variant/60'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? 'text-amber-900' : 'text-on-surface-variant'}`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        }
        ListEmptyComponent={
          feed.isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator color="#b52330" size="large" />
              <Text className="mt-3 font-bold text-sm text-secondary">Đang tải Taste Board...</Text>
            </View>
          ) : feed.isError ? (
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Text className="text-2xl font-black text-primary">Chưa tải được feed</Text>
              <Text className="text-center mt-2 font-medium text-on-surface-variant">Kiểm tra kết nối rồi thử lại nhé.</Text>
              <TouchableOpacity
                onPress={() => feed.refetch()}
                style={{ backgroundColor: '#b52330', borderBottomColor: '#61000e' }}
                className="rounded-2xl px-7 py-3.5 mt-6 border-b-4 shadow-md items-center justify-center"
              >
                <Text className="text-white font-extrabold text-base">Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Text className="text-2xl font-black text-primary">Chưa có Taste Board</Text>
              <Text className="text-center mt-2 font-medium text-on-surface-variant">
                Bấm nút camera bên dưới để là người đầu tiên chia sẻ món ngon!
              </Text>
            </View>
          )
        }
      />

      {/* Floating Action Button - Create Locket */}
      <Link href="/locket/capture" asChild>
        <TouchableOpacity
          testID="locket-create-button"
          style={{ backgroundColor: '#b52330', borderBottomColor: '#61000e' }}
          className="absolute bottom-6 right-5 rounded-full px-5 py-3.5 border-b-4 shadow-2xl flex-row items-center justify-center gap-2 active:translate-y-0.5"
        >
          <Ionicons name="camera" size={18} color="#ffffff" />
          <Text className="text-white font-black text-sm">Chụp Locket</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

function LocketCard({ locket }: { locket: Locket }) {
  const router = useRouter();
  const [likes, setLikes] = useState(12);
  const [isLiked, setIsLiked] = useState(false);

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleWantToEat = () => {
    router.push('/(tabs)/spin');
  };

  return (
    <Link href={`/locket/${locket.id}` as any} asChild>
      <TouchableOpacity 
        testID={`locket-feed-card-${locket.id}`}
        activeOpacity={0.95} 
        className="mx-5 mb-6 overflow-hidden rounded-3xl border-1.5 bg-white shadow-sm"
        style={{ borderColor: '#e2bebc' }}
      >
        {/* Author Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-orange-50">
          {locket.author.avatarUrl ? (
            <Image 
              source={{ uri: locket.author.avatarUrl }} 
              className="w-10 h-10 rounded-full border-1.5 border-amber-300 bg-orange-50" 
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-primary items-center justify-center border-1.5 border-amber-300">
              <Text className="font-extrabold text-white text-base">
                {locket.author.displayNamePublic.slice(0, 1)}
              </Text>
            </View>
          )}
          <View className="flex-1 ml-3">
            <Text className="font-extrabold text-primary text-sm">{locket.author.displayNamePublic}</Text>
            <Text className="text-on-surface-variant text-xs mt-0.5">{formatRelativeTime(locket.capturedAt)}</Text>
          </View>
          {locket.rating ? (
            <View className="flex-row items-center bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Ionicons name="star" size={13} color="#FFC107" />
              <Text className="text-amber-800 font-extrabold text-xs ml-1">{locket.rating}.0</Text>
            </View>
          ) : null}
        </View>

        {/* Photo Container with Pill Overlays */}
        <View className="relative w-full aspect-square bg-cream-linen">
          <Image 
            source={{ uri: locket.imageUrl }} 
            className="w-full h-full" 
            resizeMode="cover" 
          />

          {/* Top-Left: Rounded-Full Timestamp & GPS Verified Pill Badge */}
          <View 
            className="absolute top-3 left-3 flex-row items-center gap-1.5 px-3 py-1.5 rounded-full shadow-md"
            style={{ backgroundColor: 'rgba(30, 27, 19, 0.7)' }}
          >
            <Ionicons name="time-outline" size={13} color="#ffffff" />
            <Text className="text-white font-bold text-xs">
              {new Date(locket.capturedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text className="text-white/60 text-xs">•</Text>
            <Ionicons name="shield-checkmark" size={13} color="#4ade80" />
            <Text className="text-white font-bold text-xs">Đã xác minh GPS</Text>
          </View>

          {/* Bottom Photo Overlay: Locket Style Frosted Review Caption */}
          {locket.note ? (
            <View 
              className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl border border-white/20 shadow-lg"
              style={{ backgroundColor: 'rgba(30, 27, 19, 0.72)' }}
            >
              <Text className="text-white font-medium text-xs leading-5" numberOfLines={3}>
                “{locket.note}”
              </Text>
            </View>
          ) : null}
        </View>

        {/* Post Info & Actions Footer */}
        <View className="p-4 bg-white">
          <Text className="text-lg font-black text-primary leading-tight">
            {locket.dishName ?? 'Taste Board'}
          </Text>
          
          {locket.restaurantName ? (
            <Text className="text-secondary font-bold text-xs mt-1">
              📍 {locket.restaurantName}
            </Text>
          ) : null}

          {/* Tags */}
          {locket.tags && locket.tags.length > 0 ? (
            <View className="flex-row flex-wrap gap-1.5 mt-2.5">
              {locket.tags.map((tag) => (
                <View key={tag} className="rounded-full bg-amber-50 px-2.5 py-0.5 border border-amber-200">
                  <Text className="text-secondary text-[11px] font-bold">#{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Social Reactions & Action Row */}
          <View className="flex-row items-center justify-between mt-3.5 pt-3 border-t border-orange-100">
            {/* Like Button */}
            <TouchableOpacity 
              onPress={toggleLike}
              className="flex-row items-center gap-1.5 py-1 px-2.5 rounded-full active:bg-orange-50"
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={isLiked ? "#b52330" : "#5a403f"} 
              />
              <Text className={`text-xs font-bold ${isLiked ? 'text-primary' : 'text-on-surface-variant'}`}>
                {likes}
              </Text>
            </TouchableOpacity>

            {/* Spin CTA Button */}
            <TouchableOpacity
              onPress={handleWantToEat}
              style={{ backgroundColor: '#b52330', borderBottomColor: '#61000e' }}
              className="rounded-full px-4 py-2 border-b-2 shadow-sm flex-row items-center justify-center gap-1.5 active:translate-y-0.5"
            >
              <Ionicons name="sparkles" size={14} color="#ffffff" />
              <Text className="text-white font-black text-xs">Muốn ăn thử</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
