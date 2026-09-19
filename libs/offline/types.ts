export type MutationType =
  | 'insert_set'
  | 'update_set'
  | 'delete_set'
  | 'create_session'
  | 'update_session'
  | 'complete_session'
  | 'update_profile';

export type MutationStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface OfflineMutation<T = Record<string, unknown>> {
  id: string; // UUID v4 client generated for idempotency
  mutationType: MutationType;
  table: 'sets' | 'sessions' | 'profiles' | 'personal_records';
  payload: T;
  clientTimestamp: string;
  status: MutationStatus;
  retryCount: number;
  lastError?: string;
}

export interface SyncResult {
  syncedCount: number;
  failedCount: number;
  errors: Array<{ id: string; error: string }>;
}

export interface NetworkState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
}
