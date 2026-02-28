// kujuana/apps/web/app/(dashboard)/dashboard/page.tsx
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDashUser } from '../dash-context'
import { getApiBase } from '@/lib/api-base'

const API = getApiBase()

type ApiEnvelope<T> =
  | { success?: true; data?: T; items?: T; message?: string }
  | { success?: false; error?: { message?: string }; message?: string }

type MatchItem = {
  id?: string
  createdAt?: string
  status?: string
}

type MatchesResponse =
  | { data?: { items?: MatchItem[] } }
  | { items?: MatchItem[] }
  | ApiEnvelope<{ items?: MatchItem[] }>
  | ApiEnvelope<MatchItem[]>

type Stats = {
  activeMatches: number
  pendingIntroductions: number
  lastMatchAt?: string | null
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

async function api<T>(path: string, init?: RequestInit, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    signal,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = (isJson ? await res.json() : null) as any

  if (!res.ok) {
    const msg =
      payload?.error?.message ||
      payload?.message ||
      `Request failed (${res.status})`
    throw new Error(msg)
  }

  return payload as T
}

function extractItems(res: MatchesResponse): MatchItem[] {
  // Supports multiple backend shapes gracefully
  const anyRes: any = res
  return (
    anyRes?.data?.items ||
    anyRes?.data ||
    anyRes?.items ||
    (Array.isArray(anyRes) ? anyRes : []) ||
    []
  )
}

function toLocalDateTime(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

export default function DashboardPage() {
  const { user, loading, refetch } = useDashUser()

  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const greeting = useMemo(() => {
    const name = user?.fullName?.split(' ')?.[0] || 'there'
    return `Welcome back, ${name}`
  }, [user?.fullName])

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    let mounted = true

    ;(async () => {
      setStatsLoading(true)
      setStatsError(null)

      try {
        // Fetch a small page to estimate “last match”, and a larger page for active count.
        // If your API supports a dedicated /matches/stats endpoint later, swap it in here.
        const [r1, r2] = await Promise.all([
          api<MatchesResponse>('/matches?limit=1', { method: 'GET' }, controller.signal),
          api<MatchesResponse>('/matches?limit=50', { method: 'GET' }, controller.signal),
        ])

        const items1 = extractItems(r1)
        const items2 = extractItems(r2)

        const last = items1?.[0]?.createdAt ?? null
        const active = items2.filter(m => ['active', 'introduced'].includes(String(m?.status || ''))).length

        if (!mounted) return

        setStats({
          activeMatches: active,
          pendingIntroductions: 0, // update when you add server-side queue state
          lastMatchAt: last,
        })
      } catch (e: any) {
        if (!mounted) return
        if (e?.name === 'AbortError') return
        setStats(null)
        setStatsError(e?.message || 'Could not load stats')
      } finally {
        if (!mounted) return
        setStatsLoading(false)
      }
    })()

    return () => {
      mounted = false
      controller.abort()
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Dashboard</p>
          <h1 className="mt-2 font-[var(--font-cormorant,serif)] text-3xl font-light text-white/95 md:text-4xl">
            {greeting}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
            Your matches are built around compatibility, privacy, and intention. Keep your profile truthful and specific — it sharpens the signal and removes noise.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={refetch}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60"
          >
            Refresh
          </button>
          <Link
            href="/matches"
            className="rounded-xl border border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.10)] px-4 py-2 text-sm text-[var(--gold-champagne)] hover:bg-[rgba(212,175,55,0.14)]"
          >
            View Matches
          </Link>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Plan</p>
          <p className="mt-2 text-lg font-semibold text-white/90">
            {loading ? '—' : (user?.tier ? user.tier.toUpperCase() : 'STANDARD')}
          </p>
          <p className="mt-2 text-sm text-white/60">
            {user?.tier === 'vip'
              ? 'Curated introductions, matchmaker review, and premium filters.'
              : user?.tier === 'priority'
                ? 'Instant pay-per-match processing using credits.'
                : 'Free nightly matching — slow but intentional.'}
          </p>
          <Link href="/subscription" className="mt-4 inline-flex text-sm text-[var(--gold-champagne)] hover:underline">
            Manage subscription →
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Credits</p>
          <p className="mt-2 text-lg font-semibold text-white/90">{loading ? '—' : (user?.credits ?? 0)}</p>
          <p className="mt-2 text-sm text-white/60">
            Priority uses credits per match request. VIP typically doesn’t require credits for curated matching.
          </p>
          <Link href="/subscription" className="mt-4 inline-flex text-sm text-[var(--gold-champagne)] hover:underline">
            Top up / upgrade →
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Profile Strength</p>
          <p className="mt-2 text-lg font-semibold text-white/90">
            {loading ? '—' : `${user?.profileCompleteness ?? 0}%`}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--grad-gold,linear-gradient(135deg,#E8D27C,#D4AF37,#C9A227))]"
              style={{ width: `${Math.min(100, Math.max(0, user?.profileCompleteness ?? 0))}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-white/60">
            The more specific your vision + non-negotiables, the cleaner your matches.
          </p>
          <Link href="/profile" className="mt-4 inline-flex text-sm text-[var(--gold-champagne)] hover:underline">
            Edit profile →
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Quick actions</p>
            <p className="mt-1 text-sm text-white/65">
              Move with intention: update your preferences, request a match, or review your inbox.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              className={cx('rounded-xl border px-4 py-2 text-sm', 'border-white/10 bg-black/10 text-white/80 hover:bg-white/10')}
              href="/profile"
            >
              Update Profile
            </Link>
            <Link
              className={cx('rounded-xl border px-4 py-2 text-sm', 'border-white/10 bg-black/10 text-white/80 hover:bg-white/10')}
              href="/settings"
            >
              Privacy Settings
            </Link>
            <Link
              className={cx(
                'rounded-xl border px-4 py-2 text-sm',
                'border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.10)] text-[var(--gold-champagne)] hover:bg-[rgba(212,175,55,0.14)]'
              )}
              href="/matches"
            >
              Open Match Inbox
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs text-white/60">Active matches</p>
            <p className="mt-1 text-2xl font-semibold text-white/90">
              {statsLoading ? '…' : (stats?.activeMatches ?? '—')}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs text-white/60">Pending introductions</p>
            <p className="mt-1 text-2xl font-semibold text-white/90">
              {statsLoading ? '…' : (stats?.pendingIntroductions ?? '—')}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs text-white/60">Last match</p>
            <p className="mt-1 text-sm font-medium text-white/85">
              {statsLoading ? 'Loading…' : toLocalDateTime(stats?.lastMatchAt)}
            </p>
          </div>
        </div>

        {statsError ? <p className="mt-3 text-xs text-red-200/90">{statsError}</p> : null}
      </div>
    </div>
  )
}
