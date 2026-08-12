import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { preferencesApi } from '../../src/api/endpoints/preferences';

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Chay', icon: '🌿' },
  { id: 'vegan', label: 'Thuần Chay', icon: '🌱' },
  { id: 'halal', label: 'Halal', icon: '🕌' },
  { id: 'gluten_free', label: 'Không Gluten', icon: '🌾' }
];

const SPICE_OPTIONS = [
  { id: 'none', label: 'Không Cay', icon: '🧊' },
  { id: 'low', label: 'Ít Cay', icon: '🌶️' },
  { id: 'medium', label: 'Vừa', icon: '🔥' },
  { id: 'high', label: 'Rất Cay', icon: '🌋' }
];

const DISLIKED_OPTIONS = [
  { id: 'onion', label: 'Hành' },
  { id: 'garlic', label: 'Tỏi' },
  { id: 'cilantro', label: 'Ngò' },
  { id: 'peanut', label: 'Đậu phộng' },
  { id: 'seafood', label: 'Hải sản' },
  { id: 'pork', label: 'Thịt heo' },
  { id: 'beef', label: 'Thịt bò' }
];

export default function TastePreferencesScreen() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [dietary, setDietary] = useState<string[]>([]);
  const [spice, setSpice] = useState<string>('medium');
  const [disliked, setDisliked] = useState<string[]>([]);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const data = await preferencesApi.getPreferences();
      if (data) {
        setDietary(data.dietaryRestrictions || []);
        setSpice(data.spiceTolerance || 'medium');
        setDisliked(data.dislikedIngredients || []);
      }
    } catch (error) {
      console.log('Error fetching preferences, using defaults', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await preferencesApi.updatePreferences({
        dietaryRestrictions: dietary,
        spiceTolerance: spice,
        dislikedIngredients: disliked
      });
      Alert.alert('Thành công', 'Khẩu vị của bạn đã được cập nhật!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu khẩu vị. Vui lòng thử lại sau.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleArrayItem = (item: string, current: string[], setter: (val: string[]) => void) => {
    if (current.includes(item)) {
      setter(current.filter(i => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-amber-50 justify-center items-center">
        <ActivityIndicator size="large" color="#F59E0B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-amber-50">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-amber-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color="#44403C" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-stone-800">Khẩu Vị Cá Nhân</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving} className="px-3 py-1.5 bg-amber-500 rounded-lg">
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text className="text-white font-bold">Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text className="text-stone-500 text-sm mb-6 text-center">
          Ứng dụng sẽ dùng AI và các thông tin này để tự động lọc bớt các món không phù hợp khỏi Menu của bạn.
        </Text>

        {/* Spice Tolerance */}
        <View className="mb-8">
          <Text className="text-base font-bold text-stone-800 mb-3 flex-row items-center">
            Độ cay ưa thích
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SPICE_OPTIONS.map((option) => {
              const isSelected = spice === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setSpice(option.id)}
                  className={`flex-row items-center px-4 py-2.5 rounded-full border mb-2 mr-2 ${
                    isSelected ? 'bg-orange-500 border-orange-600' : 'bg-white border-stone-200'
                  }`}
                >
                  <Text className="mr-2">{option.icon}</Text>
                  <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-stone-600'}`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dietary Restrictions */}
        <View className="mb-8">
          <Text className="text-base font-bold text-stone-800 mb-3 flex-row items-center">
            Chế độ ăn kiêng
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {DIETARY_OPTIONS.map((option) => {
              const isSelected = dietary.includes(option.id);
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => toggleArrayItem(option.id, dietary, setDietary)}
                  className={`flex-row items-center px-4 py-2.5 rounded-full border mb-2 mr-2 ${
                    isSelected ? 'bg-amber-500 border-amber-600' : 'bg-white border-stone-200'
                  }`}
                >
                  <Text className="mr-2">{option.icon}</Text>
                  <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-stone-600'}`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Disliked Ingredients */}
        <View className="mb-8">
          <Text className="text-base font-bold text-stone-800 mb-3 flex-row items-center">
            Không ăn (Dị ứng / Ghét)
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {DISLIKED_OPTIONS.map((option) => {
              const isSelected = disliked.includes(option.id);
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => toggleArrayItem(option.id, disliked, setDisliked)}
                  className={`px-4 py-2.5 rounded-full border mb-2 mr-2 ${
                    isSelected ? 'bg-rose-500 border-rose-600' : 'bg-white border-stone-200'
                  }`}
                >
                  <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-stone-600'}`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
