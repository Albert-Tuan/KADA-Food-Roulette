import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const menuItems = [
    { icon: '✏️', title: 'Chỉnh sửa hồ sơ', href: '/profile/edit' },
    { icon: '🌐', title: 'Xem profile công khai', href: '/profile/public' },
    { icon: '🔔', title: 'Thông báo', href: '/notifications' },
    { icon: '⚙️', title: 'Cài đặt', href: '/settings' },
    { icon: '❓', title: 'Trợ giúp & FAQ', href: '/help' },
    { icon: '📜', title: 'Điều khoản sử dụng', href: '/terms' },
    { icon: '🔒', title: 'Chính sách bảo mật', href: '/privacy' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0)?.toUpperCase() || '👤'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.email?.split('@')[0] || 'Người dùng'}</Text>
          <Text style={styles.username}>@{user?.email?.split('@')[0] || 'username'}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Locket</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Check-in</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Nhóm</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Rewards Preview */}
        <TouchableOpacity style={styles.rewardsCard}>
          <View style={styles.rewardsLeft}>
            <Text style={styles.rewardsIcon}>🏆</Text>
            <View>
              <Text style={styles.rewardsTitle}>Season Garden</Text>
              <Text style={styles.rewardsSubtitle}>Đạt streak 7 ngày</Text>
            </View>
          </View>
          <View style={styles.rewardsBadge}>
            <Text style={styles.rewardsBadgeText}>4/7</Text>
          </View>
        </TouchableOpacity>

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href as any} asChild>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuText}>{item.title}</Text>
                <Text style={styles.menuArrow}>→</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#D97706',
  },
  avatarText: {
    fontSize: 36,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#292524',
  },
  username: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D97706',
  },
  statLabel: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E7E5E4',
  },
  rewardsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#059669',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },
  rewardsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardsIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  rewardsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  rewardsSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  rewardsBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rewardsBadgeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  menuSection: {
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#292524',
  },
  menuArrow: {
    fontSize: 16,
    color: '#A8A29E',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 15,
    color: '#DC2626',
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#A8A29E',
    marginTop: 24,
    marginBottom: 100,
  },
});
