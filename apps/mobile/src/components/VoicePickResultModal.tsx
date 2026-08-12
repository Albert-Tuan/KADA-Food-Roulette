import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { VoicePickResponse } from '../api/endpoints/menu';

interface VoicePickResultModalProps {
  visible: boolean;
  result: VoicePickResponse | null;
  onClose: () => void;
  onConfirmAndSpin: (selectedItems: string[]) => void;
}

export const VoicePickResultModal: React.FC<VoicePickResultModalProps> = ({
  visible,
  result,
  onClose,
  onConfirmAndSpin,
}) => {
  if (!result) return null;

  // Gather all items that should go to the spin wheel (craved + matched + suggestions, excluding excludedItems)
  const excludedSet = new Set(result.excludedItems.map((i) => i.name.toLowerCase()));
  
  const allRecommended = Array.from(
    new Set([
      ...result.cravedItems.map((i) => i.name),
      ...result.matchedItems.map((i) => i.name),
      ...result.aiSuggestions.map((i) => i.name),
    ])
  ).filter((name) => !excludedSet.has(name.toLowerCase()));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white rounded-t-3xl p-5 max-h-[85%] border-t border-amber-200">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-stone-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
                <Ionicons name="sparkles" size={20} color="#D97706" />
              </View>
              <View>
                <Text className="text-lg font-bold text-stone-800">Kết quả Phân tích AI</Text>
                <Text className="text-xs text-stone-500">Giọng nói nhóm tại bàn</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Feather name="x" size={24} color="#78716C" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
            {/* Audio Summary */}
            <View className="mb-4 p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <Text className="text-xs font-bold text-amber-800 mb-1 flex-row items-center">
                💬 Nội dung thu âm nhóm:
              </Text>
              <Text className="text-sm text-stone-700 italic">
                "{result.transcription}"
              </Text>
            </View>

            {/* Craved Items */}
            {result.cravedItems && result.cravedItems.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-bold text-red-600 mb-2 flex-row items-center">
                  🔥 Món thèm nhất (Khao khát):
                </Text>
                {result.cravedItems.map((item, idx) => (
                  <View key={idx} className="bg-red-50 p-3 rounded-xl mb-2 border border-red-200">
                    <Text className="font-bold text-stone-800 text-sm">{item.name}</Text>
                    <Text className="text-xs text-stone-600 mt-0.5">{item.reason}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Matched Items */}
            {result.matchedItems && result.matchedItems.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-bold text-emerald-700 mb-2 flex-row items-center">
                  ✅ Món phù hợp sở thích:
                </Text>
                {result.matchedItems.map((item, idx) => (
                  <View key={idx} className="bg-emerald-50 p-3 rounded-xl mb-2 border border-emerald-200">
                    <Text className="font-bold text-stone-800 text-sm">{item.name}</Text>
                    <Text className="text-xs text-stone-600 mt-0.5">{item.reason}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Excluded Items */}
            {result.excludedItems && result.excludedItems.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-bold text-stone-500 mb-2 flex-row items-center">
                  🚫 Món bị loại bỏ (Ghét / Dị ứng / Không muốn):
                </Text>
                {result.excludedItems.map((item, idx) => (
                  <View key={idx} className="bg-stone-100 p-3 rounded-xl mb-2 border border-stone-200">
                    <Text className="font-bold text-stone-500 line-through text-sm">{item.name}</Text>
                    <Text className="text-xs text-stone-500 mt-0.5">{item.reason}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* AI Suggestions */}
            {result.aiSuggestions && result.aiSuggestions.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-bold text-amber-700 mb-2 flex-row items-center">
                  💡 AI Gợi ý thêm cho nhóm:
                </Text>
                {result.aiSuggestions.map((item, idx) => (
                  <View key={idx} className="bg-amber-50 p-3 rounded-xl mb-2 border border-amber-200">
                    <Text className="font-bold text-stone-800 text-sm">{item.name}</Text>
                    <Text className="text-xs text-stone-600 mt-0.5">{item.reason}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View className="pt-3 border-t border-stone-100 gap-2">
            <TouchableOpacity
              onPress={() => onConfirmAndSpin(allRecommended)}
              disabled={allRecommended.length === 0}
              className={`w-full py-4 rounded-xl items-center justify-center flex-row shadow-sm ${
                allRecommended.length === 0 ? 'bg-stone-300' : 'bg-orange-500'
              }`}
            >
              <Ionicons name="dice" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-base">
                Quay Vòng Ngay ({allRecommended.length} món chọn lọc)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} className="w-full py-3 rounded-xl items-center justify-center">
              <Text className="text-stone-500 font-semibold text-sm">Hủy / Thu âm lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
