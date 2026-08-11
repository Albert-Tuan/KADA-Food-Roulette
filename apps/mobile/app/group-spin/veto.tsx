import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GroupVoteVeto } from '../../src/features/spin/components/GroupVoteVeto';
import { useGroupSpinStore } from '../../src/stores/groupSpinStore';

export default function VetoScreen() {
  const router = useRouter();
  const { castVote, hostId, members } = useGroupSpinStore();

  const handleVote = (decision: 'ACCEPT' | 'RESPIN' | 'VETO') => {
    castVote(hostId || members[0].id, decision);
    if (decision === 'ACCEPT') {
      router.push('/group-spin/result');
    } else if (decision === 'RESPIN') {
      router.replace('/group-spin/lobby');
    } else if (decision === 'VETO') {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GroupVoteVeto onVote={handleVote} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
});
