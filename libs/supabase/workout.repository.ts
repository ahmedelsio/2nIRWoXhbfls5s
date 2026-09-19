import { supabase, isSupabaseConfigured } from './client';
import { onlineManager } from '@tanstack/react-query';
import { LocalStore } from '../offline/storage';
import { syncOfflineQueue } from '../offline/syncWorker';
import { SetInsertSchema, SetUpdateSchema, SessionInsertSchema } from './schemas';
import type { Database } from './types';
import type { ValidatedSetInsert, ValidatedSetUpdate, ValidatedSessionInsert } from './schemas';

type WorkoutSession = Database['public']['Tables']['sessions']['Row'];
type WorkoutSet = Database['public']['Tables']['sets']['Row'];

const EXERCISE_SLUG_MAP: Record<string, string> = {
  'bench': '00000000-0000-0000-0000-000000000002',
  'bench-press': '00000000-0000-0000-0000-000000000002',
  'barbell-bench-press': '00000000-0000-0000-0000-000000000002',
  'barbell-flat-bench-press': '00000000-0000-0000-0000-000000000002',
  'incline-db': '00000000-0000-0000-0000-000000000008',
  'incline-db-press': '00000000-0000-0000-0000-000000000008',
  'incline-dumbbell-press': '00000000-0000-0000-0000-000000000008',
  'standing-overhead-press': '00000000-0000-0000-0000-000000000004',
  'overhead-barbell-press': '00000000-0000-0000-0000-000000000004',
  'ohp': '00000000-0000-0000-0000-000000000004',
  'cable-lateral-raise': '00000000-0000-0000-0000-000000000009',
  'lat-raise': '00000000-0000-0000-0000-000000000009',
  'tricep-pushdown': '00000000-0000-0000-0000-000000000010',
  'cable-tricep-pushdown': '00000000-0000-0000-0000-000000000010',
  'triceps-ext': '00000000-0000-0000-0000-000000000010',
  'barbell-back-squat': '00000000-0000-0000-0000-000000000001',
  'squat': '00000000-0000-0000-0000-000000000001',
  'barbell-conventional-deadlift': '00000000-0000-0000-0000-000000000003',
  'barbell-deadlift': '00000000-0000-0000-0000-000000000003',
  'deadlift': '00000000-0000-0000-0000-000000000003',
  'conventional-deadlift': '00000000-0000-0000-0000-000000000003',
  'barbell-bent-over-row': '00000000-0000-0000-0000-000000000005',
  'barbell-row': '00000000-0000-0000-0000-000000000005',
  'row': '00000000-0000-0000-0000-000000000005',
  'romanian-deadlift': '00000000-0000-0000-0000-000000000006',
  'pull-up-bodyweight': '00000000-0000-0000-0000-000000000007',
  'pull-ups': '00000000-0000-0000-0000-000000000007',
  'lat-pulldown': '00000000-0000-0000-0000-000000000020',
  'leg-press': '00000000-0000-0000-0000-000000000011',
  'calf-raise': '00000000-0000-0000-0000-000000000011',
};

export function normalizeExerciseId(rawId: string): string {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId);
  if (isUUID) return rawId;
  return EXERCISE_SLUG_MAP[rawId.toLowerCase()] || '00000000-0000-0000-0000-000000000002';
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const WorkoutRepository = {
  /**
   * Fetch currently active session for the lifter.
   * Priority: Local cache first, background reconciliation with Supabase.
   */
  async getActiveSession(userId: string): Promise<WorkoutSession | null> {
    const localSessions = LocalStore.getSessions();
    const activeLocal = localSessions.find((s) => s.user_id === userId && s.status === 'in_progress');

    if (isSupabaseConfigured && onlineManager.isOnline()) {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'in_progress')
          .order('started_at', { ascending: false })
          .maybeSingle();

        if (!error && data) {
          LocalStore.saveSession(data);
          return data;
        }
      } catch (err) {
        console.warn('[WorkoutRepository.getActiveSession] Falling back to local cache:', err);
      }
    }

    return activeLocal || null;
  },

  /**
   * Fetch all sets for a given session.
   */
  async getSessionSets(sessionId: string): Promise<WorkoutSet[]> {
    const localSets = LocalStore.getSets(sessionId);

    if (isSupabaseConfigured && onlineManager.isOnline()) {
      try {
        const { data, error } = await supabase
          .from('sets')
          .select('*')
          .eq('session_id', sessionId)
          .order('set_number', { ascending: true });

        if (!error && data && data.length > 0) {
          data.forEach((s) => LocalStore.saveSet(s));
          return data;
        }
      } catch (err) {
        console.warn('[WorkoutRepository.getSessionSets] Falling back to local cache:', err);
      }
    }

    return localSets;
  },

  /**
   * Log a new completed set.
   * Sub-16ms local persistence + offline mutation queue + background sync.
   */
  async logSet(rawPayload: ValidatedSetInsert): Promise<WorkoutSet> {
    const validated = SetInsertSchema.parse(rawPayload);
    const setId = validated.id || generateUUID();
    const now = new Date().toISOString();
    const resolvedExerciseId = normalizeExerciseId(validated.exercise_id);

    // Ensure session exists in LocalStore & offline queue so foreign keys stay valid
    const existingSession = LocalStore.getSessions().find((s) => s.id === validated.session_id);
    if (!existingSession) {
      const sessionRecord: WorkoutSession = {
        id: validated.session_id,
        user_id: validated.user_id,
        program_id: null,
        program_day_id: null,
        name: 'Gym Workout Session',
        status: 'in_progress',
        started_at: now,
        completed_at: null,
        duration_minutes: 0,
        total_volume_kg: 0,
        total_sets_completed: 0,
        session_grade: 'A',
        grade_reason: null,
        readiness_score: 85,
        is_timeboxed: false,
        is_crowded_gym_mode: false,
        notes: null,
        created_at: now,
        updated_at: now,
      };
      LocalStore.saveSession(sessionRecord);
      LocalStore.enqueueMutation({
        id: validated.session_id,
        mutationType: 'create_session',
        table: 'sessions',
        payload: sessionRecord,
        clientTimestamp: now,
        status: 'pending',
        retryCount: 0,
      });
    }

    const record: WorkoutSet = {
      id: setId,
      session_id: validated.session_id,
      user_id: validated.user_id,
      exercise_id: resolvedExerciseId,
      set_number: validated.set_number,
      set_type: validated.set_type,
      weight_kg: validated.weight_kg,
      reps: validated.reps,
      target_reps: validated.target_reps ?? null,
      target_weight_kg: validated.target_weight_kg ?? null,
      tempo: validated.tempo ?? null,
      notes: validated.notes ?? null,
      completed_at: validated.completed_at ?? now,
      rpe: validated.rpe ?? null,
      rir: validated.rir ?? null,
      rest_time_seconds: validated.rest_time_seconds ?? 120,
      is_completed: validated.is_completed,
      is_pr: validated.is_pr,
      created_at: now,
      updated_at: now,
    };

    // 1. Instant local persistence
    LocalStore.saveSet(record);

    // 2. Enqueue offline mutation with idempotency key
    LocalStore.enqueueMutation({
      id: setId,
      mutationType: 'insert_set',
      table: 'sets',
      payload: record,
      clientTimestamp: now,
      status: 'pending',
      retryCount: 0,
    });

    // 3. Trigger background sync
    syncOfflineQueue().catch(() => {});

    return record;
  },

  /**
   * Update an existing set (weight, reps, RIR).
   */
  async updateSet(setId: string, rawUpdates: ValidatedSetUpdate): Promise<WorkoutSet | null> {
    const updates = SetUpdateSchema.parse(rawUpdates);
    const now = new Date().toISOString();

    // Find in local cache
    const existing = LocalStore.getSets('').find((s) => s.id === setId);
    const updated: WorkoutSet = existing
      ? {
          ...existing,
          ...updates,
          updated_at: now,
        }
      : ({
          id: setId,
          updated_at: now,
          ...updates,
        } as unknown as WorkoutSet);

    if (existing) {
      LocalStore.saveSet(updated);
    }

    LocalStore.enqueueMutation({
      id: generateUUID(),
      mutationType: 'update_set',
      table: 'sets',
      payload: { id: setId, ...updates, updated_at: now },
      clientTimestamp: now,
      status: 'pending',
      retryCount: 0,
    });

    syncOfflineQueue().catch(() => {});

    return updated;
  },

  /**
   * Create a new workout session.
   */
  async createSession(rawPayload: ValidatedSessionInsert): Promise<WorkoutSession> {
    const validated = SessionInsertSchema.parse(rawPayload);
    const sessionId = validated.id || generateUUID();
    const now = new Date().toISOString();

    const session: WorkoutSession = {
      id: sessionId,
      user_id: validated.user_id,
      program_id: validated.program_id ?? null,
      program_day_id: validated.program_day_id ?? null,
      name: validated.name,
      status: validated.status,
      started_at: validated.started_at || now,
      ended_at: null,
      completed_at: null,
      duration_seconds: null,
      duration_minutes: null,
      total_tonnage_kg: 0,
      total_volume_kg: 0,
      total_sets_completed: 0,
      session_grade: null,
      grade_reason: null,
      readiness_score_at_start: null,
      readiness_score: null,
      is_timeboxed: validated.is_timeboxed,
      is_crowded_gym_mode: validated.is_crowded_gym_mode,
      notes: validated.notes ?? null,
      created_at: now,
      updated_at: now,
    };

    LocalStore.saveSession(session);

    LocalStore.enqueueMutation({
      id: sessionId,
      mutationType: 'create_session',
      table: 'sessions',
      payload: session,
      clientTimestamp: now,
      status: 'pending',
      retryCount: 0,
    });

    syncOfflineQueue().catch(() => {});

    return session;
  },

  /**
   * Finish and complete a workout session.
   */
  async completeSession(sessionId: string, durationMinutes: number, notes?: string): Promise<void> {
    const now = new Date().toISOString();
    const sessions = LocalStore.getSessions();
    const session = sessions.find((s) => s.id === sessionId);

    if (session) {
      const completed: WorkoutSession = {
        ...session,
        status: 'completed',
        completed_at: now,
        duration_minutes: durationMinutes,
        notes: notes ?? session.notes,
        updated_at: now,
      };
      LocalStore.saveSession(completed);
    }

    LocalStore.enqueueMutation({
      id: generateUUID(),
      mutationType: 'complete_session',
      table: 'sessions',
      payload: {
        id: sessionId,
        status: 'completed',
        completed_at: now,
        duration_minutes: durationMinutes,
        notes: notes ?? null,
        updated_at: now,
      },
      clientTimestamp: now,
      status: 'pending',
      retryCount: 0,
    });

    syncOfflineQueue().catch(() => {});
  },

  /**
   * Get historical workout sessions.
   */
  async getWorkoutHistory(userId: string, limit: number = 20): Promise<WorkoutSession[]> {
    const local = LocalStore.getSessions()
      .filter((s) => s.user_id === userId && s.status === 'completed')
      .slice(0, limit);

    if (isSupabaseConfigured && onlineManager.isOnline()) {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          data.forEach((s) => LocalStore.saveSession(s));
          return data;
        }
      } catch (err) {
        console.warn('[WorkoutRepository.getWorkoutHistory] Fallback to local:', err);
      }
    }

    return local;
  },
};
