import { supabase, isSupabaseConfigured } from './client';
import { onlineManager } from '@tanstack/react-query';
import { LocalStore } from '../offline/storage';
import { syncOfflineQueue } from '../offline/syncWorker';
import { SetInsertSchema, SetUpdateSchema, SessionInsertSchema } from './schemas';
import type { Database, SessionGrade } from './types';
import type { ValidatedSetInsert, ValidatedSetUpdate, ValidatedSessionInsert } from './schemas';

type WorkoutSession = Database['public']['Tables']['sessions']['Row'];
type WorkoutSet = Database['public']['Tables']['sets']['Row'];

const EXERCISE_SLUG_MAP: Record<string, string> = {
  // 0001: Barbell Back Squat
  'barbell-back-squat': '00000000-0000-0000-0000-000000000001',
  'squat': '00000000-0000-0000-0000-000000000001',
  'back-squat': '00000000-0000-0000-0000-000000000001',
  'barbell-squat': '00000000-0000-0000-0000-000000000001',

  // 0002: Barbell Flat Bench Press
  'barbell-flat-bench-press': '00000000-0000-0000-0000-000000000002',
  'barbell-bench-press': '00000000-0000-0000-0000-000000000002',
  'bench-press': '00000000-0000-0000-0000-000000000002',
  'bench': '00000000-0000-0000-0000-000000000002',
  'flat-bench': '00000000-0000-0000-0000-000000000002',
  'flat-bench-press': '00000000-0000-0000-0000-000000000002',

  // 0003: Barbell Conventional Deadlift
  'barbell-conventional-deadlift': '00000000-0000-0000-0000-000000000003',
  'conventional-deadlift': '00000000-0000-0000-0000-000000000003',
  'barbell-deadlift': '00000000-0000-0000-0000-000000000003',
  'deadlift': '00000000-0000-0000-0000-000000000003',

  // 0004: Standing Overhead Press
  'standing-overhead-press': '00000000-0000-0000-0000-000000000004',
  'overhead-barbell-press': '00000000-0000-0000-0000-000000000004',
  'overhead-press': '00000000-0000-0000-0000-000000000004',
  'ohp': '00000000-0000-0000-0000-000000000004',
  'barbell-ohp': '00000000-0000-0000-0000-000000000004',

  // 0005: Barbell Bent-Over Row
  'barbell-bent-over-row': '00000000-0000-0000-0000-000000000005',
  'barbell-row': '00000000-0000-0000-0000-000000000005',
  'bent-over-row': '00000000-0000-0000-0000-000000000005',
  'row': '00000000-0000-0000-0000-000000000005',

  // 0006: Romanian Deadlift
  'romanian-deadlift': '00000000-0000-0000-0000-000000000006',
  'romanian-deadlift-rdl': '00000000-0000-0000-0000-000000000006',
  'rdl': '00000000-0000-0000-0000-000000000006',
  'barbell-rdl': '00000000-0000-0000-0000-000000000006',

  // 0007: Pull-Up
  'pull-up': '00000000-0000-0000-0000-000000000007',
  'pull-ups': '00000000-0000-0000-0000-000000000007',
  'pull-up-bodyweight': '00000000-0000-0000-0000-000000000007',
  'pullup': '00000000-0000-0000-0000-000000000007',
  'pullups': '00000000-0000-0000-0000-000000000007',
  'chin-up': '00000000-0000-0000-0000-000000000007',

  // 0008: Incline Dumbbell Press
  'incline-dumbbell-press': '00000000-0000-0000-0000-000000000008',
  'incline-db-press': '00000000-0000-0000-0000-000000000008',
  'incline-db': '00000000-0000-0000-0000-000000000008',
  'incline-dumbbell-bench-press': '00000000-0000-0000-0000-000000000008',

  // 0009: Cable Lateral Raise
  'cable-lateral-raise': '00000000-0000-0000-0000-000000000009',
  'lat-raise': '00000000-0000-0000-0000-000000000009',
  'cable-lat-raise': '00000000-0000-0000-0000-000000000009',
  'cable-lateral': '00000000-0000-0000-0000-000000000009',

  // 0010: Cable Tricep Pushdown
  'cable-tricep-pushdown': '00000000-0000-0000-0000-000000000010',
  'tricep-pushdown': '00000000-0000-0000-0000-000000000010',
  'pushdown': '00000000-0000-0000-0000-000000000010',
  'cable-pushdown': '00000000-0000-0000-0000-000000000010',

  // 0011: 45-Degree Leg Press (separate from 0012)
  '45-degree-leg-press': '00000000-0000-0000-0000-000000000011',
  'leg-press': '00000000-0000-0000-0000-000000000011',
  'leg-press-45': '00000000-0000-0000-0000-000000000011',
  'sled-leg-press': '00000000-0000-0000-0000-000000000011',

  // 0012: Standing Calf Raise (fixed bug: separate from 0011)
  'standing-calf-raise': '00000000-0000-0000-0000-000000000012',
  'calf-raise': '00000000-0000-0000-0000-000000000012',
  'calf-raises': '00000000-0000-0000-0000-000000000012',
  'standing-calf-raises': '00000000-0000-0000-0000-000000000012',

  // 0013: Barbell Front Squat
  'barbell-front-squat': '00000000-0000-0000-0000-000000000013',
  'front-squat': '00000000-0000-0000-0000-000000000013',

  // 0014: Trap-Bar Deadlift
  'trap-bar-deadlift': '00000000-0000-0000-0000-000000000014',
  'trap-bar-dl': '00000000-0000-0000-0000-000000000014',
  'hex-bar-deadlift': '00000000-0000-0000-0000-000000000014',

  // 0015: Incline Barbell Bench Press
  'incline-barbell-bench-press': '00000000-0000-0000-0000-000000000015',
  'incline-bb': '00000000-0000-0000-0000-000000000015',
  'incline-barbell-press': '00000000-0000-0000-0000-000000000015',
  'incline-bench': '00000000-0000-0000-0000-000000000015',

  // 0016: Dumbbell Flat Press
  'dumbbell-flat-press': '00000000-0000-0000-0000-000000000016',
  'db-flat-press': '00000000-0000-0000-0000-000000000016',
  'flat-dumbbell-press': '00000000-0000-0000-0000-000000000016',
  'dumbbell-bench-press': '00000000-0000-0000-0000-000000000016',

  // 0017: Push-Up
  'push-up': '00000000-0000-0000-0000-000000000017',
  'pushup': '00000000-0000-0000-0000-000000000017',
  'push-ups': '00000000-0000-0000-0000-000000000017',
  'pushups': '00000000-0000-0000-0000-000000000017',

  // 0018: Chest-Supported Row
  'chest-supported-row': '00000000-0000-0000-0000-000000000018',
  'chest-supported-db-row': '00000000-0000-0000-0000-000000000018',
  'chest-supported-dumbbell-row': '00000000-0000-0000-0000-000000000018',

  // 0019: Seated Cable Row
  'seated-cable-row': '00000000-0000-0000-0000-000000000019',
  'cable-row': '00000000-0000-0000-0000-000000000019',
  'seated-row': '00000000-0000-0000-0000-000000000019',

  // 0020: Lat Pulldown (existing id 0020 kept)
  'lat-pulldown': '00000000-0000-0000-0000-000000000020',
  'neutral-lat-pulldown': '00000000-0000-0000-0000-000000000020',
  'pulldown': '00000000-0000-0000-0000-000000000020',
  'cable-lat-pulldown': '00000000-0000-0000-0000-000000000020',

  // 0021: Cable Face Pull
  'cable-face-pull': '00000000-0000-0000-0000-000000000021',
  'face-pull': '00000000-0000-0000-0000-000000000021',
  'face-pulls': '00000000-0000-0000-0000-000000000021',
  'facepull': '00000000-0000-0000-0000-000000000021',

  // 0022: Dumbbell Lateral Raise
  'dumbbell-lateral-raise': '00000000-0000-0000-0000-000000000022',
  'db-lateral-raise': '00000000-0000-0000-0000-000000000022',
  'standing-db-lateral-raise': '00000000-0000-0000-0000-000000000022',
  'db-lat-raise': '00000000-0000-0000-0000-000000000022',

  // 0023: Rear Delt Fly
  'rear-delt-fly': '00000000-0000-0000-0000-000000000023',
  'rear-delt-reverse-fly': '00000000-0000-0000-0000-000000000023',
  'dumbbell-rear-delt-fly': '00000000-0000-0000-0000-000000000023',
  'reverse-fly': '00000000-0000-0000-0000-000000000023',

  // 0024: Overhead Cable Triceps Extension
  'overhead-cable-triceps-extension': '00000000-0000-0000-0000-000000000024',
  'overhead-cable-triceps': '00000000-0000-0000-0000-000000000024',
  'overhead-triceps-extension': '00000000-0000-0000-0000-000000000024',
  'triceps-ext': '00000000-0000-0000-0000-000000000024',
  'cable-overhead-triceps-ext': '00000000-0000-0000-0000-000000000024',

  // 0025: Barbell Skull Crusher
  'barbell-skull-crusher': '00000000-0000-0000-0000-000000000025',
  'skull-crusher': '00000000-0000-0000-0000-000000000025',
  'skullcrusher': '00000000-0000-0000-0000-000000000025',
  'ez-bar-skull-crusher': '00000000-0000-0000-0000-000000000025',
  'skull-crushers': '00000000-0000-0000-0000-000000000025',

  // 0026: Incline Dumbbell Curl
  'incline-dumbbell-curl': '00000000-0000-0000-0000-000000000026',
  'incline-curl': '00000000-0000-0000-0000-000000000026',
  'incline-db-curl': '00000000-0000-0000-0000-000000000026',

  // 0027: Dumbbell Hammer Curl
  'dumbbell-hammer-curl': '00000000-0000-0000-0000-000000000027',
  'hammer-curl': '00000000-0000-0000-0000-000000000027',
  'db-hammer-curl': '00000000-0000-0000-0000-000000000027',

  // 0028: Bulgarian Split Squat
  'bulgarian-split-squat': '00000000-0000-0000-0000-000000000028',
  'split-squat': '00000000-0000-0000-0000-000000000028',
  'bss': '00000000-0000-0000-0000-000000000028',

  // 0029: Seated Leg Curl
  'seated-leg-curl': '00000000-0000-0000-0000-000000000029',
  'leg-curl': '00000000-0000-0000-0000-000000000029',
  'seated-hamstring-curl': '00000000-0000-0000-0000-000000000029',

  // 0030: Leg Extension
  'leg-extension': '00000000-0000-0000-0000-000000000030',
  'quad-extension': '00000000-0000-0000-0000-000000000030',
  'machine-leg-extension': '00000000-0000-0000-0000-000000000030',

  // 0031: Dumbbell Walking Lunge
  'dumbbell-walking-lunge': '00000000-0000-0000-0000-000000000031',
  'walking-lunge': '00000000-0000-0000-0000-000000000031',
  'walking-lunges': '00000000-0000-0000-0000-000000000031',
  'lunges': '00000000-0000-0000-0000-000000000031',

  // 0032: Incline DB Crush Press
  'incline-dumbbell-crush-press': '00000000-0000-0000-0000-000000000032',
  'incline-db-crush-press': '00000000-0000-0000-0000-000000000032',
  'crush-press': '00000000-0000-0000-0000-000000000032',

  // 0033: Overhead DB Triceps Ext
  'overhead-dumbbell-triceps-extension': '00000000-0000-0000-0000-000000000033',
  'overhead-db-triceps-ext': '00000000-0000-0000-0000-000000000033',
  'db-overhead-triceps': '00000000-0000-0000-0000-000000000033',

  // 0034: 90/90 Hip Flow
  '90-90-hip-flow': '00000000-0000-0000-0000-000000000034',
  '90-90-hip-internal-external-flow': '00000000-0000-0000-0000-000000000034',
  '90-90-hip-internal-external': '00000000-0000-0000-0000-000000000034',

  // 0035: Thoracic Spine Foam Roller Opener
  'thoracic-spine-foam-roller-opener': '00000000-0000-0000-0000-000000000035',
  'thoracic-extension-foam-roller': '00000000-0000-0000-0000-000000000035',
  'thoracic-spine-foam-roller': '00000000-0000-0000-0000-000000000035',

  // 0036: Couch Stretch
  'couch-stretch': '00000000-0000-0000-0000-000000000036',
  'couch-stretch-hip-flexors': '00000000-0000-0000-0000-000000000036',

  // 0037: Banded Ankle Mobilization
  'banded-ankle-mobilization': '00000000-0000-0000-0000-000000000037',
  'banded-ankle-mobility': '00000000-0000-0000-0000-000000000037',
};

export function normalizeExerciseId(rawId: string): string {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId);
  if (isUUID) return rawId;

  const slug = rawId.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const mapped = EXERCISE_SLUG_MAP[slug] || EXERCISE_SLUG_MAP[rawId.toLowerCase().trim()];
  if (mapped) return mapped;

  console.warn(`[WorkoutRepository] Unknown exercise slug "${rawId}" (slugified: "${slug}"). Defaulting to bench as fallback.`);
  return '00000000-0000-0000-0000-000000000002';
}

export const SEEDED_EXERCISE_NAMES: Record<string, string> = {
  '00000000-0000-0000-0000-000000000001': 'Barbell Back Squat',
  '00000000-0000-0000-0000-000000000002': 'Barbell Flat Bench Press',
  '00000000-0000-0000-0000-000000000003': 'Barbell Conventional Deadlift',
  '00000000-0000-0000-0000-000000000004': 'Standing Overhead Press',
  '00000000-0000-0000-0000-000000000005': 'Barbell Bent-Over Row',
  '00000000-0000-0000-0000-000000000006': 'Romanian Deadlift',
  '00000000-0000-0000-0000-000000000007': 'Pull-Up',
  '00000000-0000-0000-0000-000000000008': 'Incline Dumbbell Press',
  '00000000-0000-0000-0000-000000000009': 'Cable Lateral Raise',
  '00000000-0000-0000-0000-000000000010': 'Cable Tricep Pushdown',
  '00000000-0000-0000-0000-000000000011': '45-Degree Leg Press',
  '00000000-0000-0000-0000-000000000012': 'Standing Calf Raise',
  '00000000-0000-0000-0000-000000000013': 'Barbell Front Squat',
  '00000000-0000-0000-0000-000000000014': 'Trap-Bar Deadlift',
  '00000000-0000-0000-0000-000000000015': 'Incline Barbell Bench Press',
  '00000000-0000-0000-0000-000000000016': 'Dumbbell Flat Press',
  '00000000-0000-0000-0000-000000000017': 'Push-Up',
  '00000000-0000-0000-0000-000000000018': 'Chest-Supported Row',
  '00000000-0000-0000-0000-000000000019': 'Seated Cable Row',
  '00000000-0000-0000-0000-000000000020': 'Lat Pulldown',
  '00000000-0000-0000-0000-000000000021': 'Cable Face Pull',
  '00000000-0000-0000-0000-000000000022': 'Dumbbell Lateral Raise',
  '00000000-0000-0000-0000-000000000023': 'Rear Delt Fly',
  '00000000-0000-0000-0000-000000000024': 'Overhead Cable Triceps Extension',
  '00000000-0000-0000-0000-000000000025': 'Barbell Skull Crusher',
  '00000000-0000-0000-0000-000000000026': 'Incline Dumbbell Curl',
  '00000000-0000-0000-0000-000000000027': 'Dumbbell Hammer Curl',
  '00000000-0000-0000-0000-000000000028': 'Bulgarian Split Squat',
  '00000000-0000-0000-0000-000000000029': 'Seated Leg Curl',
  '00000000-0000-0000-0000-000000000030': 'Leg Extension',
  '00000000-0000-0000-0000-000000000031': 'Dumbbell Walking Lunge',
  '00000000-0000-0000-0000-000000000032': 'Incline DB Crush Press',
  '00000000-0000-0000-0000-000000000033': 'Overhead DB Triceps Ext',
  '00000000-0000-0000-0000-000000000034': '90/90 Hip Flow',
  '00000000-0000-0000-0000-000000000035': 'Thoracic Spine Foam Roller Opener',
  '00000000-0000-0000-0000-000000000036': 'Couch Stretch',
  '00000000-0000-0000-0000-000000000037': 'Banded Ankle Mobilization',
};

export function resolveExerciseName(rawIdOrSlug: string): string {
  if (!rawIdOrSlug) return 'Exercise';
  if (SEEDED_EXERCISE_NAMES[rawIdOrSlug]) {
    return SEEDED_EXERCISE_NAMES[rawIdOrSlug];
  }
  const normalizedId = normalizeExerciseId(rawIdOrSlug);
  if (SEEDED_EXERCISE_NAMES[normalizedId]) {
    return SEEDED_EXERCISE_NAMES[normalizedId];
  }
  if (!/^[0-9a-f-]{36}$/i.test(rawIdOrSlug)) {
    return rawIdOrSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return 'Exercise';
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

function mapToSessionGrade(grade?: string | null): SessionGrade | null {
  if (!grade) return null;
  const upper = grade.toUpperCase().trim();
  if (upper === 'A+' || upper === 'A_PLUS') return 'A_plus';
  if (upper === 'A') return 'A';
  if (upper === 'B+' || upper === 'B_PLUS') return 'B_plus';
  if (upper === 'B' || upper === 'B-') return 'B';
  if (upper === 'C' || upper === 'C+' || upper === 'C-') return 'C';
  if (upper === 'DELOAD') return 'deload';
  return 'B';
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
   * Fetch all sets for a given session with resolved exercise names.
   */
  async getSessionSets(sessionId: string): Promise<(WorkoutSet & { exercise_name?: string })[]> {
    const localSets = LocalStore.getSets(sessionId);

    if (isSupabaseConfigured && onlineManager.isOnline()) {
      try {
        const { data, error } = await supabase
          .from('sets')
          .select('*, exercises(name, slug)')
          .eq('session_id', sessionId)
          .order('set_number', { ascending: true });

        if (!error && data && data.length > 0) {
          return (data as any[]).map((s) => {
            LocalStore.saveSet(s);
            const joinedName = s.exercises?.name || (Array.isArray(s.exercises) ? s.exercises[0]?.name : null);
            const resolvedName = joinedName || resolveExerciseName(s.exercise_id);
            return {
              ...s,
              exercise_name: resolvedName,
            };
          });
        }
      } catch (err) {
        console.warn('[WorkoutRepository.getSessionSets] Falling back to local cache:', err);
      }
    }

    return localSets.map((s) => ({
      ...s,
      exercise_name: resolveExerciseName(s.exercise_id),
    }));
  },

  /**
   * Fetch PRs associated with a session or its sets/exercises for a user.
   */
  async getSessionPRs(sessionId: string, userId: string): Promise<any[]> {
    if (isSupabaseConfigured && onlineManager.isOnline()) {
      try {
        const localSets = LocalStore.getSets(sessionId);
        const setIds = localSets.map((s) => s.id).filter(Boolean);

        if (setIds.length > 0) {
          const { data, error } = await supabase
            .from('prs')
            .select('*, exercises(name, slug)')
            .eq('user_id', userId)
            .in('set_id', setIds);

          if (!error && data && data.length > 0) {
            return data;
          }
        }

        const exerciseIds = Array.from(new Set(localSets.map((s) => s.exercise_id).filter(Boolean)));
        if (exerciseIds.length > 0) {
          const { data, error } = await supabase
            .from('prs')
            .select('*, exercises(name, slug)')
            .eq('user_id', userId)
            .in('exercise_id', exerciseIds);

          if (!error && data) {
            return data;
          }
        }
      } catch (err) {
        console.warn('[WorkoutRepository.getSessionPRs] Failed to fetch PRs:', err);
      }
    }
    return [];
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
        name: (rawPayload as any).name?.trim() || 'Untitled session',
        status: 'in_progress',
        started_at: now,
        completed_at: null,
        duration_minutes: 0,
        total_volume_kg: 0,
        total_sets_completed: 0,
        session_grade: null,
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
      name: validated.name?.trim() || (rawPayload as any).name?.trim() || 'Untitled session',
      status: validated.status,
      started_at: validated.started_at || now,
      completed_at: null,
      duration_minutes: 0,
      total_volume_kg: 0,
      total_sets_completed: 0,
      session_grade: null,
      grade_reason: null,
      readiness_score: 85,
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

    if (isSupabaseConfigured && onlineManager.isOnline()) {
      await syncOfflineQueue().catch(() => {});
    }

    return session;
  },

  /**
   * Finish and complete a workout session.
   */
  async completeSession(
    sessionId: string,
    durationMinutes: number,
    notes?: string,
    extra?: {
      total_volume_kg?: number;
      total_sets_completed?: number;
      session_grade?: string;
    }
  ): Promise<void> {
    const now = new Date().toISOString();
    const sessions = LocalStore.getSessions();
    const session = sessions.find((s) => s.id === sessionId);

    const remoteUpdateFields = {
      status: 'completed' as const,
      completed_at: now,
      duration_minutes: durationMinutes,
      notes: notes ?? (session ? session.notes : null),
      total_volume_kg: extra?.total_volume_kg ?? (session?.total_volume_kg ?? 0),
      total_sets_completed: extra?.total_sets_completed ?? (session?.total_sets_completed ?? 0),
      session_grade: extra?.session_grade !== undefined ? mapToSessionGrade(extra.session_grade) : (session?.session_grade ?? null),
      updated_at: now,
    };

    if (session) {
      const completed: WorkoutSession = {
        ...session,
        ...remoteUpdateFields,
        total_tonnage_kg: extra?.total_volume_kg != null ? Number((extra.total_volume_kg / 1000).toFixed(2)) : (session?.total_tonnage_kg ?? 0),
      };
      LocalStore.saveSession(completed);
    }

    LocalStore.enqueueMutation({
      id: generateUUID(),
      mutationType: 'complete_session',
      table: 'sessions',
      payload: {
        id: sessionId,
        ...remoteUpdateFields,
      },
      clientTimestamp: now,
      status: 'pending',
      retryCount: 0,
    });

    if (isSupabaseConfigured && onlineManager.isOnline()) {
      try {
        await (supabase.from('sessions') as any)
          .update(remoteUpdateFields)
          .eq('id', sessionId);
      } catch (err) {
        console.warn('[WorkoutRepository] Error updating completed session in Supabase:', err);
      }
    }

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

  /**
   * Get the latest completed session today for a user (local timezone with UTC fallback).
   */
  async getLatestCompletedSessionToday(userId: string): Promise<WorkoutSession | null> {
    const isTodayLocalOrUtc = (dateStr: string | null | undefined): boolean => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      const now = new Date();
      const isLocal =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
      if (isLocal) return true;
      const isUtc =
        d.getUTCFullYear() === now.getUTCFullYear() &&
        d.getUTCMonth() === now.getUTCMonth() &&
        d.getUTCDate() === now.getUTCDate();
      return isUtc;
    };

    if (isSupabaseConfigured && onlineManager.isOnline()) {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(10);

        if (!error && data && data.length > 0) {
          const sessionsList = data as unknown as WorkoutSession[];
          sessionsList.forEach((s) => LocalStore.saveSession(s));
          const sorted = [...sessionsList].sort((a, b) => {
            const timeA = new Date(a.completed_at || a.started_at || 0).getTime();
            const timeB = new Date(b.completed_at || b.started_at || 0).getTime();
            return timeB - timeA;
          });
          const match = sorted.find((s) => isTodayLocalOrUtc(s.completed_at || s.started_at));
          if (match) return match;
        }
      } catch (err) {
        console.warn('[WorkoutRepository.getLatestCompletedSessionToday] Fallback to local:', err);
      }
    }

    const local = LocalStore.getSessions()
      .filter((s) => s.user_id === userId && s.status === 'completed')
      .sort((a, b) => {
        const timeA = new Date(a.completed_at || a.started_at || 0).getTime();
        const timeB = new Date(b.completed_at || b.started_at || 0).getTime();
        return timeB - timeA;
      });

    const localMatch = local.find((s) => isTodayLocalOrUtc(s.completed_at || s.started_at));
    return localMatch || null;
  },

  /**
   * Get session muscle volume aggregates.
   */
  async getSessionMuscleVolume(sessionId: string) {
    const { StatsRepository } = await import('./stats.repository');
    return StatsRepository.getSessionMuscleVolume(sessionId);
  },

  /**
   * Get user training streak aggregates.
   */
  async getUserTrainingStreak(userId: string) {
    const { StatsRepository } = await import('./stats.repository');
    return StatsRepository.getUserTrainingStreak(userId);
  },
};
