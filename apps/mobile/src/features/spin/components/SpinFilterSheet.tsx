import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import type { SpinFilters } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CUISINE_MAP: { name: string; emoji: string }[] = [
  { name: 'Phở', emoji: '🍜' },
  { name: 'Cơm tấm', emoji: '🍚' },
  { name: 'Bún chả', emoji: '🥢' },
  { name: 'Pizza', emoji: '🍕' },
  { name: 'BBQ', emoji: '🥩' },
  { name: 'Bánh mì', emoji: '🥖' },
  { name: 'Lẩu', emoji: '🍲' },
  { name: 'Ốc', emoji: '🐚' },
  { name: 'Ăn vặt', emoji: '🧋' },
  { name: 'Món Hàn', emoji: '🍣' },
];

const DIETARY_MAP: { name: string; emoji: string }[] = [
  { name: 'Chay', emoji: '🥦' },
  { name: 'Không cay', emoji: '🌶️' },
  { name: 'Không hành', emoji: '🧅' },
  { name: 'Low Carb', emoji: '🥑' },
  { name: 'Ăn kiêng', emoji: '🥗' },
];

interface SpinFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: SpinFilters;
  onApply: (filters: SpinFilters) => void;
  customCandidates: { id: string; name: string }[];
  onAddCustom: (name: string) => void;
  onRemoveCustom: (id: string) => void;
}

export function SpinFilterSheet({
  visible,
  onClose,
  filters,
  onApply,
  customCandidates,
  onAddCustom,
  onRemoveCustom,
}: SpinFilterSheetProps) {
  const [localDistance, setLocalDistance] = useState(filters.maxDistance);
  const [localPriceVND, setLocalPriceVND] = useState(filters.maxPriceVND);
  const [localCategories, setLocalCategories] = useState<string[]>(filters.categories);
  const [localDietary, setLocalDietary] = useState<string[]>(filters.dietary);
  const [newCustomFood, setNewCustomFood] = useState('');

  useEffect(() => {
    if (visible) {
      setLocalDistance(filters.maxDistance);
      setLocalPriceVND(filters.maxPriceVND);
      setLocalCategories(filters.categories);
      setLocalDietary(filters.dietary);
    }
  }, [visible, filters]);

  if (!visible) return null;

  const toggleCategory = (cat: string) => {
    setLocalCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleDietary = (tag: string) => {
    setLocalDietary(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleApply = () => {
    if (newCustomFood.trim()) {
      onAddCustom(newCustomFood.trim());
      setNewCustomFood('');
    }
    onApply({
      maxDistance: localDistance,
      maxPriceVND: localPriceVND,
      categories: localCategories,
      dietary: localDietary,
    });
    onClose();
  };

  const handleReset = () => {
    setLocalDistance(5000);
    setLocalPriceVND(1000000);
    setLocalCategories([]);
    setLocalDietary([]);
    customCandidates.forEach(c => onRemoveCustom(c.id));
  };

  const distanceSteps = [500, 1000, 2000, 3000, 5000, 7000, 10000];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Grab Handle */}
          <View style={styles.grabHandleContainer}>
            <View style={styles.grabHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🎛️ Bộ Lọc Vòng Quay</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
            {/* Distance */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>📍 Khoảng cách tối đa</Text>
                <Text style={styles.sectionValue}>{(localDistance / 1000).toFixed(1)} km</Text>
              </View>
              <View style={styles.distanceRow}>
                {distanceSteps.map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setLocalDistance(d)}
                    activeOpacity={0.8}
                    style={[
                      styles.distanceChip,
                      localDistance >= d && styles.distanceChipActive,
                    ]}
                  >
                    <Text style={[
                      styles.distanceChipText,
                      localDistance >= d && styles.distanceChipTextActive,
                    ]}>
                      {d >= 1000 ? `${d / 1000}k` : `${d}m`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>💰 Mức giá tối đa</Text>
                <Text style={styles.sectionValue}>
                  {localPriceVND >= 1000000 ? 'Tất cả mức giá' : `${(localPriceVND / 1000).toLocaleString('vi-VN')}k đ`}
                </Text>
              </View>
              <View style={styles.chipWrap}>
                {[100000, 300000, 500000, 1000000].map((price) => (
                  <TouchableOpacity
                    key={price}
                    onPress={() => setLocalPriceVND(price)}
                    activeOpacity={0.8}
                    style={[
                      styles.chip,
                      localPriceVND === price && styles.chipActive,
                    ]}
                  >
                    <Text style={[
                      styles.chipText,
                      localPriceVND === price && styles.chipTextActive,
                    ]}>
                      {price === 1000000 ? 'Tất cả' : `≤ ${(price / 1000).toLocaleString('vi-VN')}k`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cuisine / Category */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>🍜 Thể loại món ăn</Text>
                {localCategories.length > 0 && (
                  <Text style={styles.sectionValue}>{localCategories.length} đã chọn</Text>
                )}
              </View>
              <View style={styles.chipWrap}>
                {CUISINE_MAP.map((item) => {
                  const isSelected = localCategories.includes(item.name);
                  return (
                    <TouchableOpacity
                      key={item.name}
                      onPress={() => toggleCategory(item.name)}
                      activeOpacity={0.8}
                      style={[styles.chip, isSelected && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {item.emoji} {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Dietary */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>🥗 Sở thích / Kiêng khem</Text>
                {localDietary.length > 0 && (
                  <Text style={styles.sectionValue}>{localDietary.length} đã chọn</Text>
                )}
              </View>
              <View style={styles.chipWrap}>
                {DIETARY_MAP.map((item) => {
                  const isSelected = localDietary.includes(item.name);
                  return (
                    <TouchableOpacity
                      key={item.name}
                      onPress={() => toggleDietary(item.name)}
                      activeOpacity={0.8}
                      style={[styles.chip, isSelected && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {item.emoji} {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Custom Dishes (Góp món thủ công) */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>✍️ Tự thêm món bạn muốn</Text>
              </View>
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Ví dụ: Bún riêu cua, Nem nướng..."
                  placeholderTextColor="#8e4e14"
                  value={newCustomFood}
                  onChangeText={setNewCustomFood}
                  onSubmitEditing={() => {
                    if (newCustomFood.trim()) {
                      onAddCustom(newCustomFood.trim());
                      setNewCustomFood('');
                    }
                  }}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    if (newCustomFood.trim()) {
                      onAddCustom(newCustomFood.trim());
                      setNewCustomFood('');
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.addButtonText}>➕ Thêm</Text>
                </TouchableOpacity>
              </View>

              {customCandidates.length > 0 && (
                <View style={styles.chipWrap}>
                  {customCandidates.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => onRemoveCustom(c.id)}
                      style={styles.customTag}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.customTagText}>🍲 {c.name} ✕</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton} activeOpacity={0.8}>
              <Text style={styles.resetButtonText}>🔄 Đặt Lại</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleApply} style={styles.applyButton} activeOpacity={0.88}>
              <Text style={styles.applyButtonText}>ÁP DỤNG BỘ LỌC ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    width: '100%',
    backgroundColor: '#fff8ef',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#e2bebc',
    maxHeight: SCREEN_HEIGHT * 0.88,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  grabHandleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  grabHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e2bebc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fbf3e4',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#b52330',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2bebc',
  },
  closeText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#b52330',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#b52330',
  },
  sectionValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#8e4e14',
  },
  distanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distanceChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
  },
  distanceChipActive: {
    backgroundColor: '#b52330',
    borderColor: '#61000e',
  },
  distanceChipText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#8e4e14',
  },
  distanceChipTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priceChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
  },
  priceChipActive: {
    backgroundColor: '#b52330',
    borderColor: '#61000e',
  },
  priceChipText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8e4e14',
  },
  priceChipTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    backgroundColor: '#ffffff',
  },
  chipActive: {
    backgroundColor: '#ffdad8',
    borderColor: '#b52330',
  },
  chipText: {
    fontSize: 13,
    color: '#5a403f',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#b52330',
    fontWeight: '900',
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  customInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#b52330',
    fontWeight: '700',
    backgroundColor: '#ffffff',
  },
  addButton: {
    backgroundColor: '#b52330',
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#61000e',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  customTag: {
    backgroundColor: '#ffdcc4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ffab69',
  },
  customTagText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#8e4e14',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#8e4e14',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#b52330',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#61000e',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});
