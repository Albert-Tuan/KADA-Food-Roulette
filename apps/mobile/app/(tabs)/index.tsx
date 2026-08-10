import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View className="items-center pt-8 pb-6">
          <Text className="text-4xl font-bold text-primary mb-2">🍜</Text>
          <Text className="text-2xl font-bold text-secondary-800">Food Roulette</Text>
          <Text className="text-secondary-500 mt-1">Không biết ăn gì? Để vòng quyết định!</Text>
        </View>

        {/* Quick Actions */}
        <View className="px-4 space-y-4">
          {/* Spin CTA */}
          <Link href="/spin" asChild>
            <TouchableOpacity className="bg-primary rounded-2xl p-6 shadow-lg active:scale-95 transition-transform">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white text-xl font-bold">🎡 Quay ngay!</Text>
                  <Text className="text-white/80 mt-1">Chọn món ăn ngẫu nhiên</Text>
                </View>
                <Text className="text-4xl">🎲</Text>
              </View>
            </TouchableOpacity>
          </Link>

          {/* Group Spin */}
          <Link href="/group/create" asChild>
            <TouchableOpacity className="bg-white rounded-2xl p-5 border-2 border-primary/20 shadow-sm active:scale-95 transition-transform">
              <View className="flex-row items-center">
                <Text className="text-3xl mr-4">👥</Text>
                <View className="flex-1">
                  <Text className="text-secondary-800 font-semibold text-lg">Nhóm quay</Text>
                  <Text className="text-secondary-500 text-sm">Quay cùng bạn bè (tối đa 20 người)</Text>
                </View>
                <Text className="text-primary">→</Text>
              </View>
            </TouchableOpacity>
          </Link>

          {/* Recent Taste Boards */}
          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-secondary-800">📸 Taste Board gần đây</Text>
              <Link href="/lockets" className="text-primary text-sm">Xem tất cả</Link>
            </View>
            <View className="bg-white rounded-xl p-8 items-center border-2 border-dashed border-secondary-200">
              <Text className="text-secondary-400">Chưa có Taste Board nào</Text>
              <Link href="/locket/capture" asChild>
                <TouchableOpacity className="mt-3 bg-primary/10 px-4 py-2 rounded-lg">
                  <Text className="text-primary font-medium">Chụp Taste Board đầu tiên</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Nearby Restaurants */}
          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-secondary-800">📍 Quán gần bạn</Text>
              <Link href="/restaurants" className="text-primary text-sm">Xem tất cả</Link>
            </View>
            <View className="bg-white rounded-xl p-6 items-center border-2 border-dashed border-secondary-200">
              <Text className="text-secondary-400">Đang tải quán ăn...</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
});
