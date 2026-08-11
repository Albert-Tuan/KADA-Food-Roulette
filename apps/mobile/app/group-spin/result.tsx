import React from 'react';
import { StyleSheet, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GroupVoteResult } from '../../src/features/spin/components/GroupVoteResult';
import { useSpinStore } from '../../src/stores/spinStore';

export default function ResultScreen() {
  const router = useRouter();
  const { currentResult } = useSpinStore();

  const handleDirections = () => {
    if (currentResult) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentResult.name)}`;
      Linking.openURL(url).catch(() => Alert.alert('Lỗi', 'Không thể mở bản đồ'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GroupVoteResult
        onCreatePact={() => router.push('/group-spin/check-in')}
        onRespin={() => router.replace('/group-spin/lobby')}
        onDirections={handleDirections}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
});
