import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GroupLobby } from '../../src/features/spin/components/GroupLobby';

export default function LobbyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <GroupLobby
        onSpinEnd={() => router.push('/group-spin/veto')}
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
