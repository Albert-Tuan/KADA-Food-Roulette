import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, BounceIn } from 'react-native-reanimated';

export default function PersonalRewardsScreen() {
  const router = useRouter();

  const rewards = [
    { icon: '🪙', label: 'Check-in Bonus', amount: '+500 coins', color: '#FFC107' },
    { icon: '📸', label: 'Locket Photo Bonus', amount: '+200 coins', color: '#55A37A' },
    { icon: '🎟️', label: 'Voucher may mắn', amount: 'Giảm 10% / Free Drink', color: '#B52330' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Celebration Header */}
        <Animated.View entering={BounceIn.delay(200)} style={styles.header}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.title}>CHECK-IN THÀNH CÔNG!</Text>
          <Text style={styles.subtitle}>Bạn đã nhận được quà thưởng và voucher!</Text>
        </Animated.View>

        {/* Total Coins */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.totalCard}>
          <Text style={styles.totalLabel}>Tổng phần thưởng tích lũy</Text>
          <Text style={styles.totalAmount}>🪙 700 + 🎟️ 1 Voucher</Text>
        </Animated.View>

        {/* Breakdown */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>Chi tiết phần thưởng</Text>
          {rewards.map((reward, i) => (
            <View key={i} style={styles.rewardRow}>
              <View style={styles.rewardLeft}>
                <Text style={styles.rewardIcon}>{reward.icon}</Text>
                <Text style={styles.rewardLabel}>{reward.label}</Text>
              </View>
              <Text style={[styles.rewardAmount, { color: reward.color }]}>
                {reward.amount}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.actions}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/spin')}
            style={styles.spinButton}
          >
            <Text style={styles.spinButtonText}>🎟️ Xem Ví Voucher của tôi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={styles.homeButton}
          >
            <Text style={styles.homeButtonText}>🏡 Về Trang Chủ</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 20,
  },
  celebrationEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#B52330',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 6,
    textAlign: 'center',
  },
  totalCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78716C',
    marginBottom: 6,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#D97706',
  },
  breakdownSection: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  rewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rewardIcon: {
    fontSize: 20,
  },
  rewardLabel: {
    fontSize: 14,
    color: '#57534E',
  },
  rewardAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  homeButton: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E7E5E4',
  },
  homeButtonText: {
    color: '#57534E',
    fontSize: 16,
    fontWeight: '700',
  },
  spinButton: {
    backgroundColor: '#B52330',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  spinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
