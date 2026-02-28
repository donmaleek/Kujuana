// kujuana/apps/web/app/(auth)/verify-email/page.tsx
'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthCard, FormError } from '../_shared'

function toAppRelativeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.pathname}${parsed.search}`
  } catch {
    if (url.startsWith('/')) return url
    return ''
  }
}

function readApiErrorMessage(payload: any, fallback: string): string {
  if (typeof payload?.error === 'string') return payload.error
  if (typeof payload?.error?.message === 'string') return payload.error.message
  return fallback
}

function VerifyEmailContent() {
  const router = useRouter()
  const sp = useSearchParams()
  const email = useMemo(() => sp.get('email') || '', [sp])
  const token = useMemo(() => sp.get('token') || '', [sp])
  const reason = useMemo(() => sp.get('reason') || '', [sp])

  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      setLoading(true)
      setMessage(undefined)
      try {
        const res = await fetch('/api/v1/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email }),
        })
        const data = await res.json().catch(() => null)
        if (!res.ok) {
          setOk(false)
          setMessage(readApiErrorMessage(data, 'Verification failed. Try again.'))
          return
        }
        setOk(true)
        setMessage('Email verified successfully.')
        setTimeout(() => router.push('/login'), 900)
      } catch {
        setOk(false)
        setMessage('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    })()
  }, [token, router])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const resend = async () => {
    if (!email || cooldown > 0) return
    setLoading(true)
    setMessage(undefined)
    try {
      const res = await fetch('/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setMessage(readApiErrorMessage(data, 'Could not resend email. Please try again.'))
        return
      }

      const previewUrl = typeof data?.verification?.previewUrl === 'string'
        ? toAppRelativeUrl(data.verification.previewUrl)
        : ''
      if (previewUrl) {
        setMessage('Email provider is unavailable locally. Using development preview link...')
        router.push(previewUrl)
        return
      }

      setMessage('Verification email sent. Check your inbox.')
      setCooldown(30)
    } catch {
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle={
        email
          ? `We sent a verification link to ${email}.`
          : 'Enter from the link we sent to your inbox.'
      }
    >
      <FormError
        message={
          message && !ok
            ? message
            : !token && reason === 'unverified'
            ? 'Please verify your email before signing in. We can resend a verification link below.'
            : undefined
        }
      />

      {ok ? (
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
          {message}
          <div style={{ marginTop: '10px' }}>
            Redirecting you to sign in...
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              fontFamily: 'var(--font-jost)',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              lineHeight: 1.7,
            }}
          >
            If you did not receive the email, you can resend it.
          </div>

          <button
            type="button"
            onClick={resend}
            disabled={loading || !email || cooldown > 0}
            className="btn btn-gold"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '0.8rem',
              marginTop: '18px',
              opacity: loading || !email || cooldown > 0 ? 0.7 : 1,
              cursor:
                loading || !email || cooldown > 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
          </button>

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
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AuthCard>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  )
}
