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
  gold: { bg: '#FEF3C7', border: '#F59E0B', icon: '#92400E' },
  green: { bg: '#D1FAE5', border: '#10B981', icon: '#065F46' },
  blue: { bg: '#DBEAFE', border: '#3B82F6', icon: '#1E40AF' },
  red: { bg: '#FEE2E2', border: '#EF4444', icon: '#991B1B' },
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
      <Text style={styles.emptyIcon}>⏳</Text>
      <Text style={styles.emptyText}>Quay để nhận thêm</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#292524',
  },
  description: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 2,
  },
  expiryContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  expiryLabel: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '500',
  },
  expiryValue: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '700',
  },
  emptyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 13,
    color: '#78716C',
  },
});
