import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTheme } from '../hooks/use-theme';

export default function AppTabs() {
  const theme = useTheme();

  return (
    <NativeTabs
      backgroundColor={theme.background}
      indicatorColor={theme.backgroundElement}
      labelStyle={{ selected: { color: theme.text } }}
      tintColor={theme.accent}
    >
      <NativeTabs.Trigger name="(today)">
        <NativeTabs.Trigger.Label hidden>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sun.max" renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(gym)" role="search">
        <NativeTabs.Trigger.Label hidden>Gym Mode</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="dumbbell" renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(debrief)">
        <NativeTabs.Trigger.Label hidden>Debrief</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="moon" renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(library)">
        <NativeTabs.Trigger.Label hidden>Library</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book" renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(profile)">
        <NativeTabs.Trigger.Label hidden>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person" renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}