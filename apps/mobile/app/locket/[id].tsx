import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocket } from '@/features/lockets';
import { formatRelativeTime } from '@/lib';

export default function LocketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: locket, isLoading, isError, refetch } = useLocket(id);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: '#fff8ef' }}>
        <ActivityIndicator size="large" color="#b52330" />
        <Text className="mt-3 font-bold text-base" style={{ color: '#8e4e14' }}>
          Đang tải chi tiết Taste Board...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError || !locket) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: '#fff8ef' }}>
        <Text className="text-4xl mb-3">🍽️</Text>
        <Text className="text-2xl font-extrabold text-center" style={{ color: '#b52330' }}>
          Không tìm thấy Taste Board
        </Text>
        <Text className="text-center mt-2 font-medium" style={{ color: '#5a403f' }}>
          Bài đăng này có thể đã bị xóa hoặc bạn không có quyền xem.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/lockets')}
          style={{ backgroundColor: '#b52330', borderBottomColor: '#61000e' }}
          className="rounded-2xl px-8 py-3.5 mt-6 border-b-4 shadow-md"
        >
          <Text className="text-white font-extrabold text-base">Quay lại Taste Board</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#fff8ef' }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-orange-100">
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/lockets');
            }
          }}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-xs border border-orange-200"
        >
          <Text className="text-lg font-bold" style={{ color: '#b52330' }}>‹</Text>
        </TouchableOpacity>
        <Text className="text-lg font-extrabold" style={{ color: '#b52330' }}>
          Taste Board 📸
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/lockets')}
          className="px-3 py-1.5 rounded-xl bg-orange-100"
        >
          <Text className="text-xs font-bold" style={{ color: '#8e4e14' }}>Tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Author Header */}
        <View className="flex-row items-center px-5 py-4">
          {locket.author.avatarUrl ? (
            <Image
              source={{ uri: locket.author.avatarUrl }}
              className="w-12 h-12 rounded-full border-2 border-amber-400 bg-orange-50"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-amber-500 items-center justify-center border-2 border-amber-400">
              <Text className="font-extrabold text-white text-lg">
                {locket.author.displayNamePublic.slice(0, 1)}
              </Text>
            </View>
          )}
          <View className="flex-1 ml-3">
            <Text className="font-extrabold text-base" style={{ color: '#b52330' }}>
              {locket.author.displayNamePublic}
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: '#8e4e14' }}>
              Chụp lúc: {formatRelativeTime(locket.capturedAt)}
            </Text>
          </View>
          <View className="rounded-full px-3 py-1 bg-amber-100 border border-amber-300">
            <Text className="text-amber-700 font-extrabold text-xs">
              {'★'.repeat(locket.rating || 5)}
            </Text>
          </View>
        </View>

        {/* Locket Image */}
        <View className="mx-4 overflow-hidden rounded-3xl border-2 border-orange-200 bg-stone-100 shadow-lg">
          <Image
            source={{ uri: locket.imageUrl }}
            className="w-full aspect-square"
            resizeMode="cover"
          />
        </View>

        {/* Dish & Restaurant Details */}
        <View className="px-5 mt-5">
          <Text className="text-2xl font-black" style={{ color: '#b52330' }}>
            {locket.dishName}
          </Text>

          {locket.restaurantName ? (
            <View className="flex-row items-center mt-2">
              <Text className="text-base font-bold" style={{ color: '#d97706' }}>
                📍 {locket.restaurantName}
              </Text>
            </View>
          ) : null}

          {locket.note ? (
            <View className="mt-3 p-4 rounded-2xl bg-white border border-orange-200 shadow-xs">
              <Text className="text-sm leading-6 font-medium text-stone-800">
                {locket.note}
              </Text>
            </View>
          ) : null}

          {/* Tags */}
          {locket.tags && locket.tags.length > 0 ? (
            <View className="flex-row flex-wrap gap-2 mt-4">
              {locket.tags.map((tag: string) => (
                <View key={tag} className="rounded-xl bg-amber-100 px-3.5 py-1.5 border border-amber-300">
                  <Text className="text-amber-800 text-xs font-extrabold">#{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Privacy / Verified Badge */}
          <View className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-xl mr-2">🛡️</Text>
              <View>
                <Text className="font-extrabold text-sm text-emerald-800">Ảnh thật từ Camera</Text>
                <Text className="text-xs text-emerald-600">Đã gỡ thông tin EXIF nhạy cảm</Text>
              </View>
            </View>
            <View className="rounded-lg px-2.5 py-1 bg-emerald-200">
              <Text className="text-xs font-extrabold text-emerald-900">{locket.visibility}</Text>
            </View>
          </View>
        </View>

        {/* Back to Feed Action */}
        <View className="px-5 mt-8">
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/lockets')}
            style={{ backgroundColor: '#b52330', borderBottomColor: '#61000e' }}
            className="w-full rounded-2xl py-4 border-b-4 shadow-md items-center justify-center"
          >
            <Text className="text-white font-black text-base">Xem thêm Taste Board khác 🔥</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
