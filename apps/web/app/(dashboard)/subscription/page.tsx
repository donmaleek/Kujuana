// ─────────────────────────────────────────────────────────────────────
// SUBSCRIPTION PAGE
// Path: kujuana/apps/web/app/(dashboard)/subscription/page.tsx
// ─────────────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic'

'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDashUser } from '../dash-context'
import { getApiBase } from '@/lib/api-base'
import { PaymentModal } from '@/components/shared/PaymentModal'

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

type ModalState = {
  open: boolean
  title: string
  basePayload: Record<string, any>
}

export default function SubscriptionPage() {
  const { user, refetch } = useDashUser()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sub, setSub] = useState<SubDTO | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>({ open: false, title: '', basePayload: {} })
  const [returnBanner, setReturnBanner] = useState<'verifying' | 'done' | null>(null)

  // Fetch subscription
  async function fetchSub() {
    setLoading(true)
    setError(null)
    try {
      const res = await api<any>('/subscriptions/me', { method: 'GET' })
      const s = res?.data ?? res?.subscription ?? res
      setSub({
        tier: (s?.tier || s?.plan || 'standard') as Tier,
        credits: Number(s?.credits ?? 0),
        renewsAt: s?.renewsAt ?? s?.nextBillingAt ?? null,
        status: s?.status ?? 'active',
      })
    } catch (e: any) {
      setError(e?.message || 'Failed to load subscription')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      await fetchSub()
      if (!mounted) return
    })()
    return () => { mounted = false }
  }, [])

  // Handle return from payment gateway
  useEffect(() => {
    if (searchParams.get('status') === 'return') {
      setReturnBanner('verifying')
      // Re-fetch sub after a short delay to let webhook process
      const timer = setTimeout(async () => {
        await fetchSub()
        setReturnBanner('done')
        setTimeout(() => setReturnBanner(null), 3000)
      }, 4000)
      return () => clearTimeout(timer)
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
        purchases: [] as { label: string; purpose: string }[],
      },
      {
        id: 'priority',
        name: 'Priority',
        price: 'Pay per match',
        desc: 'Instant matching using credits. You control speed.',
        perks: ['Instant processing', 'Credits never double-charge (idempotent)', 'Best for busy professionals'],
        purchases: [
          { label: 'Buy 1 match — KES 500', purpose: 'priority_single' },
          { label: 'Buy 5-pack — KES 2,000 (save KES 500)', purpose: 'priority_bundle_5' },
          { label: 'Buy 10-pack — KES 3,500 (save KES 1,500)', purpose: 'priority_bundle_10' },
        ],
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 'KES 10,000 / month',
        desc: 'Curated matchmaking with matchmaker review.',
        perks: ['Curated introductions', 'Premium filters & add-ons', 'Confidential fields protected'],
        purchases: [
          { label: 'Upgrade to VIP — KES 10,000/month', purpose: 'vip_monthly' },
        ],
      },
    ],
    []
  )

  function openModal(title: string, purpose: string) {
    setModal({ open: true, title, basePayload: { purpose } })
  }

  async function cancelRenewal() {
    setBusy('cancel')
    setError(null)
    try {
      await api('/subscriptions/cancel', { method: 'POST', body: JSON.stringify({}) })
      await refetch()
      await fetchSub()
    } catch (e: any) {
      setError(e?.message || 'Could not cancel')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Return-from-gateway banner */}
      {returnBanner && (
        <div className={cx(
          'rounded-2xl border p-4 text-sm transition-all',
          returnBanner === 'verifying'
            ? 'border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] text-[#F5E6B3]'
            : 'border-green-500/30 bg-green-500/10 text-green-200'
        )}>
          {returnBanner === 'verifying'
            ? '⏳ Verifying your payment — this takes a few seconds…'
            : '✓ Payment confirmed! Your subscription has been updated.'}
        </div>
      )}

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

      {/* Current subscription summary */}
      <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs text-white/60">Current tier</p>
            <p className="mt-1 text-lg font-semibold text-white/90">{loading ? '—' : tier.toUpperCase()}</p>
            <p className="mt-1 text-xs text-white/50">
              Credits: <span className="text-white/80">{sub?.credits ?? user?.credits ?? 0}</span>
              {sub?.renewsAt ? <> · Renews: <span className="text-white/80">{new Date(sub.renewsAt).toLocaleDateString()}</span></> : null}
              {sub?.status ? <> · Status: <span className="text-white/80">{sub.status}</span></> : null}
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

      {/* Plan cards */}
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
                {c.purchases.length > 0 ? (
                  c.purchases.map((purchase, i) => (
                    <button
                      key={purchase.purpose}
                      onClick={() => openModal(purchase.label, purchase.purpose)}
                      className={cx(
                        'w-full rounded-xl border px-4 py-2 text-sm transition',
                        i === 0
                          ? 'border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.10)] text-[var(--gold-champagne,#E8D27C)] hover:bg-[rgba(212,175,55,0.14)]'
                          : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                      )}
                    >
                      {purchase.label}
                    </button>
                  ))
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

      {/* Payment modal */}
      <PaymentModal
        open={modal.open}
        onOpenChange={(v) => setModal((m) => ({ ...m, open: v }))}
        title={modal.title}
        basePayload={modal.basePayload}
        onSuccess={async () => {
          await refetch()
          await fetchSub()
        }}
      />
    </div>
  )
}
