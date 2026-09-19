import { useQuery } from '@tanstack/react-query';
import { ExerciseRepository } from '../supabase/exercise.repository';
import { queryKeys } from './keys';
import type { ValidatedExerciseFilter } from '../supabase/schemas';

export function useExercises(filter?: ValidatedExerciseFilter) {
  return useQuery({
    queryKey: queryKeys.exercises.list(filter),
    queryFn: () => ExerciseRepository.getExercises(filter),
    staleTime: 1000 * 60 * 30, // 30 minutes for library cache
    placeholderData: (previousData) => previousData, // Prevents layout shifts while filtering
  });
}

export function useExercise(idOrSlug: string) {
  return useQuery({
    queryKey: queryKeys.exercises.detail(idOrSlug),
    queryFn: () => ExerciseRepository.getExerciseById(idOrSlug),
    enabled: Boolean(idOrSlug),
    staleTime: 1000 * 60 * 30,
  });
}

export function useExerciseSubstitutes(exerciseId: string) {
  return useQuery({
    queryKey: queryKeys.exercises.substitutes(exerciseId),
    queryFn: () => ExerciseRepository.getSubstitutes(exerciseId),
    enabled: Boolean(exerciseId),
  });
}

/**
 * Hook to query relational has-many substitutes with coach rationale and stimulus rating.
 */
export function useRelationalSubstitutes(exerciseId: string) {
  return useQuery({
    queryKey: ['exercises', 'relational-substitutes', exerciseId],
    queryFn: () => ExerciseRepository.getRelationalSubstitutes(exerciseId),
    enabled: Boolean(exerciseId),
    staleTime: 1000 * 60 * 30,
  });
}
