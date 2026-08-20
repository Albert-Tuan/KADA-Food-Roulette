import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SpinWheel } from '../../src/components/SpinWheel';
import { useSpinStore } from '../../src/stores/spinStore';

interface PrizeSegment {
  label: string;
  color: string;
  icon: string;
}

export default function LuckySpinScreen() {
  const router = useRouter();
  const { luckySpinCount, consumeLuckySpin, currentResult, isCheckedIn } = useSpinStore();
  const [wonPrize, setWonPrize] = useState<PrizeSegment | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const canCheckIn = currentResult ? !isCheckedIn(currentResult.id) : false;

  const handleCheckInCta = () => {
    if (canCheckIn) {
      router.push({
        pathname: '/locket/capture',
        params: {
          restaurantId: currentResult?.id,
          restaurantName: currentResult?.name,
          returnTo: 'spin-check-in',
        },
      });
    } else {
      router.replace('/(tabs)/spin');
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSpinStart = useCallback(() => {
    setIsSpinning(true);
    consumeLuckySpin();
  }, [consumeLuckySpin]);

  const handleSpinEnd = useCallback((prize: PrizeSegment) => {
    setIsSpinning(false);
    setWonPrize(prize);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={24} color="#b52330" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vòng Quay May Mắn</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Section */}
        <View style={styles.bannerCard}>
          <View style={styles.badgeRow}>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>✅ CHECK-IN XÁC THỰC</Text>
            </View>
            <View style={[styles.spinsCountBadge, luckySpinCount <= 0 && styles.spinsCountBadgeEmpty]}>
              <Text style={[styles.spinsCountText, luckySpinCount <= 0 && styles.spinsCountTextEmpty]}>
                {luckySpinCount > 0 ? `🎟️ Còn ${luckySpinCount} lượt quay` : '⚠️ Hết lượt quay'}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>Vòng Quay May Mắn</Text>
          <Text style={styles.subtitle}>
            Mỗi lần check-in món ăn tại quán thành công, bạn sẽ nhận được đúng 1 lượt quay thưởng!
          </Text>
        </View>

        {/* Spin Wheel Card Wrapper */}
        <View style={styles.wheelCard}>
          <SpinWheel
            onSpinStart={handleSpinStart}
            onSpinEnd={handleSpinEnd}
            disabled={luckySpinCount <= 0 || isSpinning}
            buttonTitle="QUAY THƯỞNG!"
            spinningTitle="Đang quay thưởng..."
            resultPrefixLabel="Voucher nhận được:"
          />
        </View>

        {/* Out of spins warning banner */}
        {(luckySpinCount <= 0 && !isSpinning) && (
          <View style={styles.noSpinsCard}>
            <Text style={styles.noSpinsTitle}>Bạn đã dùng hết lượt quay</Text>
            <Text style={styles.noSpinsSubtitle}>
              {canCheckIn
                ? 'Hãy check-in thêm món ăn tại quán để tích lũy lượt quay mới!'
                : 'Hãy quay vòng mới để khám phá quán khác và nhận lượt quay!'}
            </Text>
            <TouchableOpacity
              style={styles.checkInCtaBtn}
              activeOpacity={0.88}
              onPress={handleCheckInCta}
            >
              <Text style={styles.checkInCtaBtnText}>
                {canCheckIn ? 'Check-in món để nhận lượt' : 'Quay quán mới'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Won Prize Banner */}
        {wonPrize && (
          <View style={styles.prizeCard}>
            <Text style={styles.prizeEmoji}>{wonPrize.icon}</Text>
            <View style={styles.prizeTextCol}>
              <Text style={styles.prizeTitle}>ĐÃ NHẬN: {wonPrize.label.toUpperCase()}</Text>
              <Text style={styles.prizeSubtitle}>Voucher đã tự động lưu vào ví thưởng của bạn!</Text>
            </View>
          </View>
        )}

        {/* View Rewards CTA */}
        <TouchableOpacity
          style={styles.rewardsBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/spin/rewards')}
        >
          <Text style={styles.rewardsBtnText}>Danh sách voucher của bạn</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8ef',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#e2bebc',
    backgroundColor: '#fff8ef',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#b52330',
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 40,
  },
  bannerCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    marginBottom: 16,
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#166b47',
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#166b47',
    letterSpacing: 0.5,
  },
  spinsCountBadge: {
    backgroundColor: '#ffdcc4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffab69',
  },
  spinsCountBadgeEmpty: {
    backgroundColor: '#ffdad8',
    borderColor: '#ff5a5f',
  },
  spinsCountText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#8e4e14',
  },
  spinsCountTextEmpty: {
    color: '#b52330',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#b52330',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#8e4e14',
    textAlign: 'center',
    lineHeight: 19,
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  wheelCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    marginBottom: 16,
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  noSpinsCard: {
    width: '100%',
    backgroundColor: '#ffdad8',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ff5a5f',
    marginBottom: 16,
  },
  noSpinsTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#b52330',
    marginBottom: 4,
  },
  noSpinsSubtitle: {
    fontSize: 12.5,
    color: '#8e4e14',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 12,
  },
  checkInCtaBtn: {
    backgroundColor: '#b52330',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#61000e',
  },
  checkInCtaBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  prizeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffdad8',
    borderWidth: 1.5,
    borderColor: '#ff5a5f',
    borderRadius: 18,
    padding: 14,
    width: '100%',
    marginBottom: 16,
  },
  prizeEmoji: {
    fontSize: 34,
  },
  prizeTextCol: {
    flex: 1,
  },
  prizeTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#b52330',
  },
  prizeSubtitle: {
    fontSize: 12,
    color: '#8e4e14',
    fontWeight: '600',
    marginTop: 2,
  },
  rewardsBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  rewardsBtnText: {
    color: '#8e4e14',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
