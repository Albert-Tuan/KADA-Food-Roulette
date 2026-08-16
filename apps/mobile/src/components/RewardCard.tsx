import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface RewardCardData {
  id: string;
  type: 'voucher' | 'credit' | 'item' | 'spin';
  title: string;
  description: string;
  expiresIn?: string;
  icon: string;
  variant?: 'gold' | 'green' | 'blue' | 'red';
}

interface RewardCardProps {
  data: RewardCardData;
  onPress?: () => void;
}

const variantColors = {
  gold: { bg: '#ffdcc4', border: '#ffab69', icon: '#b52330' },
  green: { bg: '#a3f4c5', border: '#166b47', icon: '#00341f' },
  blue: { bg: '#ffdad8', border: '#b52330', icon: '#61000e' },
  red: { bg: '#ffdad6', border: '#b52330', icon: '#93000a' },
};

export function RewardCard({ data, onPress }: RewardCardProps) {
  const colors = variantColors[data.variant || 'gold'];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Text style={styles.icon}>{data.icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{data.title}</Text>
        {data.description && (
          <Text style={styles.description} numberOfLines={1}>{data.description}</Text>
        )}
      </View>

      {data.expiresIn && (
        <View style={styles.expiryContainer}>
          <Text style={styles.expiryLabel}>HSD</Text>
          <Text style={styles.expiryValue}>{data.expiresIn}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function RewardCardEmpty() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎁</Text>
      <Text style={styles.emptyText}>Quay vòng quay để nhận thêm ưu đãi cực hot!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#b52330',
  },
  description: {
    fontSize: 13,
    color: '#5a403f',
    marginTop: 2,
  },
  expiryContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffdad8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2bebc',
  },
  expiryLabel: {
    fontSize: 10,
    color: '#b52330',
    fontWeight: '800',
  },
  expiryValue: {
    fontSize: 12,
    color: '#61000e',
    fontWeight: '900',
  },
  emptyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fbf3e4',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b52330',
  },
});
