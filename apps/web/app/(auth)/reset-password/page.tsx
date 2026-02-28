// kujuana/apps/web/app/(auth)/reset-password/page.tsx
'use client'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthCard, InputField, FormError } from '../_shared'

function ResetPasswordContent() {
  const router = useRouter()
  const sp = useSearchParams()
  const token = useMemo(() => sp.get('token') || '', [sp])

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!token) errs._form = 'Invalid reset link. Request a new one.'
    if (!form.password || form.password.length < 8)
      errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: form.password }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setErrors({
          _form: data?.error?.message || 'Reset failed. Please try again.',
        })
        return
      }
      setDone(true)
      setTimeout(() => router.push('/login'), 900)
    } catch {
      setErrors({ _form: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Create a new password"
      subtitle="Choose a strong password you will remember."
    >
      <FormError message={errors._form} />

      {done ? (
        <div
          style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.22)',
            padding: '14px 18px',
            fontFamily: 'var(--font-jost)',
            fontSize: '0.86rem',
            color: 'rgba(232,210,124,0.9)',
            lineHeight: 1.6,
          }}
        >
          Password updated successfully. Redirecting to sign in...
        </div>
      ) : (
        <form
          onSubmit={submit}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}
        >
          <InputField
            label="New Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
            error={errors.password}
            required
            autoComplete="new-password"
          />
          <InputField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

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
            }}
          >
            {loading ? 'Saving...' : 'Update password'}
          </button>
        </form>
      )}

      <div style={{ textAlign: 'center', marginTop: '18px' }}>
        <Link
          href="/forgot-password"
          style={{
            fontSize: '0.78rem',
            color: 'var(--gold-primary)',
            textDecoration: 'none',
            fontFamily: 'var(--font-jost)',
            letterSpacing: '0.06em',
            borderBottom: '1px solid rgba(212,175,55,0.2)',
            paddingBottom: '1px',
          }}
        >
          Request a new link
        </Link>
      </div>
    </AuthCard>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  )
}
