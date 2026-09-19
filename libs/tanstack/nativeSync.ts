import { onlineManager, focusManager } from '@tanstack/react-query';

/**
 * Interface matching @react-native-community/netinfo API
 */
export interface NetInfoLike {
  addEventListener: (
    listener: (state: {
      isConnected?: boolean | null;
      isInternetReachable?: boolean | null;
    }) => void
  ) => () => void;
}

/**
 * Configures TanStack Query onlineManager for React Native.
 * Follows official documentation:
 * https://tanstack.com/query/latest/docs/framework/react/react-native#online-status-management
 *
 * @example
 * ```ts
 * import NetInfo from '@react-native-community/netinfo';
 * import { configureTanStackOnlineManager } from '@/libs/tanstack';
 *
 * configureTanStackOnlineManager(NetInfo);
 * ```
 */
export function configureTanStackOnlineManager(netInfo: NetInfoLike): void {
  onlineManager.setEventListener((setOnline) => {
    return netInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? false;
      const isReachable = state.isInternetReachable ?? true;
      setOnline(isConnected && isReachable);
    });
  });
}

/**
 * Focus manager subscriber for React Native AppState.
 * Follows official documentation:
 * https://tanstack.com/query/latest/docs/framework/react/react-native#refetch-on-app-focus
 *
 * @example
 * ```ts
 * import { AppState, type AppStateStatus, Platform } from 'react-native';
 * import { onAppStateChange } from '@/libs/tanstack';
 *
 * useEffect(() => {
 *   const sub = AppState.addEventListener('change', (status: AppStateStatus) => {
 *     if (Platform.OS !== 'web') {
 *       onAppStateChange(status);
 *     }
 *   });
 *   return () => sub.remove();
 * }, []);
 * ```
 */
export function onAppStateChange(status: string): void {
  focusManager.setFocused(status === 'active');
}
