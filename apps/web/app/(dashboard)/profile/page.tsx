// ─────────────────────────────────────────────────────────────────────
// PROFILE EDIT PAGE
// Path: kujuana/apps/web/app/(dashboard)/profile/page.tsx
// ─────────────────────────────────────────────────────────────────────

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDashUser } from '../dash-context'
import { getApiBase } from '@/lib/api-base'

const API = getApiBase()

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

const PANEL_CLASS =
  'relative overflow-hidden rounded-2xl border border-white/10 bg-black/10 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.30)] backdrop-blur-xl'

const FIELD_CLASS =
  'w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white/85 placeholder:text-white/35 outline-none transition focus:border-[rgba(212,175,55,0.35)] focus:ring-1 focus:ring-[rgba(212,175,55,0.18)]'

const TEXTAREA_CLASS =
  'w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/85 placeholder:text-white/35 outline-none transition focus:border-[rgba(212,175,55,0.35)] focus:ring-1 focus:ring-[rgba(212,175,55,0.18)]'

function tierLabel(tier?: string) {
  if (tier === 'vip') return 'VIP'
  if (tier === 'priority') return 'Priority'
  return 'Standard'
}

type ProfileDTO = {
  fullName?: string
  occupation?: string
  location?: { label?: string } | string
  bio?: string
  relationshipVision?: string
  nonNegotiables?: string
  preferences?: {
    ageMin?: number
    ageMax?: number
    countries?: string[]
    religion?: string | null
    international?: boolean
  }
}

function locationLabel(location: ProfileDTO['location']) {
  return typeof location === 'string' ? location : (location?.label || '')
}

export default function ProfilePage() {
  const { user, refetch } = useDashUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loadedForm, setLoadedForm] = useState<ProfileDTO | null>(null)

  const [form, setForm] = useState<ProfileDTO>({
    fullName: '',
    occupation: '',
    location: '',
    bio: '',
    relationshipVision: '',
    nonNegotiables: '',
    preferences: {
      ageMin: 24,
      ageMax: 35,
      countries: ['Kenya'],
      religion: null,
      international: false,
    },
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api<any>('/profile/me', { method: 'GET' })
        const p = res?.data ?? res?.profile ?? res

        const dto: ProfileDTO = {
          fullName: p?.fullName || p?.user?.fullName || '',
          occupation: p?.occupation || '',
          location: p?.location?.label || p?.location || '',
          bio: p?.bio || '',
          relationshipVision: p?.relationshipVision || p?.lifeVision || '',
          nonNegotiables: Array.isArray(p?.nonNegotiables) ? p.nonNegotiables.join('\n') : (p?.nonNegotiables || ''),
          preferences: {
            ageMin: p?.preferences?.ageMin ?? p?.prefs?.ageMin ?? 24,
            ageMax: p?.preferences?.ageMax ?? p?.prefs?.ageMax ?? 35,
            countries: p?.preferences?.countries ?? p?.prefs?.countries ?? ['Kenya'],
            religion: p?.preferences?.religion ?? p?.prefs?.religion ?? null,
            international: Boolean(p?.preferences?.international ?? p?.prefs?.international ?? false),
          },
        }

        if (!mounted) return
        setForm(dto)
        setLoadedForm(dto)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to load profile')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const completenessHint = useMemo(() => {
    const hasBio = (form.bio || '').trim().length >= 60
    const hasVision = (form.relationshipVision || '').trim().length >= 60
    const hasNonNeg = (form.nonNegotiables || '').trim().length >= 20
    const okPrefs =
      (form.preferences?.ageMin ?? 0) > 0 &&
      (form.preferences?.ageMax ?? 0) >= (form.preferences?.ageMin ?? 0) &&
      (form.preferences?.countries?.length ?? 0) > 0
    const score = [hasBio, hasVision, hasNonNeg, okPrefs].filter(Boolean).length
    return score >= 4
      ? 'Strong profile. Your compatibility signal is clear and compelling.'
      : 'Add more detail to your vision and non-negotiables to improve match quality.'
  }, [form])

  const signalScore = useMemo(() => {
    const hasBio = (form.bio || '').trim().length >= 60
    const hasVision = (form.relationshipVision || '').trim().length >= 60
    const hasNonNeg = (form.nonNegotiables || '').trim().length >= 20
    const hasLocation = locationLabel(form.location).trim().length >= 3
    const hasPrefs =
      (form.preferences?.ageMin ?? 0) >= 18 &&
      (form.preferences?.ageMax ?? 0) >= (form.preferences?.ageMin ?? 0) &&
      (form.preferences?.countries?.length ?? 0) > 0

    const checks = [hasBio, hasVision, hasNonNeg, hasLocation, hasPrefs].filter(Boolean).length
    return Math.round((checks / 5) * 100)
  }, [form])

  const name = (form.fullName || user?.fullName || 'Member').trim()
  const firstName = useMemo(() => name.split(/\s+/).filter(Boolean)[0] || 'Member', [name])
  const initials = useMemo(() => {
    const parts = name.split(/\s+/).filter(Boolean)
    if (!parts.length) return 'K'
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('')
  }, [name])

  const nonNegotiables = useMemo(
    () =>
      (form.nonNegotiables || '')
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean)
        .slice(0, 4),
    [form.nonNegotiables]
  )

  const location = locationLabel(form.location).trim() || 'Location not set'
  const countries = (form.preferences?.countries || []).filter(Boolean)
  const bioPreview = (form.bio || '').trim() || 'Write a warm, specific bio so quality matches understand your energy quickly.'
  const visionPreview =
    (form.relationshipVision || '').trim() ||
    'Describe the relationship you want, the pace you prefer, and the future you are building.'

  async function save() {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = {
        fullName: form.fullName?.trim(),
        occupation: form.occupation?.trim(),
        location: typeof form.location === 'string' ? { label: form.location.trim() } : form.location,
        bio: form.bio?.trim(),
        relationshipVision: form.relationshipVision?.trim(),
        nonNegotiables: (form.nonNegotiables || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        preferences: {
          ageMin: Number(form.preferences?.ageMin ?? 0),
          ageMax: Number(form.preferences?.ageMax ?? 0),
          countries: (form.preferences?.countries ?? []).map((c) => c.trim()).filter(Boolean),
          religion: form.preferences?.religion || null,
          international: Boolean(form.preferences?.international),
        },
      }

      await api('/profile/me', { method: 'PUT', body: JSON.stringify(payload) })
      setSuccess('Profile saved and published successfully.')
      setLoadedForm(form)
      await refetch()
    } catch (e: any) {
      setError(e?.message || 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  function resetChanges() {
    if (!loadedForm) return
    setForm(loadedForm)
    setError(null)
    setSuccess(null)
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/10 p-6 text-sm text-white/60">
        Loading profile...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(150deg,rgba(74,22,99,0.45)_0%,rgba(14,14,20,0.82)_68%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.38)] md:p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.24)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(74,22,99,0.35)_0%,transparent_72%)]" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(245,230,179,0.70)]">Profile Studio</p>
            <h1 className="mt-2 font-[var(--font-cormorant,serif)] text-3xl font-light text-white/95 md:text-4xl">
              Craft your dating presence
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">{completenessHint}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetChanges}
              disabled={saving || !loadedForm}
              className={cx(
                'rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10',
                (saving || !loadedForm) && 'opacity-60'
              )}
            >
              Reset
            </button>
            <button
              onClick={save}
              disabled={saving}
              className={cx(
                'rounded-xl border px-4 py-2 text-sm transition',
                'border-[rgba(212,175,55,0.30)] bg-[rgba(212,175,55,0.12)] text-[var(--gold-champagne)] hover:bg-[rgba(212,175,55,0.16)]',
                saving && 'opacity-70'
              )}
            >
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200/20 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.08)] p-4 text-sm text-[rgba(245,230,179,0.90)]">
          {success}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className={PANEL_CLASS}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(212,175,55,0.10)_0%,transparent_100%)]" />
            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Basics</p>
              <p className="mt-1 text-sm text-white/60">These details frame your first impression.</p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs text-white/60">Full name</span>
                  <input
                    value={form.fullName || ''}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    className={FIELD_CLASS}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs text-white/60">Occupation</span>
                  <input
                    value={form.occupation || ''}
                    onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))}
                    className={FIELD_CLASS}
                  />
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-xs text-white/60">Location</span>
                  <input
                    value={locationLabel(form.location)}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    className={FIELD_CLASS}
                    placeholder="e.g. Nairobi, Kenya"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className={PANEL_CLASS}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Dating Preferences</p>
            <p className="mt-1 text-sm text-white/60">Sharpen who should enter your match queue.</p>

            <div className="mt-4 grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-2">
                  <span className="text-xs text-white/60">Age min</span>
                  <input
                    type="number"
                    value={form.preferences?.ageMin ?? 0}
                    onChange={(e) => setForm((p) => ({ ...p, preferences: { ...(p.preferences || {}), ageMin: Number(e.target.value) } }))}
                    className={FIELD_CLASS}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs text-white/60">Age max</span>
                  <input
                    type="number"
                    value={form.preferences?.ageMax ?? 0}
                    onChange={(e) => setForm((p) => ({ ...p, preferences: { ...(p.preferences || {}), ageMax: Number(e.target.value) } }))}
                    className={FIELD_CLASS}
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-xs text-white/60">Countries (comma separated)</span>
                <input
                  value={(form.preferences?.countries || []).join(', ')}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      preferences: {
                        ...(p.preferences || {}),
                        countries: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                  className={FIELD_CLASS}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs text-white/60">Religion (optional)</span>
                <input
                  value={form.preferences?.religion ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, preferences: { ...(p.preferences || {}), religion: e.target.value || null } }))}
                  className={FIELD_CLASS}
                  placeholder="e.g. Christian, Muslim"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm text-white/85">International matching</p>
                  <p className="text-xs text-white/50">Allow introductions beyond your country.</p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.preferences?.international)}
                  onChange={(e) => setForm((p) => ({ ...p, preferences: { ...(p.preferences || {}), international: e.target.checked } }))}
                  className="h-4 w-4 accent-[rgba(212,175,55,0.90)]"
                />
              </label>
            </div>
          </section>

          <section className={PANEL_CLASS}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Identity and Intention</p>
            <p className="mt-1 text-sm text-white/60">Write this as if your future partner will read it tonight.</p>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-2">
                <span className="text-xs text-white/60">Bio</span>
                <textarea
                  value={form.bio || ''}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  className={TEXTAREA_CLASS}
                  placeholder="Who are you and what kind of life are you building?"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs text-white/60">Relationship vision</span>
                <textarea
                  value={form.relationshipVision || ''}
                  onChange={(e) => setForm((p) => ({ ...p, relationshipVision: e.target.value }))}
                  rows={4}
                  className={TEXTAREA_CLASS}
                  placeholder="Describe the relationship pace, values, and future you want."
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs text-white/60">Non-negotiables (one per line)</span>
                <textarea
                  value={form.nonNegotiables || ''}
                  onChange={(e) => setForm((p) => ({ ...p, nonNegotiables: e.target.value }))}
                  rows={4}
                  className={TEXTAREA_CLASS}
                  placeholder={'e.g.\nFaith alignment\nKindness\nNo substance abuse'}
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <section className="relative overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.25)] bg-[linear-gradient(165deg,rgba(74,22,99,0.62)_0%,rgba(17,17,24,0.90)_68%)] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.42)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(212,175,55,0.20),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(74,22,99,0.50),transparent_44%)]" />

            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(245,230,179,0.75)]">Live Preview</p>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(212,175,55,0.42)] bg-[rgba(212,175,55,0.10)] font-[var(--font-cormorant,serif)] text-xl text-[var(--gold-champagne)]">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-white/95">{name}</p>
                  <p className="truncate text-sm text-white/65">{form.occupation?.trim() || 'Occupation not set'}</p>
                </div>
              </div>

              <p className="mt-3 text-sm text-white/70">{location}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.12)] px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-[var(--gold-champagne)]">
                  {tierLabel(user?.tier)}
                </span>
                {form.preferences?.international ? (
                  <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/75">
                    Global
                  </span>
                ) : null}
              </div>

              <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Bio</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/80">{bioPreview}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Vision</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/80">{visionPreview}</p>
                </div>
              </div>
            </div>
          </section>

          <section className={PANEL_CLASS}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Profile Metrics</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-white/55">Profile</p>
                <p className="mt-1 text-xl font-semibold text-white/90">{user?.profileCompleteness ?? 0}%</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-white/55">Signal</p>
                <p className="mt-1 text-xl font-semibold text-white/90">{signalScore}%</p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--grad-gold,linear-gradient(135deg,#E8D27C,#D4AF37,#C9A227))]"
                style={{ width: `${Math.min(100, Math.max(0, signalScore))}%` }}
              />
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Focus Countries</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(countries.length ? countries : ['No countries set']).slice(0, 4).map((country) => (
                    <span key={country} className="rounded-full border border-white/12 bg-black/25 px-2.5 py-1 text-xs text-white/75">
                      {country}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Non-negotiables</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(nonNegotiables.length ? nonNegotiables : ['Add at least one non-negotiable']).map((item) => (
                    <span key={item} className="rounded-full border border-[rgba(212,175,55,0.24)] bg-[rgba(212,175,55,0.10)] px-2.5 py-1 text-xs text-[rgba(245,230,179,0.90)]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-white/55">
              {firstName}, profiles with clear standards and specific intent generally get better-quality introductions.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
