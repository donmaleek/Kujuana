// kujuana/apps/web/app/(onboarding)/step/3-background/page.tsx
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

export default function Step3BackgroundPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    faith: '',
    education: '',
    work: '',
    kids: '',
    lifestyle: '',
  })
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    const s = readStore()
    setForm((p) => ({ ...p, ...(s?.background || {}) }))
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const next = () => {
    setError(undefined)
    if (!form.faith.trim()) return setError('Faith is required')
    if (!form.work.trim()) return setError('Work is required')
    writeStore({ background: form })
    router.push('/step/4-photos')
  }

  const back = () => router.push('/step/2-basic-details')

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(24, 2, 31, 0.55)',
    border: '1px solid rgba(212,175,55,0.15)',
    padding: '14px 16px',
    color: 'var(--text-body)',
    fontFamily: 'var(--font-jost)',
    outline: 'none',
    borderRadius: 0,
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
          Onboarding, Step 3 of 7
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
          Background
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
          This helps us match you with someone aligned in values and lifestyle.
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
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '14px',
        }}
        className="grid2"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Faith</label>
          <input
            name="faith"
            value={form.faith}
            onChange={onChange}
            placeholder="e.g. Christian"
            style={fieldStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Education (optional)</label>
          <input
            name="education"
            value={form.education}
            onChange={onChange}
            placeholder="e.g. Degree, Diploma"
            style={fieldStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Work</label>
          <input
            name="work"
            value={form.work}
            onChange={onChange}
            placeholder="e.g. Entrepreneur"
            style={fieldStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Kids (optional)</label>
          <input
            name="kids"
            value={form.kids}
            onChange={onChange}
            placeholder="e.g. None, 1, Open to kids"
            style={fieldStyle}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            gridColumn: '1 / -1',
          }}
        >
          <label style={labelStyle}>Lifestyle (optional)</label>
          <input
            name="lifestyle"
            value={form.lifestyle}
            onChange={onChange}
            placeholder="e.g. Gym, Travel, Quiet life"
            style={fieldStyle}
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

      <style>{`
        @media (max-width: 980px) {
          .grid2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}