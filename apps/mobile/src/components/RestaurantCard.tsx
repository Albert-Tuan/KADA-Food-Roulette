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
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  listContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  listImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E7E5E4',
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#292524',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingIcon: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#292524',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#78716C',
    marginLeft: 2,
  },
  distance: {
    fontSize: 12,
    color: '#78716C',
    marginLeft: 4,
  },
  address: {
    fontSize: 13,
    color: '#57534E',
    marginTop: 4,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceTag: {
    backgroundColor: '#D1FAE5',
  },
  tagText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '500',
  },
  closedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  closedBadgeSmall: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  closedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  closedTextSmall: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Grid variant
  gridCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  gridImageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E7E5E4',
  },
  gridContent: {
    padding: 8,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#292524',
    marginTop: 8,
  },
  category: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
    marginBottom: 8,
  },
});
