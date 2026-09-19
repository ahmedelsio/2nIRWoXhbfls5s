import { supabase, isSupabaseConfigured } from './client';
import { onlineManager } from '@tanstack/react-query';
import { LocalStore } from '../offline/storage';
import { syncOfflineQueue } from '../offline/syncWorker';
import { ProfileUpdateSchema } from './schemas';
import type { Database } from './types';
import type { ValidatedProfileUpdate } from './schemas';

type Profile = Database['public']['Tables']['profiles']['Row'];

const DEFAULT_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'lifter@ironmate.app',
  display_name: 'Alex Vance',
  avatar_url: null,
  experience_level: 'intermediate',
  primary_goal: 'hypertrophy',
  preferred_units: 'metric',
  default_bar_weight_kg: 20,
  default_rest_seconds: 120,
  cycle_tracking_enabled: false,
  cycle_phase: null,
  current_streak_days: 14,
  longest_streak_days: 28,
  last_active_date: new Date().toISOString(),
  onboarding_completed: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
};

export const ProfileRepository = {
  /**
   * Get user profile.
   */
  async getProfile(userId?: string): Promise<Profile> {
    let targetId = userId;
    if (!targetId && isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          targetId = session.user.id;
        }
      } catch {}
    }
    targetId = targetId || DEFAULT_PROFILE.id;

    const local = LocalStore.getProfile(targetId);
    if (local) return local;

    if (isSupabaseConfigured && onlineManager.isOnline()) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .maybeSingle();

        if (!error && data) {
          LocalStore.saveProfile(data);
          return data;
        }
      } catch (err) {
        console.warn('[ProfileRepository.getProfile] Fallback to default:', err);
      }
    }

    const fallback: Profile = {
      ...DEFAULT_PROFILE,
      id: targetId,
    };
    LocalStore.saveProfile(fallback);
    return fallback;
  },

  /**
   * Update profile fields (display name, units, cycle tracking, bar weight).
   */
  async updateProfile(userId: string, rawUpdates: ValidatedProfileUpdate): Promise<Profile> {
    const updates = ProfileUpdateSchema.parse(rawUpdates);
    const existing = await this.getProfile(userId);
    const now = new Date().toISOString();

    const updated: Profile = {
      ...existing,
      ...updates,
      updated_at: now,
    };

    LocalStore.saveProfile(updated);

    LocalStore.enqueueMutation({
      id: `profile-update-${Date.now()}`,
      mutationType: 'update_profile',
      table: 'profiles',
      payload: updated,
      clientTimestamp: now,
      status: 'pending',
      retryCount: 0,
    });

    syncOfflineQueue().catch(() => {});
    return updated;
  },
};
