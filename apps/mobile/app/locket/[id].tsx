import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocket, useDeleteLocket } from '@/features/lockets';
import { useMyProfile } from '@/features/profile';
import { formatRelativeTime } from '@/lib';
import { Ionicons } from '@expo/vector-icons';

export default function LocketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: locket, isLoading, isError } = useLocket(id);
  const { data: myProfile } = useMyProfile();
  const deleteMutation = useDeleteLocket();

  const isAuthor = Boolean(
    myProfile && locket && (myProfile.publicId === locket.author.publicId || myProfile.id === locket.author.id)
  );

  const handleShare = async () => {
    if (!locket) return;
    try {
      await Share.share({
        message: `Khám phá món ngon "${locket.dishName || 'Món ngon'}" tại "${locket.restaurantName || 'Food Roulette'}" trên Taste Board! 🍜📸`,
      });
    } catch {
      // Ignored
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa Taste Board',
      'Bạn có chắc chắn muốn xóa bài đăng này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(id);
              router.replace('/(tabs)/lockets');
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể xóa bài đăng');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#b52330" />
        <Text className="mt-3 font-bold text-sm text-secondary">
          Đang tải chi tiết Taste Board...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError || !locket) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6 bg-surface">
        <Text className="text-4xl mb-3">🍽️</Text>
        <Text className="text-2xl font-black text-center text-primary">
          Không tìm thấy Taste Board
        </Text>
        <Text className="text-center mt-2 font-medium text-sm text-on-surface-variant">
          Bài đăng này có thể đã bị xóa hoặc bạn không có quyền xem.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/lockets')}
          style={{ backgroundColor: '#b52330', borderBottomColor: '#61000e' }}
          className="rounded-2xl px-8 py-3.5 mt-6 border-b-4 shadow-md"
        >
          <Text className="text-white font-black text-base">Quay lại Taste Board</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView testID="locket-detail-screen" className="flex-1 bg-surface" edges={['top']}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-outline-variant/60 bg-surface">
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/lockets');
            }
          }}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-xs border border-outline-variant active:bg-orange-50"
        >
          <Ionicons name="chevron-back" size={20} color="#b52330" />
        </TouchableOpacity>
        <Text className="text-base font-black text-primary">
          Taste Board 📸
        </Text>
        <TouchableOpacity
          onPress={handleShare}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-xs border border-outline-variant active:bg-orange-50"
        >
          <Ionicons name="share-outline" size={18} color="#b52330" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Author Header */}
        <View className="flex-row items-center px-5 py-3.5">
          {locket.author.avatarUrl ? (
            <Image
              source={{ uri: locket.author.avatarUrl }}
              className="w-11 h-11 rounded-full border-1.5 border-amber-300 bg-orange-50"
            />
          ) : (
            <View className="w-11 h-11 rounded-full bg-primary items-center justify-center border-1.5 border-amber-300">
              <Text className="font-extrabold text-white text-base">
                {locket.author.displayNamePublic.slice(0, 1)}
              </Text>
            </View>
          )}
          <View className="flex-1 ml-3">
            <Text className="font-black text-sm text-primary">
              {locket.author.displayNamePublic}
            </Text>
            <Text className="text-xs text-on-surface-variant mt-0.5">
              Chụp lúc: {formatRelativeTime(locket.capturedAt)}
            </Text>
          </View>
          <View className="rounded-full px-3 py-1 bg-amber-50 border border-amber-300 flex-row items-center gap-1">
            <Ionicons name="star" size={13} color="#FFC107" />
            <Text className="text-amber-800 font-extrabold text-xs">
              {locket.rating || 5}.0
            </Text>
          </View>
        </View>

        {/* Locket Image Card with Overlays */}
        <View className="mx-4 overflow-hidden rounded-3xl border-1.5 border-outline-variant bg-stone-100 shadow-md relative">
          <Image
            source={{ uri: locket.imageUrl }}
            className="w-full aspect-square"
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
        </View>

        {/* Dish & Restaurant Details */}
        <View className="px-5 mt-4">
          <Text className="text-2xl font-black text-primary leading-tight">
            {locket.dishName ?? 'Món ngon thực tế'}
          </Text>

          {locket.restaurantName ? (
            <View className="flex-row items-center mt-1.5">
              <Text className="text-sm font-bold text-secondary">
                📍 {locket.restaurantName}
              </Text>
            </View>
          ) : null}

          {/* Review Quote */}
          {locket.note ? (
            <View className="mt-3 p-4 rounded-2xl bg-white border-1.5 border-outline-variant shadow-xs">
              <Text className="text-xs leading-5 font-medium text-on-surface">
                “{locket.note}”
              </Text>
            </View>
          ) : null}

          {/* Tags */}
          {locket.tags && locket.tags.length > 0 ? (
            <View className="flex-row flex-wrap gap-1.5 mt-3">
              {locket.tags.map((tag: string) => (
                <View key={tag} className="rounded-full bg-amber-50 px-3 py-1 border border-amber-200">
                  <Text className="text-secondary text-xs font-bold">#{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Privacy & Anti-fake Verified Badge */}
          <View className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex-row items-center justify-between shadow-xs">
            <View className="flex-row items-center gap-2">
              <Ionicons name="shield-checkmark" size={22} color="#166b47" />
              <View>
                <Text className="font-bold text-xs text-emerald-900">Ảnh thật từ Camera</Text>
                <Text className="text-[11px] text-emerald-700">Đã gỡ thông tin EXIF nhạy cảm</Text>
              </View>
            </View>
            <View testID="locket-detail-visibility" className="rounded-full px-3 py-1 bg-emerald-200/80">
              <Text className="text-[11px] font-black text-emerald-900">{locket.visibility}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-5 mt-6 gap-3">
          {/* Spin Restaurant Action */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/spin')}
            style={{ backgroundColor: '#b52330', borderBottomColor: '#61000e' }}
            className="w-full rounded-2xl py-4 border-b-4 shadow-md items-center justify-center flex-row gap-2 active:translate-y-0.5"
          >
            <Ionicons name="sparkles" size={18} color="#ffffff" />
            <Text className="text-white font-black text-base">Quay quán này ngay</Text>
          </TouchableOpacity>

          {/* Delete Button (Author only) */}
          {isAuthor ? (
            <TouchableOpacity
              testID="locket-delete-button"
              onPress={handleDelete}
              disabled={deleteMutation.isPending}
              className="w-full rounded-2xl py-3.5 border-1.5 border-red-200 bg-white items-center justify-center flex-row gap-2 shadow-xs active:bg-red-50"
            >
              {deleteMutation.isPending ? (
                <ActivityIndicator color="#b52330" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={16} color="#b91c1c" />
                  <Text className="text-red-700 font-bold text-sm">Xóa bài đăng này</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
