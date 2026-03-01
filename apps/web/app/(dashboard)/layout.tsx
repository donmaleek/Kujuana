// ─────────────────────────────────────────────────────────────────────
// DASHBOARD LAYOUT
// Path: kujuana/apps/web/app/(dashboard)/layout.tsx
// ─────────────────────────────────────────────────────────────────────

'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { getApiBase } from '@/lib/api-base'
import { DashCtx, type DashUser, type Tier } from './dash-context'

/* ─── Helpers ─────────────────────────────────────────────────────── */
const API = getApiBase()

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json() : null

  if (!res.ok) {
    const msg =
      payload?.error?.message ||
      payload?.message ||
      `Request failed (${res.status})`
    throw new Error(msg)
  }
  return payload as T
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function tierLabel(tier: Tier) {
  if (tier === 'vip') return 'VIP'
  if (tier === 'priority') return 'Priority'
  return 'Standard'
}

function tierBadgeClasses(tier: Tier) {
  if (tier === 'vip') return 'bg-[rgba(212,175,55,0.14)] border-[rgba(212,175,55,0.35)] text-[var(--gold-champagne)]'
  if (tier === 'priority') return 'bg-[rgba(232,210,124,0.10)] border-[rgba(232,210,124,0.28)] text-[rgba(245,230,179,0.92)]'
  return 'bg-white/5 border-white/10 text-white/80'
}

/* ─── Layout ──────────────────────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = useState<DashUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      // Preferred: one endpoint that returns profile + subscription summary.
      // Fallback: combine /profile/me and /subscriptions/me if your API keeps them separate.
      // This expects your API returns a consistent { success, data } shape.
      const me = await api<any>('/profile/me', { method: 'GET' })
      const sub = await api<any>('/subscriptions/me', { method: 'GET' })

      const profile = me?.data ?? me?.profile ?? me
      const subscription = sub?.data ?? sub?.subscription ?? sub

      const u: DashUser = {
        id: profile?.userId || profile?.user?.id || profile?.userId || profile?.id,
        fullName: profile?.fullName || profile?.user?.fullName || profile?.name || 'Member',
        email: profile?.email || profile?.user?.email || '',
        tier: (subscription?.tier || subscription?.plan || 'standard') as Tier,
        credits: Number(subscription?.credits ?? 0),
        avatarPublicId: profile?.avatarPublicId ?? profile?.avatar ?? null,
        profileCompleteness: toNumber(profile?.completeness ?? profile?.profileCompleteness ?? profile?.completeness?.overall, 0),
        onboardingComplete: Boolean(profile?.onboardingComplete ?? profile?.isSubmitted ?? false),
        isActive: Boolean(profile?.isActive ?? true),
      }

      setUser(u)

      // Completion is determined by onboarding status first, not strict percentage.
      // Incomplete users should land on profile first, then choose whether to continue onboarding.
      const profileReady = u.onboardingComplete || u.profileCompleteness >= 100
      if (!profileReady && pathname !== '/profile') {
        router.replace('/profile')
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [pathname, router])

  const signOut = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST', body: JSON.stringify({}) })
    } catch {
      // ignore
    } finally {
      router.replace('/login')
    }
  }, [router])

  useEffect(() => {
    refetch()
  }, [refetch])

  const value = useMemo(() => ({ user, loading, refetch, signOut }), [user, loading, refetch, signOut])

  const nav = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/matches', label: 'Matches' },
    { href: '/profile', label: 'Profile' },
    { href: '/subscription', label: 'Subscription' },
    { href: '/settings', label: 'Settings' },
  ]

  return (
    <DashCtx.Provider value={value}>
      <div className="min-h-screen bg-[var(--bg,linear-gradient(180deg,#3B0F4F,#2A0838))] text-white">
        {/* Subtle background texture */}
        <div className="pointer-events-none fixed inset-0 opacity-60">
          <div className="absolute inset-0 [background-image:repeating-linear-gradient(-45deg,rgba(212,175,55,0.03)_0px,rgba(212,175,55,0.03)_1px,transparent_1px,transparent_70px)]" />
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_50%_10%,rgba(212,175,55,0.10)_0%,transparent_55%)]" />
        </div>

        <div className="relative mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 md:px-6">
          {/* Sidebar */}
          <aside className="hidden w-72 shrink-0 md:block">
            <div className="rounded-2xl border border-white/10 bg-black/15 backdrop-blur-xl shadow-[0_12px_60px_rgba(0,0,0,0.35)]">
              <div className="p-5">
                <Link href="/dashboard" className="inline-flex items-center gap-2.5">
                  <Image
                    src="/brand/logo.png"
                    alt="Kujuana logo"
                    width={34}
                    height={34}
                    priority
                    className="h-[34px] w-[34px] object-contain"
                  />
                  <span className="font-[var(--font-cormorant,serif)] text-xl tracking-[0.14em] uppercase bg-[var(--grad-gold,linear-gradient(135deg,#E8D27C,#D4AF37,#C9A227))] bg-clip-text text-transparent">
                    Kujuana
                  </span>
                </Link>

                <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white/90">
                        {loading ? 'Loading…' : (user?.fullName || 'Member')}
                      </p>
                      <p className="truncate text-xs text-white/60">
                        {loading ? ' ' : (user?.email || '')}
                      </p>
                    </div>
                    <span className={cx('shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium', tierBadgeClasses(user?.tier || 'standard'))}>
                      {tierLabel(user?.tier || 'standard')}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Credits</p>
                      <p className="mt-1 text-lg font-semibold text-white/90">{loading ? '—' : (user?.credits ?? 0)}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Profile</p>
                      <p className="mt-1 text-lg font-semibold text-white/90">
                        {loading ? '—' : `${Math.min(100, Math.max(0, user?.profileCompleteness ?? 0))}%`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[var(--grad-gold,linear-gradient(135deg,#E8D27C,#D4AF37,#C9A227))] transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, user?.profileCompleteness ?? 0))}%` }}
                    />
                  </div>
                </div>

                <nav className="mt-5 space-y-1">
                  {nav.map((n) => {
                    const active = pathname === n.href
                    return (
                      <Link
                        key={n.href}
                        href={n.href}
                        className={cx(
                          'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition',
                          active
                            ? 'border border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.10)] text-[var(--gold-champagne)] shadow-[0_0_0_1px_rgba(212,175,55,0.12)]'
                            : 'border border-transparent text-white/80 hover:border-white/10 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        <span>{n.label}</span>
                        {active ? <span className="text-xs">●</span> : null}
                      </Link>
                    )
                  })}
                </nav>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={refetch}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                    disabled={loading}
                  >
                    Refresh
                  </button>
                  <button
                    onClick={signOut}
                    className="flex-1 rounded-xl border border-[rgba(212,175,55,0.20)] bg-[rgba(212,175,55,0.08)] px-3 py-2 text-xs text-[var(--gold-champagne)] hover:bg-[rgba(212,175,55,0.12)]"
                  >
                    Sign out
                  </button>
                </div>

                {error ? (
                  <p className="mt-3 text-xs text-red-200/90">
                    {error}
                  </p>
                ) : null}
              </div>

              <div className="border-t border-white/10 px-5 py-4 text-xs text-white/40">
                Private &amp; Confidential • Kujuana
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0 flex-1">
            {/* Mobile top bar */}
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 p-4 backdrop-blur-xl md:hidden">
              <Link href="/dashboard" className="inline-flex items-center gap-2 font-[var(--font-cormorant,serif)] tracking-[0.14em] uppercase bg-[var(--grad-gold,linear-gradient(135deg,#E8D27C,#D4AF37,#C9A227))] bg-clip-text text-transparent">
                <Image
                  src="/brand/logo.png"
                  alt="Kujuana logo"
                  width={30}
                  height={30}
                  className="h-[30px] w-[30px] object-contain"
                />
                <span>Kujuana</span>
              </Link>
              <div className="flex items-center gap-2">
                <span className={cx('rounded-full border px-2.5 py-1 text-[11px] font-medium', tierBadgeClasses(user?.tier || 'standard'))}>
                  {tierLabel(user?.tier || 'standard')}
                </span>
                <button
                  onClick={signOut}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80"
                >
                  Sign out
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4 shadow-[0_12px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-6">
              {children}
            </div>

            <div className="mt-4 text-center text-xs text-white/35">
              Kujuana — Dating with Intention 💍
            </div>
          </main>
        </div>
      </div>
    </DashCtx.Provider>
  )
}
