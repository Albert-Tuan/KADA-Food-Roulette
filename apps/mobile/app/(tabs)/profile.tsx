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
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: '#fff8ef' }}>
        <ActivityIndicator color="#b52330" size="large" />
      </SafeAreaView>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-8" style={{ backgroundColor: '#fff8ef' }}>
        <Text className="text-2xl font-extrabold" style={{ color: '#b52330' }}>Chưa tải được profile</Text>
        <TouchableOpacity
          onPress={() => profile.refetch()}
          style={{ backgroundColor: '#b52330', borderBottomColor: '#61000e' }}
          className="rounded-2xl px-7 py-3.5 mt-6 border-b-4 shadow-md items-center justify-center"
        >
          <Text className="text-white font-extrabold text-base">Thử lại</Text>
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#fff8ef' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="items-center px-5 pt-8 pb-6">
          {data.avatarUrl ? (
            <Image source={{ uri: data.avatarUrl }} className="w-28 h-28 rounded-full border-2 shadow-lg" style={{ backgroundColor: '#ffdcc4', borderColor: '#ffab69' }} />
          ) : (
            <View className="w-28 h-28 rounded-full border-2 items-center justify-center shadow-xl" style={{ backgroundColor: '#b52330', borderColor: '#ffab69' }}>
              <Text className="text-4xl font-extrabold text-white">{data.displayNamePublic.slice(0, 1)}</Text>
            </View>
          )}
          <Text className="text-2xl font-extrabold mt-4" style={{ color: '#b52330' }}>{data.displayNamePrivate}</Text>
          <Text className="font-bold mt-1" style={{ color: '#8e4e14' }}>Tên công khai: {data.displayNamePublic}</Text>
          <Text className="font-semibold" style={{ color: '#5a403f' }}>@{data.publicId}</Text>
          {data.bio ? <Text className="text-gray-800 text-center leading-5 mt-3 px-4 font-medium">{data.bio}</Text> : null}

          <View className="flex-row w-full justify-around bg-white border-1.5 rounded-3xl py-4 mt-6 shadow-md" style={{ borderColor: '#e2bebc' }}>
            <Stat value={data.stats.locketCount} label="Taste Board" />
            <Stat value={data.stats.checkInCount} label="Check-in" />
            <Stat value={data.stats.groupCount} label="Nhóm bạn" />
          </View>
        </View>

        <View className="px-5 gap-3">
          <MenuLink href="/profile/edit" title="✏️ Chỉnh sửa hồ sơ" />
          <MenuLink href="/profile/taste-preferences" title="🍜 Thiết lập khẩu vị ẩm thực" />
          <MenuLink href={`/u/${data.publicId}`} title="🌐 Xem trang cá nhân công khai" />
          <MenuLink href="/profile/settings" title="⚙️ Cài đặt ứng dụng" />
          <TouchableOpacity onPress={handleLogout} className="bg-white border-1.5 rounded-2xl p-4 mt-3 flex-row justify-center items-center shadow-sm" style={{ borderColor: '#e2bebc' }}>
            <Text className="font-extrabold text-base" style={{ color: '#b52330' }}>🚪 Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-2xl font-extrabold" style={{ color: '#8e4e14' }}>{value}</Text>
      <Text className="text-xs font-extrabold mt-1" style={{ color: '#5a403f' }}>{label}</Text>
    </View>
  );
}

function MenuLink({ href, title }: { href: '/profile/edit' | '/profile/taste-preferences' | '/profile/settings' | `/u/${string}`; title: string }) {
  return (
    <Link href={href as any} asChild>
      <TouchableOpacity className="bg-white border-1.5 rounded-2xl p-4 flex-row items-center justify-between shadow-sm" style={{ borderColor: '#e2bebc' }}>
        <Text className="font-bold text-base" style={{ color: '#b52330' }}>{title}</Text>
        <Text className="font-extrabold text-lg" style={{ color: '#8e4e14' }}>›</Text>
      </TouchableOpacity>
    </Link>
  );
}
