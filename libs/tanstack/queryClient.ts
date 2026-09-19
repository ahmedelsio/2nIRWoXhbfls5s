import { QueryClient, onlineManager } from '@tanstack/react-query';

/**
 * Enterprise TanStack Query Client configured for offline-first gym floor usage.
 * Follows official TanStack Query React Native & offline documentation:
 * https://tanstack.com/query/latest/docs/framework/react/react-native
 *
 * - networkMode: 'offlineFirst' enables reading and writing to cache even without signal
 * - onlineManager: handles online/offline state consistently across Web and React Native
 * - staleTime: 5 mins prevents jittery background refetches during active lifting
 * - gcTime: 24 hours retains exercise library and sets in memory throughout full workouts
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: (failureCount) => {
        // If offline per onlineManager, do not spin retries
        if (!onlineManager.isOnline()) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // Managed by focusManager in React Native
      refetchOnReconnect: true,
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: (failureCount) => {
        if (!onlineManager.isOnline()) return false;
        return failureCount < 2;
      },
    },
  },
});
