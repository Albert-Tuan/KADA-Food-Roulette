import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SpinTab() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        {/* Placeholder for Spin Wheel */}
        <View className="w-64 h-64 rounded-full bg-white border-4 border-primary items-center justify-center shadow-lg mb-8">
          <Text className="text-6xl">🎡</Text>
          <Text className="text-secondary-500 mt-2">Spin Wheel</Text>
        </View>

        <Text className="text-xl font-semibold text-secondary-800 mb-2 text-center">
          Không biết ăn gì?
        </Text>
        <Text className="text-secondary-500 text-center mb-8">
          Để vòng quyết định giúp bạn!
        </Text>

        <TouchableOpacity className="bg-primary rounded-full px-8 py-4 shadow-lg active:scale-95 transition-transform">
          <Text className="text-white text-lg font-bold">🎲 BẮT ĐẦU QUAY</Text>
        </TouchableOpacity>

        <View className="mt-6 flex-row gap-3">
          <TouchableOpacity className="bg-white border border-secondary-200 rounded-full px-4 py-2">
            <Text className="text-secondary-600 text-sm">🎯 Chỉ quán gần</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white border border-secondary-200 rounded-full px-4 py-2">
            <Text className="text-secondary-600 text-sm">💰 Dưới 100k</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
