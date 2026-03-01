// kujuana/apps/web/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { InputField, FormError, AuthCard } from '../_shared'

function readApiErrorMessage(payload: any, fallback: string): string {
  if (typeof payload?.error === 'string') return payload.error
  if (typeof payload?.error?.message === 'string') return payload.error.message

  const details = payload?.details
  if (details && typeof details === 'object') {
    for (const value of Object.values(details)) {
      if (Array.isArray(value) && typeof value[0] === 'string') {
        return value[0]
      }
    }
  }

  return fallback
}

function resolveSafeNextPath(value: string | null): string {
  if (!value) return ''
  if (!value.startsWith('/')) return ''
  if (value.startsWith('//')) return ''
  if (value.startsWith('/api')) return ''
  return value
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Please enter a valid email address'
    if (!form.password) errs.password = 'Password is required'
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const normalizedEmail = form.email.trim().toLowerCase()
      const requestedNextPath = resolveSafeNextPath(searchParams.get('next'))

      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: normalizedEmail, password: form.password }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        if (data?.code === 'EMAIL_NOT_VERIFIED' || /email not verified/i.test(String(data?.error || ''))) {
          router.push(`/verify-email?email=${encodeURIComponent(normalizedEmail)}&reason=unverified`)
          return
        }
        setErrors({
          _form: readApiErrorMessage(data, 'Invalid credentials. Please try again.'),
        })
        return
      }

      const role = String(data?.user?.role || '').toLowerCase()
      const defaultDestination =
        role === 'admin' || role === 'manager' || role === 'matchmaker'
          ? '/admin/dashboard'
          : '/profile'
      const destination = requestedNextPath || defaultDestination
      router.push(destination)
    } catch {
      setErrors({ _form: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Sign in to your account" subtitle="Welcome back to Kujuana.">
      <FormError message={errors._form} />

      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}
      >
        <InputField
          label="Email Address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={errors.email}
          required
          autoComplete="email"
        />

        <div>
          <InputField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Your password"
            error={errors.password}
            required
            autoComplete="current-password"
          />
          <div style={{ textAlign: 'right', marginTop: '8px' }}>
            <Link
              href="/forgot-password"
              style={{
                fontSize: '0.76rem',
                color: 'var(--gold-primary)',
                textDecoration: 'none',
                fontFamily: 'var(--font-jost)',
                letterSpacing: '0.06em',
                borderBottom: '1px solid rgba(212,175,55,0.2)',
                paddingBottom: '1px',
              }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-gold"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '0.8rem',
            marginTop: '8px',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          {loading ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{ animation: 'spin 1s linear infinite' }}
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeOpacity="0.3"
                />
                <path
                  d="M12 2a10 10 0 0110 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          margin: '28px 0',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '1px',
            background: 'rgba(212,175,55,0.1)',
          }}
        />
        <span
          style={{
            fontSize: '0.72rem',
            color: 'rgba(196,168,130,0.4)',
            fontFamily: 'var(--font-jost)',
            letterSpacing: '0.12em',
          }}
        >
          new here?
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            background: 'rgba(212,175,55,0.1)',
          }}
        />
      </div>

      <Link
        href="/register"
        className="btn btn-outline"
        style={{ width: '100%', textAlign: 'center', display: 'block' }}
      >
        Create an Account
      </Link>
    </AuthCard>
  )
}
