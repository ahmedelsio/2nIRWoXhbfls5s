import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, AppState, Platform, View } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { DataFactoryProvider } from '../context/DataFactoryContext';
import { useTheme } from '../hooks/use-theme';
import { LocalStore, syncOfflineQueue } from '../libs/offline';
import { configureTanStackOnlineManager, onAppStateChange, queryClient } from '../libs/tanstack';

configureTanStackOnlineManager(NetInfo);

export default function AppProviders({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void LocalStore.initPersistentDriver(AsyncStorage).then(() => setReady(true));

    const appStateSubscription = AppState.addEventListener('change', (status) => {
      if (Platform.OS !== 'web') onAppStateChange(status);
      if (status === 'active' && onlineManager.isOnline()) void syncOfflineQueue();
    });
    const networkSubscription = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) void syncOfflineQueue();
    });

    return () => {
      appStateSubscription.remove();
      networkSubscription();
    };
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataFactoryProvider>{children}</DataFactoryProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}