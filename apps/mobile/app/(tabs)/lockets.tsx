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

const FILTERS: { value: LocketFeedFilter; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'MINE', label: 'Của tôi' },
  { value: 'FRIENDS', label: 'Bạn bè' },
  { value: 'DISCOVER', label: 'Khám phá' },
];

export default function LocketsScreen() {
  const [filter, setFilter] = useState<LocketFeedFilter>('ALL');
  const feed = useLocketFeed(filter);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <FlatList
        data={feed.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LocketCard locket={item} />}
        contentContainerStyle={{ paddingBottom: 110, flexGrow: 1 }}
        refreshing={feed.isRefetching}
        onRefresh={feed.refetch}
        ListHeaderComponent={
          <View>
            <View className="px-4 pt-4 pb-3">
              <Text className="text-2xl font-bold text-secondary-900">Taste Board</Text>
              <Text className="text-secondary-500 mt-1">Những món ăn vừa được ghi lại.</Text>
            </View>
            <FlatList
              horizontal
              data={FILTERS}
              keyExtractor={(item) => item.value}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setFilter(item.value)}
                  className={`rounded-full border px-4 py-2 ${
                    filter === item.value ? 'bg-primary border-primary' : 'bg-white border-secondary-200'
                  }`}
                >
                  <Text className={filter === item.value ? 'text-white font-semibold' : 'text-secondary-700'}>
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
              <ActivityIndicator color="#C68E17" size="large" />
              <Text className="text-secondary-500 mt-3">Đang tải Taste Board...</Text>
            </View>
          ) : feed.isError ? (
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Text className="text-xl font-bold text-secondary-900">Chưa tải được feed</Text>
              <Text className="text-secondary-500 text-center mt-2">Kiểm tra kết nối rồi thử lại nhé.</Text>
              <TouchableOpacity onPress={() => feed.refetch()} className="bg-primary rounded-xl px-6 py-3 mt-5">
                <Text className="text-white font-semibold">Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Text className="text-xl font-bold text-secondary-900">Chưa có Taste Board</Text>
              <Text className="text-secondary-500 text-center mt-2">Chụp món đầu tiên để bắt đầu nhé.</Text>
            </View>
          )
        }
      />

      <Link href="/locket/capture" asChild>
        <TouchableOpacity className="absolute bottom-7 right-5 bg-primary rounded-full px-5 py-4 shadow-lg">
          <Text className="text-white font-bold">Tạo Taste Board</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

function LocketCard({ locket }: { locket: Locket }) {
  return (
    <Link href={`/locket/${locket.id}`} asChild>
      <TouchableOpacity className="mx-4 mb-4 overflow-hidden rounded-3xl border border-secondary-100 bg-white">
        <View className="flex-row items-center p-4">
          {locket.author.avatarUrl ? (
            <Image source={{ uri: locket.author.avatarUrl }} className="w-11 h-11 rounded-full bg-secondary-100" />
          ) : (
            <View className="w-11 h-11 rounded-full bg-primary-50 items-center justify-center">
              <Text className="font-bold text-primary">{locket.author.displayNamePublic.slice(0, 1)}</Text>
            </View>
          )}
          <View className="flex-1 ml-3">
            <Text className="font-bold text-secondary-900">{locket.author.displayNamePublic}</Text>
            <Text className="text-secondary-500 text-xs mt-1">{formatRelativeTime(locket.capturedAt)}</Text>
          </View>
          <Text className="text-primary font-semibold">{'★'.repeat(locket.rating)}</Text>
        </View>

        <Image source={{ uri: locket.imageUrl }} className="w-full aspect-square bg-secondary-100" resizeMode="cover" />

        <View className="p-4">
          <Text className="text-xl font-bold text-secondary-900">{locket.dishName}</Text>
          {locket.restaurantName ? <Text className="text-primary-800 mt-1">{locket.restaurantName}</Text> : null}
          {locket.note ? <Text className="text-secondary-700 leading-5 mt-3">{locket.note}</Text> : null}
          <View className="flex-row flex-wrap gap-2 mt-3">
            {locket.tags.map((tag) => (
              <View key={tag} className="rounded-full bg-primary-50 px-3 py-1.5">
                <Text className="text-primary-800 text-xs">#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
