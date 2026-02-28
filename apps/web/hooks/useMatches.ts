'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth.store'
import { buildApiUrl } from '../lib/api-base'

export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export type Match = {
  id: string
  users: { id: string; fullName: string }[]
  score: number // 0..100
  breakdown?: Record<string, number>
  status: MatchStatus
  createdAt: string
  expiresAt?: string
}

export type Paginated<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
}

function getAuthHeader() {
  const token = useAuthStore.getState().accessToken
  return token ? `Bearer ${token}` : null
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {})
  headers.set('Content-Type', 'application/json')
  const authHeader = getAuthHeader()
  if (authHeader) headers.set('Authorization', authHeader)

  const res = await fetch(buildApiUrl(path), {
    ...init,
    headers,
    credentials: 'include',
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const msg =
      (typeof json?.error === 'string' ? json.error : json?.error?.message) ||
      json?.message ||
      `Request failed (${res.status})`
    throw new Error(msg)
  }
  return json as T
}

const QK = {
  list: (page: number, pageSize: number) => ['matches', 'list', page, pageSize] as const,
  one: (id: string) => ['matches', 'one', id] as const,
}

export function useMatches(params?: { page?: number; pageSize?: number }) {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const qc = useQueryClient()

  const listQuery = useQuery({
    queryKey: QK.list(page, pageSize),
    queryFn: () => apiFetch<Paginated<Match>>(`/matches?page=${page}&pageSize=${pageSize}`),
    staleTime: 15_000,
  })

  const requestInstantMatch = useMutation({
    mutationFn: () => apiFetch<{ success: true; jobId: string }>('/matches/request', { method: 'POST' }),
    onSuccess: async () => {
      // refresh credits & matches
      await qc.invalidateQueries({ queryKey: ['matches'] })
      // optimistic credits decrement on client
      const auth = useAuthStore.getState()
      const u = auth.user
      if (u && u.credits > 0) auth.updateUser({ credits: u.credits - 1 })
    },
  })

  const respondToMatch = useMutation({
    mutationFn: (args: { id: string; action: 'accept' | 'decline' }) =>
      apiFetch<Match>(`/matches/${args.id}/respond`, { method: 'PATCH', body: JSON.stringify({ action: args.action }) }),
    onSuccess: async (m) => {
      qc.setQueryData(QK.one(m.id), m)
      await qc.invalidateQueries({ queryKey: ['matches', 'list'] })
    },
  })

  return {
    matches: listQuery.data?.items ?? [],
    meta: listQuery.data ? { total: listQuery.data.total, page: listQuery.data.page, pageSize: listQuery.data.pageSize } : null,
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,

    requestInstantMatch: requestInstantMatch.mutateAsync,
    requesting: requestInstantMatch.isPending,

    respondToMatch: respondToMatch.mutateAsync,
    responding: respondToMatch.isPending,
  }
}
