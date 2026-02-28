// ─────────────────────────────────────────────────────────────────────
// MATCHES LIST (INBOX)
// Path: kujuana/apps/web/app/(dashboard)/matches/page.tsx
// ─────────────────────────────────────────────────────────────────────

'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useDashUser } from '../dash-context'
import { getApiBase } from '@/lib/api-base'

const API = getApiBase()

type MatchStatus = 'queued' | 'introduced' | 'active' | 'declined' | 'expired'
type MatchItem = {
  id: string
  status: MatchStatus
  score: number
  createdAt: string
  other: {
    id: string
    firstName: string
    age?: number | null
    location?: string | null
    blurredPhotoUrl?: string | null
  }
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

function scoreLabel(score: number) {
  if (score >= 85) return 'Elite fit'
  if (score >= 70) return 'Strong fit'
  if (score >= 55) return 'Good fit'
  return 'Explore'
}

export default function MatchesPage() {
  const { user, loading: dashLoading } = useDashUser()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<MatchItem[]>([])
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return items.filter((m) => {
      const hay = `${m.other.firstName} ${m.other.location || ''} ${m.status}`.toLowerCase()
      return hay.includes(s)
    })
  }, [items, q])

  const canRequestMatch = useMemo(() => {
    if (!user) return false
    if (user.tier === 'vip') return true
    if (user.tier === 'priority') return (user.credits ?? 0) > 0
    return false
  }, [user])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api<any>('/matches?limit=50', { method: 'GET' })
        const list = res?.data?.items || res?.items || []
        const mapped: MatchItem[] = list.map((m: any) => ({
          id: m?._id || m?.id,
          status: m?.status || 'active',
          score: Number(m?.score ?? m?.compatibilityScore ?? 0),
          createdAt: m?.createdAt || new Date().toISOString(),
          other: {
            id: m?.other?.id || m?.otherUserId || m?.candidate?.id || 'unknown',
            firstName: m?.other?.firstName || m?.other?.name || m?.candidate?.firstName || 'Match',
            age: m?.other?.age ?? m?.candidate?.age ?? null,
            location: m?.other?.location ?? m?.candidate?.location?.label ?? null,
            blurredPhotoUrl: m?.other?.blurredPhotoUrl ?? null,
          },
        }))
        if (!mounted) return
        setItems(mapped)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to load matches')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  async function requestMatch() {
    setError(null)
    try {
      await api('/matches/request', { method: 'POST', body: JSON.stringify({}) })
      // refresh list
      const res = await api<any>('/matches?limit=50', { method: 'GET' })
      const list = res?.data?.items || res?.items || []
      setItems(
        list.map((m: any) => ({
          id: m?._id || m?.id,
          status: m?.status || 'active',
          score: Number(m?.score ?? m?.compatibilityScore ?? 0),
          createdAt: m?.createdAt || new Date().toISOString(),
          other: {
            id: m?.other?.id || m?.otherUserId || m?.candidate?.id || 'unknown',
            firstName: m?.other?.firstName || m?.other?.name || m?.candidate?.firstName || 'Match',
            age: m?.other?.age ?? m?.candidate?.age ?? null,
            location: m?.other?.location ?? m?.candidate?.location?.label ?? null,
            blurredPhotoUrl: m?.other?.blurredPhotoUrl ?? null,
          },
        }))
      )
    } catch (e: any) {
      setError(e?.message || 'Could not request a match')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Matches</p>
          <h1 className="mt-2 font-[var(--font-cormorant,serif)] text-3xl font-light text-white/95 md:text-4xl">
            Match Inbox
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
            Your matches are private. Photos may appear blurred until introduction is accepted, depending on your privacy policy and tier.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search matches…"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/85 placeholder:text-white/35 outline-none focus:border-[rgba(212,175,55,0.35)] sm:w-56"
          />
          <button
            onClick={requestMatch}
            disabled={!canRequestMatch || dashLoading}
            className={cx(
              'rounded-xl border px-4 py-2 text-sm transition',
              canRequestMatch
                ? 'border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.10)] text-[var(--gold-champagne)] hover:bg-[rgba(212,175,55,0.14)]'
                : 'border-white/10 bg-white/5 text-white/45'
            )}
            title={
              user?.tier === 'standard'
                ? 'Upgrade to Priority or VIP to request an instant match.'
                : user?.tier === 'priority' && (user?.credits ?? 0) <= 0
                  ? 'You need credits to request a Priority match.'
                  : 'Request a match'
            }
          >
            Request a match
          </button>
          {(user?.tier === 'standard' || (user?.tier === 'priority' && (user?.credits ?? 0) <= 0)) ? (
            <Link
              href="/subscription"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center text-sm text-white/75 hover:bg-white/10"
            >
              Upgrade
            </Link>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200/20 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-black/10">
        <div className="border-b border-white/10 p-4">
          <p className="text-xs text-white/55">
            {loading ? 'Loading…' : `${filtered.length} match${filtered.length === 1 ? '' : 'es'}`}
          </p>
        </div>

        <div className="divide-y divide-white/10">
          {loading ? (
            <div className="p-6 text-sm text-white/60">Loading your matches…</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-white/60">
              No matches yet. Keep your profile clear, and consider Priority for instant processing.
            </div>
          ) : (
            filtered.map((m) => (
              <Link
                key={m.id}
                href={`/matches/${m.id}`}
                className="block p-4 hover:bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    {m.other.blurredPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.other.blurredPhotoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                        —
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white/90">
                      {m.other.firstName}
                      {m.other.age ? <span className="text-white/60">, {m.other.age}</span> : null}
                    </p>
                    <p className="truncate text-xs text-white/55">
                      {m.other.location || 'Location hidden'} • {m.status.toUpperCase()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-white/90">{Math.round(m.score)}%</p>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(245,230,179,0.70)]">
                      {scoreLabel(m.score)}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
