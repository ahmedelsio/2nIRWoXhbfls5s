import { supabase, isSupabaseConfigured } from './client';
import { onlineManager } from '@tanstack/react-query';
import { LocalStore } from '../offline/storage';

export interface SessionMuscleVolumeRow {
  session_id: string;
  primary_muscle: string;
  set_count: number;
  volume_kg: number;
}

export interface UserTrainingStreakRow {
  user_id: string;
  current_streak_days: number;
  longest_streak_days: number;
  last_completed_on: string | null;
}

export const StatsRepository = {
  /**
   * Fetches aggregated volume and set count by primary muscle for a session.
   * Uses public.session_muscle_volume view, falling back to client-side computation from sets.
   */
  async getSessionMuscleVolume(sessionId: string): Promise<SessionMuscleVolumeRow[]> {
    if (isSupabaseConfigured && onlineManager.isOnline()) {
      try {
        const { data, error } = await (supabase.from('session_muscle_volume') as any)
          .select('*')
          .eq('session_id', sessionId);

        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            session_id: row.session_id,
            primary_muscle: row.primary_muscle || 'Other',
            set_count: Number(row.set_count) || 0,
            volume_kg: Number(row.volume_kg) || 0,
          }));
        }
      } catch (err) {
        console.warn('[StatsRepository.getSessionMuscleVolume] View query failed, using local fallback:', err);
      }
    }

    // Local fallback: calculate from LocalStore sets
    const localSets = LocalStore.getSets(sessionId).filter((s) => s.is_completed);
    if (localSets.length === 0) return [];

    let exMap = new Map<string, string>();
    try {
      const { EXERCISE_LIBRARY } = await import('../../data/mockData');
      exMap = new Map(EXERCISE_LIBRARY.map((e) => [e.id, e.targetMuscle || 'Other']));
    } catch {
      // ignore
    }

    const group: Record<string, { set_count: number; volume_kg: number }> = {};
    for (const set of localSets) {
      const muscle = exMap.get(set.exercise_id) || 'Compound / Other';
      if (!group[muscle]) {
        group[muscle] = { set_count: 0, volume_kg: 0 };
      }
      group[muscle].set_count += 1;
      group[muscle].volume_kg += Number(set.weight_kg || 0) * Number(set.reps || 0);
    }

    return Object.entries(group).map(([primary_muscle, val]) => ({
      session_id: sessionId,
      primary_muscle,
      set_count: val.set_count,
      volume_kg: Math.round(val.volume_kg * 100) / 100,
    }));
  },

  /**
   * Fetches training streak data for a user.
   * Uses public.user_training_streak view, falling back to local session history computation.
   */
  async getUserTrainingStreak(userId: string): Promise<UserTrainingStreakRow> {
    if (isSupabaseConfigured && onlineManager.isOnline()) {
      try {
        const { data, error } = await (supabase.from('user_training_streak') as any)
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          return {
            user_id: data.user_id,
            current_streak_days: Number(data.current_streak_days) || 0,
            longest_streak_days: Number(data.longest_streak_days) || 0,
            last_completed_on: data.last_completed_on || null,
          };
        }
      } catch (err) {
        console.warn('[StatsRepository.getUserTrainingStreak] View query failed, using local fallback:', err);
      }
    }

    // Local fallback: calculate consecutive calendar days from local sessions
    const completedSessions = LocalStore.getSessions().filter(
      (s) => s.user_id === userId && s.status === 'completed'
    );

    const dates = new Set<string>();
    for (const s of completedSessions) {
      const dateStr = (s.completed_at || s.started_at || '').split('T')[0];
      if (dateStr) dates.add(dateStr);
    }

    const sortedDates = Array.from(dates).sort().reverse();
    if (sortedDates.length === 0) {
      return {
        user_id: userId,
        current_streak_days: 0,
        longest_streak_days: 0,
        last_completed_on: null,
      };
    }

    const lastCompletedOn = sortedDates[0];
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    if (dates.has(today) || dates.has(yesterday)) {
      let checkDate = dates.has(today) ? new Date() : new Date(Date.now() - 86400000);
      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (dates.has(checkStr)) {
          currentStreak++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else {
          break;
        }
      }
    }

    return {
      user_id: userId,
      current_streak_days: currentStreak,
      longest_streak_days: Math.max(currentStreak, sortedDates.length),
      last_completed_on: lastCompletedOn,
    };
  },
};
