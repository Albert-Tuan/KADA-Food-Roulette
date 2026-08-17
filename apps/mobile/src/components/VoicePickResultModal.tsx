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
      <View className="flex-1 bg-black/70 justify-end">
        <View className="bg-surface rounded-t-4xl p-6 max-h-[85%] border-t-2 border-outline-variant shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-outline-variant">
            <View className="flex-row items-center">
              <View className="w-11 h-11 rounded-2xl bg-primary items-center justify-center mr-3 border border-secondary-container">
                <Ionicons name="sparkles" size={22} color="#ffffff" />
              </View>
              <View>
                <Text className="text-xl font-extrabold text-primary">Phân Tích Món Thèm AI 🍜</Text>
                <Text className="text-xs text-on-surface-variant">Giọng nói thảo luận tại bàn ăn</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Feather name="x" size={24} color="#8e706f" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
            {/* Audio Summary */}
            <View className="mb-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant">
              <Text className="text-xs font-bold text-secondary mb-1">
                💬 AI ghi nhận thảo luận của nhóm:
              </Text>
              <Text className="text-sm text-primary italic font-semibold">
                "{result.transcription}"
              </Text>
              <Text className="text-[11px] text-on-surface-variant mt-2">
                * Muốn đổi nội dung? Bấm "Thu âm lại" ở phía dưới.
              </Text>
            </View>

            {/* Craved Items */}
            {result.cravedItems && result.cravedItems.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-bold text-primary mb-2 flex-row items-center">
                  🔥 Món khao khát nhất (Thèm điên đảo):
                </Text>
                {result.cravedItems.map((item, idx) => (
                  <View key={idx} className="bg-secondary-fixed p-3.5 rounded-2xl mb-2 border border-secondary-container">
                    <Text className="font-extrabold text-primary text-base">{item.name}</Text>
                    <Text className="text-xs text-secondary mt-0.5 font-medium">{item.reason}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Matched Items */}
            {result.matchedItems && result.matchedItems.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-bold text-secondary mb-2">
                  ✅ Món hợp khẩu vị nhóm:
                </Text>
                {result.matchedItems.map((item, idx) => (
                  <View key={idx} className="bg-surface-white p-3.5 rounded-2xl mb-2 border border-outline-variant">
                    <Text className="font-bold text-primary text-sm">{item.name}</Text>
                    <Text className="text-xs text-on-surface-variant mt-0.5">{item.reason}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Excluded Items */}
            {result.excludedItems && result.excludedItems.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-bold text-on-surface-variant mb-2">
                  🚫 Món bị loại bỏ (Ghét / Không ăn):
                </Text>
                {result.excludedItems.map((item, idx) => (
                  <View key={idx} className="bg-surface-container-high p-3 rounded-2xl mb-2 border border-outline-variant/40">
                    <Text className="font-bold text-on-surface-variant line-through text-sm">{item.name}</Text>
                    <Text className="text-xs text-on-surface-variant mt-0.5">{item.reason}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* AI Suggestions */}
            {result.aiSuggestions && result.aiSuggestions.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-bold text-tertiary mb-2">
                  💡 AI Đề Xuất Thêm Món Ngon:
                </Text>
                {result.aiSuggestions.map((item, idx) => (
                  <View key={idx} className="bg-tertiary-container/30 p-3 rounded-2xl mb-2 border border-tertiary">
                    <Text className="font-bold text-tertiary-dark text-sm">{item.name}</Text>
                    <Text className="text-xs text-on-surface-variant mt-0.5">{item.reason}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View className="pt-3 border-t border-outline-variant gap-2">
            <TouchableOpacity
              onPress={() => onConfirmAndSpin(allRecommended)}
              disabled={allRecommended.length === 0}
              className={`w-full py-4 rounded-2xl items-center justify-center flex-row shadow-lg border-b-4 ${
                allRecommended.length === 0 ? 'bg-on-surface-variant/30 border-on-surface-variant/50' : 'bg-primary border-primary-dark'
              }`}
            >
              <Ionicons name="dice" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text className="text-white font-extrabold text-base">
                QUAY VÒNG NGAY! ({allRecommended.length} món chọn lọc)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} className="w-full py-3 rounded-2xl items-center justify-center">
              <Text className="text-on-surface-variant font-bold text-sm">Hủy / Thu âm lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
