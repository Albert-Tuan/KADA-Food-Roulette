import { View, Text, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text className="text-6xl mb-4">😕</Text>
        <Text className="text-xl font-bold text-secondary-800 mb-2">Trang không tìm thấy</Text>
        <Text className="text-secondary-500 mb-6">Trang bạn đang tìm kiếm không tồn tại.</Text>
        <TouchableOpacity 
          className="bg-primary px-6 py-3 rounded-full"
          onPress={() => router.replace('/')}
        >
          <Text className="text-white font-semibold">Quay về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFF8E7',
  },
});
