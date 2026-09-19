import { Stack } from 'expo-router';
import { useTheme } from '@/src/hooks/use-theme';

/**
 * Auth group layout — no tab bar, no header chrome.
 * Screens: index (welcome), login (email), verify (check inbox).
 */
export default function AuthLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}