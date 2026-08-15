import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyProfile } from '@/features/profile';
import { useAuthStore } from '@/stores';

export default function ProfileScreen() {
  const profile = useMyProfile();
  const logout = useAuthStore((state) => state.logout);

  if (profile.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#C68E17" size="large" />
      </SafeAreaView>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <Text className="text-xl font-bold text-secondary-900">Chưa tải được profile</Text>
        <TouchableOpacity onPress={() => profile.refetch()} className="bg-primary rounded-xl px-6 py-3 mt-5">
          <Text className="text-white font-semibold">Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const data = profile.data;
  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView testID="profile-private-screen" className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="items-center px-5 pt-8 pb-6">
          {data.avatarUrl ? (
            <Image source={{ uri: data.avatarUrl }} className="w-28 h-28 rounded-full bg-secondary-100" />
          ) : (
            <View className="w-28 h-28 rounded-full bg-primary-50 items-center justify-center">
              <Text className="text-4xl font-bold text-primary">{data.displayNamePublic.slice(0, 1)}</Text>
            </View>
          )}
          <Text testID="profile-private-display-name" className="text-2xl font-bold text-secondary-900 mt-4">{data.displayNamePrivate}</Text>
          <Text testID="profile-public-display-name-summary" className="text-secondary-500 mt-1">Hiển thị công khai: {data.displayNamePublic}</Text>
          <Text className="text-secondary-500">@{data.publicId}</Text>
          {data.bio ? <Text className="text-secondary-700 text-center leading-5 mt-4">{data.bio}</Text> : null}

          <View className="flex-row w-full justify-around bg-white border border-secondary-100 rounded-2xl py-4 mt-6">
            <Stat value={data.stats.locketCount} label="Taste Board" />
            <Stat value={data.stats.checkInCount} label="Check-in" />
            <Stat value={data.stats.groupCount} label="Nhóm" />
          </View>
        </View>

        <View className="px-4 gap-3">
          <MenuLink testID="profile-edit-link" href="/profile/edit" title="Chỉnh sửa hồ sơ" />
          <MenuLink href="/profile/taste-preferences" title="Thiết lập khẩu vị" />
          <MenuLink testID="profile-public-link" href={`/u/${data.publicId}`} title="Xem profile công khai" />
          <MenuLink testID="profile-settings-link" href="/profile/settings" title="Cài đặt" />
          <TouchableOpacity onPress={handleLogout} className="bg-white border border-red-100 rounded-2xl p-4 mt-3">
            <Text className="text-red-700 font-semibold">Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-2xl font-bold text-primary">{value}</Text>
      <Text className="text-secondary-500 text-sm mt-1">{label}</Text>
    </View>
  );
}

function MenuLink({ testID, href, title }: { testID?: string; href: '/profile/edit' | '/profile/taste-preferences' | '/profile/settings' | `/u/${string}`; title: string }) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity testID={testID} className="bg-white border border-secondary-100 rounded-2xl p-4 flex-row items-center">
        <Text className="flex-1 text-secondary-900 font-semibold">{title}</Text>
        <Text className="text-secondary-400">›</Text>
      </TouchableOpacity>
    </Link>
  );
}
