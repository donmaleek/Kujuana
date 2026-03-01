import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, Lock, MapPin, MessageSquareWarning, ShieldCheck, UserCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Safety Tips | Kujuana',
  description: 'Comprehensive safety standards for intentional dating on Kujuana',
}

const SAFETY_PILLARS = [
  {
    title: 'Before You Meet',
    description: 'Verify consistency, set boundaries, and avoid oversharing private details too early.',
    icon: UserCheck,
    points: [
      'Keep early conversation on-platform while trust is still being built.',
      'Do not share passwords, OTPs, account details, or send money.',
      'Watch for rushed emotional pressure or inconsistent personal stories.',
    ],
  },
  {
    title: 'During the Date',
    description: 'Protect your environment, your mobility, and your decision-making space.',
    icon: MapPin,
    points: [
      'Use public locations with easy exits and active staff presence.',
      'Share your plans and check-in times with a trusted contact.',
      'Use your own transport and leave immediately if your instincts signal risk.',
    ],
  },
  {
    title: 'Digital Privacy',
    description: 'Control your visibility and reduce opportunities for identity misuse.',
    icon: Lock,
    points: [
      'Share city-level information, not exact home/work addresses.',
      'Review profile visibility and update privacy settings regularly.',
      'Capture evidence and report suspicious behavior quickly.',
    ],
  },
] as const

const RED_FLAGS = [
  'Requests for money, gift cards, investments, or emergency transfers',
  'Pressure to leave Kujuana immediately for private apps or calls',
  'Refusal to respect boundaries, pace, or consent',
  'Contradictory details about identity, location, or relationship intentions',
  'Attempts to isolate you from public venues or trusted contacts',
] as const

const RESPONSE_FLOW = [
  {
    step: 'Pause',
    body: 'Stop responding if something feels unsafe. You are never required to continue.',
  },
  {
    step: 'Document',
    body: 'Capture screenshots, usernames, timestamps, and any relevant context.',
  },
  {
    step: 'Report',
    body: 'Contact support with “Safety” in subject line for priority triage.',
  },
  {
    step: 'Protect',
    body: 'Block the member, update your privacy settings, and inform a trusted contact.',
  },
] as const

export default function SafetyPage() {
  return (
    <main style={{ padding: '112px 20px 84px' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'grid', gap: '22px' }}>
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '28px',
            border: '1px solid rgba(212,175,55,0.22)',
            background:
              'radial-gradient(120% 160% at 0% 0%, rgba(212,175,55,0.14) 0%, rgba(74,22,99,0.70) 44%, rgba(13,10,20,0.94) 100%)',
            padding: '30px clamp(20px, 4vw, 38px)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '230px',
              height: '230px',
              borderRadius: '999px',
              right: '-60px',
              top: '-75px',
              background: 'radial-gradient(circle, rgba(212,175,55,0.22), transparent 72%)',
            }}
          />

          <div style={{ position: 'relative', display: 'grid', gap: '15px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--gold-champagne)" />
              <span
                style={{
                  fontSize: '0.74rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,230,179,0.90)',
                }}
              >
                Kujuana Safety Standard
              </span>
            </div>

            <h1
              style={{
                margin: 0,
                color: 'var(--off-white)',
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
                lineHeight: 1.02,
              }}
            >
              Comprehensive Safety Tips for intentional dating
            </h1>

            <p
              style={{
                margin: 0,
                color: 'rgba(237,224,196,0.84)',
                lineHeight: 1.75,
                maxWidth: '780px',
                fontSize: '1.02rem',
              }}
            >
              Safety is not a single action, it is a system. Use these practical safeguards before, during, and after
              introductions to protect your time, boundaries, and peace of mind.
            </p>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {SAFETY_PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <article
                key={pillar.title}
                style={{
                  border: '1px solid rgba(212,175,55,0.16)',
                  borderRadius: '20px',
                  background: 'linear-gradient(165deg, rgba(32,10,43,0.82), rgba(14,10,22,0.88))',
                  padding: '16px',
                  display: 'grid',
                  gap: '9px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '999px',
                    border: '1px solid rgba(212,175,55,0.28)',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(212,175,55,0.12)',
                  }}
                >
                  <Icon size={17} color="var(--gold-champagne)" />
                </div>
                <h2
                  style={{
                    margin: 0,
                    color: 'var(--off-white)',
                    fontFamily: 'var(--font-cormorant, serif)',
                    fontSize: '1.5rem',
                    lineHeight: 1.05,
                  }}
                >
                  {pillar.title}
                </h2>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>{pillar.description}</p>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '6px', color: 'rgba(237,224,196,0.88)' }}>
                  {pillar.points.map((point) => (
                    <li key={point} style={{ lineHeight: 1.55, fontSize: '0.9rem' }}>
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          <div
            style={{
              border: '1px solid rgba(212,175,55,0.18)',
              borderRadius: '22px',
              background: 'rgba(14,10,22,0.76)',
              padding: '20px',
            }}
          >
            <h3
              style={{
                margin: 0,
                color: 'var(--off-white)',
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: '2rem',
              }}
            >
              High-risk red flags
            </h3>
            <p style={{ marginTop: '8px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Escalate immediately if you observe these patterns.
            </p>
            <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
              {RED_FLAGS.map((flag) => (
                <div
                  key={flag}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '18px 1fr',
                    gap: '8px',
                    alignItems: 'start',
                    border: '1px solid rgba(240,130,130,0.22)',
                    borderRadius: '12px',
                    background: 'rgba(240,130,130,0.06)',
                    padding: '10px',
                  }}
                >
                  <AlertTriangle size={14} color="rgba(240,130,130,0.95)" />
                  <p style={{ margin: 0, color: 'rgba(255,223,223,0.92)', lineHeight: 1.55, fontSize: '0.9rem' }}>{flag}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              border: '1px solid rgba(212,175,55,0.18)',
              borderRadius: '22px',
              background: 'rgba(14,10,22,0.76)',
              padding: '20px',
            }}
          >
            <h3
              style={{
                margin: 0,
                color: 'var(--off-white)',
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: '2rem',
              }}
            >
              If something feels wrong
            </h3>
            <p style={{ marginTop: '8px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Use this response flow to protect yourself quickly.
            </p>

            <div style={{ marginTop: '13px', display: 'grid', gap: '9px' }}>
              {RESPONSE_FLOW.map((item, index) => (
                <div
                  key={item.step}
                  style={{
                    border: '1px solid rgba(212,175,55,0.14)',
                    borderRadius: '12px',
                    padding: '10px 11px',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: 'var(--gold-champagne)',
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Step {index + 1}: {item.step}
                  </p>
                  <p style={{ margin: '5px 0 0', color: 'rgba(237,224,196,0.86)', lineHeight: 1.6, fontSize: '0.9rem' }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            border: '1px solid rgba(212,175,55,0.18)',
            borderRadius: '22px',
            background: 'rgba(14,10,22,0.76)',
            padding: '20px',
            display: 'grid',
            gap: '12px',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquareWarning size={16} color="var(--gold-champagne)" />
            <span style={{ color: 'var(--gold-champagne)', fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Priority Support
            </span>
          </div>

          <h3
            style={{
              margin: 0,
              color: 'var(--off-white)',
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: '2rem',
            }}
          >
            Report incidents quickly and clearly
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Include your email, username, incident date/time, and screenshots. For urgent matters, use “Safety” in your
            message subject for accelerated handling.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href="/contact"
              className="btn btn-gold"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
            >
              Contact Support
              <ArrowRight size={14} />
            </Link>
            <Link href="/help" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              Help Centre
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
