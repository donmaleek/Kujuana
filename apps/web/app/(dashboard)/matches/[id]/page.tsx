// ─────────────────────────────────────────────────────────────────────
// MATCH DETAILS
// Path: kujuana/apps/web/app/(dashboard)/matches/[id]/page.tsx
// ─────────────────────────────────────────────────────────────────────

'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { getApiBase } from '@/lib/api-base'

const API = getApiBase()

type MatchDetail = {
  id: string
  status: string
  score: number
  createdAt: string
  other: {
    id: string
    fullName: string
    age?: number | null
    location?: string | null
    bio?: string | null
    photos?: Array<{ url: string }> | null
  }
  breakdown?: {
    goals?: number
    values?: number
    lifestyle?: number
    preferences?: number
    readiness?: number
    vipBonus?: number
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

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MatchDetail | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api<any>(`/matches/${id}`, { method: 'GET' })
        const m = res?.data ?? res?.match ?? res
        const mapped: MatchDetail = {
          id: m?._id || m?.id,
          status: m?.status || 'active',
          score: Number(m?.score ?? m?.compatibilityScore ?? 0),
          createdAt: m?.createdAt || new Date().toISOString(),
          other: {
            id: m?.other?.id || m?.otherUserId || m?.candidate?.id || 'unknown',
            fullName: m?.other?.fullName || m?.other?.name || m?.candidate?.fullName || m?.candidate?.firstName || 'Match',
            age: m?.other?.age ?? m?.candidate?.age ?? null,
            location: m?.other?.location ?? m?.candidate?.location?.label ?? null,
            bio: m?.other?.bio ?? m?.candidate?.bio ?? null,
            photos: m?.other?.photos ?? m?.candidate?.photos ?? null,
          },
          breakdown: m?.breakdown || m?.scoreBreakdown || undefined,
        }
        if (!mounted) return
        setData(mapped)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to load match')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id])

  const pills = useMemo(() => {
    if (!data?.breakdown) return null
    const b = data.breakdown
    const rows: Array<[string, number | undefined]> = [
      ['Goals', b.goals],
      ['Values', b.values],
      ['Lifestyle', b.lifestyle],
      ['Preferences', b.preferences],
      ['Readiness', b.readiness],
    ]
    return rows.filter(([, v]) => typeof v === 'number')
  }, [data?.breakdown])

  async function respond(next: 'accept' | 'decline') {
    setActionLoading(true)
    setError(null)
    try {
      await api(`/matches/${id}/respond`, { method: 'PATCH', body: JSON.stringify({ action: next }) })
      // Reload the match
      const res = await api<any>(`/matches/${id}`, { method: 'GET' })
      const m = res?.data ?? res?.match ?? res
      setData((prev) =>
        prev
          ? {
              ...prev,
              status: m?.status || prev.status,
            }
          : prev
      )
    } catch (e: any) {
      setError(e?.message || 'Could not update match')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Match details</p>
          <h1 className="mt-2 truncate font-[var(--font-cormorant,serif)] text-3xl font-light text-white/95 md:text-4xl">
            {loading ? 'Loading…' : (data?.other?.fullName || 'Match')}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {loading ? '' : `${Math.round(data?.score ?? 0)}% compatibility • ${String(data?.status || '').toUpperCase()}`}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Link href="/matches" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10">
            Back
          </Link>
          <button
            onClick={() => router.refresh?.()}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200/20 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-black/10 p-6 text-sm text-white/60">
          Loading match profile…
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-white/10 bg-black/10 p-6 text-sm text-white/60">
          Match not found.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Profile */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/10 p-5">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="grid grid-cols-3 gap-2 sm:w-56">
                {(data.other.photos || []).slice(0, 3).map((p, idx) => (
                  <div key={idx} className="aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
                {(!data.other.photos || data.other.photos.length === 0) ? (
                  <div className="col-span-3 rounded-xl border border-white/10 bg-white/5 p-6 text-center text-xs text-white/45">
                    Photos are private and may appear later depending on policy.
                  </div>
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white/90">
                  {data.other.fullName}
                  {data.other.age ? <span className="text-white/60">, {data.other.age}</span> : null}
                </p>
                <p className="mt-1 text-xs text-white/55">{data.other.location || 'Location hidden'}</p>

                <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">About</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {data.other.bio || 'No bio shared yet.'}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => respond('accept')}
                    className={cx(
                      'rounded-xl border px-4 py-2 text-sm transition',
                      'border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.10)] text-[var(--gold-champagne)] hover:bg-[rgba(212,175,55,0.14)]',
                      actionLoading && 'opacity-70'
                    )}
                  >
                    Accept
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => respond('decline')}
                    className={cx(
                      'rounded-xl border px-4 py-2 text-sm transition',
                      'border-white/10 bg-white/5 text-white/80 hover:bg-white/10',
                      actionLoading && 'opacity-70'
                    )}
                  >
                    Decline
                  </button>
                </div>

                <p className="mt-3 text-xs text-white/45">
                  Accepting means you’re open to an introduction. Declining helps refine future matching.
                </p>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Compatibility</p>
            <p className="mt-2 text-4xl font-semibold text-white/90">{Math.round(data.score)}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--grad-gold,linear-gradient(135deg,#E8D27C,#D4AF37,#C9A227))]"
                style={{ width: `${Math.min(100, Math.max(0, data.score))}%` }}
              />
            </div>

            {pills ? (
              <div className="mt-5 space-y-2">
                {pills.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-3 py-2">
                    <span className="text-sm text-white/70">{k}</span>
                    <span className="text-sm font-semibold text-white/90">{Math.round(Number(v))}%</span>
                  </div>
                ))}
                {typeof data.breakdown?.vipBonus === 'number' ? (
                  <div className="flex items-center justify-between rounded-xl border border-[rgba(212,175,55,0.18)] bg-[rgba(212,175,55,0.07)] px-3 py-2">
                    <span className="text-sm text-[rgba(245,230,179,0.86)]">VIP Bonus</span>
                    <span className="text-sm font-semibold text-[var(--gold-champagne)]">+{Math.round(data.breakdown.vipBonus)}%</span>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-white/55">
                Score breakdown will appear here once available.
              </p>
            )}

            <div className="mt-6 rounded-xl border border-white/10 bg-black/10 p-4">
              <p className="text-xs text-white/60">
                Created: <span className="text-white/80">{new Date(data.createdAt).toLocaleString()}</span>
              </p>
              <p className="mt-2 text-xs text-white/45">
                Kujuana is compatibility-first. Chemistry is built through communication, not gambling on randomness.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
