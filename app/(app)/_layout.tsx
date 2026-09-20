import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal/plates" options={{ presentation: 'formSheet', }} />
      <Stack.Screen name="modal/auth" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.99] }} />
      <Stack.Screen name="modal/cues" options={{ presentation: 'formSheet' }} />
      <Stack.Screen name="modal/swap-exercise" options={{ presentation: 'formSheet' }} />
      <Stack.Screen name="modal/onboarding" options={{ presentation: 'formSheet' }} />
      <Stack.Screen name="modal/ai-coach" options={{ presentation: 'formSheet' }} />
    </Stack>
  );
}