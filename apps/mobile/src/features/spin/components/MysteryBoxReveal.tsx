import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

interface MysteryBoxRevealProps {
  rewardTitle: string;
  rewardDescription: string;
  rewardImageUrl?: string;
  discount?: string;
  onClaim: () => void;
  onShare: () => void;
  onDismiss: () => void;
}

export function MysteryBoxReveal({
  rewardTitle,
  rewardDescription,
  rewardImageUrl,
  discount = '50% OFF',
  onClaim,
  onShare,
  onDismiss,
}: MysteryBoxRevealProps) {
  return (
    <View style={styles.container}>
      {/* Background decorations */}
      <Animated.Text
        entering={FadeIn.delay(200).duration(800)}
        style={[styles.sparkle, { top: '15%', left: '10%' }]}
      >
        ✨
      </Animated.Text>
      <Animated.Text
        entering={FadeIn.delay(500).duration(800)}
        style={[styles.sparkle, { top: '20%', right: '15%' }]}
      >
        ✨
      </Animated.Text>
      <Animated.Text
        entering={FadeIn.delay(300).duration(800)}
        style={[styles.sparkle, { bottom: '35%', left: '20%' }]}
      >
        ✨
      </Animated.Text>

      {/* Box graphic */}
      <Animated.View
        entering={FadeInDown.springify().damping(12).delay(100)}
        style={styles.boxContainer}
      >
        <Text style={styles.boxEmoji}>🎁</Text>
      </Animated.View>

      {/* Headline */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(600)}
        style={styles.headlineContainer}
      >
        <Text style={styles.headlineLabel}>PHẦN THƯỞNG CỦA BẠN</Text>
        <Text style={styles.headlineTitle}>BẠN ĐÃ NHẬN ĐƯỢC...</Text>
      </Animated.View>

      {/* Reward Card */}
      <Animated.View
        entering={FadeInDown.delay(600).duration(600)}
        style={styles.rewardCard}
      >
        {rewardImageUrl && (
          <View style={styles.rewardImageContainer}>
            <Image source={{ uri: rewardImageUrl }} style={styles.rewardImage} />
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}</Text>
            </View>
          </View>
        )}
        <Text style={styles.rewardTitle}>{rewardTitle}</Text>
        <Text style={styles.rewardDescription}>✅ {rewardDescription}</Text>
      </Animated.View>

      {/* Actions */}
      <Animated.View
        entering={FadeInDown.delay(900).duration(600)}
        style={styles.actions}
      >
        <TouchableOpacity onPress={onClaim} style={styles.claimButton}>
          <Text style={styles.claimButtonText}>🎁 NHẬN NGAY</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onShare} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>📤 Chia sẻ kết quả</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDismiss}>
          <Text style={styles.dismissText}>Quay lại Khu Vườn</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 32,
  },
  boxContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  boxEmoji: {
    fontSize: 100,
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headlineLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#55A37A',
    letterSpacing: 2,
    marginBottom: 8,
  },
  headlineTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#B52330',
    textAlign: 'center',
  },
  rewardCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    padding: 16,
    marginBottom: 24,
    shadowColor: '#B52330',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  rewardImageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  rewardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  discountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B52330',
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#292524',
    textAlign: 'center',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  claimButton: {
    width: '100%',
    backgroundColor: '#B52330',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#B52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  claimButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  shareButton: {
    width: '100%',
    backgroundColor: '#F5F5F4',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  shareButtonText: {
    color: '#B52330',
    fontSize: 15,
    fontWeight: '600',
  },
  dismissText: {
    color: '#78716C',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 8,
  },
});
