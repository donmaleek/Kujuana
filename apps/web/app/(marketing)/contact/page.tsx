import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BriefcaseBusiness, CreditCard, LifeBuoy, ShieldAlert, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us | Kujuana',
  description: 'Reach Kujuana support, safety, billing, and partnerships teams',
}

const CHANNELS = [
  {
    title: 'General Support',
    subtitle: 'Account access, profile updates, and technical troubleshooting.',
    response: 'Response target: within 24 hours',
    email: 'support@kujuana.com',
    icon: LifeBuoy,
    subject: 'Kujuana Support Request',
  },
  {
    title: 'Safety Priority',
    subtitle: 'Urgent incidents, harassment, scams, or policy violations.',
    response: 'Priority triage: fastest available review',
    email: 'support@kujuana.com',
    icon: ShieldAlert,
    subject: 'SAFETY - Priority Review Needed',
  },
  {
    title: 'Billing & Subscription',
    subtitle: 'Tier upgrades, renewals, credits, and payment issues.',
    response: 'Response target: within 24 hours',
    email: 'support@kujuana.com',
    icon: CreditCard,
    subject: 'Billing Support Request',
  },
  {
    title: 'Partnerships & Media',
    subtitle: 'Brand collaborations, media requests, and strategic opportunities.',
    response: 'Response target: within 2 business days',
    email: 'partnerships@kujuana.com',
    icon: BriefcaseBusiness,
    subject: 'Partnership Inquiry',
  },
] as const

const PREP_GUIDE = [
  'Your Kujuana account email',
  'Short issue summary and expected result',
  'Exact error text and timestamp (if available)',
  'Device/browser details and screenshots',
] as const

export default function ContactPage() {
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
              'radial-gradient(125% 160% at 0% 0%, rgba(212,175,55,0.14) 0%, rgba(74,22,99,0.70) 44%, rgba(13,10,20,0.94) 100%)',
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
              <Sparkles size={16} color="var(--gold-champagne)" />
              <span
                style={{
                  fontSize: '0.74rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,230,179,0.90)',
                }}
              >
                Premium Contact Centre
              </span>
            </div>

            <h1
              style={{
                margin: 0,
                color: 'var(--off-white)',
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: 'clamp(2.4rem, 5vw, 4.1rem)',
                lineHeight: 1.02,
              }}
            >
              Contact Us
            </h1>

            <p
              style={{
                margin: 0,
                color: 'rgba(237,224,196,0.84)',
                lineHeight: 1.75,
                maxWidth: '760px',
                fontSize: '1.02rem',
              }}
            >
              Reach the right Kujuana team quickly. We route support, safety, billing, and partnership inquiries with
              clear response targets and priority handling for urgent cases.
            </p>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
          {CHANNELS.map((channel) => {
            const Icon = channel.icon
            const mailto = `mailto:${channel.email}?subject=${encodeURIComponent(channel.subject)}`
            return (
              <article
                key={channel.title}
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
                    fontSize: '1.52rem',
                    lineHeight: 1.05,
                  }}
                >
                  {channel.title}
                </h2>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.62 }}>{channel.subtitle}</p>
                <p style={{ margin: 0, color: 'var(--gold-champagne)', fontSize: '0.82rem', letterSpacing: '0.03em' }}>{channel.response}</p>
                <a
                  href={mailto}
                  style={{
                    marginTop: '2px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--gold-champagne)',
                    fontSize: '0.86rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {channel.email}
                  <ArrowRight size={14} />
                </a>
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
              Before you send your message
            </h3>
            <p style={{ marginTop: '8px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              A complete support request helps us resolve your issue faster.
            </p>

            <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
              {PREP_GUIDE.map((line) => (
                <div
                  key={line}
                  style={{
                    border: '1px solid rgba(212,175,55,0.14)',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '10px 11px',
                    color: 'rgba(237,224,196,0.88)',
                    lineHeight: 1.55,
                    fontSize: '0.9rem',
                  }}
                >
                  {line}
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
              display: 'grid',
              gap: '12px',
              alignContent: 'space-between',
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  color: 'var(--off-white)',
                  fontFamily: 'var(--font-cormorant, serif)',
                  fontSize: '2rem',
                }}
              >
                Need immediate direction?
              </h3>
              <p style={{ marginTop: '8px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Start in Help Centre for guided answers, then escalate to support with context and screenshots if needed.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                href="/help"
                className="btn btn-gold"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
              >
                Open Help Centre
                <ArrowRight size={14} />
              </Link>
              <Link href="/safety" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                Safety Tips
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
