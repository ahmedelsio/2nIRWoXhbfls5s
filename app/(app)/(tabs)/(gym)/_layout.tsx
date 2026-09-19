import { Stack } from 'expo-router';

export default function GymLayout() {
  return <Stack screenOptions={{ headerTitleStyle: { color: 'transparent' }, headerTransparent: true }} />;
}