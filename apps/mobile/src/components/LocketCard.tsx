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

          <TouchableOpacity
            style={styles.spinButton}
            onPress={() => data.restaurantId && router.push(`/restaurant/${data.restaurantId}`)}
          >
            <Text style={styles.spinButtonText}>🎲 Muốn ăn thử!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    overflow: 'hidden',
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#292524',
  },
  timeAgo: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
  },
  moreIcon: {
    fontSize: 20,
    color: '#78716C',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E7E5E4',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verifiedIcon: {
    color: '#059669',
    fontSize: 12,
    marginRight: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#292524',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#292524',
  },
  content: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#292524',
    marginBottom: 4,
  },
  caption: {
    fontSize: 14,
    color: '#57534E',
    marginBottom: 12,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E7E5E4',
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
    color: '#78716C',
  },
  spinButton: {
    backgroundColor: '#D97706',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#92400E',
  },
  spinButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
});
