'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth.store'
import { buildApiUrl } from '../lib/api-base'

export type PaymentMethod = 'mpesa' | 'paystack' | 'pesapal' | 'flutterwave'
export type PaymentPurpose =
  | 'priority_single'
  | 'priority_5pack'
  | 'priority_10pack'
  | 'vip_monthly'
  | 'vip_addon'

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

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

export function usePaymentInitiate() {
  return useMutation({
    mutationFn: (payload: { method: PaymentMethod; purpose: PaymentPurpose; phone?: string }) =>
      apiFetch<{ reference: string; redirectUrl?: string; stk?: boolean }>('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  })
}

export function usePaymentStatus(reference?: string) {
  return useQuery({
    queryKey: ['payments', 'status', reference],
    queryFn: () => apiFetch<{ reference: string; status: PaymentStatus }> ( `/payments/${reference}/status` ),
    enabled: Boolean(reference),
    refetchInterval: (q) => {
      const status = (q.state.data as any)?.status
      if (!status) return 3000
      return status === 'pending' ? 3000 : false
    },
    staleTime: 0,
  })
}
