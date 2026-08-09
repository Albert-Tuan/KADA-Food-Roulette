import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { LocketCard, LocketCardData } from '../../src/components/LocketCard';
import { RestaurantCard, RestaurantCardData } from '../../src/components/RestaurantCard';

const MOCK_LOCKETS: LocketCardData[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
    restaurantName: 'Phở Thìn Lò Đúc',
    restaurantId: '1',
    userName: 'Linh Nguyễn',
    rating: 4.8,
    caption: 'Món này ngon tuyệt, rất đáng thử! Nước dùng béo ngậy đúng điệu.',
    likes: 24,
    comments: 5,
    timeAgo: '2 giờ trước',
    isVerifiedGps: true,
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    restaurantName: 'Mì Cay Sasin',
    restaurantId: '2',
    userName: 'Minh Tuấn',
    rating: 4.5,
    caption: 'Cấp độ 7 cay xé lưỡi nhưng vị rất đậm đà. Thích hợp cho ngày mưa.',
    likes: 128,
    comments: 12,
    timeAgo: '5 giờ trước',
    isVerifiedGps: true,
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    restaurantName: 'Bánh Mì Huỳnh Hoa',
    restaurantId: '3',
    userName: 'Tuấn Đạt',
    rating: 5.0,
    caption: 'Nhiều thịt dã man, ăn một ổ no tới chiều!',
    likes: 89,
    comments: 23,
    timeAgo: '10 giờ trước',
    isVerifiedGps: true,
  },
];

const CATEGORIES = [
  { id: '1', name: 'Món Cay', icon: '🔥' },
  { id: '2', name: 'Cà phê', icon: '☕' },
  { id: '3', name: 'Vỉa hè', icon: '🍜' },
  { id: '4', name: 'Hẹn hò', icon: '❤️' },
  { id: '5', name: 'Bánh ngọt', icon: '🥐' },
];

export default function LocketsScreen() {
  const [activeTab, setActiveTab] = useState<'friends' | 'discover'>('discover');
  const [searchQuery, setSearchQuery] = useState('');

  const renderLocketItem = ({ item }: { item: LocketCardData }) => (
    <LocketCard 
      data={item} 
      onLike={() => console.log('Like:', item.id)}
      onComment={() => console.log('Comment:', item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📸 Lockets</Text>
        <Text style={styles.headerSubtitle}>Chia sẻ món ăn của bạn</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
            Bạn bè
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
            Khám phá
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'discover' ? (
        <FlatList
          data={MOCK_LOCKETS}
          keyExtractor={(item) => item.id}
          renderItem={renderLocketItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm kiếm nhà hàng hoặc món ăn..."
                  placeholderTextColor="#A8A29E"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Categories */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}
              >
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                    <View style={styles.categoryIcon}>
                      <Text style={styles.categoryIconText}>{cat.icon}</Text>
                    </View>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Section Title */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
              </View>
            </>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>Chưa có bài viết nào</Text>
          <Text style={styles.emptySubtitle}>
            Thêm bạn bè để xem bài viết của họ
          </Text>
          <TouchableOpacity style={styles.addFriendButton}>
            <Text style={styles.addFriendText}>Tìm bạn bè</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FAB - Capture Button */}
      <Link href="/locket/capture" asChild>
        <TouchableOpacity style={styles.fab}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#292524',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#D97706',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78716C',
  },
  tabTextActive: {
    color: '#D97706',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#292524',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#57534E',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#292524',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#292524',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFriendButton: {
    backgroundColor: '#D97706',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addFriendText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: 'white',
    fontWeight: '300',
  },
});
