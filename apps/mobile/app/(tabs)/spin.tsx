import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SpinWheel } from '../../src/components/SpinWheel';
import { RewardCard, RewardCardEmpty } from '../../src/components/RewardCard';
import { FoodRoulette } from '../../src/features/spin/components/FoodRoulette';
import { SpinFilterSheet } from '../../src/features/spin/components/SpinFilterSheet';
import { useSpinStore } from '../../src/stores/spinStore';
import type { Restaurant } from '../../src/features/spin/types';

interface PrizeSegment {
  label: string;
  color: string;
  icon: string;
}

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
  const { candidates, filters, customCandidates, setFilters, addCustomCandidate, removeCustomCandidate, setCurrentResult } = useSpinStore();
  const [rewards, setRewards] = useState<Reward[]>(MOCK_REWARDS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFoodSpinEnd = useCallback((winner: Restaurant, index: number) => {
    setCurrentResult(winner);
    router.push('/spin/result');
  }, [setCurrentResult, router]);

  const handleRewardSpinEnd = useCallback((prize: PrizeSegment) => {
    const newReward: Reward = {
      id: Date.now().toString(),
      type: prize.label.includes('Voucher') ? 'voucher'
           : prize.label.includes('Credit') ? 'credit'
           : prize.label.includes('Lượt') ? 'spin'
           : 'item',
      title: prize.label,
      description: 'Từ vòng quay',
      expiresIn: '3 ngày',
      icon: prize.icon,
      variant: 'gold',
    };

    setRewards(prev => [newReward, ...prev]);

    Alert.alert(
      '🎉 Chúc mừng!',
      `Bạn nhận được: ${prize.icon} ${prize.label}`,
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  return (
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
            <TouchableOpacity onPress={() => setIsFilterOpen(true)} style={styles.filterButton}>
              <Text style={styles.filterIcon}>⚙️</Text>
            </TouchableOpacity>
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
          <Text style={styles.dividerText}>Vòng quay may mắn</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Reward Spin Section */}
        <View style={styles.section}>
          <View style={styles.header}>
            <Text style={styles.rewardTitle}>Vòng Quay May Mắn!</Text>
            <Text style={styles.rewardSubtitle}>Thử vận may sau khi check-in thành công!</Text>
          </View>
          <SpinWheel onSpinEnd={handleRewardSpinEnd} />
        </View>

        {/* Voucher Divider */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#292524',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  filterIcon: {
    fontSize: 18,
  },
  candidatesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#292524',
    marginTop: 16,
    marginBottom: 12,
  },
  candidatesScroll: {
    marginBottom: 16,
  },
  candidateCard: {
    width: 120,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    alignItems: 'center',
  },
  candidateImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#FECDD3',
  },
  candidateName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#292524',
    textAlign: 'center',
  },
  candidateInfo: {
    fontSize: 11,
    color: '#78716C',
    marginTop: 2,
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  quickLink: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#292524',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E7E5E4',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#57534E',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  rewardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#292524',
    textAlign: 'center',
  },
  rewardSubtitle: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 4,
    textAlign: 'center',
  },
  rewardsSection: {
    paddingHorizontal: 16,
  },
});
