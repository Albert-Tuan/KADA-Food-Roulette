import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from './Card';

export interface LocketCardData {
  id: string;
  imageUrl: string;
  restaurantName: string;
  restaurantId?: string;
  userName: string;
  userAvatar?: string;
  rating?: number;
  caption?: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isVerifiedGps?: boolean;
}

interface LocketCardProps {
  data: LocketCardData;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export function LocketCard({ data, onLike, onComment, onShare }: LocketCardProps) {
  const router = useRouter();

  return (
    <Card variant="elevated" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {data.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{data.userName}</Text>
            <Text style={styles.timeAgo}>{data.timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onShare}>
          <Text style={styles.moreIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Image */}
      <TouchableOpacity
        onPress={() => data.restaurantId && router.push(`/restaurant/${data.restaurantId}`)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: data.imageUrl }} style={styles.image} />

          {/* Verified GPS Badge */}
          {data.isVerifiedGps && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
              <Text style={styles.verifiedText}>Đã xác minh GPS</Text>
            </View>
          )}

          {/* Rating Badge */}
          {data.rating && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>{data.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {data.restaurantName && (
          <Text style={styles.restaurantName}>{data.restaurantName}</Text>
        )}
        {data.caption && (
          <Text style={styles.caption} numberOfLines={2}>
            {data.caption}
          </Text>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.actionButton} onPress={onLike}>
              <Text style={styles.actionIcon}>❤️</Text>
              <Text style={styles.actionCount}>{data.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onComment}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionCount}>{data.comments}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    overflow: 'hidden',
    padding: 0,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ff5a5f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#ffab69',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#b52330',
  },
  timeAgo: {
    fontSize: 12,
    color: '#5a403f',
    marginTop: 2,
  },
  moreIcon: {
    fontSize: 20,
    color: '#5a403f',
    paddingHorizontal: 8,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffdcc4',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251,243,228,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2bebc',
  },
  verifiedIcon: {
    color: '#b52330',
    fontSize: 13,
    marginRight: 4,
    fontWeight: '800',
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e1b13',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,220,196,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffab69',
  },
  ratingIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8e4e14',
  },
  content: {
    padding: 14,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#b52330',
    marginBottom: 4,
  },
  caption: {
    fontSize: 14,
    color: '#1e1b13',
    marginBottom: 12,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9e2d3',
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5a403f',
  },
});
