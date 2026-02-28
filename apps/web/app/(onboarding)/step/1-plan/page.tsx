// kujuana/apps/web/app/(onboarding)/step/1-plan/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Plan = 'standard' | 'priority' | 'vip'

const STORAGE_KEY = 'kujuana_onboarding_v1'

function readStore(): any {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeStore(patch: any) {
  const current = readStore()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }))
}

export default function Step1PlanPage() {
  const router = useRouter()
  const [plan, setPlan] = useState<Plan>('standard')

  useEffect(() => {
    const s = readStore()
    if (s?.plan) setPlan(s.plan)
  }, [])

  const cards = useMemo(
    () => [
      {
        id: 'standard' as const,
        title: 'Standard',
        price: 'Free',
        points: ['Apply and get matched', 'Best for patient, intentional people'],
      },
      {
        id: 'priority' as const,
        title: 'Priority',
        price: 'Pay per match',
        points: ['Fast matching', 'Instant profile delivery'],
      },
      {
        id: 'vip' as const,
        title: 'VIP',
        price: 'Monthly curated',
        points: ['Human matchmakers', 'Premium filters and privacy'],
      },
    ],
    []
  )

  const next = () => {
    writeStore({ plan })
    router.push('/step/2-basic-details')
  }

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
          Onboarding, Step 1 of 7
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
            fontWeight: 400,
            color: 'var(--off-white)',
            marginTop: '10px',
            lineHeight: 1.2,
          }}
        >
          Choose your plan
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-jost)',
            color: 'var(--text-muted)',
            marginTop: '10px',
            lineHeight: 1.7,
            maxWidth: '680px',
          }}
        >
          Pick the experience that matches your speed and level of support.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '14px',
          marginTop: '18px',
        }}
        className="plan-grid"
      >
        {cards.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setPlan(c.id)}
            style={{
              textAlign: 'left',
              background: 'rgba(24, 2, 31, 0.55)',
              border:
                plan === c.id
                  ? '1px solid rgba(212,175,55,0.55)'
                  : '1px solid rgba(212,175,55,0.15)',
              padding: '18px',
              cursor: 'pointer',
              boxShadow:
                plan === c.id
                  ? '0 0 0 3px rgba(212,175,55,0.08)'
                  : 'none',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: '1.4rem',
                color: 'var(--off-white)',
                marginBottom: '6px',
              }}
            >
              {c.title}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-jost)',
                fontSize: '0.8rem',
                color: 'rgba(232,210,124,0.85)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              {c.price}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {c.points.map((p) => (
                <div
                  key={p}
                  style={{
                    fontFamily: 'var(--font-jost)',
                    fontSize: '0.86rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                  }}
                >
                  • {p}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '22px',
        }}
      >
        <button
          type="button"
          onClick={next}
          className="btn btn-gold"
          style={{
            padding: '14px 18px',
            fontSize: '0.78rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Continue
        </button>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .plan-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}