'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore, Tier } from '../store/auth.store'
import { buildApiUrl } from '../lib/api-base'

export type Subscription = {
  tier: Tier
  credits: number
  isActive: boolean
  renewsAt?: string | null
  addOns?: string[]
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

const QK = { me: ['subscription', 'me'] as const }

export function useSubscription() {
  const qc = useQueryClient()

  const subQuery = useQuery({
    queryKey: QK.me,
    queryFn: () => apiFetch<Subscription>('/subscriptions/me'),
    staleTime: 20_000,
  })

  const upgrade = useMutation({
    mutationFn: (payload: { tier: Tier; method: 'mpesa' | 'pesapal' | 'flutterwave'; phone?: string }) =>
      apiFetch<{ reference: string; redirectUrl?: string; stk?: boolean }>('/subscriptions/upgrade', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.me })
    },
  })

  const cancel = useMutation({
    mutationFn: () => apiFetch<{ success: true }>('/subscriptions/cancel', { method: 'POST' }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.me })
    },
  })

  return {
    subscription: subQuery.data ?? null,
    isLoading: subQuery.isLoading,
    error: subQuery.error,
    refetch: subQuery.refetch,

    upgrade: upgrade.mutateAsync,
    upgrading: upgrade.isPending,

    cancel: cancel.mutateAsync,
    cancelling: cancel.isPending,
  }
}
