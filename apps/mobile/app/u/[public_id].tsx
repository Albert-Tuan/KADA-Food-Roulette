import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePublicProfile } from '@/features/profile';

export default function PublicProfileScreen() {
  const params = useLocalSearchParams<{ public_id: string }>();
  const profile = usePublicProfile(params.public_id);

  if (profile.isLoading) {
    return <SafeAreaView className="flex-1 bg-background items-center justify-center"><ActivityIndicator color="#C68E17" size="large" /></SafeAreaView>;
  }
  if (profile.isError || !profile.data) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <Text className="text-xl font-bold text-secondary-900">Không tìm thấy profile</Text>
        <TouchableOpacity onPress={() => profile.refetch()} className="bg-primary rounded-xl px-6 py-3 mt-5"><Text className="text-white font-semibold">Thử lại</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  const data = profile.data;
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <FlatList
        data={data.publicLockets}
        numColumns={3}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ gap: 3 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="items-center px-5 pt-6 pb-7">
            {data.avatarUrl ? <Image source={{ uri: data.avatarUrl }} className="w-28 h-28 rounded-full" /> : null}
            <Text className="text-2xl font-bold text-secondary-900 mt-4">{data.displayNamePublic}</Text>
            <Text className="text-secondary-500 mt-1">@{data.publicId}</Text>
            {data.bio ? <Text className="text-secondary-700 text-center leading-5 mt-4">{data.bio}</Text> : null}
            <View className="flex-row w-full justify-around bg-white border border-secondary-100 rounded-2xl py-4 mt-6">
              <PublicStat value={data.stats.locketCount} label="Taste Board" />
              <PublicStat value={data.stats.checkInCount} label="Check-in" />
              <PublicStat value={data.stats.groupCount} label="Nhóm" />
            </View>
            <Text className="self-start text-lg font-bold text-secondary-900 mt-7">Taste Board công khai</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Link href={`/locket/${item.id}`} asChild>
            <TouchableOpacity style={{ flex: 1 / 3, aspectRatio: 1, marginBottom: 3 }}>
              <Image source={{ uri: item.imageUrl }} className="w-full h-full bg-secondary-100" />
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={<Text className="text-secondary-500 text-center py-12">Chưa có Taste Board công khai.</Text>}
      />
    </SafeAreaView>
  );
}

function PublicStat({ value, label }: { value: number; label: string }) {
  return <View className="items-center"><Text className="text-xl font-bold text-primary">{value}</Text><Text className="text-secondary-500 text-xs mt-1">{label}</Text></View>;
}
