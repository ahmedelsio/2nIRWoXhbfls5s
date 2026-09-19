import type { OfflineMutation } from './types';
import type { Database } from '../supabase/types';

type WorkoutSet = Database['public']['Tables']['sets']['Row'];
type WorkoutSession = Database['public']['Tables']['sessions']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Exercise = Database['public']['Tables']['exercises']['Row'];

const STORAGE_KEYS = {
  QUEUE: 'ironmate_offline_mutation_queue_v1',
  SESSIONS: 'ironmate_local_sessions_v1',
  SETS: 'ironmate_local_sets_v1',
  PROFILE: 'ironmate_local_profile_v1',
  EXERCISES: 'ironmate_local_exercises_v1',
  LAST_SYNC: 'ironmate_last_synced_at_v1',
} as const;

export interface PersistentStorageDriver {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}

// Synchronous fast cache: guarantees < 16ms instant gym floor set logging
const memoryCache = new Map<string, string>();
let customDriver: PersistentStorageDriver | null = null;

function hasLocalStorage(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined' &&
      typeof window.localStorage.getItem === 'function' &&
      typeof window.localStorage.setItem === 'function'
    );
  } catch {
    return false;
  }
}

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    // 1. Check memory cache first (instant synchronous)
    const mem = memoryCache.get(key);
    if (mem) {
      return JSON.parse(mem) as T;
    }
    // 2. Check DOM localStorage if available
    if (hasLocalStorage()) {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        memoryCache.set(key, raw);
        return JSON.parse(raw) as T;
      }
    }
    return fallback;
  } catch (error) {
    console.warn(`[Ironmate Storage] Failed to read ${key}:`, error);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    memoryCache.set(key, serialized);

    if (hasLocalStorage()) {
      window.localStorage.setItem(key, serialized);
    }

    if (customDriver) {
      Promise.resolve(customDriver.setItem(key, serialized)).catch((err) => {
        console.warn(`[Ironmate Storage] Persistent write error for ${key}:`, err);
      });
    }
  } catch (error) {
    console.warn(`[Ironmate Storage] Failed to write ${key}:`, error);
  }
}

export const LocalStore = {
  /**
   * Plugs in AsyncStorage or any persistent driver for React Native / Expo.
   * Hydrates the fast memory cache on app launch.
   */
  async initPersistentDriver(driver: PersistentStorageDriver): Promise<void> {
    customDriver = driver;
    try {
      for (const key of Object.values(STORAGE_KEYS)) {
        const value = await driver.getItem(key);
        if (value && !memoryCache.has(key)) {
          memoryCache.set(key, value);
        }
      }
    } catch (err) {
      console.warn('[Ironmate Storage] Failed to hydrate persistent storage:', err);
    }
  },

  // Mutation Queue Operations (Sync Worker)
  getQueue(): OfflineMutation[] {
    return safeGetItem<OfflineMutation[]>(STORAGE_KEYS.QUEUE, []);
  },

  enqueueMutation(mutation: OfflineMutation): void {
    const queue = this.getQueue();
    const exists = queue.some((m) => m.id === mutation.id);
    if (!exists) {
      queue.push(mutation);
      safeSetItem(STORAGE_KEYS.QUEUE, queue);
    }
  },

  removeMutation(id: string): void {
    const queue = this.getQueue().filter((m) => m.id !== id);
    safeSetItem(STORAGE_KEYS.QUEUE, queue);
  },

  updateMutationStatus(id: string, updates: Partial<OfflineMutation>): void {
    const queue = this.getQueue().map((m) => (m.id === id ? { ...m, ...updates } : m));
    safeSetItem(STORAGE_KEYS.QUEUE, queue);
  },

  clearCompletedMutations(): void {
    const queue = this.getQueue().filter((m) => m.status !== 'synced');
    safeSetItem(STORAGE_KEYS.QUEUE, queue);
  },

  markAllAsLocalSynced(): void {
    const queue = this.getQueue().map((m) => ({
      ...m,
      status: 'synced' as const,
      lastError: undefined,
    }));
    safeSetItem(STORAGE_KEYS.QUEUE, queue);
    this.setLastSyncedAt(new Date().toISOString());
  },

  clearQueue(): void {
    safeSetItem(STORAGE_KEYS.QUEUE, []);
  },

  // Local Entity Cache (Immediate < 16ms Gym Floor reads and writes)
  getSessions(): WorkoutSession[] {
    return safeGetItem<WorkoutSession[]>(STORAGE_KEYS.SESSIONS, []);
  },

  saveSession(session: WorkoutSession): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    safeSetItem(STORAGE_KEYS.SESSIONS, sessions);
  },

  getSets(sessionId: string): WorkoutSet[] {
    const allSets = safeGetItem<WorkoutSet[]>(STORAGE_KEYS.SETS, []);
    return allSets
      .filter((s) => s.session_id === sessionId)
      .sort((a, b) => a.set_number - b.set_number);
  },

  saveSet(setRecord: WorkoutSet): void {
    const allSets = safeGetItem<WorkoutSet[]>(STORAGE_KEYS.SETS, []);
    const index = allSets.findIndex((s) => s.id === setRecord.id);
    if (index >= 0) {
      allSets[index] = setRecord;
    } else {
      allSets.push(setRecord);
    }
    safeSetItem(STORAGE_KEYS.SETS, allSets);
  },

  deleteSet(setId: string): void {
    const allSets = safeGetItem<WorkoutSet[]>(STORAGE_KEYS.SETS, []);
    safeSetItem(
      STORAGE_KEYS.SETS,
      allSets.filter((s) => s.id !== setId)
    );
  },

  getProfile(userId: string): Profile | null {
    const profile = safeGetItem<Profile | null>(STORAGE_KEYS.PROFILE, null);
    return profile && profile.id === userId ? profile : null;
  },

  saveProfile(profile: Profile): void {
    safeSetItem(STORAGE_KEYS.PROFILE, profile);
  },

  clearProfile(): void {
    safeSetItem(STORAGE_KEYS.PROFILE, null);
  },

  getLastSyncedAt(): string | null {
    return safeGetItem<string | null>(STORAGE_KEYS.LAST_SYNC, null);
  },

  setLastSyncedAt(timestamp: string): void {
    safeSetItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  },
};
