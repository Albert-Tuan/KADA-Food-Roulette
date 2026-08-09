import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="items-center pt-8 pb-6 px-4">
        {/* Avatar */}
        <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4">
          <Text className="text-4xl">👤</Text>
        </View>

        <Text className="text-xl font-bold text-secondary-800">Người dùng</Text>
        <Text className="text-secondary-500">@username</Text>

        {/* Stats */}
        <View className="flex-row mt-4 gap-8">
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary">12</Text>
            <Text className="text-secondary-500 text-sm">Locket</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary">5</Text>
            <Text className="text-secondary-500 text-sm">Check-in</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary">3</Text>
            <Text className="text-secondary-500 text-sm">Nhóm</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View className="px-4 space-y-2">
        <Link href="/profile/edit" asChild>
          <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center">
            <Text className="text-xl mr-3">✏️</Text>
            <Text className="flex-1 text-secondary-800">Chỉnh sửa hồ sơ</Text>
            <Text className="text-secondary-400">→</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/profile/public" asChild>
          <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center">
            <Text className="text-xl mr-3">🌐</Text>
            <Text className="flex-1 text-secondary-800">Xem profile công khai</Text>
            <Text className="text-secondary-400">→</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center">
          <Text className="text-xl mr-3">⚙️</Text>
          <Text className="flex-1 text-secondary-800">Cài đặt</Text>
          <Text className="text-secondary-400">→</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center">
          <Text className="text-xl mr-3">❓</Text>
          <Text className="flex-1 text-secondary-800">Trợ giúp</Text>
          <Text className="text-secondary-400">→</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center mt-4">
          <Text className="text-xl mr-3">🚪</Text>
          <Text className="flex-1 text-red-500">Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
