import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { friendsApi, FriendUser, PendingFriendRequests } from '../../src/api/endpoints/friends';
import { useAuthStore } from '../../src/stores/authStore';

export default function FriendsScreen() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'search'>('friends');
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingFriendRequests>({ incoming: [], outgoing: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [actionFriendId, setActionFriendId] = useState<string | null>(null);
  const [friendToUnfriend, setFriendToUnfriend] = useState<FriendUser | null>(null);
  const [copiedPublicId, setCopiedPublicId] = useState(false);

  const loadData = async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      const [friendsList, pending] = await Promise.all([
        friendsApi.getFriends(),
        friendsApi.getPendingRequests(),
      ]);
      setFriends(friendsList);
      setPendingRequests(pending);
    } catch (err) {
      console.error('[Friends] Error loading data:', err);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
    // Real-time polling every 1.5s so invitations appear live without reload
    const interval = setInterval(() => {
      loadData(false);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await friendsApi.searchUsers(text.trim());
      setSearchResults(results);
    } catch (err) {
      console.error('[Friends] Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (target: string) => {
    try {
      setActionFriendId(target);
      // Optimistic update for instant UI feedback
      setSearchResults((prev) =>
        prev.map((u) => {
          if (u.id === target || u.publicId === target || u.email?.toLowerCase() === target.toLowerCase()) {
            return { ...u, friendshipStatus: 'PENDING', isSender: true };
          }
          return u;
        })
      );

      await friendsApi.sendRequest(target);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('🎉 Đã gửi lời mời kết bạn thành công!');
      } else {
        Alert.alert('Thành công', 'Đã gửi lời mời kết bạn!');
      }
      await loadData(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Lỗi gửi lời mời';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`Lỗi: ${msg}`);
      } else {
        Alert.alert('Lỗi', msg);
      }
      await loadData(false);
    } finally {
      setActionFriendId(null);
    }
  };

  const handleAccept = async (friendshipId: string) => {
    try {
      setActionFriendId(friendshipId);
      // Optimistic instant removal from incoming and addition to friends
      const item = pendingRequests.incoming.find((i) => (i.friendshipId || i.id) === friendshipId);
      setPendingRequests((prev) => ({
        ...prev,
        incoming: prev.incoming.filter((i) => (i.friendshipId || i.id) !== friendshipId),
      }));
      if (item) {
        setFriends((prev) => [item, ...prev]);
      }

      await friendsApi.acceptRequest(friendshipId);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('🎉 Đã chấp nhận lời mời kết bạn!');
      }
      await loadData(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Lỗi chấp nhận';
      Alert.alert('Lỗi', msg);
      await loadData(false);
    } finally {
      setActionFriendId(null);
    }
  };

  const handleReject = async (friendshipId: string) => {
    try {
      setActionFriendId(friendshipId);
      // Optimistic instant removal
      setPendingRequests((prev) => ({
        ...prev,
        incoming: prev.incoming.filter((i) => (i.friendshipId || i.id) !== friendshipId),
      }));

      await friendsApi.rejectRequest(friendshipId);
      await loadData(false);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể từ chối lời mời');
      await loadData(false);
    } finally {
      setActionFriendId(null);
    }
  };

  const handleConfirmUnfriend = async () => {
    if (!friendToUnfriend?.friendshipId) return;
    const targetFId = friendToUnfriend.friendshipId;
    try {
      setFriends((prev) => prev.filter((f) => f.friendshipId !== targetFId));
      setFriendToUnfriend(null);
      await friendsApi.removeFriend(targetFId);
      await loadData(false);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Đã hủy kết bạn thành công.');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể hủy kết bạn');
      await loadData(false);
    }
  };

  const incomingCount = pendingRequests.incoming.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={24} color="#b52330" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bạn Bè & Kết Nối 👥</Text>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          style={styles.iconBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="home" size={22} color="#b52330" />
        </TouchableOpacity>
      </View>

      {/* Segmented Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('friends')}
          style={[styles.tabItem, activeTab === 'friends' && styles.tabItemActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
            Bạn bè ({friends.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('pending')}
          style={[styles.tabItem, activeTab === 'pending' && styles.tabItemActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Lời mời {incomingCount > 0 ? `(${incomingCount}) 🔴` : `(${incomingCount})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('search')}
          style={[styles.tabItem, activeTab === 'search' && styles.tabItemActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
            🔍 Thêm bạn
          </Text>
        </TouchableOpacity>
      </View>

      {/* Real-time Incoming Request Notification Banner */}
      {incomingCount > 0 && activeTab !== 'pending' ? (
        <TouchableOpacity
          onPress={() => setActiveTab('pending')}
          style={styles.incomingBanner}
          activeOpacity={0.85}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Text style={{ fontSize: 16 }}>🔔</Text>
            <Text style={styles.incomingBannerText}>
              Bạn có <Text style={{ fontWeight: '900', color: '#b52330' }}>{incomingCount} lời mời kết bạn</Text> đang chờ duyệt!
            </Text>
          </View>
          <Text style={styles.incomingBannerAction}>Xem ngay ➔</Text>
        </TouchableOpacity>
      ) : null}

      {/* Main Content Body */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#b52330" />
          <Text style={styles.loadingText}>Đang tải danh sách bạn bè...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* TAB 1: FRIENDS LIST */}
          {activeTab === 'friends' && (
            <FlatList
              data={friends}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshing={isLoading}
              onRefresh={loadData}
              ListHeaderComponent={
                <View style={styles.myCardBox}>
                  <Text style={styles.myCardLabel}>Mã kết bạn của bạn:</Text>
                  <View style={styles.myCardRow}>
                    <Text style={styles.myCardId}>@{currentUser?.publicId || 'foodlover'}</Text>
                    <TouchableOpacity
                      style={styles.copyBtn}
                      onPress={() => {
                        setCopiedPublicId(true);
                        setTimeout(() => setCopiedPublicId(false), 2000);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.copyBtnText}>
                        {copiedPublicId ? 'Đã chép ✓' : 'Sao chép 📋'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              }
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyEmoji}>🍽️</Text>
                  <Text style={styles.emptyTitle}>Chưa có bạn bè nào</Text>
                  <Text style={styles.emptySubtitle}>
                    Chuyển sang tab "🔍 Thêm bạn" để kết nối cùng bạn bè và xem Taste Board của nhau nhé!
                  </Text>
                  <TouchableOpacity
                    style={styles.findFriendsBtn}
                    onPress={() => setActiveTab('search')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.findFriendsBtnText}>🔍 Tìm bạn ngay</Text>
                  </TouchableOpacity>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.userCard}>
                  <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.displayNamePublic}</Text>
                    <Text style={styles.userSub}>@{item.publicId} • Bạn bè ✓</Text>
                  </View>

                  <View style={styles.userActionRow}>
                    <TouchableOpacity
                      style={styles.viewFeedBtn}
                      onPress={() => {
                        router.push('/(tabs)/lockets');
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.viewFeedText}>📸 Locket</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.unfriendBtn}
                      onPress={() => setFriendToUnfriend(item)}
                      activeOpacity={0.8}
                    >
                      <Feather name="user-x" size={16} color="#8e4e14" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}

          {/* TAB 2: PENDING REQUESTS */}
          {activeTab === 'pending' && (
            <FlatList
              data={pendingRequests.incoming}
              keyExtractor={(item) => item.friendshipId || item.id}
              contentContainerStyle={styles.listContent}
              refreshing={isLoading}
              onRefresh={loadData}
              ListHeaderComponent={
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Lời mời đã nhận ({pendingRequests.incoming.length})
                  </Text>
                </View>
              }
              ListEmptyComponent={
                <View style={styles.emptySmallBox}>
                  <Text style={styles.emptySmallText}>Không có lời mời kết bạn nào đang chờ bạn duyệt.</Text>
                </View>
              }
              ListFooterComponent={
                pendingRequests.outgoing.length > 0 ? (
                  <View style={{ marginTop: 20 }}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>
                        Lời mời đã gửi ({pendingRequests.outgoing.length})
                      </Text>
                    </View>
                    {pendingRequests.outgoing.map((out) => (
                      <View key={out.friendshipId || out.id} style={styles.userCard}>
                        <Image source={{ uri: out.avatarUrl }} style={styles.avatar} />
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>{out.displayNamePublic}</Text>
                          <Text style={styles.userSub}>@{out.publicId}</Text>
                        </View>
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingBadgeText}>⏳ Đang chờ duyệt</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <View style={styles.userCard}>
                  <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.displayNamePublic}</Text>
                    <Text style={styles.userSub}>@{item.publicId}</Text>
                  </View>

                  <View style={styles.requestBtnRow}>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => item.friendshipId && handleAccept(item.friendshipId)}
                      disabled={actionFriendId === item.friendshipId}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.acceptBtnText}>Đồng ý ✓</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => item.friendshipId && handleReject(item.friendshipId)}
                      disabled={actionFriendId === item.friendshipId}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.rejectBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}

          {/* TAB 3: SEARCH & ADD FRIENDS */}
          {activeTab === 'search' && (
            <View style={{ flex: 1 }}>
              <View style={styles.searchBarBox}>
                <View style={styles.searchBar}>
                  <Feather name="search" size={18} color="#8e4e14" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm theo email (ví dụ: friend@...) hoặc tên, @id"
                    placeholderTextColor="#a4726f"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                    autoFocus
                  />
                  {searchQuery ? (
                    <TouchableOpacity onPress={() => handleSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Feather name="x" size={16} color="#8e4e14" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {isSearching ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color="#b52330" />
                  <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
                </View>
              ) : (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContent}
                  ListEmptyComponent={
                    searchQuery ? (
                      <View style={styles.emptyBox}>
                        <Text style={styles.emptyEmoji}>🔎</Text>
                        <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
                        <Text style={styles.emptySubtitle}>
                          Hãy thử kiểm tra lại chính xác email hoặc Public ID của bạn bè.
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.emptyBox}>
                        <Text style={styles.emptyEmoji}>💡</Text>
                        <Text style={styles.emptyTitle}>Tìm bạn cùng gu ăn uống</Text>
                        <Text style={styles.emptySubtitle}>
                          Nhập email hoặc Public ID của bạn bè ở ô tìm kiếm phía trên để gửi lời mời kết bạn nhé!
                        </Text>
                      </View>
                    )
                  }
                  renderItem={({ item }) => {
                    const isFriend = item.friendshipStatus === 'ACCEPTED';
                    const isPending = item.friendshipStatus === 'PENDING';
                    const isActing = actionFriendId === item.id;

                    return (
                      <View style={styles.userCard}>
                        <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>{item.displayNamePublic}</Text>
                          <Text style={styles.userSub}>@{item.publicId} • {item.email || ''}</Text>
                        </View>

                        {isFriend ? (
                          <View style={styles.friendBadge}>
                            <Text style={styles.friendBadgeText}>✓ Bạn bè</Text>
                          </View>
                        ) : isPending ? (
                          <View style={styles.pendingBadge}>
                            <Text style={styles.pendingBadgeText}>⏳ Đã gửi lời mời</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.addFriendBtn}
                            onPress={() => handleSendRequest(item.id)}
                            disabled={isActing}
                            activeOpacity={0.88}
                          >
                            <Text style={styles.addFriendBtnText}>
                              {isActing ? '...' : '+ Kết bạn'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  }}
                />
              )}
            </View>
          )}
        </View>
      )}

      {/* Unfriend Confirmation Modal */}
      <Modal
        visible={!!friendToUnfriend}
        transparent
        animationType="fade"
        onRequestClose={() => setFriendToUnfriend(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🚫 Hủy Kết Bạn</Text>
            <Text style={styles.modalSubtitle}>
              Bạn có chắc chắn muốn hủy kết bạn với{' '}
              <Text style={{ fontWeight: '900', color: '#b52330' }}>
                {friendToUnfriend?.displayNamePublic}
              </Text>{' '}
              không? Sau khi hủy, bạn sẽ không còn thấy Taste Board chế độ Bạn bè của nhau.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setFriendToUnfriend(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmUnfriend}
                activeOpacity={0.88}
              >
                <Text style={styles.modalConfirmText}>Xác nhận Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8ef',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#e2bebc',
    backgroundColor: '#fff8ef',
  },
  iconBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#b52330',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2bebc',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#b52330',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8e4e14',
  },
  tabTextActive: {
    fontWeight: '900',
    color: '#b52330',
  },
  incomingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffedea',
    borderBottomWidth: 1.5,
    borderBottomColor: '#f7c5c0',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  incomingBannerText: {
    fontSize: 12.5,
    color: '#3d2314',
    fontWeight: '600',
  },
  incomingBannerAction: {
    fontSize: 12,
    fontWeight: '900',
    color: '#b52330',
    marginLeft: 8,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#8e4e14',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 60,
  },
  myCardBox: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    marginBottom: 16,
  },
  myCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8e4e14',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  myCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  myCardId: {
    fontSize: 16,
    fontWeight: '900',
    color: '#b52330',
  },
  copyBtn: {
    backgroundColor: '#fff8ef',
    borderWidth: 1,
    borderColor: '#e2bebc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8e4e14',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffdcc4',
    borderWidth: 1.5,
    borderColor: '#ffab69',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#3d2314',
  },
  userSub: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#8e4e14',
    marginTop: 2,
  },
  userActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewFeedBtn: {
    backgroundColor: '#fff8ef',
    borderWidth: 1,
    borderColor: '#e2bebc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewFeedText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#b52330',
  },
  unfriendBtn: {
    padding: 6,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#b52330',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requestBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acceptBtn: {
    backgroundColor: '#166b47',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  acceptBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  rejectBtn: {
    backgroundColor: '#fbf3e4',
    borderWidth: 1,
    borderColor: '#e2bebc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  rejectBtnText: {
    color: '#5a403f',
    fontSize: 12,
    fontWeight: '900',
  },
  pendingBadge: {
    backgroundColor: '#fff8ef',
    borderWidth: 1,
    borderColor: '#e2bebc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8e4e14',
  },
  friendBadge: {
    backgroundColor: '#e6f4ea',
    borderWidth: 1,
    borderColor: '#34a853',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  friendBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#137333',
  },
  addFriendBtn: {
    backgroundColor: '#b52330',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#61000e',
  },
  addFriendBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  searchBarBox: {
    padding: 16,
    paddingBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#3d2314',
  },
  emptyBox: {
    alignItems: 'center',
    padding: 30,
    marginTop: 20,
  },
  emptyEmoji: {
    fontSize: 42,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3d2314',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#8e4e14',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  emptySmallBox: {
    padding: 16,
    alignItems: 'center',
  },
  emptySmallText: {
    fontSize: 12,
    color: '#8e4e14',
    fontWeight: '600',
  },
  findFriendsBtn: {
    marginTop: 18,
    backgroundColor: '#b52330',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderBottomWidth: 3,
    borderBottomColor: '#61000e',
  },
  findFriendsBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    borderWidth: 2,
    borderColor: '#e2bebc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#b52330',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: '#5a403f',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#fbf3e4',
    borderWidth: 1,
    borderColor: '#e2bebc',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#5a403f',
    fontWeight: '800',
    fontSize: 13,
  },
  modalConfirmBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#b52330',
    borderBottomWidth: 3,
    borderBottomColor: '#61000e',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
});
