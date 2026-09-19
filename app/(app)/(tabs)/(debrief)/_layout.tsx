import { Stack } from 'expo-router';

export default function DebriefLayout() {
  return <Stack screenOptions={{ headerTitleStyle: { color: 'transparent' }, headerTransparent: true }} />;
}