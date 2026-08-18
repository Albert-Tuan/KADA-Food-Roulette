import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, AppState, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { RewardCard, RewardCardEmpty } from '../../src/components/RewardCard';
import { FoodRoulette } from '../../src/features/spin/components/FoodRoulette';
import { SpinFilterSheet } from '../../src/features/spin/components/SpinFilterSheet';
import { useSpinStore } from '../../src/stores/spinStore';
import { restaurantApi, Restaurant as ApiRestaurant } from '../../src/api/endpoints/restaurants';
import type { Restaurant } from '../../src/features/spin/types';

interface Reward {
  id: string;
  type: 'voucher' | 'credit' | 'item' | 'spin';
  title: string;
  description: string;
  expiresIn: string;
  icon: string;
  variant: 'gold' | 'green' | 'blue' | 'red';
}

const MOCK_REWARDS: Reward[] = [
  { id: '1', type: 'voucher', title: 'Giảm 10%', description: 'Áp dụng mọi món', expiresIn: '3 ngày', icon: '🎟️', variant: 'gold' },
  { id: '2', type: 'item', title: 'Trà đá Free', description: 'Mỗi check-in', expiresIn: 'Hôm nay', icon: '🥤', variant: 'green' },
];

const FALLBACK_IMAGE_URL =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';

const toSpinRestaurant = (r: ApiRestaurant): Restaurant => {
  const priceLevel = r.priceLevel && r.priceLevel >= 1 && r.priceLevel <= 4 ? r.priceLevel : 1;
  return {
    id: r.id,
    name: r.name,
    category: r.category ?? 'Ẩm thực',
    rating: r.ratingAvg ?? 0,
    totalReviews: r.ratingCount ?? 0,
    distance: (r.distance ?? 0) * 1000,
    priceLevel: priceLevel as 1 | 2 | 3 | 4,
    imageUrl: r.photos?.[0] ?? FALLBACK_IMAGE_URL,
  };
};

export default function SpinScreen() {
  const router = useRouter();
  const { candidates, filters, customCandidates, setFilters, setCandidates, addCustomCandidate, removeCustomCandidate, setCurrentResult, resetStore, fetchNearbyCandidates, spin, currentResult } = useSpinStore();
  const [rewards] = useState<Reward[]>(MOCK_REWARDS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [multiMode, setMultiMode] = useState<1 | 2 | 3>(1);
  const [comboWinners, setComboWinners] = useState<Restaurant[]>([]);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [newFoodInput, setNewFoodInput] = useState('');

  const handleAddDish = () => {
    if (!newFoodInput.trim()) return;
    addCustomCandidate(newFoodInput.trim());
    setNewFoodInput('');
  };

  const isMockRepository = process.env.EXPO_PUBLIC_USE_MOCK_REPOSITORIES === 'true';

  useEffect(() => {
    if (isMockRepository) return;

    let cancelled = false;
    (async () => {
      try {
        const list = await restaurantApi.list({ status: 'APPROVED' });
        if (cancelled) return;
        setCandidates(list.map(toSpinRestaurant));
      } catch (error) {
        if (cancelled) return;
        console.error('Load spin candidates failed:', error);
        setCandidates([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isMockRepository, setCandidates]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        resetStore();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [resetStore]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Không thể lấy vị trí của bạn để tìm quán ăn.');
        setIsLoading(false);
        return;
      }

      try {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        await fetchNearbyCandidates(loc.coords.latitude, loc.coords.longitude);
      } catch (error) {
        console.error('Error fetching location', error);
      }
      setIsLoading(false);
    })();
  }, [fetchNearbyCandidates]);

  const handleFoodSpinEnd = useCallback((winner: Restaurant, index: number) => {
    if (multiMode === 1) {
      setCurrentResult(winner);
      router.push('/spin/result');
    }
  }, [setCurrentResult, router, multiMode]);

  const handleMultiSpinEnd = useCallback((winners: Restaurant[]) => {
    if (multiMode > 1) {
      setComboWinners(winners);
      setIsComboModalOpen(true);
    }
  }, [multiMode]);

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Food Roulette Section */}
          <View style={styles.section}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#b52330" style={{ marginTop: 60, marginBottom: 200 }} />
            ) : (
              <>
                <View style={styles.sectionHeader}>

              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.sectionTitle}>Ăn gì hôm nay?</Text>
                <Text style={styles.sectionSubtitle}>Chọn 1 đến 3 món quay ngẫu nhiên 3D cùng lúc!</Text>
                
                {/* Filter Context Chips */}
                <View style={styles.contextChipsRow}>
                  <TouchableOpacity onPress={() => setIsFilterOpen(true)} style={styles.contextChip}>
                    <Text style={styles.contextChipText}>📍 {(filters.maxDistance / 1000).toFixed(1)}km</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsFilterOpen(true)} style={styles.contextChip}>
                    <Text style={styles.contextChipText}>
                      💰 {filters.maxPrice === 1 ? 'Bình dân' : filters.maxPrice === 2 ? 'Trung bình' : filters.maxPrice === 3 ? 'Hơi sang' : 'Sang trọng'}
                    </Text>
                  </TouchableOpacity>
                  {filters.categories.length > 0 && (
                    <TouchableOpacity onPress={() => setIsFilterOpen(true)} style={styles.contextChip}>
                      <Text style={styles.contextChipText}>🍲 {filters.categories.length} loại</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                {customCandidates.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Làm mới vòng quay',
                        'Bạn có chắc chắn muốn xóa tất cả các món ăn tự chọn khỏi vòng quay?',
                        [
                          { text: 'Hủy', style: 'cancel' },
                          { text: 'Xóa', style: 'destructive', onPress: () => resetStore() },
                        ]
                      );
                    }}
                    style={styles.filterButton}
                  >
                    <Text style={styles.filterIcon}>🔄</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setIsFilterOpen(true)} style={styles.filterButton}>
                  <Text style={styles.filterIcon}>⚙️</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Input Bar */}
            <View style={styles.addInputRow}>
              <TextInput
                placeholder="Ví dụ: Bún đậu, Gà rán..."
                value={newFoodInput}
                onChangeText={setNewFoodInput}
                onSubmitEditing={handleAddDish}
                style={styles.addInput}
                placeholderTextColor="#8e4e14"
              />
              <TouchableOpacity
                style={styles.addInputBtn}
                onPress={handleAddDish}
                activeOpacity={0.85}
              >
                <Text style={styles.addInputBtnText}>➕ Thêm món</Text>
              </TouchableOpacity>
            </View>

            {/* 3D Multi-Dish Selector Bar */}
            <View style={styles.multiModeBar}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setMultiMode(1)}
                style={[styles.multiModeBtn, multiMode === 1 && styles.multiModeBtnActive]}
              >
                <Text style={[styles.multiModeBtnText, multiMode === 1 && styles.multiModeBtnTextActive]}>
                  🎯 1 Món
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setMultiMode(2)}
                style={[styles.multiModeBtn, multiMode === 2 && styles.multiModeBtnActive]}
              >
                <Text style={[styles.multiModeBtnText, multiMode === 2 && styles.multiModeBtnTextActive]}>
                  ✌️ 2 Món Cùng Lúc
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setMultiMode(3)}
                style={[styles.multiModeBtn, multiMode === 3 && styles.multiModeBtnActive]}
              >
                <Text style={[styles.multiModeBtnText, multiMode === 3 && styles.multiModeBtnTextActive]}>
                  👑 3 Món Cùng Lúc
                </Text>
              </TouchableOpacity>
            </View>

            <FoodRoulette
              candidates={candidates}
              multiSpinMode={multiMode}
              onSpinStart={async () => {
                if (location) {
                  await spin(location.coords.latitude, location.coords.longitude);
                  // Find the index of the result that spinStore just set
                  const newResult = useSpinStore.getState().currentResult;
                  if (newResult) {
                    const idx = useSpinStore.getState().candidates.findIndex(c => c.id === newResult.id);
                    if (idx !== -1) return idx;
                  }
                }
                return undefined;
              }}
              onSpinEnd={handleFoodSpinEnd}
              onMultiSpinEnd={handleMultiSpinEnd}
            />

            {/* Candidates List */}
            <View style={styles.candidatesHeaderRow}>
              <Text style={styles.candidatesTitle}>
                🍽️ Danh sách đề cử ({candidates.length})
              </Text>
              {customCandidates.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Làm mới vòng quay',
                      'Bạn có chắc chắn muốn xóa tất cả các món ăn tự chọn?',
                      [
                        { text: 'Hủy', style: 'cancel' },
                        { text: 'Xóa', style: 'destructive', onPress: () => resetStore() },
                      ]
                    );
                  }}
                >
                  <Text style={styles.clearAllText}>Xóa tất cả 🔄</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.candidatesScroll}>
              {candidates.map(restaurant => (
                <View key={restaurant.id} style={styles.candidateCard}>
                  <Image source={{ uri: restaurant.imageUrl }} style={styles.candidateImage} />
                  <Text style={styles.candidateName} numberOfLines={1}>{restaurant.name}</Text>
                  <Text style={styles.candidateInfo}>
                    ⭐ {restaurant.rating} • {(restaurant.distance / 1000).toFixed(1)}km
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Quick Links */}
            <View style={styles.quickLinks}>
              <TouchableOpacity
                onPress={() => router.push('/group-spin/lobby')}
                style={styles.quickLink}
              >
                <Text style={styles.quickLinkText}>👥 Group Spin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/lockets')}
                style={styles.quickLink}
              >
                <Text style={styles.quickLinkText}>📸 Locket Feed</Text>
              </TouchableOpacity>
            </View>
            </>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Voucher của bạn</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Rewards List */}
          <View style={styles.rewardsSection}>
            {rewards.length > 0 ? (
              rewards.map(reward => (
                <RewardCard key={reward.id} data={reward} />
              ))
            ) : (
              <RewardCardEmpty />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Combo Winners Reveal Modal (2-3 món cùng lúc) */}
      <Modal visible={isComboModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalBadge}>🎉 COMBO {comboWinners.length} MÓN TRÚNG THƯỞNG 🎉</Text>
              <Text style={styles.modalTitle}>✨ CHÚC MỪNG BẠN! ✨</Text>
              <Text style={styles.modalSubtitle}>Vòng quay 3D đã chọn ra {comboWinners.length} món ngon xuất sắc</Text>
            </View>

            <View style={styles.modalBody}>
              <ScrollView style={{ maxHeight: 260 }}>
                {comboWinners.map((w, i) => (
                  <TouchableOpacity
                    key={w.id || i}
                    activeOpacity={0.9}
                    onPress={() => {
                      setIsComboModalOpen(false);
                      setCurrentResult(w);
                      router.push('/spin/result');
                    }}
                    style={styles.comboWinnerCard}
                  >
                    <Image source={{ uri: w.imageUrl }} style={styles.comboWinnerImage} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={styles.comboNumberBadge}>
                          <Text style={styles.comboNumberBadgeText}>{i + 1}</Text>
                        </View>
                        <Text style={styles.comboWinnerName}>{w.name}</Text>
                      </View>
                      <Text style={styles.comboWinnerInfo}>
                        ⭐ {w.rating} • {w.category} • {(w.distance / 1000).toFixed(1)}km
                      </Text>
                    </View>
                    <Text style={styles.comboArrow}>➔</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsComboModalOpen(false)}
              >
                <Text style={styles.modalCloseBtnText}>Đóng & Quay Tiếp 🎲</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Sheet */}
      <SpinFilterSheet
        visible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={(f) => setFilters(f)}
        customCandidates={customCandidates.map(c => ({ id: c.id, name: c.name }))}
        onAddCustom={addCustomCandidate}
        onRemoveCustom={removeCustomCandidate}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8ef',
  },
  multiModeBar: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
  },
  multiModeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  multiModeBtnActive: {
    backgroundColor: '#b52330',
    borderColor: '#93000a',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  multiModeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8e4e14',
  },
  multiModeBtnTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 380,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  modalHeader: {
    backgroundColor: '#b52330',
    padding: 18,
    alignItems: 'center',
  },
  modalBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#ffdcc4',
    marginTop: 2,
  },
  modalBody: {
    padding: 16,
  },
  comboWinnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8ef',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    padding: 10,
    borderRadius: 16,
    marginBottom: 8,
    gap: 10,
  },
  comboWinnerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FFC107',
    backgroundColor: '#ffdcc4',
  },
  comboNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#b52330',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comboNumberBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
  },
  comboWinnerName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#b52330',
  },
  comboWinnerInfo: {
    fontSize: 11,
    color: '#8e4e14',
    marginTop: 2,
    fontWeight: '700',
  },
  comboArrow: {
    fontSize: 16,
    fontWeight: '900',
    color: '#b52330',
    marginRight: 4,
  },
  modalCloseBtn: {
    backgroundColor: '#b52330',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#b52330',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8e4e14',
    marginTop: 3,
    fontWeight: '700',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  filterIcon: {
    fontSize: 18,
  },
  contextChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  contextChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2bebc',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  contextChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b52330',
  },
  addInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 4,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#b52330',
    fontWeight: '700',
  },
  addInputBtn: {
    backgroundColor: '#b52330',
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#61000e',
  },
  addInputBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
  },
  candidatesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  candidatesTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#b52330',
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8e4e14',
  },
  candidatesScroll: {
    marginBottom: 16,
  },
  candidateCard: {
    width: 128,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    alignItems: 'center',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  candidateImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFC107',
    backgroundColor: '#ffdcc4',
  },
  candidateName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#b52330',
    textAlign: 'center',
  },
  candidateInfo: {
    fontSize: 11,
    color: '#8e4e14',
    marginTop: 3,
    fontWeight: '700',
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  quickLink: {
    flex: 1,
    backgroundColor: '#fbf3e4',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickLinkText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#b52330',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#e2bebc',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '800',
    color: '#b52330',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  rewardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#b52330',
    textAlign: 'center',
  },
  rewardSubtitle: {
    fontSize: 14,
    color: '#5a403f',
    marginTop: 4,
    textAlign: 'center',
  },
  rewardsSection: {
    paddingHorizontal: 16,
  },
});
