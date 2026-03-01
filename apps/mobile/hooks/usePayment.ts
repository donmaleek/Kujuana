// apps/mobile/hooks/usePayment.ts
import { useRef } from 'react';
import { apiClient } from '@/lib/api/client';
import { useSession } from '@/lib/state/session';
import { API_CONFIG } from '@/lib/api/config';

export type PaymentPurpose =
  | 'priority_single'
  | 'priority_bundle_5'
  | 'priority_bundle_10'
  | 'vip_monthly';

export type PaymentMethod = 'mpesa' | 'paystack' | 'pesapal' | 'flutterwave';

export type InitiatePayload = {
  purpose: PaymentPurpose;
  method: PaymentMethod;
  phone?: string;
  currency?: 'KES' | 'USD';
};

type InitiateResult =
  | { type: 'mpesa'; reference: string; message: string }
  | { type: 'redirect'; reference: string; url: string };

type StatusResult = 'pending' | 'completed' | 'failed';

async function request<T>(path: string, token: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const msg = json?.error?.message || json?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json as T;
}

export function usePayment() {
  const { token: accessToken } = useSession();
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function initiate(payload: InitiatePayload): Promise<InitiateResult> {
    if (!accessToken) throw new Error('Not authenticated');

    const res = await request<any>('/payments/initiate', accessToken, {
      method: 'POST',
      body: payload,
    });

    const data = res?.data ?? res;
    const reference: string = data?.reference || data?.internalRef;
    const url: string | undefined = data?.redirectUrl || data?.url;

    if (!reference) throw new Error('No payment reference returned');

    if (url) {
      return { type: 'redirect', reference, url };
    }

    return {
      type: 'mpesa',
      reference,
      message: data?.message ?? 'Check your phone for the M-Pesa prompt.',
    };
  }

  async function pollStatus(
    reference: string,
    onUpdate: (status: StatusResult) => void,
    options: { intervalMs?: number; maxMs?: number } = {}
  ): Promise<StatusResult> {
    const { intervalMs = 3000, maxMs = 90000 } = options;
    const startTime = Date.now();

    return new Promise((resolve) => {
      async function check() {
        if (Date.now() - startTime > maxMs) {
          resolve('failed');
          return;
        }

        try {
          const res = await request<any>(`/payments/${reference}/status`, accessToken!);
          const data = res?.data ?? res;
          const status = data?.status as StatusResult | undefined;

          if (status === 'completed' || status === 'failed') {
            onUpdate(status);
            resolve(status);
            return;
          }

          onUpdate('pending');
        } catch {
          // Network hiccup — keep polling
        }

        pollTimerRef.current = setTimeout(check, intervalMs);
      }

      check();
    });
  }

  function cancelPoll() {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  return { initiate, pollStatus, cancelPoll };
}
