import { Stack } from 'expo-router';

export default function TodayLayout() {
  return <Stack screenOptions={{ headerTitleStyle: { color: 'transparent' }, headerTransparent: true }} />;
}