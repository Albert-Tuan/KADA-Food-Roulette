import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { menuApi, MenuItem } from '../../src/api/endpoints/menu';
import { Href } from 'expo-router';
import { preferencesApi, UserPreference } from '../../src/api/endpoints/preferences';
import { useSpinStore } from '../../src/stores/spinStore';

export default function MenuReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addCustomCandidate } = useSpinStore();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [confidence, setConfidence] = useState<number | undefined>();
  const [menuId, setMenuId] = useState<string | undefined>();
  
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [isFilterEnabled, setIsFilterEnabled] = useState<boolean>(true);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const prefs = await preferencesApi.getPreferences();
        setPreferences(prefs);
      } catch (err) {
        console.log('Failed to fetch preferences', err);
      }
    };
    fetchPrefs();
  }, []);

  useEffect(() => {
    try {
      if (params.initialItems && typeof params.initialItems === 'string') {
        setItems(JSON.parse(params.initialItems));
      }
      if (params.confidence && typeof params.confidence === 'string') {
        setConfidence(parseFloat(params.confidence));
      }
      if (params.menuId && typeof params.menuId === 'string') {
        setMenuId(params.menuId);
      }
    } catch (e) {
      console.error('Error parsing menu parameters', e);
    }
  }, [params.initialItems, params.confidence, params.menuId]);

  const handleToggleTag = (index: number, tag: string) => {
    const updated = [...items];
    const currentTags = updated[index].tags || [];
    if (currentTags.includes(tag)) {
      updated[index].tags = currentTags.filter((t: string) => t !== tag);
    } else {
      updated[index].tags = [...currentTags, tag];
    }
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const priceNum = parseInt(newItemPrice.replace(/\D/g, ''), 10);
    setItems([
      ...items,
      {
        name: newItemName.trim(),
        priceVND: isNaN(priceNum) ? null : priceNum,
        category: 'món chính',
        tags: [],
      },
    ]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const getFilteredItems = () => {
    if (!isFilterEnabled || !preferences) return items;
    
    return items.filter(item => {
      const itemTags = item.tags || [];
      
      // 1. Dietary restrictions
      if (preferences.dietaryRestrictions && preferences.dietaryRestrictions.length > 0) {
        const isVeg = preferences.dietaryRestrictions.includes('vegetarian') || preferences.dietaryRestrictions.includes('vegan');
        if (isVeg && !itemTags.includes('chay')) {
           return false;
        }
      }
      
      // 2. Spice tolerance
      if (preferences.spiceTolerance === 'none' && itemTags.includes('cay')) {
        return false;
      }
      
      // 3. Disliked ingredients
      if (preferences.dislikedIngredients && preferences.dislikedIngredients.length > 0) {
        const nameLower = item.name.toLowerCase();
        const hasDisliked = preferences.dislikedIngredients.some(ingredient => {
           const mapping: Record<string, string> = {
              'onion': 'hành',
              'garlic': 'tỏi',
              'cilantro': 'ngò',
              'peanut': 'đậu phộng',
              'seafood': 'hải sản',
              'pork': 'heo',
              'beef': 'bò'
           };
           const viTerm = mapping[ingredient];
           return viTerm && nameLower.includes(viTerm);
        });
        if (hasDisliked) return false;
      }
      
      return true;
    });
  };

  const handleConfirmAndSpin = async () => {
    const finalItems = getFilteredItems();
    if (finalItems.length === 0) {
      Alert.alert('Không có món phù hợp', 'Bộ lọc khẩu vị đã loại bỏ tất cả các món. Vui lòng tắt bộ lọc hoặc thêm món khác.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (menuId) {
        await menuApi.verifyMenu(menuId, finalItems);
      }
      // Assuming you have a route to start spinning with specific items.
      // E.g., redirect to main spin tab or a specific spin route
      finalItems.forEach((item) => {
        addCustomCandidate({
          name: item.name,
          category: item.category || 'Món từ Menu Scan',
        });
      });

      if (params.target === 'group') {
        router.replace('/group-spin/lobby');
        return;
      }

      router.push('/(tabs)/spin');
    } catch (err) {
      console.error(err);
      // Fallback navigation
      router.push({
        pathname: '/(tabs)/spin' as any,
        params: {
          menuItems: JSON.stringify(finalItems),
          fromMenuCapture: 'true',
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-amber-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {/* Top Header */}
          <View className="flex-row items-center mb-4 pt-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 rounded-full bg-white border border-amber-200 shadow-sm mr-3"
            >
              <Feather name="arrow-left" size={20} color="#44403C" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-stone-800">
                📋 Xác Nhận Menu
              </Text>
              <Text className="text-xs text-stone-500 mt-1">
                AI đã quét được {items.length} món ăn từ menu
              </Text>
            </View>
          </View>

          {/* Confidence Badge */}
          {confidence !== undefined && (
            <View className="mb-4 p-3 rounded-xl bg-white border border-amber-200 shadow-sm flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="sparkles" size={16} color="#F59E0B" style={{ marginRight: 6 }} />
                <Text className="text-xs font-semibold text-stone-600">
                  Độ chính xác nhận diện AI:
                </Text>
              </View>
              <View className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300">
                <Text className="text-xs font-bold text-amber-800">
                  {Math.round(confidence * 100)}%
                </Text>
              </View>
            </View>
          )}

          {/* List of Parsed Items */}
          <View className="flex-col gap-3">
            {items.map((item, idx) => (
              <View
                key={idx}
                className="p-3.5 rounded-2xl bg-white border border-amber-100 shadow-sm mb-3"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <TextInput
                    value={item.name}
                    onChangeText={(text) => {
                      const updated = [...items];
                      updated[idx].name = text;
                      setItems(updated);
                    }}
                    placeholder="Tên món"
                    className="font-bold text-sm text-stone-800 flex-1 py-1 mr-2"
                  />
                  <View className="flex-row items-center">
                    <TextInput
                      keyboardType="numeric"
                      placeholder="Giá đ"
                      value={item.priceVND ? item.priceVND.toString() : ''}
                      onChangeText={(text) => {
                        const updated = [...items];
                        updated[idx].priceVND = text ? parseInt(text, 10) : null;
                        setItems(updated);
                      }}
                      className="w-24 text-right text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1.5 rounded-lg border border-amber-200 mr-2"
                    />
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(idx)}
                      className="p-1.5 rounded-lg bg-rose-50"
                    >
                      <Feather name="trash-2" size={16} color="#F43F5E" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Quick Tag Selector Buttons */}
                <View className="flex-row items-center flex-wrap pt-2 border-t border-stone-100">
                  <View className="flex-row items-center mr-2">
                    <Feather name="tag" size={12} color="#9CA3AF" style={{ marginRight: 4 }} />
                    <Text className="text-stone-400 font-medium text-xs">Tags:</Text>
                  </View>
                  {['cay', 'chay', 'chiên', 'nướng'].map((t) => {
                    const isSelected = item.tags?.includes(t);
                    return (
                      <TouchableOpacity
                        key={t}
                        onPress={() => handleToggleTag(idx, t)}
                        className={`px-2 py-1 rounded-full border mr-1.5 mb-1 flex-row items-center ${
                          isSelected
                            ? 'bg-amber-500 border-amber-600'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <Text className={`text-[10px] font-semibold ${isSelected ? 'text-white' : 'text-stone-600'}`}>
                          {t === 'cay' && '🔥 '}
                          {t === 'chay' && '🌱 '}
                          {t}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          {/* Taste Filter Toggle */}
          <View className="mt-2 mb-2 p-3 rounded-2xl bg-white border border-amber-200 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="p-2 bg-amber-100 rounded-full mr-3">
                <Ionicons name="filter" size={18} color="#D97706" />
              </View>
              <View>
                <Text className="font-bold text-stone-800 text-sm">✨ Lọc theo khẩu vị của tôi</Text>
                <Text className="text-xs text-stone-500 mt-0.5">
                  {preferences 
                    ? `Áp dụng ${preferences.dietaryRestrictions?.length || 0} ăn kiêng, ${preferences.dislikedIngredients?.length || 0} dị ứng`
                    : 'Đang tải thiết lập...'}
                </Text>
              </View>
            </View>
            <Switch
              value={isFilterEnabled}
              onValueChange={setIsFilterEnabled}
              trackColor={{ false: "#E5E7EB", true: "#F59E0B" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Add New Item Row */}
          <View className="mt-4 p-3 rounded-2xl bg-amber-50 border border-dashed border-amber-300 flex-row items-center">
            <TextInput
              placeholder="Tên món bị thiếu..."
              value={newItemName}
              onChangeText={setNewItemName}
              className="flex-1 text-xs px-3 py-2.5 rounded-xl bg-white border border-amber-200 mr-2"
            />
            <TextInput
              keyboardType="numeric"
              placeholder="Giá VNĐ"
              value={newItemPrice}
              onChangeText={setNewItemPrice}
              className="w-24 text-xs px-2 py-2.5 rounded-xl bg-white border border-amber-200 mr-2"
            />
            <TouchableOpacity
              onPress={handleAddItem}
              className="p-3 rounded-xl bg-amber-500 shadow-sm"
            >
              <Feather name="plus" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Action */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-amber-200 shadow-lg gap-2">
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/spin/voice-pick' as any,
              params: {
                menuItems: JSON.stringify(getFilteredItems()),
              },
            })
          }
          disabled={items.length === 0 || isSubmitting}
          className={`w-full py-3.5 rounded-xl flex-row items-center justify-center border-2 ${
            items.length === 0 ? 'bg-amber-50 border-amber-200' : 'bg-amber-100 border-amber-400'
          }`}
        >
          <Ionicons name="mic" size={20} color="#D97706" style={{ marginRight: 8 }} />
          <Text className="text-amber-900 font-bold text-sm">
            🎤 Voice Pick - Nói để chọn món cho Nhóm
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleConfirmAndSpin}
          disabled={items.length === 0 || isSubmitting}
          className={`w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg ${
            items.length === 0 || isSubmitting ? 'bg-stone-300' : 'bg-orange-500'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="dice-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
          )}
          <Text className="text-white font-bold text-sm">
            Quay Vòng Chọn Món Ngay ({getFilteredItems().length} món)
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
