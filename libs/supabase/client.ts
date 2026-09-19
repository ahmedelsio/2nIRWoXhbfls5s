import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { Database } from './types';

export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}

// In-memory fallback storage for environments with no window.localStorage or AsyncStorage
const inMemoryStorage = new Map<string, string>();
const fallbackStorageAdapter: StorageAdapter = {
  getItem: (key: string) => inMemoryStorage.get(key) ?? null,
  setItem: (key: string, value: string) => {
    inMemoryStorage.set(key, value);
  },
  removeItem: (key: string) => {
    inMemoryStorage.delete(key);
  },
};

let customStorageAdapter: StorageAdapter | null = null;

/**
 * Configure AsyncStorage for Expo React Native auth session persistence.
 *
 * @example
 * ```ts
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * import { configureSupabaseAuthStorage } from '@/libs/supabase';
 *
 * configureSupabaseAuthStorage(AsyncStorage);
 * ```
 */
export function configureSupabaseAuthStorage(storage: StorageAdapter): void {
  customStorageAdapter = storage;
  // If client already created, reset so it picks up the storage adapter
  supabaseInstance = null;
}

// Universal environment variable resolver (supports Expo process.env, Vite import.meta.env, and local persistence)
function getRawSupabaseUrl(): string {
  try {
    const staticEnv =
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_URL) ||
      (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
      (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.EXPO_PUBLIC_SUPABASE_URL) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.SUPABASE_URL);

    if (typeof staticEnv === 'string' && staticEnv.trim().length > 0) {
      return staticEnv.trim();
    }
  } catch {}

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored =
        window.localStorage.getItem('EXPO_PUBLIC_SUPABASE_URL') ||
        window.localStorage.getItem('VITE_SUPABASE_URL') ||
        window.localStorage.getItem('SUPABASE_URL');
      if (stored && stored.trim().length > 0) {
        return stored.trim();
      }
    }
  } catch {}

  return '';
}

function getRawSupabaseAnonKey(): string {
  try {
    const staticEnv =
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_KEY) ||
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY) ||
      (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
      (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.EXPO_PUBLIC_SUPABASE_KEY) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.EXPO_PUBLIC_SUPABASE_ANON_KEY) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.SUPABASE_ANON_KEY);

    if (typeof staticEnv === 'string' && staticEnv.trim().length > 0) {
      return staticEnv.trim();
    }
  } catch {}

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored =
        window.localStorage.getItem('EXPO_PUBLIC_SUPABASE_KEY') ||
        window.localStorage.getItem('EXPO_PUBLIC_SUPABASE_ANON_KEY') ||
        window.localStorage.getItem('VITE_SUPABASE_ANON_KEY') ||
        window.localStorage.getItem('SUPABASE_ANON_KEY');
      if (stored && stored.trim().length > 0) {
        return stored.trim();
      }
    }
  } catch {}

  return '';
}

export let supabaseUrl = getRawSupabaseUrl();
export let supabaseAnonKey = getRawSupabaseAnonKey();
export let isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function checkIsSupabaseConfigured(): boolean {
  const url = getRawSupabaseUrl();
  const key = getRawSupabaseAnonKey();
  return Boolean(url && key);
}

export function getSupabaseConfig(): {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: string;
} {
  const url = getRawSupabaseUrl();
  const key = getRawSupabaseAnonKey();
  const configured = Boolean(url && key);
  return {
    url,
    anonKey: key ? `${key.slice(0, 12)}...` : '',
    isConfigured: configured,
    source: url ? (url.includes('supabase.co') ? 'Cloud Supabase' : 'Custom Endpoint') : 'None',
  };
}

export function setCustomSupabaseCredentials(url: string, anonKey: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('EXPO_PUBLIC_SUPABASE_URL', url.trim());
      window.localStorage.setItem('EXPO_PUBLIC_SUPABASE_KEY', anonKey.trim());
      window.localStorage.setItem('VITE_SUPABASE_URL', url.trim());
      window.localStorage.setItem('VITE_SUPABASE_ANON_KEY', anonKey.trim());
    }
    supabaseUrl = url.trim();
    supabaseAnonKey = anonKey.trim();
    isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
    // Invalidate client instance to rebuild with new credentials
    supabaseInstance = null;
  } catch {}
}

let supabaseInstance: SupabaseClient<Database> | null = null;

// Determine if running in standard DOM browser (not React Native / Expo Native)
const isDomBrowser =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.location !== 'undefined';

/**
 * Returns the singleton typed Supabase client.
 * Self-contained and production-ready for Expo React Native and Web.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    if (!isSupabaseConfigured) {
      console.warn(
        '[Ironmate Supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY not configured. Running with offline-first local fallback store.'
      );
    }

    const activeUrl = supabaseUrl || 'https://placeholder.supabase.co';
    const activeKey = supabaseAnonKey || 'placeholder-anon-key';

    // Select optimal storage adapter
    const storage = customStorageAdapter ||
      (isDomBrowser && typeof window.localStorage !== 'undefined'
        ? window.localStorage
        : AsyncStorage || fallbackStorageAdapter);

    supabaseInstance = createClient<Database>(activeUrl, activeKey, {
      auth: {
        storage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: isDomBrowser, // false on React Native to avoid window.location crashes
      },
    });
  }

  return supabaseInstance;
}

export const supabase = getSupabase();
export type { Database };
