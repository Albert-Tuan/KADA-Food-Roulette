import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Linking, Alert } from 'react-native';
import type { Restaurant } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SpinResultCardProps {
  restaurant: Restaurant;
  onSpinAgain: () => void;
  onAccept: () => void;
}

export function SpinResultCard({ restaurant, onSpinAgain, onAccept }: SpinResultCardProps) {
  const handleDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Lỗi', 'Không thể mở bản đồ')
    );
  };

  const handleSave = () => {
    Alert.alert('Đã lưu!', 'Đã lưu vào danh sách xem sau (Locket)!');
  };

  const handleShare = () => {
    Alert.alert('Chia sẻ', 'Đã tạo liên kết chia sẻ!');
  };

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image source={{ uri: restaurant.imageUrl }} style={styles.heroImage} />
        <View style={styles.heroGradient} />

        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>IT'S A MATCH!</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{restaurant.category}</Text>
          </View>
        </View>

        {/* Restaurant Info */}
        <View style={styles.heroInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statText}>⭐ {restaurant.rating} ({restaurant.totalReviews})</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statText}>🚶 {(restaurant.distance / 1000).toFixed(1)}km</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statText}>💰 {'$'.repeat(restaurant.priceLevel)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "Known for their rich, spicy broth and generous portions. A local favorite!"
          </Text>
        </View>

        {/* Primary Actions */}
        <TouchableOpacity onPress={onAccept} style={styles.eatButton}>
          <Text style={styles.eatButtonText}>🍽️ Let's Eat Here!</Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtonRow}>
          <TouchableOpacity onPress={onSpinAgain} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>🔄 Spin Again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDirections} style={styles.directionsButton}>
            <Text style={styles.directionsButtonText}>🧭 Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Social Actions */}
        <View style={styles.socialRow}>
          <TouchableOpacity onPress={handleSave} style={styles.socialButton}>
            <View style={styles.socialIcon}>
              <Text style={styles.socialIconText}>🔖</Text>
            </View>
            <Text style={styles.socialLabel}>Save to Locket</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.socialButton}>
            <View style={styles.socialIcon}>
              <Text style={styles.socialIconText}>📤</Text>
            </View>
            <Text style={styles.socialLabel}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  badgeRow: {
    position: 'absolute',
    bottom: 72,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  matchBadge: {
    backgroundColor: '#B52330',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  categoryBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  restaurantName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    marginTop: -16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFF',
  },
  quoteCard: {
    backgroundColor: '#FAFAF9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#78716C',
    textAlign: 'center',
    lineHeight: 20,
  },
  eatButton: {
    backgroundColor: '#B52330',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#B52330',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  eatButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F5F5F4',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#57534E',
  },
  directionsButton: {
    flex: 1,
    backgroundColor: '#DBEAFE',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  directionsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E7E5E4',
    marginBottom: 20,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  socialButton: {
    alignItems: 'center',
    gap: 8,
  },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAFAF9',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconText: {
    fontSize: 20,
  },
  socialLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78716C',
  },
});
