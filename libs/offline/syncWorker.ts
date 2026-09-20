import { LocalStore } from './storage';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { onlineManager } from '@tanstack/react-query';
import type { SyncResult, NetworkState } from './types';

type NetworkListener = (state: NetworkState) => void;
const listeners = new Set<NetworkListener>();

let isSyncing = false;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(str: unknown): boolean {
  return typeof str === 'string' && UUID_REGEX.test(str);
}

function mapToSessionGrade(grade?: string | null): string | null {
  if (!grade) return null;
  const upper = String(grade).toUpperCase().trim();
  if (upper === 'A+' || upper === 'A_PLUS') return 'A_plus';
  if (upper === 'A') return 'A';
  if (upper === 'B+' || upper === 'B_PLUS') return 'B_plus';
  if (upper === 'B' || upper === 'B-') return 'B';
  if (upper === 'C' || upper === 'C+' || upper === 'C-') return 'C';
  if (upper === 'DELOAD') return 'deload';
  return 'A';
}

/**
 * Sanitizes session payload strictly according to Supabase `public.sessions` table schema:
 * (id, user_id, program_id, program_day_id, name, status, started_at, completed_at,
 *  duration_minutes, total_volume_kg, total_sets_completed, session_grade, grade_reason,
 *  readiness_score, is_timeboxed, is_crowded_gym_mode, notes, created_at, updated_at)
 * 
 * Omits client-only/unrecognized properties (ended_at, duration_seconds, total_tonnage_kg,
 * readiness_score_at_start) that trigger PostgREST 400 Bad Request.
 */
function sanitizeSessionPayload(raw: any, authUserId?: string | null): Record<string, any> {
  const userId = authUserId || raw.user_id;
  const clean: Record<string, any> = {
    id: raw.id,
    user_id: userId,
    name: raw.name || 'Gym Workout Session',
    status: raw.status || 'in_progress',
    started_at: raw.started_at || new Date().toISOString(),
    duration_minutes: raw.duration_minutes ?? (raw.duration_seconds ? Math.round(raw.duration_seconds / 60) : 0),
    total_volume_kg: Number(raw.total_volume_kg ?? (raw.total_tonnage_kg ? raw.total_tonnage_kg * 1000 : 0)),
    total_sets_completed: Number(raw.total_sets_completed ?? 0),
    session_grade: mapToSessionGrade(raw.session_grade),
    grade_reason: raw.grade_reason || null,
    readiness_score: Number(raw.readiness_score ?? raw.readiness_score_at_start ?? 85),
    is_timeboxed: Boolean(raw.is_timeboxed),
    is_crowded_gym_mode: Boolean(raw.is_crowded_gym_mode),
    notes: raw.notes || null,
  };

  if (raw.completed_at) clean.completed_at = raw.completed_at;
  if (raw.created_at) clean.created_at = raw.created_at;
  if (raw.updated_at) clean.updated_at = raw.updated_at;

  // Foreign keys must be valid UUIDs or null
  clean.program_id = isValidUUID(raw.program_id) ? raw.program_id : null;
  clean.program_day_id = isValidUUID(raw.program_day_id) ? raw.program_day_id : null;

  return clean;
}

/**
 * Sanitizes set payload strictly according to Supabase `public.sets` table schema:
 * (id, session_id, user_id, exercise_id, set_number, set_type, weight_kg, reps,
 *  rpe, rir, rest_time_seconds, is_completed, is_pr, created_at, updated_at)
 * 
 * Omits client-only/unrecognized properties (tempo, target_reps, target_weight_kg,
 * completed, rest_seconds) that trigger PostgREST 400 Bad Request.
 */
function sanitizeSetPayload(raw: any, authUserId?: string | null): Record<string, any> {
  const userId = authUserId || raw.user_id;
  const rawExerciseId = raw.exercise_id || '';
  const resolvedExerciseId = isValidUUID(rawExerciseId)
    ? rawExerciseId
    : '00000000-0000-0000-0000-000000000002'; // Fallback to Barbell Bench Press if slug or non-uuid

  const clean: Record<string, any> = {
    id: raw.id,
    session_id: raw.session_id,
    user_id: userId,
    exercise_id: resolvedExerciseId,
    set_number: Number(raw.set_number || 1),
    set_type: raw.set_type || 'working',
    weight_kg: Number(raw.weight_kg || 0),
    reps: Number(raw.reps || 0),
    rpe: raw.rpe != null ? Number(raw.rpe) : null,
    rir: raw.rir != null ? Number(raw.rir) : null,
    rest_time_seconds: Number(raw.rest_time_seconds ?? raw.rest_seconds ?? 120),
    is_completed: Boolean(raw.is_completed ?? raw.completed),
    is_pr: Boolean(raw.is_pr),
  };

  if (raw.created_at) clean.created_at = raw.created_at;
  if (raw.updated_at) clean.updated_at = raw.updated_at;

  return clean;
}

function notifyListeners(): void {
  const queue = LocalStore.getQueue();
  const state: NetworkState = {
    isOnline: onlineManager.isOnline(),
    isSyncing,
    pendingCount: queue.filter((m) => m.status === 'pending' || m.status === 'failed').length,
    lastSyncedAt: LocalStore.getLastSyncedAt(),
  };
  queueMicrotask(() => {
    listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {
        console.warn('[Ironmate SyncWorker] listener error:', err);
      }
    });
  });
}

export function subscribeNetworkState(listener: NetworkListener): () => void {
  listeners.add(listener);
  notifyListeners();
  return () => {
    listeners.delete(listener);
  };
}

export function markAllAsLocalSynced(): void {
  LocalStore.markAllAsLocalSynced();
  notifyListeners();
}

export function clearOfflineQueue(): void {
  LocalStore.clearQueue();
  notifyListeners();
}

/**
 * Drains the pending offline mutation queue sequentially.
 * Guarantees idempotency via unique mutation UUIDs.
 */
export async function syncOfflineQueue(): Promise<SyncResult> {
  const isOnline = onlineManager.isOnline();

  if (!isOnline || isSyncing || !isSupabaseConfigured) {
    notifyListeners();
    return {
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    };
  }

  isSyncing = true;
  notifyListeners();

  const queue = LocalStore.getQueue();
  const pending = queue.filter((m) => m.status === 'pending' || m.status === 'failed');

  let syncedCount = 0;
  let failedCount = 0;
  const errors: Array<{ id: string; error: string }> = [];

  let authUserId: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    authUserId = session?.user?.id ?? null;
  } catch {}

  const syncedSessionIds = new Set<string>();
  const skippedSetMutations: typeof pending = [];

  const checkRemoteSession = async (sessionId?: string | null): Promise<boolean> => {
    if (!sessionId || !isValidUUID(sessionId)) return false;
    if (syncedSessionIds.has(sessionId)) return true;
    try {
      const { data, error } = await (supabase.from('sessions') as any)
        .select('id')
        .eq('id', sessionId)
        .maybeSingle();
      if (!error && data?.id) {
        syncedSessionIds.add(sessionId);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  // Process pending mutations sequentially (FIFO)
  for (const mutation of pending) {
    LocalStore.updateMutationStatus(mutation.id, { status: 'syncing' });

    // RLS guard: User-scoped tables require an authenticated Supabase session
    if (!authUserId && ['sets', 'sessions', 'profiles', 'personal_records'].includes(mutation.table)) {
      LocalStore.updateMutationStatus(mutation.id, {
        status: 'failed',
        lastError: 'Authentication required for Supabase RLS write.',
      });
      continue;
    }

    try {
      if (mutation.table === 'sets') {
        const payloadRecord = mutation.payload as Record<string, any> | undefined;
        const sessionId = typeof payloadRecord?.session_id === 'string' ? payloadRecord.session_id : undefined;

        // Never apply a set mutation until a sessions create/upsert for that session_id
        // has succeeded (or the row already exists remotely).
        let sessionReady = sessionId ? syncedSessionIds.has(sessionId) : false;
        if (!sessionReady && sessionId) {
          sessionReady = await checkRemoteSession(sessionId);
        }

        if (!sessionReady) {
          // Parent session does not exist remotely yet. Leave pending and continue other work.
          LocalStore.updateMutationStatus(mutation.id, {
            status: 'pending',
            lastError: 'Deferred: Waiting for parent session to exist on Supabase.',
          });
          skippedSetMutations.push(mutation);
          continue;
        }

        if (mutation.mutationType === 'insert_set') {
          const payload = sanitizeSetPayload(mutation.payload, authUserId);
          let { error } = await (supabase.from('sets') as any).upsert(payload, {
            onConflict: 'id',
          });

          // Resilient trigger workaround:
          // If the remote database has a BEFORE INSERT trigger that inserts into personal_records,
          // Postgres trips personal_records_set_id_fkey because NEW.id is not yet in table sets.
          if (error && String(error.message || '').includes('personal_records_set_id_fkey')) {
            // Step 1: Insert row as uncompleted so the trigger check does not fire
            const uncompletedPayload = { ...payload, is_completed: false };
            const step1 = await (supabase.from('sets') as any).upsert(uncompletedPayload, {
              onConflict: 'id',
            });
            if (step1.error) throw step1.error;

            // Step 2: Update row to completed. Since the row now exists in sets, foreign key succeeds!
            const step2 = await (supabase.from('sets') as any)
              .update({ is_completed: payload.is_completed, is_pr: payload.is_pr })
              .eq('id', payload.id);
            if (step2.error) throw step2.error;
            error = null;
          }

          if (error) throw error;
        } else if (mutation.mutationType === 'update_set') {
          const raw = mutation.payload as Record<string, any>;
          const cleanUpdates = sanitizeSetPayload(raw, authUserId);
          const { id, ...updates } = cleanUpdates;
          const { error } = await (supabase.from('sets') as any)
            .update(updates)
            .eq('id', id);
          if (error) throw error;
        } else if (mutation.mutationType === 'delete_set') {
          const payload = mutation.payload as unknown as { id: string };
          const { error } = await supabase.from('sets').delete().eq('id', payload.id);
          if (error) throw error;
        }
      } else if (mutation.table === 'sessions') {
        const payloadRecord = mutation.payload as Record<string, any> | undefined;
        const sessionId = typeof payloadRecord?.id === 'string' ? payloadRecord.id : undefined;
        if (mutation.mutationType === 'complete_session') {
          const raw = mutation.payload as Record<string, any>;
          const clean = sanitizeSessionPayload(raw, authUserId);
          const { id, user_id, created_at, ...updates } = clean;
          const { error } = await (supabase.from('sessions') as any)
            .update(updates)
            .eq('id', raw.id);
          if (error) throw error;
          if (sessionId) syncedSessionIds.add(sessionId);
        } else {
          // create_session or general session upsert
          const payload = sanitizeSessionPayload(mutation.payload, authUserId);
          const { error } = await (supabase.from('sessions') as any).upsert(payload, {
            onConflict: 'id',
          });
          if (error) throw error;
          if (sessionId) syncedSessionIds.add(sessionId);
        }
      } else if (mutation.table === 'profiles') {
        const raw = mutation.payload as Record<string, any>;
        const cleanProfile: Record<string, any> = {
          id: authUserId || raw.id,
          display_name: raw.display_name || 'Lifter',
          updated_at: new Date().toISOString(),
        };
        if (raw.email) cleanProfile.email = raw.email;
        if (raw.avatar_url) cleanProfile.avatar_url = raw.avatar_url;
        if (raw.experience_level) cleanProfile.experience_level = raw.experience_level;
        if (raw.primary_goal) cleanProfile.primary_goal = raw.primary_goal;
        if (raw.preferred_units) cleanProfile.preferred_units = raw.preferred_units;
        if (raw.default_bar_weight_kg) cleanProfile.default_bar_weight_kg = raw.default_bar_weight_kg;
        if (raw.default_rest_seconds) cleanProfile.default_rest_seconds = raw.default_rest_seconds;

        const { error } = await (supabase.from('profiles') as any).upsert(cleanProfile, {
          onConflict: 'id',
        });
        if (error) throw error;
      } else if (mutation.table === 'personal_records') {
        const raw = mutation.payload as Record<string, any>;
        const cleanPR: Record<string, any> = {
          id: raw.id,
          user_id: authUserId || raw.user_id,
          exercise_id: raw.exercise_id,
          set_id: isValidUUID(raw.set_id) ? raw.set_id : null,
          pr_type: raw.pr_type || 'e1rm_pr',
          weight_kg: Number(raw.weight_kg || 0),
          reps: Number(raw.reps || 0),
          e1rm_kg: Number(raw.e1rm_kg || 0),
          achieved_at: raw.achieved_at || new Date().toISOString(),
        };
        const { error } = await (supabase.from('personal_records') as any).upsert(cleanPR, {
          onConflict: 'id',
        });
        if (error) throw error;
      }

      LocalStore.updateMutationStatus(mutation.id, { status: 'synced' });
      LocalStore.removeMutation(mutation.id);
      syncedCount++;
    } catch (err: unknown) {
      failedCount++;
      let errMsg = 'Sync error';
      if (err && typeof err === 'object') {
        const supaErr = err as { message?: string; details?: string; hint?: string; code?: string };
        errMsg = supaErr.message || String(err);
        if (supaErr.details) errMsg += ` (${supaErr.details})`;
        if (supaErr.hint) errMsg += ` [Hint: ${supaErr.hint}]`;
      } else if (err instanceof Error) {
        errMsg = err.message;
      } else {
        errMsg = String(err);
      }
      errors.push({ id: mutation.id, error: errMsg });
      LocalStore.updateMutationStatus(mutation.id, {
        status: 'failed',
        retryCount: mutation.retryCount + 1,
        lastError: errMsg,
      });
      console.warn(`[Ironmate SyncWorker] Mutation failed [${mutation.table}:${mutation.mutationType}]:`, errMsg);
      // Stop sequential drain if a blocking error occurs
      break;
    }
  }

  // Retry skipped set mutations whose parent session was synced during this run
  for (const mutation of skippedSetMutations) {
    const payloadRecord = mutation.payload as Record<string, any> | undefined;
    const sessionId = typeof payloadRecord?.session_id === 'string' ? payloadRecord.session_id : undefined;
    const sessionReady = sessionId ? (syncedSessionIds.has(sessionId) || await checkRemoteSession(sessionId)) : false;
    if (sessionReady) {
      try {
        LocalStore.updateMutationStatus(mutation.id, { status: 'syncing' });
        if (mutation.mutationType === 'insert_set') {
          const payload = sanitizeSetPayload(mutation.payload, authUserId);
          let { error } = await (supabase.from('sets') as any).upsert(payload, {
            onConflict: 'id',
          });

          if (error && String(error.message || '').includes('personal_records_set_id_fkey')) {
            const uncompletedPayload = { ...payload, is_completed: false };
            const step1 = await (supabase.from('sets') as any).upsert(uncompletedPayload, {
              onConflict: 'id',
            });
            if (step1.error) throw step1.error;

            const step2 = await (supabase.from('sets') as any)
              .update({ is_completed: payload.is_completed, is_pr: payload.is_pr })
              .eq('id', payload.id);
            if (step2.error) throw step2.error;
            error = null;
          }

          if (error) throw error;
        } else if (mutation.mutationType === 'update_set') {
          const raw = mutation.payload as Record<string, any>;
          const cleanUpdates = sanitizeSetPayload(raw, authUserId);
          const { id, ...updates } = cleanUpdates;
          const { error } = await (supabase.from('sets') as any)
            .update(updates)
            .eq('id', id);
          if (error) throw error;
        } else if (mutation.mutationType === 'delete_set') {
          const payload = mutation.payload as unknown as { id: string };
          const { error } = await supabase.from('sets').delete().eq('id', payload.id);
          if (error) throw error;
        }

        LocalStore.updateMutationStatus(mutation.id, { status: 'synced' });
        LocalStore.removeMutation(mutation.id);
        syncedCount++;
      } catch (err: unknown) {
        failedCount++;
        let errMsg = 'Sync error';
        if (err && typeof err === 'object') {
          const supaErr = err as { message?: string; details?: string; hint?: string };
          errMsg = supaErr.message || String(err);
        } else if (err instanceof Error) {
          errMsg = err.message;
        }
        errors.push({ id: mutation.id, error: errMsg });
        LocalStore.updateMutationStatus(mutation.id, {
          status: 'failed',
          retryCount: mutation.retryCount + 1,
          lastError: errMsg,
        });
      }
    }
  }

  isSyncing = false;
  const now = new Date().toISOString();
  LocalStore.setLastSyncedAt(now);
  notifyListeners();

  return { syncedCount, failedCount, errors };
}

// Automatically flush offline queue when device reconnects (unified across Web & Mobile via TanStack onlineManager)
onlineManager.subscribe((isOnline) => {
  if (isOnline) {
    console.log('[Ironmate SyncWorker] Connectivity restored. Flushing offline queue...');
    syncOfflineQueue().catch(() => {});
  } else {
    notifyListeners();
  }
});
