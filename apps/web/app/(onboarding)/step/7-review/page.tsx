// kujuana/apps/web/app/(onboarding)/step/7-review/page.tsx
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

const STORAGE_KEY = 'kujuana_onboarding_v1'
const TIER_RANK = { standard: 1, priority: 2, vip: 3 } as const

type PlanTier = keyof typeof TIER_RANK
type PaymentMethod = 'mpesa' | 'pesapal' | 'flutterwave'
type PaymentState = 'idle' | 'pending' | 'completed' | 'failed' | 'cancelled'

function readStore(): any {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
function clearStore() {
  localStorage.removeItem(STORAGE_KEY)
}

function normalizePlanTier(value: unknown): PlanTier {
  const tier = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (tier === 'priority' || tier === 'vip') return tier
  return 'standard'
}

function tierSatisfiesRequirement(currentTier: PlanTier, requiredTier: PlanTier): boolean {
  return TIER_RANK[currentTier] >= TIER_RANK[requiredTier]
}

function readErrorMessage(payload: any, fallback: string): string {
  if (typeof payload?.error === 'string') return payload.error
  if (typeof payload?.error?.message === 'string') return payload.error.message
  if (typeof payload?.message === 'string') return payload.message
  return fallback
}

export default function Step7ReviewPage() {
  const router = useRouter()
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [paymentBusy, setPaymentBusy] = useState(false)
  const [paymentError, setPaymentError] = useState<string | undefined>(undefined)
  const [checkingPayment, setCheckingPayment] = useState(true)
  const [hasPaidAccess, setHasPaidAccess] = useState(false)
  const [paymentReference, setPaymentReference] = useState<string | null>(null)
  const [paymentState, setPaymentState] = useState<PaymentState>('idle')

  const selectedPlan = useMemo<PlanTier>(() => normalizePlanTier(data?.plan), [data?.plan])
  const paymentRequired = selectedPlan !== 'standard'
  const planLabel = selectedPlan === 'vip' ? 'VIP' : selectedPlan === 'priority' ? 'Priority' : 'Standard'

  const refreshPaymentEligibility = useCallback(async (): Promise<boolean> => {
    if (!paymentRequired) {
      setHasPaidAccess(true)
      setPaymentState('completed')
      setPaymentError(undefined)
      setCheckingPayment(false)
      return true
    }

    setCheckingPayment(true)
    try {
      const res = await fetch('/api/v1/subscriptions/me', {
        method: 'GET',
        credentials: 'include',
      })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        setHasPaidAccess(false)
        return false
      }

      const paidTier = normalizePlanTier(json?.tier)
      const isPaid = Boolean(json?.isPaid) && tierSatisfiesRequirement(paidTier, selectedPlan)
      setHasPaidAccess(isPaid)
      if (isPaid) {
        setPaymentState('completed')
        setPaymentError(undefined)
      }
      return isPaid
    } catch {
      setHasPaidAccess(false)
      return false
    } finally {
      setCheckingPayment(false)
    }
  }, [paymentRequired, selectedPlan])

  useEffect(() => {
    setData(readStore())
  }, [])

  useEffect(() => {
    void refreshPaymentEligibility()
  }, [refreshPaymentEligibility])

  useEffect(() => {
    if (!paymentRequired || !paymentReference || hasPaidAccess) return
    let isStopped = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/v1/payments/${encodeURIComponent(paymentReference)}/status`, {
          method: 'GET',
          credentials: 'include',
        })
        const json = await res.json().catch(() => null)
        if (isStopped) return
        if (res.ok) {
          const status = typeof json?.status === 'string' ? json.status : 'pending'
          if (status === 'completed') {
            setPaymentState('completed')
            const isPaid = await refreshPaymentEligibility()
            if (isPaid || isStopped) return
          } else if (status === 'failed' || status === 'cancelled') {
            setPaymentState(status)
            return
          } else {
            setPaymentState('pending')
          }
        }
      } catch {
        // Keep polling on transient failures.
      }

      if (isStopped) return
      timer = setTimeout(() => {
        void pollStatus()
      }, 3000)
    }

    void pollStatus()
    return () => {
      isStopped = true
      if (timer) clearTimeout(timer)
    }
  }, [paymentReference, hasPaidAccess, paymentRequired, refreshPaymentEligibility])

  const back = () => router.push('/step/6-preferences')

  const startPayment = async (method: PaymentMethod) => {
    setPaymentError(undefined)
    setPaymentBusy(true)
    try {
      const res = await fetch('/api/v1/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          method,
          tier: selectedPlan,
          purpose: 'subscription_new',
          returnUrl: window.location.href,
        }),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setPaymentError(readErrorMessage(json, 'Unable to initiate payment.'))
        return
      }

      const redirectUrl = typeof json?.redirectUrl === 'string' ? json.redirectUrl : undefined
      if (redirectUrl) {
        window.location.href = redirectUrl
        return
      }

      const reference =
        typeof json?.reference === 'string'
          ? json.reference
          : typeof json?.paymentReference === 'string'
            ? json.paymentReference
            : undefined

      if (!reference) {
        setPaymentError('Payment was started but no reference was returned. Please retry.')
        return
      }

      setPaymentReference(reference)
      setPaymentState('pending')
    } catch {
      setPaymentError('Payment request failed. Please try again.')
    } finally {
      setPaymentBusy(false)
    }
  }

  const submit = async () => {
    if (paymentRequired && !hasPaidAccess) {
      setError('Complete payment before submitting your profile.')
      return
    }

    setError(undefined)
    setLoading(true)
    try {
      const res = await fetch('/api/v1/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setError(readErrorMessage(json, 'Submission failed. Please try again.'))
        return
      }
      clearStore()
      router.push('/profile')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const row = (label: string, value?: any) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '12px 0',
        borderBottom: '1px solid rgba(212,175,55,0.08)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-jost)',
          fontSize: '0.72rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(196,168,130,0.55)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-jost)',
          fontSize: '0.9rem',
          color: 'var(--text-body)',
          lineHeight: 1.6,
          textAlign: 'right',
          maxWidth: '720px',
        }}
      >
        {value || <span style={{ color: 'rgba(196,168,130,0.45)' }}>Not set</span>}
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <div
          style={{
            fontFamily: 'var(--font-jost)',
            fontSize: '0.68rem',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--gold-champagne)',
          }}
        >
          Onboarding, Step 7 of 7
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
            fontWeight: 400,
            color: 'var(--off-white)',
            marginTop: '10px',
          }}
        >
          Review
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-jost)',
            color: 'var(--text-muted)',
            marginTop: '10px',
            lineHeight: 1.7,
            maxWidth: '720px',
          }}
        >
          {paymentRequired
            ? 'Confirm everything looks right. Payment must be completed before profile submission.'
            : 'Confirm everything looks right, then submit your free Standard profile.'}
        </p>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(232,128,128,0.08)',
            border: '1px solid rgba(232,128,128,0.25)',
            padding: '14px 18px',
            marginBottom: '18px',
            fontFamily: 'var(--font-jost)',
            fontSize: '0.84rem',
            color: '#e88080',
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: 'rgba(24, 2, 31, 0.55)',
          border: '1px solid rgba(212,175,55,0.15)',
          padding: '16px 18px',
        }}
      >
        {row('Plan', data?.plan)}
        {row('Full name', data?.basicDetails?.fullName)}
        {row('Age', data?.basicDetails?.age)}
        {row('Gender', data?.basicDetails?.gender)}
        {row('Location', data?.basicDetails?.location)}
        {row('Phone', data?.basicDetails?.phone)}
        {row('Faith', data?.background?.faith)}
        {row('Work', data?.background?.work)}
        {row('Lifestyle', data?.background?.lifestyle)}
        {row('Vision', data?.vision?.intention)}
        {row('Values', data?.vision?.values)}
        {row('Non negotiables', data?.vision?.nonNegotiables)}
        {row(
          'Preferences',
          data?.preferences
            ? `Age ${data.preferences.ageMin}-${data.preferences.ageMax}, ${data.preferences.preferredLocation || 'Any location'}`
            : undefined
        )}
        {row('Deal breakers', data?.preferences?.dealBreakers)}
        {row(
          'Photos',
          Array.isArray(data?.photos) ? `${data.photos.length} uploaded` : undefined
        )}
      </div>

      {paymentRequired && (
        <div
          style={{
            marginTop: '16px',
            background: 'rgba(24, 2, 31, 0.55)',
            border: '1px solid rgba(212,175,55,0.15)',
            padding: '16px 18px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-jost)',
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(196,168,130,0.55)',
              marginBottom: '10px',
            }}
          >
            Payment Requirement
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-jost)',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
          >
            Selected plan: {planLabel}. You must complete payment before submitting this profile.
          </p>

          {checkingPayment ? (
            <p
              style={{
                marginTop: '12px',
                fontFamily: 'var(--font-jost)',
                color: 'rgba(232,210,124,0.9)',
                fontSize: '0.88rem',
              }}
            >
              Checking payment status...
            </p>
          ) : hasPaidAccess ? (
            <p
              style={{
                marginTop: '12px',
                fontFamily: 'var(--font-jost)',
                color: '#8fe3a3',
                fontSize: '0.88rem',
              }}
            >
              Payment confirmed. You can submit now.
            </p>
          ) : (
            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => startPayment('mpesa')}
                  disabled={paymentBusy}
                  className="btn btn-gold"
                  style={{
                    padding: '12px 14px',
                    fontSize: '0.72rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    opacity: paymentBusy ? 0.7 : 1,
                    cursor: paymentBusy ? 'not-allowed' : 'pointer',
                  }}
                >
                  {paymentBusy ? 'Starting...' : 'Pay with M-Pesa'}
                </button>
                <button
                  type="button"
                  onClick={() => startPayment('pesapal')}
                  disabled={paymentBusy}
                  className="btn btn-outline"
                  style={{
                    padding: '12px 14px',
                    fontSize: '0.72rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    opacity: paymentBusy ? 0.7 : 1,
                    cursor: paymentBusy ? 'not-allowed' : 'pointer',
                  }}
                >
                  Pay by card
                </button>
                <button
                  type="button"
                  onClick={() => startPayment('flutterwave')}
                  disabled={paymentBusy}
                  className="btn btn-outline"
                  style={{
                    padding: '12px 14px',
                    fontSize: '0.72rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    opacity: paymentBusy ? 0.7 : 1,
                    cursor: paymentBusy ? 'not-allowed' : 'pointer',
                  }}
                >
                  Pay global
                </button>
              </div>

              {paymentReference && (
                <p
                  style={{
                    marginTop: '12px',
                    fontFamily: 'var(--font-jost)',
                    color: 'var(--text-body)',
                    fontSize: '0.86rem',
                  }}
                >
                  Payment reference: {paymentReference} ({paymentState})
                </p>
              )}
            </div>
          )}

          {paymentError && (
            <div
              style={{
                background: 'rgba(232,128,128,0.08)',
                border: '1px solid rgba(232,128,128,0.25)',
                padding: '10px 12px',
                marginTop: '12px',
                fontFamily: 'var(--font-jost)',
                fontSize: '0.82rem',
                color: '#e88080',
                lineHeight: 1.5,
              }}
            >
              {paymentError}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          marginTop: '22px',
        }}
      >
        <button
          type="button"
          onClick={back}
          className="btn btn-outline"
          style={{
            padding: '14px 18px',
            fontSize: '0.78rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Back
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={loading || (paymentRequired && (checkingPayment || !hasPaidAccess))}
          className="btn btn-gold"
          style={{
            padding: '14px 18px',
            fontSize: '0.78rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            opacity: loading || (paymentRequired && (checkingPayment || !hasPaidAccess)) ? 0.7 : 1,
            cursor:
              loading || (paymentRequired && (checkingPayment || !hasPaidAccess))
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {loading
            ? 'Submitting...'
            : paymentRequired && checkingPayment
              ? 'Checking payment...'
              : paymentRequired && !hasPaidAccess
                ? 'Pay to submit'
                : 'Submit profile'}
        </button>
      </div>
    </div>
  )
}
