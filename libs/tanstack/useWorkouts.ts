import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkoutRepository } from '../supabase/workout.repository';
import { queryKeys } from './keys';
import type { ValidatedSetInsert, ValidatedSetUpdate, ValidatedSessionInsert } from '../supabase/schemas';
import type { Database } from '../supabase/types';

type WorkoutSet = Database['public']['Tables']['sets']['Row'];
type WorkoutSession = Database['public']['Tables']['sessions']['Row'];

/**
 * Hook to query lifter's active in-progress workout session.
 */
export function useActiveSession(userId: string) {
  return useQuery({
    queryKey: queryKeys.workouts.active(userId),
    queryFn: () => WorkoutRepository.getActiveSession(userId),
    enabled: Boolean(userId),
  });
}

/**
 * Hook to query all sets for a specific session.
 */
export function useSessionSets(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.workouts.sets(sessionId),
    queryFn: () => WorkoutRepository.getSessionSets(sessionId),
    enabled: Boolean(sessionId),
  });
}

/**
 * High-speed optimistic mutation hook for logging completed sets.
 * Provides < 16ms UI feedback, rollback snapshot on error, and automatic cache settling.
 */
export function useLogSetMutation(sessionId: string) {
  const queryClient = useQueryClient();
  const cacheKey = queryKeys.workouts.sets(sessionId);

  return useMutation({
    mutationKey: ['workouts', 'logSet', sessionId],
    mutationFn: (newSet: ValidatedSetInsert) => WorkoutRepository.logSet(newSet),

    // 1. Optimistic Update (< 16ms)
    onMutate: async (newSet: ValidatedSetInsert) => {
      await queryClient.cancelQueries({ queryKey: cacheKey });
      const previousSets = queryClient.getQueryData<WorkoutSet[]>(cacheKey) || [];

      const optimisticSet: WorkoutSet = {
        id: newSet.id || `temp-${Date.now()}`,
        session_id: sessionId,
        user_id: newSet.user_id,
        exercise_id: newSet.exercise_id,
        set_number: newSet.set_number,
        set_type: newSet.set_type || 'working',
        weight_kg: newSet.weight_kg,
        reps: newSet.reps,
        target_reps: newSet.target_reps ?? null,
        target_weight_kg: newSet.target_weight_kg ?? null,
        tempo: newSet.tempo ?? null,
        notes: newSet.notes ?? null,
        completed_at: newSet.completed_at ?? new Date().toISOString(),
        rpe: newSet.rpe ?? null,
        rir: newSet.rir ?? null,
        rest_time_seconds: newSet.rest_time_seconds ?? 120,
        is_completed: newSet.is_completed ?? true,
        is_pr: newSet.is_pr ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<WorkoutSet[]>(cacheKey, [...previousSets, optimisticSet]);
      return { previousSets };
    },

    // 2. Rollback on failure
    onError: (err, newSet, context) => {
      if (context?.previousSets) {
        queryClient.setQueryData(cacheKey, context.previousSets);
      }
      console.error('[useLogSetMutation] Error logging set, rolled back cache:', err);
    },

    // 3. Reconcile on settled
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
    },
  });
}

/**
 * Optimistic mutation for modifying set weight, reps, or RPE.
 */
export function useUpdateSetMutation(sessionId: string) {
  const queryClient = useQueryClient();
  const cacheKey = queryKeys.workouts.sets(sessionId);

  return useMutation({
    mutationKey: ['workouts', 'updateSet', sessionId],
    mutationFn: ({ setId, updates }: { setId: string; updates: ValidatedSetUpdate }) =>
      WorkoutRepository.updateSet(setId, updates),

    onMutate: async ({ setId, updates }) => {
      await queryClient.cancelQueries({ queryKey: cacheKey });
      const previousSets = queryClient.getQueryData<WorkoutSet[]>(cacheKey) || [];

      queryClient.setQueryData<WorkoutSet[]>(
        cacheKey,
        previousSets.map((s) => (s.id === setId ? { ...s, ...updates, updated_at: new Date().toISOString() } : s))
      );

      return { previousSets };
    },

    onError: (err, variables, context) => {
      if (context?.previousSets) {
        queryClient.setQueryData(cacheKey, context.previousSets);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
    },
  });
}

/**
 * Mutation to create a new session.
 */
export function useCreateSessionMutation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['workouts', 'createSession', userId],
    mutationFn: (payload: ValidatedSessionInsert) => WorkoutRepository.createSession(payload),
    onSuccess: (newSession) => {
      queryClient.setQueryData(queryKeys.workouts.active(userId), newSession);
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.history(userId) });
    },
  });
}

/**
 * Mutation to complete a session.
 */
export function useCompleteSessionMutation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['workouts', 'completeSession', userId],
    mutationFn: ({ sessionId, durationMinutes, notes }: { sessionId: string; durationMinutes: number; notes?: string }) =>
      WorkoutRepository.completeSession(sessionId, durationMinutes, notes),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.workouts.active(userId), null);
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.history(userId) });
    },
  });
}

/**
 * Hook for historical workouts.
 */
export function useWorkoutHistory(userId: string, limit: number = 20) {
  return useQuery({
    queryKey: queryKeys.workouts.history(userId, limit),
    queryFn: () => WorkoutRepository.getWorkoutHistory(userId, limit),
    enabled: Boolean(userId),
  });
}
