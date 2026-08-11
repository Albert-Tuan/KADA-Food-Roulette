import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Share,
  ScrollView,
  Image,
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
  const { roomCode, members, inviteMember } = useGroupSpinStore();
  const [invitedIds, setInvitedIds] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://foodroulette.app/g/${roomCode}`;

  const handleShareLink = async () => {
    try {
      await Share.share({
        title: 'Mời tham gia Food Roulette Group Spin',
        message: `Vào chọn món ăn cùng nhóm mình nhé! Mã phòng: ${roomCode}\nLink tham gia: ${inviteLink}`,
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handleBar} />
            <View style={styles.headerTitleRow}>
              <Text style={styles.title}>Mời bạn vào nhóm</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Tối đa 20 người cùng chọn món & chốt kèo</Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Room Code & Share Link Section */}
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>MÃ PHÒNG NHÓM</Text>
              <Text style={styles.codeValue}>{roomCode}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
                  <Text style={styles.copyBtnText}>{copied ? '✓ Đã chép' : '📋 Sao chép mã'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.copyBtn, styles.shareBtn]} onPress={handleShareLink}>
                  <Text style={styles.shareBtnText}>🔗 Chia sẻ link</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* QR Code Section */}
            <View style={styles.qrSection}>
              <Text style={styles.sectionTitle}>Quét mã tại bàn</Text>
              <View style={styles.qrContainer}>
                {/* Visual Representation of QR Code using SVG */}
                <Svg width={140} height={140} viewBox="0 0 100 100">
                  <Rect x="0" y="0" width="100" height="100" fill="#FFF" />
                  {/* Top Left Marker */}
                  <Rect x="10" y="10" width="25" height="25" fill="#B52330" />
                  <Rect x="14" y="14" width="17" height="17" fill="#FFF" />
                  <Rect x="18" y="18" width="9" height="9" fill="#B52330" />
                  {/* Top Right Marker */}
                  <Rect x="65" y="10" width="25" height="25" fill="#B52330" />
                  <Rect x="69" y="14" width="17" height="17" fill="#FFF" />
                  <Rect x="73" y="18" width="9" height="9" fill="#B52330" />
                  {/* Bottom Left Marker */}
                  <Rect x="10" y="65" width="25" height="25" fill="#B52330" />
                  <Rect x="14" y="69" width="17" height="17" fill="#FFF" />
                  <Rect x="18" y="73" width="9" height="9" fill="#B52330" />
                  {/* Inner Pattern Dots */}
                  <Rect x="42" y="15" width="8" height="8" fill="#292524" />
                  <Rect x="42" y="30" width="8" height="8" fill="#292524" />
                  <Rect x="15" y="42" width="8" height="8" fill="#292524" />
                  <Rect x="30" y="42" width="8" height="8" fill="#292524" />
                  <Rect x="45" y="45" width="10" height="10" fill="#B52330" />
                  <Rect x="60" y="42" width="8" height="8" fill="#292524" />
                  <Rect x="75" y="42" width="8" height="8" fill="#292524" />
                  <Rect x="42" y="60" width="8" height="8" fill="#292524" />
                  <Rect x="42" y="75" width="8" height="8" fill="#292524" />
                  <Rect x="65" y="65" width="12" height="12" fill="#292524" />
                  <Rect x="80" y="80" width="10" height="10" fill="#B52330" />
                </Svg>
              </View>
              <Text style={styles.qrHint}>Đưa camera quét để vào phòng nhanh</Text>
            </View>

            {/* In-app Friends Section */}
            <View style={styles.friendsSection}>
              <View style={styles.friendsHeader}>
                <Text style={styles.sectionTitle}>Mời bạn bè trong app</Text>
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
                          ? 'Đã trong phòng'
                          : friend.isOnline
                          ? 'Đang hoạt động'
                          : 'Ngoại tuyến'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.inviteBtn,
                        isInvited && styles.invitedBtn,
                      ]}
                      disabled={isInvited}
                      onPress={() => handleInviteFriend(friend)}
                    >
                      <Text style={[styles.inviteBtnText, isInvited && styles.invitedBtnText]}>
                        {isAlreadyJoined ? 'Đã vào' : isInvited ? 'Đã mời ✓' : 'Mời'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF8E7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D6D3D1',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#B52330',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E7E5E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#78716C',
  },
  subtitle: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  codeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78716C',
    letterSpacing: 1,
  },
  codeValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#B52330',
    letterSpacing: 3,
    marginVertical: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    width: '100%',
  },
  copyBtn: {
    flex: 1,
    backgroundColor: '#F5F5F4',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#292524',
  },
  shareBtn: {
    backgroundColor: '#B52330',
    borderColor: '#B52330',
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  qrSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 8,
  },
  qrContainer: {
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginVertical: 4,
  },
  qrHint: {
    fontSize: 11,
    color: '#78716C',
    marginTop: 6,
  },
  friendsSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
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
    fontWeight: '600',
    color: '#B52330',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  friendAvatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7E5E4',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#292524',
  },
  friendStatus: {
    fontSize: 12,
    color: '#78716C',
  },
  inviteBtn: {
    backgroundColor: '#B52330',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  invitedBtn: {
    backgroundColor: '#F5F5F4',
  },
  inviteBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  invitedBtnText: {
    color: '#A8A29E',
  },
});
