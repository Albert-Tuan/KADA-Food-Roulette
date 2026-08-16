import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';

const MOCK_RECENT_LOCKETS = [
  { id: '1', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200', restaurant: 'Phở Thìn', rating: 4.8 },
  { id: '2', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200', restaurant: 'Mì Cay Sasin', rating: 4.6 },
  { id: '3', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200', restaurant: 'Cơm Tấm Ba Ghiền', rating: 4.9 },
];

const MOCK_NEARBY_RESTAURANTS = [
  { id: '1', name: 'Phở Bò Hai Cụ', rating: 4.8, distance: '0.5km', category: 'Phở Bò' },
  { id: '2', name: 'Bún Bò Huế Chay', rating: 4.6, distance: '0.8km', category: 'Bún Bò' },
  { id: '3', name: 'Gyu-Kaku Japanese BBQ', rating: 4.9, distance: '1.2km', category: 'Lẩu Nướng' },
];

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào! 👋</Text>
            <Text style={styles.subGreeting}>Hôm nay bạn muốn ăn gì nhỉ?</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications' as any)}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* 2. CHỦ ĐẠO CHÍNH: Hero Card (Personal Spin) */}
        <TouchableOpacity
          style={styles.heroCard}
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/spin')}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroTag}>
              <Text style={styles.heroTagText}>⚡ CHỨC NĂNG CHÍNH</Text>
            </View>
            <Text style={styles.heroTitle}>Quay Quán Ngẫu Nhiên</Text>
            <Text style={styles.heroSubtitle}>Đỡ phải suy nghĩ! Để vòng xoay chọn 1 quán ngon giúp bạn.</Text>
            <View style={styles.heroButton}>
              <Text style={styles.heroButtonText}>BẮT ĐẦU QUAY 🎰</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. CHỨC NĂNG PHỤ: Clean 4 Quick Tools Row */}
        <View style={styles.quickToolsContainer}>
          <Text style={styles.sectionTitle}>Công cụ hỗ trợ</Text>
          <View style={styles.quickToolsRow}>
            {/* Tool 1: AI Menu */}
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/spin/menu-capture')}
              activeOpacity={0.8}
            >
              <View style={[styles.toolIconBg, { backgroundColor: '#ffdad8', borderColor: '#ff5a5f' }]}>
                <Text style={styles.toolIcon}>📷</Text>
              </View>
              <Text style={styles.toolTitle}>Quét Menu AI</Text>
            </TouchableOpacity>

            {/* Tool 2: Group Spin */}
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/group-spin/lobby')}
              activeOpacity={0.8}
            >
              <View style={[styles.toolIconBg, { backgroundColor: '#ffdcc4', borderColor: '#ffab69' }]}>
                <Text style={styles.toolIcon}>👥</Text>
              </View>
              <Text style={styles.toolTitle}>Quay Nhóm</Text>
            </TouchableOpacity>

            {/* Tool 3: AI Voice */}
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/(tabs)/spin')}
              activeOpacity={0.8}
            >
              <View style={[styles.toolIconBg, { backgroundColor: '#fbf3e4', borderColor: '#166b47' }]}>
                <Text style={styles.toolIcon}>🎙️</Text>
              </View>
              <Text style={styles.toolTitle}>AI Voice</Text>
            </TouchableOpacity>

            {/* Tool 4: Foodie Map */}
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/discover')}
              activeOpacity={0.8}
            >
              <View style={[styles.toolIconBg, { backgroundColor: '#ffdcc4', borderColor: '#e2bebc' }]}>
                <Text style={styles.toolIcon}>🗺️</Text>
              </View>
              <Text style={styles.toolTitle}>Bản Đồ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Quick Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity style={styles.filterChipActive}>
            <Text style={styles.filterTextActive}>📍 Gần tôi (&lt;2km)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>💰 Dưới 100k</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>⭐ 4.5+ sao</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>🍜 Phở & Bún</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>🧋 Trà Sữa</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 5. Taste Board Live Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📸 Taste Board Bạn Bè</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/lockets')}>
              <Text style={styles.sectionLink}>Xem tất cả ➔</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.locketList}
          >
            {MOCK_RECENT_LOCKETS.map((locket) => (
              <TouchableOpacity
                key={locket.id}
                style={styles.locketCard}
                onPress={() => router.push('/(tabs)/lockets')}
                activeOpacity={0.88}
              >
                <Image source={{ uri: locket.image }} style={styles.locketImage} />
                <View style={styles.locketRatingBadge}>
                  <Text style={styles.locketRatingText}>⭐ {locket.rating}</Text>
                </View>
                <Text style={styles.locketName} numberOfLines={1}>{locket.restaurant}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 6. Nearby Foodie Hotspots */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 Quán Ngon Gần Bạn</Text>
            <TouchableOpacity onPress={() => router.push('/restaurants' as any)}>
              <Text style={styles.sectionLink}>Xem tất cả ➔</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.restaurantList}>
            {MOCK_NEARBY_RESTAURANTS.map((restaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.restaurantCard}
                onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                activeOpacity={0.88}
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
                <TouchableOpacity
                  style={styles.spinIconBadge}
                  onPress={() => router.push('/(tabs)/spin')}
                >
                  <Text style={styles.spinIconText}>🎲</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff8ef',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff8ef',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 25,
    fontWeight: '900',
    color: '#b52330',
  },
  subGreeting: {
    fontSize: 13,
    color: '#8e4e14',
    marginTop: 3,
    fontWeight: '700',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  notificationIcon: {
    fontSize: 19,
  },

  // Hero Card (CHỦ ĐẠO CHÍNH)
  heroCard: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#b52330',
    borderRadius: 24,
    padding: 22,
    borderBottomWidth: 4,
    borderBottomColor: '#61000e',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroTag: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  heroTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#ffdcc4',
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  heroButton: {
    width: '100%',
    backgroundColor: '#ff5a5f',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#61000e',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  heroButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  heroEmoji: {
    fontSize: 48,
  },

  // Quick Tools Row (CHỨC NĂNG PHỤ - CLEAN & FOCUSED)
  quickToolsContainer: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#b52330',
    marginBottom: 12,
  },
  quickToolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  toolCard: {
    flex: 1,
    alignItems: 'center',
  },
  toolIconBg: {
    width: 60,
    height: 60,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 6,
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  toolIcon: {
    fontSize: 26,
  },
  toolTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b52330',
    textAlign: 'center',
  },

  // Category Filters
  filtersScroll: {
    marginTop: 20,
    marginBottom: 6,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  filterChipActive: {
    backgroundColor: '#b52330',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#b52330',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  filterText: {
    fontSize: 13,
    color: '#b52330',
    fontWeight: '800',
  },
  filterTextActive: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '900',
  },

  // Exploratory Sections
  section: {
    marginTop: 22,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLink: {
    fontSize: 13,
    color: '#8e4e14',
    fontWeight: '800',
  },

  // Lockets Carousel
  locketList: {
    paddingRight: 20,
    gap: 12,
  },
  locketCard: {
    width: 128,
    position: 'relative',
  },
  locketImage: {
    width: 128,
    height: 128,
    borderRadius: 18,
    backgroundColor: '#ffdcc4',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
  },
  locketRatingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,220,196,0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffab69',
  },
  locketRatingText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8e4e14',
  },
  locketName: {
    fontSize: 13,
    color: '#b52330',
    marginTop: 6,
    fontWeight: '800',
  },

  // Restaurants List
  restaurantList: {
    gap: 12,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#b52330',
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  restaurantRating: {
    fontSize: 13,
    color: '#FFC107',
    fontWeight: '800',
  },
  restaurantDot: {
    fontSize: 13,
    color: '#5a403f',
    marginHorizontal: 6,
  },
  restaurantDistance: {
    fontSize: 13,
    color: '#8e4e14',
    fontWeight: '700',
  },
  restaurantCategory: {
    fontSize: 13,
    color: '#5a403f',
  },
  spinIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffdcc4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffab69',
  },
  spinIconText: {
    fontSize: 20,
  },
});
