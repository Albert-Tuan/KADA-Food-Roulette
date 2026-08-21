import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Share,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useGroupSpinStore } from '../../../stores/groupSpinStore';
import type { GroupMember } from '../types';

interface InviteMembersSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface FriendItem {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
}

const MOCK_FRIENDS: FriendItem[] = [
  { id: '10', name: '@bao_nguyen', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Bao', isOnline: true },
  { id: '11', name: '@trang_pink', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Trang', isOnline: true },
  { id: '12', name: '@dung_foodie', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Dung', isOnline: false },
  { id: '13', name: '@nam_pham', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Nam', isOnline: true },
  { id: '14', name: '@vy_vy', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Vy', isOnline: false },
];

export function InviteMembersSheet({ visible, onClose }: InviteMembersSheetProps) {
  const { roomCode, members, inviteMember, joinByCode } = useGroupSpinStore();
  const [invitedIds, setInvitedIds] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const currentRoomCode = roomCode || 'FOOD-8892';
  const inviteLink = `https://foodroulette.app/g/${currentRoomCode.replace('#', '')}`;

  const handleShareLink = async () => {
    try {
      await Share.share({
        title: 'Mời tham gia Food Roulette Group Spin',
        message: `Vào chọn món ăn cùng nhóm mình nhé! Mã phòng: ${currentRoomCode}\nLink tham gia: ${inviteLink}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteFriend = (friend: FriendItem) => {
    const newMember: GroupMember = {
      id: friend.id,
      name: friend.name,
      role: 'MEMBER',
      avatarUrl: friend.avatarUrl,
    };
    inviteMember(newMember);
    setInvitedIds((prev) => ({ ...prev, [friend.id]: true }));
  };

  const handleJoinByCode = async () => {
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã phòng (ví dụ: FOOD-4K9X hoặc PARTY2026)!');
      return;
    }

    try {
      setIsJoining(true);
      const success = await joinByCode(cleanCode);
      if (success) {
        setJoinCodeInput('');
        onClose();
        Alert.alert('Thành công 🎉', `Bạn đã vào phòng nhóm #${cleanCode}!`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Không thể tham gia phòng này. Vui lòng kiểm tra lại mã!';
      Alert.alert('Lỗi vào phòng', msg);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Grab Handle */}
          <View style={styles.grabHandleContainer}>
            <View style={styles.grabHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.title}>👥 Mời & Nhập Mã Phòng</Text>
              <Text style={styles.subtitle}>Chia sẻ mã cho bạn bè hoặc nhập mã để vào nhóm</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 1. Enter Room Code Form (Join other room) */}
            <View style={styles.joinCodeCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>🔑 THAM GIA PHÒNG BẰNG MÃ</Text>
              </View>
              <Text style={styles.cardHint}>
                Bạn có mã phòng từ bạn bè? Nhập mã vào đây để tham gia cùng nhóm:
              </Text>
              <View style={styles.joinInputRow}>
                <TextInput
                  style={styles.joinInput}
                  placeholder="Ví dụ: FOOD-4K9X"
                  placeholderTextColor="#8e706f"
                  value={joinCodeInput}
                  onChangeText={setJoinCodeInput}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={12}
                />
                <TouchableOpacity
                  style={[styles.joinBtn, isJoining && styles.joinBtnDisabled]}
                  disabled={isJoining}
                  onPress={handleJoinByCode}
                  activeOpacity={0.85}
                >
                  {isJoining ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.joinBtnText}>Vào Phòng 🚀</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Current Room Code & Share Link Section */}
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>MÃ PHÒNG HIỆN TẠI CỦA BẠN</Text>
              <Text style={styles.codeValue}>#{currentRoomCode.replace('#', '')}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode} activeOpacity={0.8}>
                  <Text style={styles.copyBtnText}>{copied ? '✓ Đã chép' : '📋 Sao chép mã'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareBtn} onPress={handleShareLink} activeOpacity={0.88}>
                  <Text style={styles.shareBtnText}>🔗 Chia sẻ link</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. QR Code Section */}
            <View style={styles.qrSection}>
              <Text style={styles.sectionTitle}>📷 Quét mã tại bàn</Text>
              <View style={styles.qrContainer}>
                <Svg width={120} height={120} viewBox="0 0 100 100">
                  <Rect x="0" y="0" width="100" height="100" fill="#FFF" />
                  <Rect x="10" y="10" width="25" height="25" fill="#b52330" />
                  <Rect x="14" y="14" width="17" height="17" fill="#FFF" />
                  <Rect x="18" y="18" width="9" height="9" fill="#b52330" />
                  <Rect x="65" y="10" width="25" height="25" fill="#b52330" />
                  <Rect x="69" y="14" width="17" height="17" fill="#FFF" />
                  <Rect x="73" y="18" width="9" height="9" fill="#b52330" />
                  <Rect x="10" y="65" width="25" height="25" fill="#b52330" />
                  <Rect x="14" y="69" width="17" height="17" fill="#FFF" />
                  <Rect x="18" y="73" width="9" height="9" fill="#b52330" />
                  <Rect x="42" y="15" width="8" height="8" fill="#5a403f" />
                  <Rect x="42" y="30" width="8" height="8" fill="#5a403f" />
                  <Rect x="15" y="42" width="8" height="8" fill="#5a403f" />
                  <Rect x="30" y="42" width="8" height="8" fill="#5a403f" />
                  <Rect x="45" y="45" width="10" height="10" fill="#b52330" />
                  <Rect x="60" y="42" width="8" height="8" fill="#5a403f" />
                  <Rect x="75" y="42" width="8" height="8" fill="#5a403f" />
                  <Rect x="42" y="60" width="8" height="8" fill="#5a403f" />
                  <Rect x="42" y="75" width="8" height="8" fill="#5a403f" />
                  <Rect x="65" y="65" width="12" height="12" fill="#5a403f" />
                  <Rect x="80" y="80" width="10" height="10" fill="#b52330" />
                </Svg>
              </View>
              <Text style={styles.qrHint}>Đưa camera quét để vào phòng nhanh</Text>
            </View>

            {/* 4. In-app Friends Section */}
            <View style={styles.friendsSection}>
              <View style={styles.friendsHeader}>
                <Text style={styles.sectionTitle}>🔥 Bạn bè trong app</Text>
                <Text style={styles.memberCount}>{members.length}/20 người</Text>
              </View>

              {MOCK_FRIENDS.map((friend) => {
                const isAlreadyJoined = members.some((m) => m.id === friend.id);
                const isInvited = invitedIds[friend.id] || isAlreadyJoined;

                return (
                  <View key={friend.id} style={styles.friendRow}>
                    <View style={styles.friendAvatarContainer}>
                      <Image source={{ uri: friend.avatarUrl }} style={styles.friendAvatar} />
                      {friend.isOnline && <View style={styles.onlineBadge} />}
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendStatus}>
                        {isAlreadyJoined
                          ? '🟢 Đã trong phòng'
                          : friend.isOnline
                          ? '🟢 Đang hoạt động'
                          : '⚪ Ngoại tuyến'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.inviteBtn,
                        isInvited && styles.invitedBtn,
                      ]}
                      disabled={isInvited}
                      activeOpacity={0.85}
                      onPress={() => handleInviteFriend(friend)}
                    >
                      <Text style={[styles.inviteBtnText, isInvited && styles.invitedBtnText]}>
                        {isAlreadyJoined ? 'Đã vào' : isInvited ? 'Đã mời ✓' : '➕ Mời'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    width: '100%',
    backgroundColor: '#fff8ef',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#e2bebc',
    maxHeight: '90%',
    paddingBottom: 28,
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  grabHandleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  grabHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e2bebc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fbf3e4',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#b52330',
  },
  subtitle: {
    fontSize: 12,
    color: '#8e4e14',
    marginTop: 2,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
  },
  closeText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#b52330',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  joinCodeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#b52330',
    letterSpacing: 0.5,
  },
  cardHint: {
    fontSize: 12,
    color: '#5a403f',
    marginBottom: 12,
    lineHeight: 16,
  },
  joinInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  joinInput: {
    flex: 1,
    backgroundColor: '#fff8ef',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '800',
    color: '#3d2314',
    letterSpacing: 1,
  },
  joinBtn: {
    backgroundColor: '#b52330',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderBottomWidth: 3,
    borderBottomColor: '#61000e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnDisabled: {
    opacity: 0.6,
  },
  joinBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  codeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    marginBottom: 14,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#8e4e14',
    letterSpacing: 1,
  },
  codeValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#b52330',
    letterSpacing: 2,
    marginVertical: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    width: '100%',
  },
  copyBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8e4e14',
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#b52330',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#61000e',
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
  qrSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#b52330',
    marginBottom: 8,
  },
  qrContainer: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    marginVertical: 4,
  },
  qrHint: {
    fontSize: 11.5,
    color: '#8e4e14',
    marginTop: 6,
    fontWeight: '600',
  },
  friendsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    marginBottom: 24,
  },
  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberCount: {
    fontSize: 12,
    fontWeight: '900',
    color: '#b52330',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fbf3e4',
  },
  friendAvatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  friendAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffdcc4',
    borderWidth: 1,
    borderColor: '#e2bebc',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#166b47',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#b52330',
  },
  friendStatus: {
    fontSize: 11.5,
    color: '#8e4e14',
    fontWeight: '600',
    marginTop: 1,
  },
  inviteBtn: {
    backgroundColor: '#b52330',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#61000e',
  },
  invitedBtn: {
    backgroundColor: '#ffdad8',
    borderBottomWidth: 0,
  },
  inviteBtnText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#ffffff',
  },
  invitedBtnText: {
    color: '#b52330',
  },
});
