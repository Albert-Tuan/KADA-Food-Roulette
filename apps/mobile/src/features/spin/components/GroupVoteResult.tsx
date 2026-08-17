import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown, BounceIn } from 'react-native-reanimated';
import { useGroupSpinStore } from '../../../stores/groupSpinStore';
import { useSpinStore } from '../../../stores/spinStore';
import { CircleAiSuggestion } from './CircleAiSuggestion';
import type { MemberScore } from '../types';

const MOCK_MEMBER_SCORES: MemberScore[] = [
  {
    userId: 'user-1', userName: 'Minh',
    topItem: { name: 'Bún bò đặc biệt', priceVND: 65000, category: 'món chính', tags: ['cay'] },
    matchScore: 0.92,
    reasons: ['Bạn thích món bún bò ✓', 'Trong budget ✓', 'Bạn thích cay 🔥'],
    alternativeItems: [{ name: 'Bún bò gân' }, { name: 'Bún bò giò heo' }],
  },
  {
    userId: 'user-2', userName: 'Lan',
    topItem: { name: 'Bún bò nạm chả', priceVND: 55000, category: 'món chính', tags: [] },
    matchScore: 0.85,
    reasons: ['Lan thích bún nước ✓', 'Vừa phải không quá cay ✓'],
    alternativeItems: [{ name: 'Bún bò tái' }],
  },
];

interface GroupVoteResultProps {
  onCreatePact: () => void;
  onRespin: () => void;
  onDirections: () => void;
}

export function GroupVoteResult({ onCreatePact, onRespin, onDirections }: GroupVoteResultProps) {
  const { members, votes } = useGroupSpinStore();
  const { currentResult, candidates } = useSpinStore();

  const acceptedVotes = Object.values(votes).filter(v => v === 'ACCEPT').length;
  const isAccepted = acceptedVotes > members.length / 2;
  const resultData = currentResult || candidates[0];

  if (!resultData) return null;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <Animated.View entering={BounceIn.delay(200)} style={styles.header}>
        <Text style={styles.headerTitle}>
          {isAccepted ? '🎉 ĐI THÔI!' : '🔄 QUAY LẠI!'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isAccepted ? 'ĐA SỐ CHẤP NHẬN!' : 'CHƯA ĐẠT ĐỒNG THUẬN'}
        </Text>
      </Animated.View>

      {/* Restaurant Card */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.restaurantCard}>
        <Image source={{ uri: resultData.imageUrl }} style={styles.restaurantImage} />
        <View style={styles.imageBadges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>⭐ {resultData.rating}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>📍 {(resultData.distance / 1000).toFixed(1)}km</Text>
          </View>
        </View>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{resultData.name}</Text>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{resultData.category}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{'$'.repeat(resultData.priceLevel)}</Text>
            </View>
          </View>
          <Text style={styles.voteCount}>
            👥 {acceptedVotes}/{members.length} thành viên đã đồng ý
          </Text>
        </View>
      </Animated.View>

      {/* AI Suggestion */}
      <Animated.View entering={FadeInDown.delay(600)}>
        <CircleAiSuggestion memberScores={MOCK_MEMBER_SCORES} />
      </Animated.View>

      {/* Actions */}
      <Animated.View entering={FadeInDown.delay(800)} style={styles.actions}>
        {isAccepted ? (
          <TouchableOpacity onPress={onCreatePact} style={styles.pactButton}>
            <Text style={styles.pactButtonText}>🤝 Tạo Khế Ước</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onRespin} style={styles.respinButton}>
            <Text style={styles.respinButtonText}>🔄 Quay Lại Nhé</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onDirections} style={styles.directionsButton}>
          <Text style={styles.directionsButtonText}>🧭 Chỉ đường</Text>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.footnote}>
        ℹ️ Khế ước sẽ giúp nhóm bạn chắc chắn thực hiện kế hoạch này!
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fff8ef',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#b52330',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#166b47',
  },
  restaurantCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    marginBottom: 16,
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  restaurantImage: {
    width: '100%',
    height: 180,
  },
  imageBadges: {
    position: 'absolute',
    top: 148,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2bebc',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b52330',
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#b52330',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#fff8ef',
    borderWidth: 1,
    borderColor: '#e2bebc',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#8e4e14',
    fontWeight: '700',
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166b47',
  },
  actions: {
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  pactButton: {
    backgroundColor: '#b52330',
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#61000e',
  },
  pactButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  respinButton: {
    backgroundColor: '#b52330',
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#61000e',
  },
  respinButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  directionsButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
  },
  directionsButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#b52330',
  },
  footnote: {
    fontSize: 12,
    color: '#8e4e14',
    textAlign: 'center',
    maxWidth: 280,
    alignSelf: 'center',
    fontWeight: '600',
  },
});
