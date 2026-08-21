import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity, Alert, Linking, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../stores/authStore';
import { useGroupSpinStore } from '../../../stores/groupSpinStore';
import { useSpinStore } from '../../../stores/spinStore';
import { restaurantApi } from '../../../api/endpoints/restaurants';
import { FoodRoulette, type FoodRouletteRef } from './FoodRoulette';
import { SpinFilterSheet } from './SpinFilterSheet';
import { InviteMembersSheet } from './InviteMembersSheet';
import { GroupVoteVeto } from './GroupVoteVeto';
import { GroupVoteResult } from './GroupVoteResult';
import { GroupPactConfirmationModal } from './GroupPactConfirmationModal';
import type { Restaurant, GroupMember } from '../types';

interface GroupLobbyProps {
  onSpinEnd?: (winner: Restaurant) => void;
}

type GroupSpinStep = 'LOBBY' | 'VOTE_VETO' | 'VOTE_RESULT';

export function GroupLobby({ onSpinEnd }: GroupLobbyProps) {
  const router = useRouter();
  const rouletteRef = useRef<FoodRouletteRef>(null);
  const currentUser = useAuthStore((s) => s.user);
  const {
    members,
    roomCode,
    removeMember,
    joinByCode,
    hostId,
    status: roomStatus,
    fetchOrInitHostRoom,
    createNewRoom,
    syncRoom,
    startGroupSpin,
    finishGroupSpin,
    resetGroupSpin,
    currentResult: backendResult,
    isLoadingRoom,
  } = useGroupSpinStore();
  const {
    candidates,
    baseCandidates,
    filters,
    customCandidates: storeCustomCandidates,
    setFilters,
    setCandidates,
    addCustomCandidate,
    removeCustomCandidate,
    setCurrentResult,
    resetStore,
    currentResult,
  } = useSpinStore();
  const [step, setStep] = useState<GroupSpinStep>('LOBBY');
  const [newFoodInput, setNewFoodInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [memberToKick, setMemberToKick] = useState<GroupMember | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPactModalOpen, setIsPactModalOpen] = useState(false);

  // Initialize room & sync realtime with backend every 1.5s
  useEffect(() => {
    fetchOrInitHostRoom();

    const interval = setInterval(() => {
      syncRoom();
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Listen to synchronized room status changes (Host spins -> Members automatically spin too)
  useEffect(() => {
    if (roomStatus === 'SPINNING' && !isSpinning) {
      setIsSpinning(true);
      if (rouletteRef.current) {
        rouletteRef.current.spin();
      }
      // Safety fallback timer so UI never gets permanently stuck
      const timer = setTimeout(() => {
        setIsSpinning(false);
      }, 4500);
      return () => clearTimeout(timer);
    } else if (roomStatus === 'VOTING' && step === 'LOBBY') {
      if (backendResult) {
        setCurrentResult(backendResult);
      }
      setIsSpinning(false);
      setStep('VOTE_VETO');
    } else if (roomStatus === 'LOBBY' && step !== 'LOBBY') {
      setStep('LOBBY');
      setIsSpinning(false);
    } else if (roomStatus === 'RESULT' && step !== 'VOTE_RESULT') {
      setStep('VOTE_RESULT');
      setIsSpinning(false);
    }
  }, [roomStatus, isSpinning, step, backendResult]);

  // Load real restaurants from backend if base is small
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (baseCandidates.length <= 8) {
          const list = await restaurantApi.list({ status: 'APPROVED' });
          if (!cancelled && list.length > 0) {
            const mapped: Restaurant[] = list.map((r) => ({
              id: r.id,
              name: r.name,
              address: r.address,
              category: r.category ?? 'Ẩm thực',
              rating: r.ratingAvg ?? 4.5,
              totalReviews: r.ratingCount ?? 0,
              distance: (r.distance ?? 0.5) * 1000,
              priceLevel: (r.priceLevel && r.priceLevel >= 1 && r.priceLevel <= 4 ? r.priceLevel : 2) as 1 | 2 | 3 | 4,
              imageUrl: r.photos?.[0] ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
            }));
            setCandidates(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load group spin restaurants:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const DEFAULT_FALLBACK_RESTAURANTS: Restaurant[] = [
    { id: 'def-1', name: 'Phở Bò Tái Nạm', category: 'Món nước', rating: 4.8, totalReviews: 50, distance: 800, priceLevel: 2, imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=400' },
    { id: 'def-2', name: 'Cơm Tấm Sườn Bì', category: 'Cơm', rating: 4.7, totalReviews: 42, distance: 1200, priceLevel: 1, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400' },
    { id: 'def-3', name: 'Bún Chả Hà Nội', category: 'Bún', rating: 4.9, totalReviews: 88, distance: 1500, priceLevel: 2, imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&q=80&w=400' },
    { id: 'def-4', name: 'Gà Nướng Mật Ong', category: 'Gà', rating: 4.6, totalReviews: 35, distance: 2000, priceLevel: 2, imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=400' },
  ];

  const pool = candidates.length > 0 ? candidates : DEFAULT_FALLBACK_RESTAURANTS;
  const displayCandidates = storeCustomCandidates.length > 0 
    ? [...storeCustomCandidates, ...pool.slice(0, 4)]
    : pool;
  const allReady = members.length > 0;
  const isCurrentUserHost = currentUser?.id ? hostId === currentUser.id : true;

  const handleSpinEnd = async (winner: Restaurant) => {
    setIsSpinning(false);
    setCurrentResult(winner);
    if (onSpinEnd) onSpinEnd(winner);
    if (isCurrentUserHost) {
      try {
        await finishGroupSpin(winner);
      } catch (err) {
        console.error('Error finishing group spin:', err);
      }
    }
    setStep('VOTE_VETO');
  };

  const handleAddDish = (dishName: string) => {
    if (!dishName.trim()) return;
    addCustomCandidate(dishName.trim());
    setNewFoodInput('');
  };

  if (step === 'VOTE_VETO') {
    return (
      <View style={styles.container}>
        <GroupVoteVeto
          onVote={async (decision) => {
            if (decision === 'ACCEPT') {
              // Voting handled by store sync
            } else {
              if (isCurrentUserHost) {
                await resetGroupSpin();
              }
              setStep('LOBBY');
            }
          }}
        />
      </View>
    );
  }

  const handleNewSpinRound = async () => {
    try {
      setIsPactModalOpen(false);
      if (isCurrentUserHost) {
        await resetGroupSpin();
      }
      setStep('LOBBY');
      Alert.alert('🎲 Lượt Mới', 'Đã đặt lại phòng! Mời cả nhóm cùng quay món mới.');
    } catch (err) {
      console.error('Reset spin error:', err);
      setStep('LOBBY');
    }
  };

  const handleLeaveOrCreateNewRoom = async () => {
    Alert.alert(
      '🚪 Tạo Phòng Mới',
      'Bạn có muốn tạo mã phòng mới cho nhóm quay khác không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tạo Mã Mới',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsPactModalOpen(false);
              await createNewRoom();
              setStep('LOBBY');
            } catch (err) {
              console.error('Create new room error:', err);
            }
          },
        },
      ]
    );
  };

  const handleCheckInLocket = () => {
    setIsPactModalOpen(false);
    const resultData = currentResult || candidates[0];
    router.push({
      pathname: '/locket/capture',
      params: {
        restaurantId: resultData?.id || '',
        restaurantName: resultData?.name || '',
      },
    });
  };

  if (step === 'VOTE_RESULT') {
    return (
      <View style={styles.container}>
        <GroupVoteResult
          onCreatePact={() => {
            setIsPactModalOpen(true);
          }}
          onRespin={handleNewSpinRound}
          onNewSpinRound={handleNewSpinRound}
          onLeaveRoom={handleLeaveOrCreateNewRoom}
          isHost={isCurrentUserHost}
          onDirections={() => {
            const resultData = currentResult || candidates[0];
            if (resultData) {
              const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resultData.name)}`;
              Linking.openURL(url).catch(() => Alert.alert('Lỗi', 'Không thể mở bản đồ'));
            } else {
              Alert.alert('🧭 Chỉ đường', 'Đang mở bản đồ chỉ đường đến quán...');
            }
          }}
        />

        {/* Group Pact Confirmation Modal */}
        <GroupPactConfirmationModal
          visible={isPactModalOpen}
          onClose={() => setIsPactModalOpen(false)}
          onNewSpinRound={handleNewSpinRound}
          onDirections={() => {
            const resultData = currentResult || candidates[0];
            if (resultData) {
              const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resultData.name)}`;
              Linking.openURL(url).catch(() => Alert.alert('Lỗi', 'Không thể mở bản đồ'));
            }
          }}
          onCheckInLocket={handleCheckInLocket}
          isHost={isCurrentUserHost}
        />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 1. COMPACT & CLEAN ROOM HEADER */}
          <View style={styles.roomCard}>
            <View style={styles.roomHeaderRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.roomCodeRow}>
                  <TouchableOpacity
                    style={styles.roomCodeBadge}
                    onPress={() => {
                      Alert.alert('Mã Phòng', `Mã phòng hiện tại: #${roomCode}\nChia sẻ mã này cho bạn bè để cùng tham gia!`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.roomCodeText}>MÃ: #{roomCode} 📋</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.createCodeBtn}
                    onPress={async () => {
                      const newCode = await createNewRoom();
                      Alert.alert('Phòng Mới 🎉', `Đã tạo phòng mới với mã #${newCode}!`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.createCodeBtnText}>🎲 Mã mới</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.joinCodeBtn}
                    onPress={() => {
                      setJoinCodeInput('');
                      setIsJoinModalOpen(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.joinCodeBtnText}>🔑 Nhập mã</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.roomTitle}>Phòng Nhậu Roulette 🍻</Text>
              </View>

              <TouchableOpacity onPress={() => setIsFilterOpen(true)} style={styles.settingsBtn} activeOpacity={0.8}>
                <Text style={styles.settingsIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>

            {/* Members Row */}
            <View style={styles.membersBar}>
              <View style={styles.membersTitleRow}>
                <Text style={styles.membersTitle}>Thành viên ({members.length}/20 người)</Text>
                {isCurrentUserHost && <Text style={styles.membersHint}>Chạm ✕ để kick thành viên</Text>}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarScroll}>
                {members.map((m) => {
                  const isHost = m.role === 'HOST' || m.id === hostId;
                  const canKick = isCurrentUserHost && !isHost;
                  return (
                    <View key={m.id} style={styles.avatarWrapper}>
                      <Image source={{ uri: m.avatarUrl }} style={styles.avatarImage} />
                      {isHost && (
                        <View style={styles.hostCrown}>
                          <Text style={styles.hostCrownText}>👑</Text>
                        </View>
                      )}
                      {canKick && (
                        <TouchableOpacity
                          style={styles.kickMemberBtn}
                          onPress={() => setMemberToKick(m)}
                          activeOpacity={0.8}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.kickMemberText}>✕</Text>
                        </TouchableOpacity>
                      )}
                      <Text style={styles.avatarName} numberOfLines={1}>{m.name}</Text>
                    </View>
                  );
                })}

                <TouchableOpacity
                  style={styles.addMemberBtn}
                  onPress={() => setIsInviteOpen(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addMemberIcon}>➕</Text>
                  <Text style={styles.addMemberText}>Mời bạn</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>

          {/* 2. THE HERO: THE SPIN WHEEL (Placed in prime position) */}
          <View style={styles.wheelWrapper}>
            <FoodRoulette
              ref={rouletteRef}
              showSpinButton={false}
              candidates={displayCandidates}
              onSpinEnd={(winner) => handleSpinEnd(winner)}
            />
          </View>

          {/* 3. CLEAN & STREAMLINED "GÓP MÓN ĂN" SECTION */}
          <View style={styles.toolsContainer}>
            <View style={styles.toolsHeaderRow}>
              <Text style={styles.toolsSectionTitle}>🍲 GÓP MÓN VÀO VÒNG QUAY</Text>
              
              {/* Compact AI helper pills */}
              <View style={styles.aiPillRow}>
                <TouchableOpacity
                  style={styles.aiPillBtn}
                  onPress={() => router.push('/spin/menu-capture?target=group' as any)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.aiPillIcon}>📷</Text>
                  <Text style={styles.aiPillText}>Quét Menu</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.aiPillBtn}
                  onPress={() => router.push('/spin/voice-pick?target=group' as any)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.aiPillIcon}>🎙️</Text>
                  <Text style={styles.aiPillText}>Voice Pick</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Bar */}
            <View style={styles.addInputRow}>
              <TextInput
                placeholder="Nhập món bạn thèm (Ví dụ: Bún đậu, Gà nướng...)"
                value={newFoodInput}
                onChangeText={setNewFoodInput}
                onSubmitEditing={() => handleAddDish(newFoodInput)}
                style={styles.addInput}
                placeholderTextColor="#8e4e14"
              />
              <TouchableOpacity
                style={styles.addInputBtn}
                onPress={() => handleAddDish(newFoodInput)}
                activeOpacity={0.85}
              >
                <Text style={styles.addInputBtnText}>➕ Thêm</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Suggestion Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              {['🍜 Phở Thìn', '🥩 Lẩu Gyu-Kaku', '🍕 Pizza Hut', '🧋 Trà Sữa KOI', '🍚 Cơm Tấm Ba Ghiền'].map((chip, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickChip}
                  onPress={() => handleAddDish(chip.substring(3))}
                  activeOpacity={0.75}
                >
                  <Text style={styles.quickChipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 4. Group Candidates Pool (Món đã đề xuất) */}
          {storeCustomCandidates.length > 0 && (
            <View style={styles.poolSection}>
              <View style={styles.poolHeader}>
                <Text style={styles.poolTitle}>🎯 Món Nhóm Đã Đóng Góp ({storeCustomCandidates.length})</Text>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Xóa tất cả', 'Bạn có chắc chắn muốn làm mới danh sách?', [
                      { text: 'Hủy', style: 'cancel' },
                      { text: 'Xóa', style: 'destructive', onPress: () => resetStore() },
                    ]);
                  }}
                >
                  <Text style={styles.clearAllText}>Xóa tất cả 🔄</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.chipGrid}>
                {storeCustomCandidates.map((c) => (
                  <View key={c.id} style={styles.candidateBadge}>
                    <Text style={styles.candidateText}>🍽️ {c.name}</Text>
                    <TouchableOpacity onPress={() => removeCustomCandidate(c.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.removeIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* 5. Fixed 3D Game Action Dock */}
        <View style={styles.bottomDock}>
          <TouchableOpacity
            style={[
              styles.startSpinBtn,
              (!allReady || isSpinning || !isCurrentUserHost) && styles.startSpinBtnDisabled,
            ]}
            disabled={!allReady || isSpinning || !isCurrentUserHost}
            activeOpacity={0.88}
            onPress={async () => {
              if (!isCurrentUserHost) return;
              setIsSpinning(true);
              const randomPick = displayCandidates[Math.floor(Math.random() * displayCandidates.length)];
              await startGroupSpin(randomPick);
              rouletteRef.current?.spin();
            }}
          >
            <Text style={styles.startSpinText}>
              {isSpinning
                ? '🔄 ĐANG QUAY VÒNG NHÓM...'
                : !isCurrentUserHost
                ? '⏳ ĐỢI TRƯỞNG PHÒNG BẤM QUAY VÒNG...'
                : allReady
                ? `🎉 QUAY CHO CẢ NHÓM (TRƯỞNG PHÒNG 👑)`
                : 'Đợi mọi người tham gia...'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Filter Sheet */}
      <SpinFilterSheet
        visible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={(f) => setFilters(f)}
        customCandidates={storeCustomCandidates.map((c) => ({ id: c.id, name: c.name }))}
        onAddCustom={addCustomCandidate}
        onRemoveCustom={removeCustomCandidate}
      />

      {/* Invite Members Sheet */}
      <InviteMembersSheet visible={isInviteOpen} onClose={() => setIsInviteOpen(false)} />

      {/* Join Room Code Modal */}
      <Modal
        visible={isJoinModalOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsJoinModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔑 Nhập Mã Phòng</Text>
            <Text style={styles.modalSubtitle}>Nhập mã phòng 4-8 ký tự để tham gia nhóm quay cùng bạn bè.</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Ví dụ: PARTY2026 hoặc FR-8892"
              placeholderTextColor="#8e4e14"
              value={joinCodeInput}
              onChangeText={setJoinCodeInput}
              autoCapitalize="characters"
              autoFocus
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsJoinModalOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={async () => {
                  if (!joinCodeInput.trim()) {
                    Alert.alert('Thông báo', 'Vui lòng nhập mã phòng!');
                    return;
                  }
                  try {
                    const success = await joinByCode(joinCodeInput);
                    if (success) {
                      setIsJoinModalOpen(false);
                      Alert.alert('Thành công 🎉', `Bạn đã vào phòng #${joinCodeInput.trim().toUpperCase()}!`);
                    }
                  } catch (err: any) {
                    const msg = err?.response?.data?.error || err?.message || 'Không thể vào phòng này.';
                    Alert.alert('Lỗi vào phòng', msg);
                  }
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.modalConfirmText}>Vào Phòng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Kick Member Confirmation Modal */}
      <Modal
        visible={!!memberToKick}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMemberToKick(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🚫 Xóa Thành Viên</Text>
            <Text style={styles.modalSubtitle}>
              Bạn có chắc chắn muốn xóa thành viên <Text style={{ fontWeight: '900', color: '#b52330' }}>{memberToKick?.name}</Text> khỏi phòng quay nhóm không?
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setMemberToKick(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: '#b52330', borderBottomColor: '#61000e' }]}
                onPress={async () => {
                  if (memberToKick) {
                    const kickedName = memberToKick.name;
                    await removeMember(memberToKick.id);
                    setMemberToKick(null);
                    if (Platform.OS === 'web' && typeof window !== 'undefined') {
                      window.alert(`Đã xóa ${kickedName} khỏi nhóm thành công!`);
                    } else {
                      Alert.alert('Đã xóa', `Đã xóa ${kickedName} khỏi nhóm thành công!`);
                    }
                  }
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.modalConfirmText}>Xác nhận Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8ef',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },

  // Room Card Banner
  roomCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  roomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roomCodeBadge: {
    backgroundColor: '#ffdad8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ff5a5f',
  },
  roomCodeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#b52330',
  },
  roomTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#b52330',
  },
  roomSubtitle: {
    fontSize: 12,
    color: '#8e4e14',
    marginTop: 2,
    fontWeight: '600',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff8ef',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2bebc',
  },
  settingsIcon: {
    fontSize: 18,
  },

  // Members Bar
  membersBar: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fbf3e4',
  },
  membersTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8e4e14',
    marginBottom: 8,
  },
  avatarScroll: {
    gap: 12,
    alignItems: 'center',
  },
  avatarWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#b52330',
  },
  hostCrown: {
    position: 'absolute',
    top: -6,
    right: -2,
    backgroundColor: '#FFC107',
    borderRadius: 10,
    paddingHorizontal: 3,
  },
  hostCrownText: {
    fontSize: 10,
  },
  avatarName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5a403f',
    marginTop: 3,
    maxWidth: 50,
  },
  addMemberBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#b52330',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addMemberIcon: {
    fontSize: 14,
    color: '#ffffff',
  },
  addMemberText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: -2,
  },

  // Tools Container
  toolsContainer: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  toolsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolsSectionTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#8e4e14',
    letterSpacing: 0.5,
  },
  aiPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  aiPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0d4',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#c68e17',
    gap: 4,
  },
  aiPillIcon: {
    fontSize: 12,
  },
  aiPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#8e4e14',
  },

  // Input Row
  addInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#b52330',
    fontWeight: '700',
  },
  addInputBtn: {
    backgroundColor: '#b52330',
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#61000e',
  },
  addInputBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },

  // Fast Chips
  chipScroll: {
    gap: 8,
  },
  quickChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2bebc',
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b52330',
  },

  // Candidates Pool
  poolSection: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  poolTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#b52330',
  },
  clearAllText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#8e4e14',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  candidateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdad8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff5a5f',
    gap: 6,
  },
  candidateText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#b52330',
  },
  removeIcon: {
    fontSize: 12,
    fontWeight: '900',
    color: '#b52330',
    marginLeft: 2,
  },

  // Wheel
  wheelWrapper: {
    marginTop: 10,
  },

  // Bottom Dock
  bottomDock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1.5,
    borderTopColor: '#e2bebc',
  },
  startSpinBtn: {
    backgroundColor: '#b52330',
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#61000e',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  startSpinBtnDisabled: {
    backgroundColor: '#e1d9cb',
    borderBottomColor: '#8e706f',
  },
  startSpinText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Room Code & Join Bar
  roomCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  createCodeBtn: {
    backgroundColor: '#ffdad8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff5a5f',
  },
  createCodeBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b52330',
  },
  joinCodeBtn: {
    backgroundColor: '#fff0d4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c68e17',
  },
  joinCodeBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8e4e14',
  },

  // Member Management & Kick
  membersTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  membersHint: {
    fontSize: 10,
    color: '#a08885',
    fontWeight: '600',
  },
  kickMemberBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#b52330',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    zIndex: 10,
  },
  kickMemberText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
  },

  // Join Room Modal
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 9999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff8ef',
    borderRadius: 24,
    padding: 22,
    borderWidth: 2,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
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
    marginBottom: 16,
    lineHeight: 18,
  },
  modalInput: {
    backgroundColor: '#fff8ef',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '800',
    color: '#3d2314',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 18,
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
