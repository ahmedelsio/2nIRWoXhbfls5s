import { useEffect, useState } from 'react';
import { onlineManager } from '@tanstack/react-query';
import { subscribeNetworkState, syncOfflineQueue } from './syncWorker';
import { LocalStore } from './storage';
import type { NetworkState } from './types';

export function useNetworkStatus(): NetworkState & { triggerSync: () => Promise<void> } {
  const [state, setState] = useState<NetworkState>(() => ({
    isOnline: onlineManager.isOnline(),
    isSyncing: false,
    pendingCount: LocalStore.getQueue().filter((m) => m.status === 'pending' || m.status === 'failed').length,
    lastSyncedAt: LocalStore.getLastSyncedAt(),
  }));

  useEffect(() => {
    return subscribeNetworkState(setState);
  }, []);

  const triggerSync = async () => {
    await syncOfflineQueue();
  };

  return {
    ...state,
    triggerSync,
  };
}
