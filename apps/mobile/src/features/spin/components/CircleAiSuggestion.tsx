import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MemberScore } from '../types';

interface CircleAiSuggestionProps {
  memberScores: MemberScore[];
}

export function CircleAiSuggestion({ memberScores }: CircleAiSuggestionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🤖</Text>
        <View>
          <Text style={styles.headerTitle}>AI Gợi Ý Cho Nhóm</Text>
          <Text style={styles.headerSubtitle}>Dựa trên khẩu vị của từng người</Text>
        </View>
      </View>

      {memberScores.map(score => (
        <View key={score.userId} style={styles.memberCard}>
          <View style={styles.memberHeader}>
            <Text style={styles.memberName}>{score.userName}</Text>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{Math.round(score.matchScore * 100)}% match</Text>
            </View>
          </View>

          <View style={styles.topItem}>
            <Text style={styles.topItemName}>👉 {score.topItem.name}</Text>
            <Text style={styles.topItemPrice}>
              {(score.topItem.priceVND / 1000).toFixed(0)}k VND
            </Text>
          </View>

          <View style={styles.reasons}>
            {score.reasons.map((reason, i) => (
              <Text key={i} style={styles.reasonText}>• {reason}</Text>
            ))}
          </View>

          {score.alternativeItems.length > 0 && (
            <Text style={styles.alternatives}>
              Hoặc: {score.alternativeItems.map(a => a.name).join(', ')}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#292524',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
  },
  memberCard: {
    backgroundColor: '#FAFAF9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F5F5F4',
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#292524',
  },
  scoreBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  topItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  topItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B52330',
  },
  topItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78716C',
  },
  reasons: {
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12,
    color: '#57534E',
    lineHeight: 18,
  },
  alternatives: {
    fontSize: 12,
    color: '#78716C',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
