import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, AppState, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { RewardCard, RewardCardEmpty } from '../../src/components/RewardCard';
import { FoodRoulette } from '../../src/features/spin/components/FoodRoulette';
import { SpinFilterSheet } from '../../src/features/spin/components/SpinFilterSheet';
import { useSpinStore } from '../../src/stores/spinStore';
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

export default function SpinScreen() {
  const router = useRouter();
  const { candidates, filters, customCandidates, setFilters, addCustomCandidate, removeCustomCandidate, setCurrentResult, resetStore } = useSpinStore();
  const [rewards] = useState<Reward[]>(MOCK_REWARDS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const handleFoodSpinEnd = useCallback((winner: Restaurant, index: number) => {
    setCurrentResult(winner);
    router.push('/spin/result');
  }, [setCurrentResult, router]);

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
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Ăn gì hôm nay?</Text>
                <Text style={styles.sectionSubtitle}>Chọn một quán ngẫu nhiên xung quanh bạn!</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {customCandidates.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => {
                      Alert.alert(
                        'Làm mới vòng quay',
                        'Bạn có chắc chắn muốn xóa tất cả các món ăn tự chọn (do bạn thêm, AI thêm) khỏi vòng quay?',
                        [
                          { text: 'Hủy', style: 'cancel' },
                          { text: 'Xóa', style: 'destructive', onPress: () => resetStore() },
                        ]
                      );
                    }} 
                    style={[styles.filterButton, { marginRight: 8 }]}
                  >
                    <Text style={styles.filterIcon}>🔄</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setIsFilterOpen(true)} style={styles.filterButton}>
                  <Text style={styles.filterIcon}>⚙️</Text>
                </TouchableOpacity>
              </View>
            </View>

            <FoodRoulette
              candidates={candidates}
              onSpinEnd={handleFoodSpinEnd}
            />

            {/* Candidates List */}
            <Text style={styles.candidatesTitle}>
              🍽️ Danh sách đề cử ({candidates.length})
            </Text>
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
  candidatesTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#b52330',
    marginTop: 20,
    marginBottom: 12,
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
