import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useGroupSpinStore } from '../../../stores/groupSpinStore';
import { useSpinStore } from '../../../stores/spinStore';
import type { VoteDecision } from '../types';

interface GroupVoteVetoProps {
  onVote: (decision: 'ACCEPT' | 'RESPIN' | 'VETO') => void;
}

export function GroupVoteVeto({ onVote }: GroupVoteVetoProps) {
  const [timeLeft, setTimeLeft] = useState(9 * 60 + 42);
  const { members, votes, hostId } = useGroupSpinStore();
  const { currentResult, candidates } = useSpinStore();

  const resultData = currentResult || candidates[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!resultData) return null;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Timer */}
        <View style={styles.timerBar}>
          <Text style={styles.timerIcon}>⏱️</Text>
          <Text style={styles.timerText}>
            Tự động khóa trong <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
          </Text>
        </View>

        {/* Result Card */}
        <View style={styles.resultCard}>
          <Image source={{ uri: resultData.imageUrl }} style={styles.resultImage} />
          <View style={styles.resultBadges}>
            <View style={styles.ratingBadge}>
              <Text style={styles.badgeText}>⭐ {resultData.rating}</Text>
            </View>
            <View style={styles.distanceBadge}>
              <Text style={styles.badgeText}>📍 {(resultData.distance / 1000).toFixed(1)} km</Text>
            </View>
          </View>
          <View style={styles.resultInfo}>
            <Text style={styles.resultName}>{resultData.name}</Text>
            <Text style={styles.resultCategory}>
              🏪 {resultData.category} • {'$'.repeat(resultData.priceLevel)}
            </Text>
          </View>
        </View>

        {/* Voting Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>VOTING PROGRESS</Text>
            <Text style={styles.progressCount}>
              {Object.keys(votes).length}/{members.length} Voted
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {
              width: `${(Object.keys(votes).length / members.length) * 100}%`
            }]} />
          </View>
          <Text style={styles.progressHint}>
            Cần &gt;50% ({Math.ceil(members.length / 2)} người) chấp nhận để chốt đơn
          </Text>
        </View>

        {/* Members */}
        <View style={styles.membersSection}>
          <Text style={styles.membersLabel}>SQUAD STATUS</Text>
          {members.map(member => {
            const hasVoted = votes[member.id] !== undefined;
            const decision = votes[member.id];

            return (
              <View key={member.id} style={[
                styles.memberRow,
                decision === 'ACCEPT' && styles.memberRowAccept,
              ]}>
                <View style={[
                  styles.memberIndicator,
                  decision === 'ACCEPT' && styles.indicatorAccept,
                  decision === 'RESPIN' && styles.indicatorRespin,
                ]} />
                <Image source={{ uri: member.avatarUrl }} style={styles.memberAvatar} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>
                    {member.name} {member.id === hostId && '(You)'}
                  </Text>
                  <Text style={[
                    styles.memberStatus,
                    decision === 'ACCEPT' && styles.statusAccept,
                    decision === 'RESPIN' && styles.statusRespin,
                  ]}>
                    {decision === 'ACCEPT' && '✅ Chấp nhận'}
                    {decision === 'RESPIN' && '❌ Quay lại'}
                    {!hasVoted && '⏳ Chưa vote'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Veto tokens */}
        <View style={styles.vetoTokens}>
          <Text style={styles.vetoLabel}>Veto Tokens:</Text>
          <Text style={styles.vetoIcons}>❌ ❌ ❌</Text>
          <Text style={styles.vetoCount}>3/3</Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => onVote('RESPIN')} style={styles.respinButton}>
            <Text style={styles.respinText}>🔄 QUAY LẠI</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onVote('ACCEPT')} style={styles.acceptButton}>
            <Text style={styles.acceptText}>✅ CHẤP NHẬN</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => onVote('VETO')} style={styles.vetoButton}>
          <Text style={styles.vetoButtonText}>🚫 DÙNG VETO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 180,
  },
  timerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: 'rgba(186,26,26,0.3)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  timerIcon: {
    fontSize: 16,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
  },
  timerValue: {
    fontWeight: '800',
    color: '#DC2626',
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  resultImage: {
    width: '100%',
    height: 130,
  },
  resultBadges: {
    position: 'absolute',
    top: 98,
    left: 8,
    flexDirection: 'row',
    gap: 6,
  },
  ratingBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#292524',
  },
  resultInfo: {
    padding: 14,
  },
  resultName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 4,
  },
  resultCategory: {
    fontSize: 13,
    color: '#78716C',
  },
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78716C',
    letterSpacing: 1,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B52330',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F5F5F4',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#B52330',
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 12,
    color: '#78716C',
    textAlign: 'center',
    marginTop: 6,
  },
  membersSection: {
    marginTop: 16,
  },
  membersLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78716C',
    letterSpacing: 1,
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginBottom: 8,
    overflow: 'hidden',
  },
  memberRowAccept: {
    borderColor: 'rgba(22,163,74,0.2)',
  },
  memberIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#F5F5F4',
  },
  indicatorAccept: {
    backgroundColor: '#16A34A',
  },
  indicatorRespin: {
    backgroundColor: '#DC2626',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginLeft: 8,
  },
  memberInfo: {
    marginLeft: 12,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#292524',
  },
  memberStatus: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
  },
  statusAccept: {
    color: '#16A34A',
  },
  statusRespin: {
    color: '#DC2626',
  },
  vetoTokens: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  vetoLabel: {
    fontSize: 13,
    color: '#78716C',
  },
  vetoIcons: {
    fontSize: 14,
  },
  vetoCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#292524',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1,
    borderTopColor: '#E7E5E4',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 34,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  respinButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  respinText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#292524',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#B52330',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  vetoButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(186,26,26,0.2)',
  },
  vetoButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
  },
});
