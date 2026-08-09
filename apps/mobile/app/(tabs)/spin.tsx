import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SpinWheel } from '../../src/components/SpinWheel';
import { RewardCard, RewardCardEmpty } from '../../src/components/RewardCard';
import { Button } from '../../src/components/Button';

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
  const [spun, setSpun] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>(MOCK_REWARDS);

  const handleSpinEnd = useCallback((prize: PrizeSegment) => {
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
    
    setRewards([newReward, ...rewards]);
    
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vòng Quay May Mắn!</Text>
          <Text style={styles.subtitle}>Thử vận may sau khi check-in thành công!</Text>
        </View>

        {/* Spin Wheel */}
        <SpinWheel onSpinEnd={handleSpinEnd} />

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

        {/* How it works */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Cách thức</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>1</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoHeading}>Check-in tại quán</Text>
              <Text style={styles.infoText}>Xác nhận bạn đã đến quán ăn</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>2</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoHeading}>Quay vòng may mắn</Text>
              <Text style={styles.infoText}>Nhận voucher hoặc phần thưởng hấp dẫn</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>3</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoHeading}>Sử dụng ngay</Text>
              <Text style={styles.infoText}>Áp dụng voucher khi thanh toán</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#292524',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 8,
    textAlign: 'center',
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
  rewardsSection: {
    paddingHorizontal: 16,
  },
  infoSection: {
    marginTop: 32,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D97706',
    color: 'white',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78350F',
  },
  infoText: {
    fontSize: 13,
    color: '#92400E',
    marginTop: 2,
  },
});
