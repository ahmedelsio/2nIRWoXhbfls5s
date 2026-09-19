import type { ValidatedExerciseFilter } from '../supabase/schemas';

/**
 * Deterministic query key factories for TanStack Query cache.
 */
export const queryKeys = {
  profile: (userId: string) => ['profile', userId] as const,
  exercises: {
    all: ['exercises'] as const,
    list: (filter?: ValidatedExerciseFilter) => ['exercises', 'list', filter || {}] as const,
    detail: (idOrSlug: string) => ['exercises', 'detail', idOrSlug] as const,
    substitutes: (exerciseId: string) => ['exercises', 'substitutes', exerciseId] as const,
  },
  workouts: {
    all: ['workouts'] as const,
    active: (userId: string) => ['workouts', 'active', userId] as const,
    sets: (sessionId: string) => ['workouts', 'sets', sessionId] as const,
    history: (userId: string, limit?: number) => ['workouts', 'history', userId, limit || 20] as const,
  },
  records: {
    prs: (userId: string) => ['records', 'prs', userId] as const,
  },
};
