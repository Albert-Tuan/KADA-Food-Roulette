import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_LOCKETS = [
  { id: '1', image: 'https://picsum.photos/200', restaurant: 'Quán Bụi', user: 'anhnguyen', time: '2 giờ trước' },
  { id: '2', image: 'https://picsum.photos/201', restaurant: 'Cơm Tấm Kiều Giang', user: 'minhle', time: '5 giờ trước' },
  { id: '3', image: 'https://picsum.photos/202', restaurant: 'Bún Bò Huế', user: 'thanhhoa', time: '1 ngày trước' },
];

export default function LocketsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        <View className="px-4 py-4 border-b border-secondary-100">
          <Text className="text-lg font-semibold text-secondary-800">📸 Lockets</Text>
          <Text className="text-secondary-500 text-sm">Chia sẻ món ăn của bạn</Text>
        </View>

        <FlatList
          data={MOCK_LOCKETS}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle="p-2"
          renderItem={({ item }) => (
            <Link href={`/locket/${item.id}`} asChild>
              <TouchableOpacity className="flex-1 m-1 aspect-square">
                <Image
                  source={{ uri: item.image }}
                  className="w-full h-full rounded-lg"
                />
              </TouchableOpacity>
            </Link>
          )}
        />

        {/* FAB - Capture Button */}
        <Link href="/locket/capture" asChild>
          <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Text className="text-white text-2xl">+</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
