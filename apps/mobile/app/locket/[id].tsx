import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeleteLocket, useLocket, type Locket } from '@/features/lockets';
import { formatDate } from '@/lib';

const VISIBILITY_LABELS = {
  PRIVATE: 'Riêng tư',
  FRIENDS: 'Bạn bè',
  PUBLIC: 'Công khai',
};

export default function LocketDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const locketQuery = useLocket(params.id);
  const deleteLocket = useDeleteLocket();

  const handleDelete = () => {
    if (!locketQuery.data?.permissions.canDelete) return;
    Alert.alert('Xóa Taste Board?', 'Taste Board sẽ không còn xuất hiện trong feed.', [
      { text: 'Giữ lại', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteLocket.mutateAsync(locketQuery.data!.id);
            router.replace('/(tabs)/lockets');
          } catch (error) {
            Alert.alert('Chưa xóa được', error instanceof Error ? error.message : 'Bạn thử lại nhé.');
          }
        },
      },
    ]);
  };

  if (locketQuery.isLoading) {
    return <CenteredDetail><ActivityIndicator color="#C68E17" size="large" /></CenteredDetail>;
  }
  if (locketQuery.isError || !locketQuery.data) {
    return (
      <CenteredDetail>
        <Text className="text-xl font-bold text-secondary-900">Không tìm thấy Taste Board</Text>
        <TouchableOpacity onPress={() => locketQuery.refetch()} className="bg-primary rounded-xl px-5 py-3 mt-4">
          <Text className="text-white font-semibold">Thử lại</Text>
        </TouchableOpacity>
      </CenteredDetail>
    );
  }

  const locket: Locket = locketQuery.data;
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Image source={{ uri: locket.imageUrl }} className="w-full aspect-square bg-secondary-100" />
        <View className="p-5">
          <View className="flex-row items-center">
            {locket.author.avatarUrl ? (
              <Image source={{ uri: locket.author.avatarUrl }} className="w-12 h-12 rounded-full" />
            ) : null}
            <View className="flex-1 ml-3">
              <Text className="font-bold text-secondary-900">{locket.author.displayNamePublic}</Text>
              <Text className="text-secondary-500 text-sm">@{locket.author.publicId}</Text>
            </View>
            <View className="rounded-full bg-secondary-50 px-3 py-2">
              <Text className="text-secondary-700 text-xs">{VISIBILITY_LABELS[locket.visibility]}</Text>
            </View>
          </View>

          <Text className="text-3xl font-bold text-secondary-900 mt-6">{locket.dishName}</Text>
          {locket.restaurantName ? <Text className="text-primary-800 font-semibold mt-2">{locket.restaurantName}</Text> : null}
          <Text className="text-primary text-xl mt-3">{'★'.repeat(locket.rating)}{'☆'.repeat(5 - locket.rating)}</Text>
          {locket.note ? <Text className="text-secondary-700 text-base leading-6 mt-4">{locket.note}</Text> : null}

          <View className="flex-row flex-wrap gap-2 mt-4">
            {locket.tags.map((tag) => (
              <View key={tag} className="bg-primary-50 rounded-full px-3 py-2">
                <Text className="text-primary-800">#{tag}</Text>
              </View>
            ))}
          </View>

          <View className="bg-white border border-secondary-100 rounded-2xl p-4 mt-6 gap-2">
            <Text className="text-secondary-700">Chụp lúc {formatDate(locket.capturedAt, { dateStyle: 'medium', timeStyle: 'short' })}</Text>
            {locket.canDisplayLocation && locket.location ? (
              <Text className="text-secondary-700">
                GPS {locket.location.latitude.toFixed(5)}, {locket.location.longitude.toFixed(5)}
              </Text>
            ) : (
              <Text className="text-secondary-500">Vị trí không được công khai.</Text>
            )}
          </View>

          {locket.permissions.canDelete ? (
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleteLocket.isPending}
              className="border border-red-300 rounded-xl py-4 items-center mt-8 disabled:opacity-50"
            >
              <Text className="text-red-700 font-semibold">Xóa Taste Board</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CenteredDetail({ children }: { children: React.ReactNode }) {
  return <SafeAreaView className="flex-1 bg-background items-center justify-center p-8">{children}</SafeAreaView>;
}
