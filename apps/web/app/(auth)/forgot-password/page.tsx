// kujuana/apps/web/app/(auth)/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthCard, InputField, FormError } from '../_shared'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(undefined)
    setMessage(undefined)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error?.message || 'Request failed. Please try again.')
        return
      }
      setMessage('Reset link sent. Check your inbox.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we will send a secure reset link."
    >
      <FormError message={error} />

      {message && (
        <div
          style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.22)',
            padding: '14px 18px',
            marginBottom: '18px',
            fontFamily: 'var(--font-jost)',
            fontSize: '0.86rem',
            color: 'rgba(232,210,124,0.9)',
            lineHeight: 1.6,
          }}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={submit}
        noValidate
        style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}
      >
        <InputField
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '18px' }}>
        <Link
          href="/login"
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
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  )
}