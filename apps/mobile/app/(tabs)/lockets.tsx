import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocketFeed, type Locket, type LocketFeedFilter } from '@/features/lockets';
import { formatRelativeTime } from '@/lib';
import { Ionicons } from '@expo/vector-icons';

const FILTERS: { value: LocketFeedFilter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'ALL', label: 'Tất cả', icon: 'grid' },
  { value: 'MINE', label: 'Của tôi', icon: 'person' },
  { value: 'FRIENDS', label: 'Bạn bè', icon: 'people' },
  { value: 'DISCOVER', label: 'Khám phá', icon: 'compass' },
];

export default function LocketsScreen() {
  const [filter, setFilter] = useState<LocketFeedFilter>('ALL');
  const feed = useLocketFeed(filter);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#fff8ef' }} edges={['top']}>
      <FlatList
        data={feed.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LocketCard locket={item} />}
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        refreshing={feed.isRefetching}
        onRefresh={feed.refetch}
        ListHeaderComponent={
          <View>
            <View className="px-5 pt-4 pb-3">
              <Text className="text-3xl font-extrabold" style={{ color: '#b52330' }}>Taste Board Live 📸🔥</Text>
              <Text className="font-semibold mt-1" style={{ color: '#8e4e14' }}>Những món ăn chân thực chụp từ camera!</Text>
            </View>
            <FlatList
              horizontal
              data={FILTERS}
              keyExtractor={(item) => item.value}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 14, gap: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setFilter(item.value)}
                  style={{
                    backgroundColor: filter === item.value ? '#b52330' : '#ffffff',
                    borderColor: filter === item.value ? '#b52330' : '#e2bebc',
                  }}
                  className="rounded-2xl border-1.5 px-5 py-3 shadow-xs flex-row items-center gap-2"
                >
                  <Ionicons 
                    name={item.icon} 
                    size={16} 
                    color={filter === item.value ? '#ffffff' : '#b52330'} 
                  />
                  <Text style={{ color: filter === item.value ? '#ffffff' : '#b52330' }} className="font-extrabold text-sm">
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        }
        ListEmptyComponent={
          feed.isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator color="#b52330" size="large" />
              <Text className="mt-3 font-bold" style={{ color: '#8e4e14' }}>Đang tải Taste Board...</Text>
            </View>
          ) : feed.isError ? (
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Text className="text-2xl font-extrabold" style={{ color: '#b52330' }}>Chưa tải được feed</Text>
              <Text className="text-center mt-2 font-medium" style={{ color: '#5a403f' }}>Kiểm tra kết nối rồi thử lại nhé.</Text>
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
              <Text className="text-2xl font-extrabold" style={{ color: '#b52330' }}>Chưa có Taste Board</Text>
              <Text className="text-center mt-2 font-medium" style={{ color: '#5a403f' }}>Bấm chụp món đầu tiên từ camera để tạo nhé!</Text>
            </View>
          )
        }
      />

      <Link href="/locket/capture" asChild>
        <TouchableOpacity
          style={{ backgroundColor: '#b52330', borderBottomColor: '#61000e' }}
          className="absolute bottom-5 right-5 rounded-3xl px-6 py-4 border-b-4 shadow-2xl flex-row items-center"
        >
          <Text className="text-white font-extrabold text-base">📸 Chụp Locket 🔥</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

function LocketCard({ locket }: { locket: Locket }) {
  return (
    <Link href={`/locket/${locket.id}` as any} asChild>
      <TouchableOpacity className="mx-5 mb-5 overflow-hidden rounded-3xl border-1.5 border-borderflame bg-white shadow-md">
        <View className="flex-row items-center p-4">
          {locket.author.avatarUrl ? (
            <Image source={{ uri: locket.author.avatarUrl }} className="w-11 h-11 rounded-full bg-borderflame border-2 border-gold" />
          ) : (
            <View className="w-11 h-11 rounded-full bg-flameorange items-center justify-center border-2 border-gold">
              <Text className="font-extrabold text-white">{locket.author.displayNamePublic.slice(0, 1)}</Text>
            </View>
          )}
          <View className="flex-1 ml-3">
            <Text className="font-extrabold text-flamered text-base">{locket.author.displayNamePublic}</Text>
            <Text className="text-warmgray text-xs mt-0.5">{formatRelativeTime(locket.capturedAt)}</Text>
          </View>
          <Text className="text-gold font-extrabold text-sm">{'★'.repeat(locket.rating)}</Text>
        </View>

        <Image source={{ uri: locket.imageUrl }} className="w-full aspect-square bg-cream-linen" resizeMode="cover" />

        <View className="p-4">
          <Text className="text-xl font-extrabold text-flamered">{locket.dishName}</Text>
          {locket.restaurantName ? <Text className="text-flameorange font-bold mt-1">📍 {locket.restaurantName}</Text> : null}
          {locket.note ? <Text className="text-gray-800 leading-5 mt-2 font-medium">{locket.note}</Text> : null}
          <View className="flex-row flex-wrap gap-2 mt-3">
            {locket.tags.map((tag) => (
              <View key={tag} className="rounded-xl bg-gold-soft px-3 py-1 border border-gold-light">
                <Text className="text-flameorange text-xs font-extrabold">#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
