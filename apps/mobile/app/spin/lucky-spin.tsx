import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SpinWheel } from '../../src/components/SpinWheel';

interface PrizeSegment {
  label: string;
  color: string;
  icon: string;
}

export default function LuckySpinScreen() {
  const router = useRouter();
  const [wonPrize, setWonPrize] = useState<PrizeSegment | null>(null);

  const handleSpinEnd = useCallback((prize: PrizeSegment) => {
    setWonPrize(prize);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>✅ CHECK-IN XÁC THỰC</Text>
          <Text style={styles.title}>🎡 Vòng Quay May Mắn</Text>
          <Text style={styles.subtitle}>
            Thử vận may của bạn để nhận Voucher giảm giá, nước uống miễn phí hoặc lượt quay thưởng!
          </Text>
        </View>

        {/* Spin Wheel */}
        <View style={styles.wheelWrapper}>
          <SpinWheel onSpinEnd={handleSpinEnd} />
        </View>

        {/* Won Prize Banner if available */}
        {wonPrize && (
          <View style={styles.prizeCard}>
            <Text style={styles.prizeEmoji}>{wonPrize.icon}</Text>
            <View>
              <Text style={styles.prizeTitle}>Đã nhận: {wonPrize.label}</Text>
              <Text style={styles.prizeSubtitle}>Đã được lưu vào ví Voucher của bạn</Text>
            </View>
          </View>
        )}

        {/* View Rewards CTA */}
        <TouchableOpacity
          style={styles.rewardsBtn}
          onPress={() => router.push('/spin/rewards')}
        >
          <Text style={styles.rewardsBtnText}>🎟️ Mở Danh Sách Voucher Của Bạn</Text>
        </TouchableOpacity>
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
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 12,
  },
  badge: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#292524',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
    lineHeight: 20,
  },
  wheelWrapper: {
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prizeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    marginVertical: 12,
  },
  prizeEmoji: {
    fontSize: 32,
  },
  prizeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B45309',
  },
  prizeSubtitle: {
    fontSize: 12,
    color: '#78716C',
  },
  rewardsBtn: {
    backgroundColor: '#3D2314',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  rewardsBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
