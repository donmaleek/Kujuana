// ─────────────────────────────────────────────────────────────────────
// SETTINGS PAGE
// Path: kujuana/apps/web/app/(dashboard)/settings/page.tsx
// ─────────────────────────────────────────────────────────────────────

'use client'

import { useEffect, useState } from 'react'
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

type SettingsDTO = {
  blurPhotosUntilAccepted: boolean
  showOnlineStatus: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

export default function SettingsPage() {
  const { signOut } = useDashUser()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [s, setS] = useState<SettingsDTO>({
    blurPhotosUntilAccepted: true,
    showOnlineStatus: false,
    emailNotifications: true,
    pushNotifications: true,
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api<any>('/profile/me', { method: 'GET' })
        const p = res?.data ?? res?.profile ?? res
        const settings = p?.settings || p?.privacy || {}
        const dto: SettingsDTO = {
          blurPhotosUntilAccepted: Boolean(settings?.blurPhotosUntilAccepted ?? true),
          showOnlineStatus: Boolean(settings?.showOnlineStatus ?? false),
          emailNotifications: Boolean(settings?.emailNotifications ?? true),
          pushNotifications: Boolean(settings?.pushNotifications ?? true),
        }
        if (!mounted) return
        setS(dto)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to load settings')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  async function save() {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await api('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({ settings: s }),
      })
      setSuccess('Settings saved.')
    } catch (e: any) {
      setError(e?.message || 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/10 p-6 text-sm text-white/60">
        Loading settings…
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Settings</p>
          <h1 className="mt-2 font-[var(--font-cormorant,serif)] text-3xl font-light text-white/95 md:text-4xl">
            Privacy & Notifications
          </h1>
          <p className="mt-2 text-sm text-white/65">
            Kujuana is private by design. These controls let you decide how much is revealed — and when.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className={cx(
              'rounded-xl border px-4 py-2 text-sm transition',
              'border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.10)] text-[var(--gold-champagne)] hover:bg-[rgba(212,175,55,0.14)]',
              saving && 'opacity-70'
            )}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={signOut}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      </div>

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

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-black/10 p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Privacy</p>

          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3">
              <div>
                <p className="text-sm text-white/80">Blur photos until accepted</p>
                <p className="text-xs text-white/50">Photos stay protected until introduction is accepted.</p>
              </div>
              <input
                type="checkbox"
                checked={s.blurPhotosUntilAccepted}
                onChange={(e) => setS((p) => ({ ...p, blurPhotosUntilAccepted: e.target.checked }))}
                className="h-4 w-4 accent-[rgba(212,175,55,0.90)]"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3">
              <div>
                <p className="text-sm text-white/80">Show online status</p>
                <p className="text-xs text-white/50">Let matches see when you are active.</p>
              </div>
              <input
                type="checkbox"
                checked={s.showOnlineStatus}
                onChange={(e) => setS((p) => ({ ...p, showOnlineStatus: e.target.checked }))}
                className="h-4 w-4 accent-[rgba(212,175,55,0.90)]"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/10 p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Notifications</p>

          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3">
              <div>
                <p className="text-sm text-white/80">Email notifications</p>
                <p className="text-xs text-white/50">New matches and important account updates.</p>
              </div>
              <input
                type="checkbox"
                checked={s.emailNotifications}
                onChange={(e) => setS((p) => ({ ...p, emailNotifications: e.target.checked }))}
                className="h-4 w-4 accent-[rgba(212,175,55,0.90)]"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3">
              <div>
                <p className="text-sm text-white/80">Push notifications</p>
                <p className="text-xs text-white/50">Instant alerts on your phone for introductions.</p>
              </div>
              <input
                type="checkbox"
                checked={s.pushNotifications}
                onChange={(e) => setS((p) => ({ ...p, pushNotifications: e.target.checked }))}
                className="h-4 w-4 accent-[rgba(212,175,55,0.90)]"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Account</p>
          <p className="mt-2 text-sm text-white/65">
            If you suspect unusual activity, sign out and sign back in. Your refresh-token rotation will invalidate old sessions automatically.
          </p>
        </section>
      </div>
    </div>
  )
}
