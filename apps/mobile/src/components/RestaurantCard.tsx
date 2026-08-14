import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export interface RestaurantCardData {
  id: string;
  name: string;
  imageUrl?: string;
  address: string;
  rating: number;
  reviewCount: number;
  category: string;
  distance?: string;
  priceRange?: string;
  isOpen?: boolean;
}

interface RestaurantCardProps {
  data: RestaurantCardData;
  variant?: 'list' | 'grid';
  onPress?: () => void;
}

export function RestaurantCard({ data, variant = 'list', onPress }: RestaurantCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/restaurant/${data.id}`);
    }
  };

  if (variant === 'grid') {
    return (
      <TouchableOpacity style={styles.gridCard} onPress={handlePress} activeOpacity={0.8}>
        <View style={styles.gridImageContainer}>
          <Image
            source={{ uri: data.imageUrl || 'https://picsum.photos/200' }}
            style={styles.gridImage}
          />
          {data.isOpen === false && (
            <View style={styles.closedBadge}>
              <Text style={styles.closedText}>Đóng cửa</Text>
            </View>
          )}
        </View>
        <View style={styles.gridContent}>
          <Text style={styles.gridName} numberOfLines={1}>{data.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.ratingText}>{data.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({data.reviewCount})</Text>
          </View>
          <Text style={styles.category} numberOfLines={1}>{data.category}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.listCard}>
      <TouchableOpacity style={styles.listContainer} onPress={handlePress} activeOpacity={0.8}>
        <Image
          source={{ uri: data.imageUrl || 'https://picsum.photos/200' }}
          style={styles.listImage}
        />
        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <Text style={styles.listName} numberOfLines={1}>{data.name}</Text>
            {data.isOpen === false && (
              <View style={styles.closedBadgeSmall}>
                <Text style={styles.closedTextSmall}>Đóng</Text>
              </View>
            )}
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.ratingText}>{data.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({data.reviewCount})</Text>
            {data.distance && (
              <Text style={styles.distance}>· {data.distance}</Text>
            )}
          </View>

          <Text style={styles.address} numberOfLines={1}>{data.address}</Text>

          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{data.category}</Text>
            </View>
            {data.priceRange && (
              <View style={[styles.tag, styles.priceTag]}>
                <Text style={styles.tagText}>{data.priceRange}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // List variant
  listCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  listContainer: {
    flexDirection: 'row',
    padding: 14,
  },
  listImage: {
    width: 104,
    height: 104,
    borderRadius: 16,
    backgroundColor: '#ffdcc4',
  },
  listContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#b52330',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingIcon: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFC107',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#5a403f',
    marginLeft: 4,
  },
  distance: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8e4e14',
    marginLeft: 6,
  },
  address: {
    fontSize: 13,
    color: '#1e1b13',
    marginTop: 4,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#ffdcc4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffab69',
  },
  priceTag: {
    backgroundColor: '#ffdad8',
    borderColor: '#e2bebc',
  },
  tagText: {
    fontSize: 11,
    color: '#8e4e14',
    fontWeight: '800',
  },
  closedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(181,35,48,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  closedBadgeSmall: {
    backgroundColor: '#ffdad6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  closedText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  closedTextSmall: {
    color: '#b52330',
    fontSize: 11,
    fontWeight: '800',
  },

  // Grid variant
  gridCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  gridImageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#ffdcc4',
  },
  gridContent: {
    padding: 12,
  },
  gridName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#b52330',
    marginTop: 4,
  },
  category: {
    fontSize: 12,
    color: '#5a403f',
    marginTop: 3,
    marginBottom: 6,
  },
});
