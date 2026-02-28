// kujuana/apps/web/app/(onboarding)/step/5-relationship-vision/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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

export default function Step5RelationshipVisionPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    intention: '',
    values: '',
    nonNegotiables: '',
  })
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    const s = readStore()
    setForm((p) => ({ ...p, ...(s?.vision || {}) }))
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const next = () => {
    setError(undefined)
    if (!form.intention.trim()) return setError('Please describe your intention.')
    writeStore({ vision: form })
    router.push('/step/6-preferences')
  }

  const back = () => router.push('/step/4-photos')

  const areaStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(24, 2, 31, 0.55)',
    border: '1px solid rgba(212,175,55,0.15)',
    padding: '14px 16px',
    color: 'var(--text-body)',
    fontFamily: 'var(--font-jost)',
    outline: 'none',
    borderRadius: 0,
    minHeight: '110px',
    resize: 'vertical',
    lineHeight: 1.6,
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-jost)',
    fontSize: '0.7rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'rgba(196,168,130,0.6)',
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
          Onboarding, Step 5 of 7
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
          Relationship vision
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
          This is how we avoid random matching. We match intention with intention.
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>What are you looking for?</label>
          <textarea
            name="intention"
            value={form.intention}
            onChange={onChange}
            placeholder="e.g. Marriage-minded relationship with peace, respect, and purpose"
            style={areaStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Core values (optional)</label>
          <textarea
            name="values"
            value={form.values}
            onChange={onChange}
            placeholder="e.g. Faith, loyalty, growth, kindness"
            style={areaStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Non negotiables (optional)</label>
          <textarea
            name="nonNegotiables"
            value={form.nonNegotiables}
            onChange={onChange}
            placeholder="e.g. No dishonesty, no secret relationships"
            style={areaStyle}
          />
        </div>
      </div>

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
    </div>
  )
}