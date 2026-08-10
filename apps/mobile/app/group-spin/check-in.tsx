import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function CheckInScreen() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 59);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const members = [
    { name: 'Linh T.', status: 'At Table', statusType: 'here' },
    { name: 'You', status: 'Here', statusType: 'you' },
    { name: 'Mai H.', status: '150m away', statusType: 'near' },
    { name: 'Khoa D.', status: 'On the way', statusType: 'away' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status */}
        <View style={styles.statusCard}>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>⏱️ {formatTime(timeLeft)} Left</Text>
          </View>
          <Text style={styles.statusTitle}>Almost there!</Text>
          <Text style={styles.statusSubtitle}>
            Checking in at <Text style={styles.bold}>Bún Bò Bà Luân</Text>
          </Text>
        </View>

        {/* Members Grid */}
        <Text style={styles.sectionLabel}>GROUP ARRIVAL STATUS</Text>
        <View style={styles.membersGrid}>
          {members.map((m, i) => (
            <View key={i} style={[
              styles.memberCard,
              m.statusType === 'you' && styles.memberCardYou,
            ]}>
              <Text style={styles.memberEmoji}>
                {m.statusType === 'here' ? '✅' : m.statusType === 'you' ? '📍' : m.statusType === 'near' ? '🚶' : '🚗'}
              </Text>
              <Text style={styles.memberCardName}>{m.name}</Text>
              <Text style={[
                styles.memberCardStatus,
                m.statusType === 'here' && styles.statusGreen,
                m.statusType === 'you' && styles.statusPrimary,
              ]}>
                {m.status}
              </Text>
            </View>
          ))}
        </View>

        {/* Photo Verification */}
        <View style={styles.verifySection}>
          <View style={styles.verifyHeader}>
            <Text style={styles.verifyLabel}>📸 Photo Verification</Text>
            <Text style={styles.verifyBadge}>Required for +500🪙</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/group-spin/rewards')}
            style={styles.cameraButton}
          >
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.cameraText}>Take Group Photo</Text>
          </TouchableOpacity>
          <Text style={styles.gpsNote}>
            GPS and timestamps are automatically added to prevent cheating.
          </Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/group-spin/rewards')}>
          <Text style={styles.skipLink}>Check-in without photo</Text>
        </TouchableOpacity>
        <Text style={styles.skipWarning}>
          Note: Skipping photo forfeits Lucky Spin rewards.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  timerBadge: {
    backgroundColor: '#F5F5F4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#55A37A',
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#292524',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#78716C',
  },
  bold: {
    fontWeight: '700',
    color: '#292524',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78716C',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 10,
    paddingLeft: 4,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  memberCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  memberCardYou: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  memberEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  memberCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#292524',
    marginBottom: 4,
  },
  memberCardStatus: {
    fontSize: 11,
    color: '#78716C',
  },
  statusGreen: {
    color: '#16A34A',
  },
  statusPrimary: {
    color: '#B52330',
    fontWeight: '600',
  },
  verifySection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  verifyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FAFAF9',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  verifyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78716C',
  },
  verifyBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#55A37A',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cameraButton: {
    backgroundColor: '#1C1917',
    margin: 16,
    paddingVertical: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cameraText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  gpsNote: {
    fontSize: 11,
    color: '#78716C',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  skipLink: {
    fontSize: 13,
    color: '#78716C',
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: 20,
  },
  skipWarning: {
    fontSize: 11,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 4,
  },
});
