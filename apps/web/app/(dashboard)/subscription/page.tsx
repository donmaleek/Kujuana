// ─────────────────────────────────────────────────────────────────────
// SUBSCRIPTION PAGE
// Path: kujuana/apps/web/app/(dashboard)/subscription/page.tsx
// ─────────────────────────────────────────────────────────────────────

'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useDashUser } from '../dash-context'
import { getApiBase } from '@/lib/api-base'

const API = getApiBase()

type Tier = 'standard' | 'priority' | 'vip'
type SubDTO = {
  tier: Tier
  credits: number
  renewsAt?: string | null
  status?: 'active' | 'canceled' | 'expired'
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json() : null
  if (!res.ok) throw new Error(payload?.error?.message || payload?.message || `Request failed (${res.status})`)
  return payload as T
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function SubscriptionPage() {
  const { user, refetch } = useDashUser()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sub, setSub] = useState<SubDTO | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api<any>('/subscriptions/me', { method: 'GET' })
        const s = res?.data ?? res?.subscription ?? res
        const dto: SubDTO = {
          tier: (s?.tier || s?.plan || 'standard') as Tier,
          credits: Number(s?.credits ?? 0),
          renewsAt: s?.renewsAt ?? s?.nextBillingAt ?? null,
          status: s?.status ?? 'active',
        }
        if (!mounted) return
        setSub(dto)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to load subscription')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const tier = (sub?.tier || user?.tier || 'standard') as Tier

  const cards = useMemo(
    () => [
      {
        id: 'standard',
        name: 'Standard',
        price: 'Free',
        desc: 'Nightly matching. Slow, intentional, no credits.',
        perks: ['Nightly batch matching', 'Up to 3 active matches', 'Basic filters'],
        cta: 'Current on free',
        primary: false,
      },
      {
        id: 'priority',
        name: 'Priority',
        price: 'Pay per match',
        desc: 'Instant matching using credits. You control speed.',
        perks: ['Instant processing', 'Credits never double-charge (idempotent)', 'Best for busy professionals'],
        cta: 'Buy credits',
        primary: true,
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 'KES 10,000 / month',
        desc: 'Curated matchmaking with matchmaker review.',
        perks: ['Curated introductions', 'Premium filters & add-ons', 'Confidential fields protected'],
        cta: 'Upgrade to VIP',
        primary: true,
      },
    ],
    []
  )

  async function initiatePayment(purpose: string, method: 'mpesa' | 'pesapal' | 'flutterwave') {
    setBusy(purpose)
    setError(null)
    try {
      const res = await api<any>('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({ purpose, method }),
      })

      // Typical behavior:
      // - mpesa => returns { reference } for polling; you already handle STK UX elsewhere
      // - card/global => returns { redirectUrl }
      const redirectUrl = res?.data?.redirectUrl || res?.redirectUrl
      if (redirectUrl) {
        window.location.href = redirectUrl
        return
      }

      // If no redirect, just refresh state
      await refetch()
      setBusy(null)
    } catch (e: any) {
      setError(e?.message || 'Payment initiation failed')
      setBusy(null)
    }
  }

  async function cancelRenewal() {
    setBusy('cancel')
    setError(null)
    try {
      await api('/subscriptions/cancel', { method: 'POST', body: JSON.stringify({}) })
      await refetch()
      const res = await api<any>('/subscriptions/me', { method: 'GET' })
      const s = res?.data ?? res?.subscription ?? res
      setSub({
        tier: (s?.tier || 'standard') as Tier,
        credits: Number(s?.credits ?? 0),
        renewsAt: s?.renewsAt ?? null,
        status: s?.status ?? 'canceled',
      })
    } catch (e: any) {
      setError(e?.message || 'Could not cancel')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Subscription</p>
          <h1 className="mt-2 font-[var(--font-cormorant,serif)] text-3xl font-light text-white/95 md:text-4xl">
            Your plan
          </h1>
          <p className="mt-2 text-sm text-white/65">
            Choose speed (Priority) or curation (VIP). Standard remains the free intentional baseline.
          </p>
        </div>

        <Link href="/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10">
          Back to dashboard
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200/20 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs text-white/60">Current tier</p>
            <p className="mt-1 text-lg font-semibold text-white/90">{loading ? '—' : tier.toUpperCase()}</p>
            <p className="mt-1 text-xs text-white/50">
              Credits: <span className="text-white/80">{sub?.credits ?? user?.credits ?? 0}</span>
              {sub?.renewsAt ? <> • Renews: <span className="text-white/80">{new Date(sub.renewsAt).toLocaleDateString()}</span></> : null}
              {sub?.status ? <> • Status: <span className="text-white/80">{sub.status}</span></> : null}
            </p>
          </div>

          {tier === 'vip' ? (
            <button
              onClick={cancelRenewal}
              disabled={busy === 'cancel'}
              className={cx(
                'rounded-xl border px-4 py-2 text-sm transition',
                'border-white/10 bg-white/5 text-white/80 hover:bg-white/10',
                busy === 'cancel' && 'opacity-70'
              )}
            >
              {busy === 'cancel' ? 'Canceling…' : 'Cancel renewal'}
            </button>
          ) : null}
        </div>
      </div>

      {/* Plans */}
      <div className="grid gap-4 lg:grid-cols-3">
        {cards.map((c) => {
          const active = tier === (c.id as Tier)
          return (
            <div key={c.id} className={cx('rounded-2xl border bg-black/10 p-5', active ? 'border-[rgba(212,175,55,0.28)]' : 'border-white/10')}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">{c.name}</p>
              <p className="mt-2 text-2xl font-semibold text-white/90">{c.price}</p>
              <p className="mt-2 text-sm text-white/60">{c.desc}</p>

              <ul className="mt-4 space-y-2 text-sm text-white/65">
                {c.perks.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[rgba(212,175,55,0.75)]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 space-y-2">
                {c.id === 'priority' ? (
                  <>
                    <button
                      onClick={() => initiatePayment('priority_single', 'mpesa')}
                      disabled={busy === 'priority_single'}
                      className={cx(
                        'w-full rounded-xl border px-4 py-2 text-sm transition',
                        'border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.10)] text-[var(--gold-champagne)] hover:bg-[rgba(212,175,55,0.14)]',
                        busy === 'priority_single' && 'opacity-70'
                      )}
                    >
                      {busy === 'priority_single' ? 'Starting…' : 'Buy 1 match (KES 500) via M-Pesa'}
                    </button>
                    <button
                      onClick={() => initiatePayment('priority_5pack', 'mpesa')}
                      disabled={busy === 'priority_5pack'}
                      className={cx(
                        'w-full rounded-xl border px-4 py-2 text-sm transition',
                        'border-white/10 bg-white/5 text-white/80 hover:bg-white/10',
                        busy === 'priority_5pack' && 'opacity-70'
                      )}
                    >
                      {busy === 'priority_5pack' ? 'Starting…' : 'Buy 5-pack (KES 2,000)'}
                    </button>
                    <button
                      onClick={() => initiatePayment('priority_10pack', 'mpesa')}
                      disabled={busy === 'priority_10pack'}
                      className={cx(
                        'w-full rounded-xl border px-4 py-2 text-sm transition',
                        'border-white/10 bg-white/5 text-white/80 hover:bg-white/10',
                        busy === 'priority_10pack' && 'opacity-70'
                      )}
                    >
                      {busy === 'priority_10pack' ? 'Starting…' : 'Buy 10-pack (KES 3,500)'}
                    </button>
                  </>
                ) : c.id === 'vip' ? (
                  <>
                    <button
                      onClick={() => initiatePayment('vip_monthly', 'mpesa')}
                      disabled={busy === 'vip_monthly'}
                      className={cx(
                        'w-full rounded-xl border px-4 py-2 text-sm transition',
                        'border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.10)] text-[var(--gold-champagne)] hover:bg-[rgba(212,175,55,0.14)]',
                        busy === 'vip_monthly' && 'opacity-70'
                      )}
                    >
                      {busy === 'vip_monthly' ? 'Starting…' : 'Upgrade to VIP via M-Pesa'}
                    </button>
                    <button
                      onClick={() => initiatePayment('vip_monthly', 'pesapal')}
                      disabled={busy === 'vip_monthly_pesapal'}
                      className={cx(
                        'w-full rounded-xl border px-4 py-2 text-sm transition',
                        'border-white/10 bg-white/5 text-white/80 hover:bg-white/10',
                        busy === 'vip_monthly_pesapal' && 'opacity-70'
                      )}
                    >
                      Pay by Card (Pesapal)
                    </button>
                    <button
                      onClick={() => initiatePayment('vip_monthly', 'flutterwave')}
                      disabled={busy === 'vip_monthly_flutterwave'}
                      className={cx(
                        'w-full rounded-xl border px-4 py-2 text-sm transition',
                        'border-white/10 bg-white/5 text-white/80 hover:bg-white/10',
                        busy === 'vip_monthly_flutterwave' && 'opacity-70'
                      )}
                    >
                      Pay Global (Flutterwave)
                    </button>
                  </>
                ) : (
                  <button
                    disabled
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/45"
                  >
                    {active ? 'Current plan' : 'Always available'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/65">
        <p className="text-white/80 font-medium">Truthful positioning</p>
        <p className="mt-2">
          Priority guarantees speed and compatibility filtering. VIP adds human curation and deeper filtering. Either way, your clarity determines the quality of your outcomes.
        </p>
      </div>
    </div>
  )
}
