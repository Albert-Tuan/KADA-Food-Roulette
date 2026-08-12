import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_RECENT_LOCKETS = [
  { id: '1', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200', restaurant: 'Phở Thìn' },
  { id: '2', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200', restaurant: 'Mì Cay' },
];

const MOCK_NEARBY_RESTAURANTS = [
  { id: '1', name: 'Phở Bò Hai', rating: 4.5, distance: '0.5km', category: 'Phở' },
  { id: '2', name: 'Bún Bò Huế', rating: 4.3, distance: '0.8km', category: 'Bún' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào! 👋</Text>
            <Text style={styles.subGreeting}>Hôm nay ăn gì nhỉ?</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications' as any)}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <Link href="/(tabs)/spin" asChild>
          <TouchableOpacity style={styles.heroCard} activeOpacity={0.9}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>🎡 Quay ngay!</Text>
              <Text style={styles.heroSubtitle}>Để vòng quyết định giúp bạn</Text>
              <View style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Bắt đầu quay</Text>
                <Text style={styles.heroButtonIcon}>→</Text>
              </View>
            </View>
            <Text style={styles.heroEmoji}>🍜</Text>
          </TouchableOpacity>
        </Link>

        {/* Quick Filters */}
        <View style={styles.quickFilters}>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterIcon}>📍</Text>
            <Text style={styles.filterText}>Gần tôi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterIcon}>💰</Text>
            <Text style={styles.filterText}>Dưới 100k</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterIcon}>⭐</Text>
            <Text style={styles.filterText}>4.5+ sao</Text>
          </TouchableOpacity>
        </View>

        {/* Group Spin CTA */}
        <Link href="/group-spin/lobby" asChild>
          <TouchableOpacity style={styles.groupCard}>
            <View style={styles.groupIcon}>
              <Text style={styles.groupIconText}>👥</Text>
            </View>
            <View style={styles.groupContent}>
              <Text style={styles.groupTitle}>Nhóm quay</Text>
              <Text style={styles.groupSubtitle}>Quay cùng bạn bè, tối đa 20 người</Text>
            </View>
            <Text style={styles.groupArrow}>→</Text>
          </TouchableOpacity>
        </Link>

        {/* Menu Scanner CTA */}
        <Link href="/spin/menu-capture" asChild>
          <TouchableOpacity style={styles.scannerCard}>
            <View style={styles.scannerIcon}>
              <Text style={styles.groupIconText}>📷</Text>
            </View>
            <View style={styles.groupContent}>
              <Text style={styles.groupTitle}>Quét Menu bằng AI</Text>
              <Text style={styles.groupSubtitle}>Chụp ảnh menu, AI sẽ tự động tạo vòng quay</Text>
            </View>
            <Text style={styles.groupArrow}>→</Text>
          </TouchableOpacity>
        </Link>

        {/* Recent Taste Boards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📸 Taste Board gần đây</Text>
            <Link href="/(tabs)/lockets">
              <Text style={styles.sectionLink}>Xem tất cả</Text>
            </Link>
          </View>

          {MOCK_RECENT_LOCKETS.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.locketList}
            >
              {MOCK_RECENT_LOCKETS.map((locket) => (
                <TouchableOpacity key={locket.id} style={styles.locketItem}>
                  <Image source={{ uri: locket.image }} style={styles.locketImage} />
                  <Text style={styles.locketRestaurant} numberOfLines={1}>
                    {locket.restaurant}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📷</Text>
              <Text style={styles.emptyText}>Chưa có Taste Board nào</Text>
              <Link href="/locket/capture" asChild>
                <TouchableOpacity style={styles.emptyButton}>
                  <Text style={styles.emptyButtonText}>Chụp Taste Board</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </View>

        {/* Nearby Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 Quán gần bạn</Text>
            <Link href={'/restaurants' as any}>
              <Text style={styles.sectionLink}>Xem tất cả</Text>
            </Link>
          </View>

          <View style={styles.restaurantList}>
            {MOCK_NEARBY_RESTAURANTS.map((restaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.restaurantCard}
                onPress={() => router.push(`/restaurant/${restaurant.id}`)}
              >
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <View style={styles.restaurantMeta}>
                    <Text style={styles.restaurantRating}>⭐ {restaurant.rating}</Text>
                    <Text style={styles.restaurantDot}>·</Text>
                    <Text style={styles.restaurantDistance}>{restaurant.distance}</Text>
                    <Text style={styles.restaurantDot}>·</Text>
                    <Text style={styles.restaurantCategory}>{restaurant.category}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.spinButton}>
                  <Text style={styles.spinButtonText}>🎲</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rewards Banner */}
        <TouchableOpacity style={styles.rewardsBanner}>
          <View style={styles.rewardsContent}>
            <Text style={styles.rewardsTitle}>🏆 Season Rewards</Text>
            <Text style={styles.rewardsSubtitle}>Đạt streak 7 ngày để nhận voucher!</Text>
          </View>
          <View style={styles.rewardsProgress}>
            <View style={styles.rewardsProgressBar}>
              <View style={[styles.rewardsProgressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.rewardsProgressText}>4/7 ngày</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#292524',
  },
  subGreeting: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationIcon: {
    fontSize: 20,
  },
  heroCard: {
    marginHorizontal: 20,
    backgroundColor: '#D97706',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#D97706',
    fontWeight: '600',
    fontSize: 14,
  },
  heroButtonIcon: {
    color: '#D97706',
    fontWeight: '700',
    marginLeft: 8,
  },
  heroEmoji: {
    fontSize: 56,
    marginLeft: 12,
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterText: {
    fontSize: 13,
    color: '#57534E',
    fontWeight: '500',
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FEF3C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  groupIconText: {
    fontSize: 24,
  },
  scannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FDE68A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  groupContent: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#292524',
  },
  groupSubtitle: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 2,
  },
  groupArrow: {
    fontSize: 20,
    color: '#D97706',
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#292524',
  },
  sectionLink: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: '500',
  },
  locketList: {
    paddingRight: 20,
  },
  locketItem: {
    width: 120,
    marginRight: 12,
  },
  locketImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#E7E5E4',
  },
  locketRestaurant: {
    fontSize: 13,
    color: '#57534E',
    marginTop: 6,
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E7E5E4',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#78716C',
  },
  emptyButton: {
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#D97706',
    fontWeight: '600',
    fontSize: 14,
  },
  restaurantList: {
    gap: 12,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#292524',
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  restaurantRating: {
    fontSize: 13,
    color: '#292524',
    fontWeight: '500',
  },
  restaurantDot: {
    fontSize: 13,
    color: '#A8A29E',
    marginHorizontal: 6,
  },
  restaurantDistance: {
    fontSize: 13,
    color: '#78716C',
  },
  restaurantCategory: {
    fontSize: 13,
    color: '#78716C',
  },
  spinButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinButtonText: {
    fontSize: 18,
  },
  rewardsBanner: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#059669',
    borderRadius: 16,
    padding: 16,
  },
  rewardsContent: {
    marginBottom: 12,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  rewardsSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  rewardsProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardsProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
  rewardsProgressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  rewardsProgressText: {
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
  },
});
