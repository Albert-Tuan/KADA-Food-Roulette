import { Stack } from 'expo-router';

export default function GroupSpinLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="lobby" />
      <Stack.Screen name="veto" />
      <Stack.Screen name="result" />
      <Stack.Screen name="check-in" />
      <Stack.Screen name="rewards" />
    </Stack>
  );
}
