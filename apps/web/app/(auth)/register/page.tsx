// kujuana/apps/web/app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { InputField, FormError, StyledCheckbox } from '../_shared'

const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/

function normalizePhoneForRegistration(raw: string): string {
  const compact = raw.replace(/[\s()-]/g, '')

  if (compact.startsWith('+')) return compact
  if (compact.startsWith('00')) return `+${compact.slice(2)}`

  // Kenya-first normalization for common local formats.
  if (/^0\d{9}$/.test(compact)) return `+254${compact.slice(1)}`
  if (/^254\d{9}$/.test(compact)) return `+${compact}`
  if (/^7\d{8}$/.test(compact)) return `+254${compact}`

  return compact
}

function readApiErrorMessage(payload: any): string {
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

  return 'Registration failed. Please review your details and try again.'
}

function toAppRelativeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.pathname}${parsed.search}`
  } catch {
    if (url.startsWith('/')) return url
    return ''
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleAgreementChange = (nextValue: boolean) => {
    setAgreed(nextValue)
    if (errors.agreed) {
      setErrors((prev) => ({ ...prev, agreed: '' }))
    }
  }

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {}
    const nameParts = form.fullName.trim().split(/\s+/)
    const normalizedPhone = normalizePhoneForRegistration(form.phone)

    if (!form.fullName.trim() || nameParts.length < 2)
      errs.fullName = 'Please enter your full name (first and last)'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Please enter a valid email address'
    if (!form.phone) {
      errs.phone = 'Phone number is required'
    } else if (!E164_PHONE_REGEX.test(normalizedPhone)) {
      errs.phone = 'Use a valid number like +254712345678 (local formats are accepted too).'
    }

    if (!form.password || form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
    } else if (!/[A-Z]/.test(form.password)) {
      errs.password = 'Password must include at least one uppercase letter'
    } else if (!/[0-9]/.test(form.password)) {
      errs.password = 'Password must include at least one number'
    }

    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match'
    if (!agreed) errs.agreed = 'You must agree to the Terms of Service'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const normalizedPhone = normalizePhoneForRegistration(form.phone)
      const normalizedEmail = form.email.trim().toLowerCase()

      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: normalizedEmail,
          phone: normalizedPhone,
          password: form.password,
          agreedToTerms: true,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setErrors({
          _form: readApiErrorMessage(data),
        })
        return
      }

      const previewUrl = typeof data?.verification?.previewUrl === 'string'
        ? toAppRelativeUrl(data.verification.previewUrl)
        : ''
      if (previewUrl) {
        router.push(previewUrl)
        return
      }

      router.push(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`)
    } catch {
      setErrors({ _form: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'var(--purple-deepest)',
      }}
      className="register-grid"
    >
      {/* Left Brand Panel */}
      <div
        style={{
          background: 'var(--grad-hero)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(40px, 6vw, 80px)',
        }}
        className="auth-brand-panel"
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              rgba(212,175,55,0.025) 0px,
              rgba(212,175,55,0.025) 1px,
              transparent 1px,
              transparent 72px
            )`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 65%)',
            bottom: '-100px',
            right: '-100px',
            animation: 'float 10s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        <Link
          href="/"
          style={{
            textDecoration: 'none',
            position: 'relative',
            zIndex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Image
            src="/brand/logo.png"
            alt="Kujuana logo"
            width={44}
            height={44}
            priority
            style={{ width: '44px', height: '44px', objectFit: 'contain' }}
          />
          <div
            style={{
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: '1.8rem',
              fontWeight: 500,
              letterSpacing: '0.14em',
              background: 'var(--grad-gold)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textTransform: 'uppercase',
            }}
          >
            Kujuana
          </div>
        </Link>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: '48px',
              height: '1px',
              background: 'var(--grad-gold)',
              marginBottom: '28px',
            }}
          />
          <h2
            style={{
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
              fontWeight: 300,
              lineHeight: 1.15,
              color: 'var(--off-white)',
              marginBottom: '20px',
            }}
          >
            Your story begins
            <br />
            <em style={{ color: 'var(--gold-champagne)' }}>here.</em>
          </h2>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              lineHeight: 1.8,
              maxWidth: '340px',
              fontFamily: 'var(--font-jost)',
            }}
          >
            Join intentional singles who chose curated matchmaking over swipe
            culture. Private, purposeful, premium.
          </p>

          <div
            style={{
              marginTop: '40px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {[
              'All photos stored in a private vault',
              'Compatibility matched across multiple dimensions',
              'Human matchmakers for VIP members',
            ].map((point) => (
              <div
                key={point}
                style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ marginTop: '3px', flexShrink: 0 }}
                  aria-hidden="true"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="#D4AF37"
                    strokeOpacity="0.5"
                  />
                  <path
                    d="M5 8l2 2 4-4"
                    stroke="#D4AF37"
                    strokeOpacity="0.8"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  style={{
                    fontSize: '0.84rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-jost)',
                    lineHeight: 1.5,
                  }}
                >
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            borderTop: '1px solid rgba(212,175,55,0.1)',
            paddingTop: '24px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: '1.05rem',
              fontStyle: 'italic',
              color: 'rgba(196,168,130,0.6)',
              lineHeight: 1.6,
            }}
          >
            "kujuana, to know each other"
          </p>
          <p
            style={{
              fontSize: '0.7rem',
              color: 'rgba(196,168,130,0.35)',
              marginTop: '6px',
              fontFamily: 'var(--font-jost)',
              letterSpacing: '0.08em',
            }}
          >
            Swahili
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div
        style={{
          background:
            'linear-gradient(160deg, #2A0838 0%, var(--purple-deepest) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(40px, 6vw, 80px)',
          overflowY: 'auto',
        }}
      >
        <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
          {/* Back to home — visible on mobile where the brand panel is hidden */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-jost, sans-serif)',
              fontSize: '0.8rem',
              color: 'rgba(196,168,130,0.6)',
              textDecoration: 'none',
              marginBottom: '32px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-champagne)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(196,168,130,0.6)')}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Home
          </Link>

          <div style={{ marginBottom: '40px' }}>
            <span
              style={{
                fontFamily: 'var(--font-jost)',
                fontSize: '0.68rem',
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'var(--gold-champagne)',
              }}
            >
              Create Account
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
                fontWeight: 400,
                color: 'var(--off-white)',
                marginTop: '10px',
                lineHeight: 1.2,
              }}
            >
              Begin your journey
            </h1>
          </div>

          <FormError message={errors._form} />

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}
          >
            <InputField
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="e.g. Amara Wanjiku"
              error={errors.fullName}
              hint="First and last name as it appears on your ID"
              required
              autoComplete="name"
            />
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
            <InputField
              label="Phone Number"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+254 712 345 678"
              error={errors.phone}
              hint="Used for M-Pesa and verification. You can enter +254..., 07..., or 254..."
              required
              autoComplete="tel"
            />
            <InputField
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              error={errors.password}
              hint="At least 8 characters, with at least one uppercase letter and one number."
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

            <StyledCheckbox
              id="terms-agreed"
              checked={agreed}
              onChange={handleAgreementChange}
              error={errors.agreed}
            >
              I agree to Kujuana&apos;s{' '}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--gold-champagne)',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(232,210,124,0.3)',
                }}
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--gold-champagne)',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(232,210,124,0.3)',
                }}
              >
                Privacy Policy
              </Link>
            </StyledCheckbox>

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
                  Creating account...
                </>
              ) : (
                'Create Your Account'
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
              already a member?
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
            href="/login"
            className="btn btn-outline"
            style={{ width: '100%', textAlign: 'center', display: 'block' }}
          >
            Sign In
          </Link>

          <p
            style={{
              textAlign: 'center',
              marginTop: '28px',
              fontSize: '0.74rem',
              color: 'rgba(196,168,130,0.35)',
              fontFamily: 'var(--font-jost)',
              lineHeight: 1.6,
            }}
          >
            Your data is private and confidential. Photos are stored in an
            encrypted private vault. We never sell your data.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(16px); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .register-grid { grid-template-columns: 1fr !important; }
          .auth-brand-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
