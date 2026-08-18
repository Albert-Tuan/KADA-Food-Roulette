import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';

interface MapFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filter: string;
  setFilter: (f: any) => void;
}

export default function MapFilterSheet({ visible, onClose, filter, setFilter }: MapFilterSheetProps) {
  const categories = ['Tất cả', 'Phở', 'Bún Bò', 'Cơm Tấm', 'Bánh Mì', 'Lẩu', 'Nướng', 'Cafe'];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-cream rounded-t-3xl p-6 h-3/4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-espresso font-extrabold text-2xl">Bộ Lọc</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-warmgray text-lg font-bold">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sắp xếp */}
            <Text className="text-espresso-dark font-bold text-lg mb-3">Sắp xếp theo</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {['nearby', 'top_rated', 'new'].map((f) => {
                const isSelected = filter === f;
                const labels: any = { nearby: 'Gần tôi', top_rated: 'Top Rated', new: 'Mới nhất' };
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full border ${
                      isSelected ? 'bg-espresso border-espresso' : 'bg-cream border-borderbrown'
                    }`}
                  >
                    <Text className={`font-bold ${isSelected ? 'text-cream' : 'text-espresso'}`}>
                      {labels[f]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Danh mục */}
            <Text className="text-espresso-dark font-bold text-lg mb-3">Danh mục</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {categories.map((c) => (
                <TouchableOpacity
                  key={c}
                  className="px-4 py-2 rounded-full border bg-cream border-borderbrown"
                >
                  <Text className="font-bold text-espresso">{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Khoảng cách */}
            <Text className="text-espresso-dark font-bold text-lg mb-3">Khoảng cách</Text>
            <View className="mb-6">
              <View className="h-2 bg-borderbrown rounded-full w-full">
                <View className="h-2 bg-gold rounded-full w-1/2" />
              </View>
              <View className="flex-row justify-between mt-2">
                <Text className="text-warmgray text-xs">1 km</Text>
                <Text className="text-espresso font-bold text-sm">5 km</Text>
                <Text className="text-warmgray text-xs">20 km</Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            className="w-full bg-gold rounded-2xl py-4 items-center mt-4"
            onPress={onClose}
          >
            <Text className="text-espresso font-bold text-lg">Áp Dụng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
