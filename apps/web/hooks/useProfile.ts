'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfileStore, Profile } from '../store/profile.store'

const QK = {
  me: ['profile', 'me'] as const,
}

export function useProfile() {
  const qc = useQueryClient()
  const { profile, fetchMe, updateMe } = useProfileStore()

  const meQuery = useQuery({
    queryKey: QK.me,
    queryFn: () => fetchMe(),
    // prefer cached Zustand state first for instant paint
    initialData: profile ?? undefined,
    staleTime: 30_000,
  })

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<Profile>) => updateMe(patch),
    onSuccess: (data) => {
      qc.setQueryData(QK.me, data)
    },
  })

  return {
    profile: meQuery.data ?? null,
    isLoading: meQuery.isLoading,
    error: meQuery.error,
    refetch: meQuery.refetch,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}