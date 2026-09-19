import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileRepository } from '../supabase/profile.repository';
import { queryKeys } from './keys';
import type { ValidatedProfileUpdate } from '../supabase/schemas';

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: queryKeys.profile(userId || 'default'),
    queryFn: () => ProfileRepository.getProfile(userId),
  });
}

export function useUpdateProfileMutation(userId?: string) {
  const queryClient = useQueryClient();
  const targetId = userId || '00000000-0000-0000-0000-000000000001';

  return useMutation({
    mutationKey: ['profile', targetId],
    mutationFn: (updates: ValidatedProfileUpdate) => ProfileRepository.updateProfile(targetId, updates),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(queryKeys.profile(targetId), updatedProfile);
      queryClient.setQueryData(queryKeys.profile('default'), updatedProfile);
    },
  });
}
