import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Share,
  Dimensions,
  Platform,
} from 'react-native';
import { useGroupSpinStore } from '../../../stores/groupSpinStore';
import { useSpinStore } from '../../../stores/spinStore';
import type { Restaurant } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GroupPactConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onNewSpinRound: () => void;
  onDirections: () => void;
  onCheckInLocket: () => void;
  isHost?: boolean;
}

export function GroupPactConfirmationModal({
  visible,
  onClose,
  onNewSpinRound,
  onDirections,
  onCheckInLocket,
  isHost = true,
}: GroupPactConfirmationModalProps) {
  const { roomCode, members } = useGroupSpinStore();
  const { currentResult, candidates } = useSpinStore();
  const resultData: Restaurant | undefined = currentResult || candidates[0];

  // 60 minutes countdown timer (3600 seconds)
  const [timeLeft, setTimeLeft] = useState(3600);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSharePact = async () => {
    try {
      const code = roomCode || 'FOOD-8892';
      const dish = resultData?.name || 'Món ngon';
      await Share.share({
        title: '📜 Khế Ước Ăn Uống Food Roulette',
        message: `🔥 Cả nhóm mình vừa lập khế ước đi ăn [${dish}] tại phòng #${code}!\nThời hạn check-in còn: ${formatTimer(timeLeft)}.\nCùng chuẩn bị lên đồ đi nào! 🛵💨`,
      });
    } catch (err) {
      console.error('Share pact error:', err);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Badge & Title */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🤝 KHẾ ƯỚC HOÀN THÀNH 🤝</Text>
            </View>
            <Text style={styles.title}>ĐÃ LẬP KÈO ĐI ĂN!</Text>
            <Text style={styles.subtitle}>
              Cả nhóm {members.length} thành viên đã đồng thuận cam kết
            </Text>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Restaurant Info Card */}
            {resultData && (
              <View style={styles.dishCard}>
                <Image
                  source={{ uri: resultData.imageUrl }}
                  style={styles.dishImage}
                />
                <View style={styles.dishInfo}>
                  <Text style={styles.dishName} numberOfLines={1}>
                    {resultData.name}
                  </Text>
                  <Text style={styles.dishMeta}>
                    ⭐ {resultData.rating ?? 5.0} • {resultData.category ?? 'Ẩm thực'} • {((resultData.distance ?? 0) / 1000).toFixed(1)}km
                  </Text>
                  <Text style={styles.dishAddress} numberOfLines={1}>
                    📍 {resultData.address || 'Quán ăn gần bạn'}
                  </Text>
                </View>
              </View>
            )}

            {/* Countdown Timer */}
            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>⏱️ THỜI HẠN CÓ MẶT TẠI QUÁN CÒN</Text>
              <Text style={styles.timerValue}>{formatTimer(timeLeft)}</Text>
              <Text style={styles.timerHint}>
                Đến quán và check-in Locket để nhận điểm thưởng XP & Lucky Spin!
              </Text>
            </View>

            {/* Members Committed */}
            <View style={styles.membersSection}>
              <Text style={styles.sectionLabel}>
                👥 Thành viên tham gia ({members.length} người)
              </Text>
              <View style={styles.membersRow}>
                {members.map((m) => (
                  <View key={m.id} style={styles.memberAvatarWrapper}>
                    <Image source={{ uri: m.avatarUrl }} style={styles.memberAvatar} />
                    <Text style={styles.memberName} numberOfLines={1}>
                      {m.name.replace('@', '')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <View style={styles.primaryActionRow}>
              <TouchableOpacity
                style={styles.directionsBtn}
                onPress={onDirections}
                activeOpacity={0.88}
              >
                <Text style={styles.directionsBtnText}>🧭 Chỉ Đường</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkInBtn}
                onPress={onCheckInLocket}
                activeOpacity={0.88}
              >
                <Text style={styles.checkInBtnText}>📸 Check-in Quán</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleSharePact}
              activeOpacity={0.88}
            >
              <Text style={styles.shareBtnText}>🔗 Chia Sẻ Kèo Lên Nhóm Chat</Text>
            </TouchableOpacity>

            <View style={styles.secondaryActionRow}>
              {isHost && (
                <TouchableOpacity
                  style={styles.newRoundBtn}
                  onPress={onNewSpinRound}
                  activeOpacity={0.85}
                >
                  <Text style={styles.newRoundBtnText}>🎲 Bắt Đầu Lượt Quay Mới</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.closeBtnText}>✕ Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 9999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: SCREEN_HEIGHT * 0.9,
    backgroundColor: '#fff8ef',
    borderRadius: 26,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    backgroundColor: '#ffdcc4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffab69',
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#8e4e14',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#b52330',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#5a403f',
    textAlign: 'center',
    fontWeight: '600',
  },
  scrollArea: {
    maxHeight: 320,
    marginBottom: 14,
  },
  dishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    marginBottom: 12,
  },
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#ffdcc4',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2bebc',
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#b52330',
    marginBottom: 2,
  },
  dishMeta: {
    fontSize: 11.5,
    color: '#8e4e14',
    fontWeight: '700',
    marginBottom: 2,
  },
  dishAddress: {
    fontSize: 11,
    color: '#5a403f',
  },
  timerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    marginBottom: 12,
  },
  timerLabel: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#8e4e14',
    letterSpacing: 0.5,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#b52330',
    letterSpacing: 2,
    marginVertical: 4,
  },
  timerHint: {
    fontSize: 11,
    color: '#5a403f',
    textAlign: 'center',
    lineHeight: 15,
  },
  membersSection: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#b52330',
    marginBottom: 8,
  },
  membersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  memberAvatarWrapper: {
    alignItems: 'center',
    width: 50,
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffdcc4',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    marginBottom: 2,
  },
  memberName: {
    fontSize: 10,
    color: '#5a403f',
    fontWeight: '700',
    textAlign: 'center',
  },
  actionContainer: {
    gap: 8,
  },
  primaryActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  directionsBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
  },
  directionsBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#8e4e14',
  },
  checkInBtn: {
    flex: 1.2,
    backgroundColor: '#b52330',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#61000e',
  },
  checkInBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
  shareBtn: {
    backgroundColor: '#ffdcc4',
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffab69',
  },
  shareBtnText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#8e4e14',
  },
  secondaryActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  newRoundBtn: {
    flex: 2,
    backgroundColor: '#fbf3e4',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2bebc',
  },
  newRoundBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#b52330',
  },
  closeBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2bebc',
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5a403f',
  },
});
