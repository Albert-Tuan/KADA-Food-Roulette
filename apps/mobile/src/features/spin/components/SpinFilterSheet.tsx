import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import type { SpinFilters } from '../types';

const CUISINES = ['Phở', 'Cơm tấm', 'Bún chả', 'Pizza', 'BBQ', 'Bánh mì', 'Lẩu', 'Ốc', 'Ăn vặt', 'Món Hàn'];
const DIETARY_TAGS = ['Chay', 'Không cay', 'Không hành', 'Low Carb', 'Ăn kiêng'];
const PRICE_LEVELS = [1, 2, 3, 4] as const;

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
  const [localPrice, setLocalPrice] = useState(filters.maxPrice);
  const [localCategories, setLocalCategories] = useState<string[]>(filters.categories);
  const [localDietary, setLocalDietary] = useState<string[]>(filters.dietary);
  const [newCustomFood, setNewCustomFood] = useState('');

  useEffect(() => {
    if (visible) {
      setLocalDistance(filters.maxDistance);
      setLocalPrice(filters.maxPrice);
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
      maxPrice: localPrice,
      categories: localCategories,
      dietary: localDietary,
    });
    onClose();
  };

  const handleReset = () => {
    setLocalDistance(5000);
    setLocalPrice(4);
    setLocalCategories([]);
    setLocalDietary([]);
    customCandidates.forEach(c => onRemoveCustom(c.id));
  };

  const distanceSteps = [500, 1000, 2000, 3000, 5000, 7000, 10000];

  return (
    <View style={styles.modalContainer}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Bộ Lọc Vòng Quay</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
          {/* Distance */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Khoảng cách</Text>
              <Text style={styles.sectionValue}>{(localDistance / 1000).toFixed(1)} km</Text>
            </View>
            <View style={styles.distanceRow}>
              {distanceSteps.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setLocalDistance(d)}
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
              <Text style={styles.sectionLabel}>Mức giá</Text>
              <Text style={styles.sectionValue}>{'$'.repeat(localPrice)}</Text>
            </View>
            <View style={styles.priceRow}>
              {PRICE_LEVELS.map(level => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setLocalPrice(level)}
                  style={[
                    styles.priceChip,
                    localPrice >= level && styles.priceChipActive,
                  ]}
                >
                  <Text style={[
                    styles.priceChipText,
                    localPrice >= level && styles.priceChipTextActive,
                  ]}>
                    {'$'.repeat(level)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cuisines */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Thể loại món ăn</Text>
            <View style={styles.chipWrap}>
              {CUISINES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => toggleCategory(cat)}
                  style={[
                    styles.chip,
                    localCategories.includes(cat) && styles.chipActive,
                  ]}
                >
                  <Text style={[
                    styles.chipText,
                    localCategories.includes(cat) && styles.chipTextActive,
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dietary */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Khẩu vị / Dị ứng</Text>
            <View style={styles.chipWrap}>
              {DIETARY_TAGS.map(tag => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleDietary(tag)}
                  style={[
                    styles.chip,
                    localDietary.includes(tag) && styles.chipActive,
                  ]}
                >
                  <Text style={[
                    styles.chipText,
                    localDietary.includes(tag) && styles.chipTextActive,
                  ]}>
                    {localDietary.includes(tag) ? '✓ ' : ''}{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Food */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Thêm món ăn tự chọn</Text>
            <View style={styles.customInputRow}>
              <TextInput
                placeholder="Ví dụ: Cơm rang..."
                value={newCustomFood}
                onChangeText={setNewCustomFood}
                style={styles.customInput}
                placeholderTextColor="#A8A29E"
                onSubmitEditing={() => {
                  if (newCustomFood.trim()) {
                    onAddCustom(newCustomFood.trim());
                    setNewCustomFood('');
                  }
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  if (newCustomFood.trim()) {
                    onAddCustom(newCustomFood.trim());
                    setNewCustomFood('');
                  }
                }}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
            {customCandidates.length > 0 && (
              <View style={styles.chipWrap}>
                {customCandidates.map(c => (
                  <Pressable
                    key={c.id}
                    onPress={() => onRemoveCustom(c.id)}
                    style={styles.customTag}
                  >
                    <Text style={styles.customTagText}>{c.name} ✕</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Đặt Lại</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleApply} style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Áp Dụng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    width: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#292524',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#78716C',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#292524',
    marginBottom: 10,
  },
  sectionValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B52330',
    marginBottom: 10,
  },
  distanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  distanceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F4',
    marginRight: 8,
    marginBottom: 8,
  },
  distanceChipActive: {
    backgroundColor: '#B52330',
  },
  distanceChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78716C',
  },
  distanceChipTextActive: {
    color: '#FFF',
  },
  priceRow: {
    flexDirection: 'row',
  },
  priceChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  priceChipActive: {
    backgroundColor: '#B52330',
  },
  priceChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#78716C',
  },
  priceChipTextActive: {
    color: '#FFF',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    backgroundColor: '#FFF',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#FFF1F2',
    borderColor: '#B52330',
  },
  chipText: {
    fontSize: 13,
    color: '#57534E',
  },
  chipTextActive: {
    color: '#B52330',
    fontWeight: '600',
  },
  customInputRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#292524',
    backgroundColor: '#FAFAF9',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#B52330',
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  customTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  customTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    marginRight: 6,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#78716C',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#B52330',
    alignItems: 'center',
    marginLeft: 6,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});
