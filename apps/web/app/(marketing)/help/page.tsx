import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CreditCard, LifeBuoy, Lock, MessageSquare, ShieldCheck, UserCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Help Centre | Kujuana',
  description: 'Premium support for account, profile, safety, and subscription questions',
}

const QUICK_PATHS = [
  {
    title: 'Account & Login',
    description: 'Password reset, verification, and access issues resolved quickly.',
    href: '/contact',
    icon: Lock,
  },
  {
    title: 'Profile Quality',
    description: 'Improve bio, vision, and preference quality for better introductions.',
    href: '/safety',
    icon: UserCircle2,
  },
  {
    title: 'Billing & Plans',
    description: 'Understand tiers, credits, renewals, and upgrade options.',
    href: '/pricing',
    icon: CreditCard,
  },
  {
    title: 'Trust & Safety',
    description: 'Read practical safety guidance before every date.',
    href: '/safety',
    icon: ShieldCheck,
  },
] as const

const FAQS = [
  {
    question: 'Why am I seeing login errors even with correct credentials?',
    answer:
      'Check network/API connectivity first, then confirm your account is verified. If errors persist, contact support with your email and timestamp of the failed attempt.',
  },
  {
    question: 'How do I unlock better matches faster?',
    answer:
      'Complete your profile deeply, especially your bio and relationship vision. Keep preferences current and respond to intros quickly to improve matching momentum.',
  },
  {
    question: 'Where can I manage credits and subscription renewals?',
    answer:
      'Open Subscription from your dashboard or use Pricing to compare tiers. You can review active plan status, credit balance, and renewal timelines there.',
  },
  {
    question: 'How do I report unsafe behavior?',
    answer:
      'Stop communication immediately, preserve screenshots, and contact support through Contact Us with clear details. We review safety cases with high priority.',
  },
] as const

export default function HelpPage() {
  return (
    <main style={{ padding: '112px 20px 84px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'grid', gap: '22px' }}>
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '28px',
            border: '1px solid rgba(212,175,55,0.22)',
            background:
              'radial-gradient(120% 140% at 0% 0%, rgba(212,175,55,0.16) 0%, rgba(74,22,99,0.70) 45%, rgba(16,10,24,0.92) 100%)',
            padding: '30px clamp(20px, 4vw, 36px)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '220px',
              height: '220px',
              borderRadius: '999px',
              right: '-70px',
              top: '-80px',
              background: 'radial-gradient(circle, rgba(212,175,55,0.24), transparent 70%)',
            }}
          />
          <div
            style={{
              position: 'relative',
              display: 'grid',
              gap: '18px',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <LifeBuoy size={16} color="var(--gold-champagne)" />
              <span
                style={{
                  fontSize: '0.74rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,230,179,0.92)',
                  fontFamily: 'var(--font-jost)',
                }}
              >
                Premium Help Centre
              </span>
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: 'clamp(2.3rem, 5vw, 4.1rem)',
                lineHeight: 1.03,
                color: 'var(--off-white)',
              }}
            >
              Fast answers, real support, and safer dating guidance
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: '760px',
                color: 'rgba(237,224,196,0.84)',
                lineHeight: 1.7,
                fontSize: '1.02rem',
              }}
            >
              Get immediate direction for login, profile quality, subscriptions, and safety. If you need direct
              assistance, our support team responds quickly with practical next steps.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              {[
                { label: 'Account', count: '24/7' },
                { label: 'Safety', count: 'Priority' },
                { label: 'Billing', count: 'Guided' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    border: '1px solid rgba(212,175,55,0.22)',
                    borderRadius: '999px',
                    background: 'rgba(16,10,24,0.44)',
                    padding: '8px 13px',
                    color: 'var(--gold-champagne)',
                    fontSize: '0.78rem',
                    letterSpacing: '0.06em',
                  }}
                >
                  {item.label}: {item.count}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {QUICK_PATHS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                style={{
                  textDecoration: 'none',
                  border: '1px solid rgba(212,175,55,0.16)',
                  borderRadius: '20px',
                  background: 'linear-gradient(165deg, rgba(32,10,43,0.82), rgba(17,11,26,0.88))',
                  padding: '16px',
                  display: 'grid',
                  gap: '8px',
                  boxShadow: '0 12px 34px rgba(0,0,0,0.28)',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
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
                  {item.title}
                </h2>
                <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.92rem' }}>{item.description}</p>
                <span
                  style={{
                    marginTop: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--gold-champagne)',
                    fontSize: '0.84rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Open path
                  <ArrowRight size={14} />
                </span>
              </Link>
            )
          })}
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '14px',
          }}
        >
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
              Popular questions
            </h3>
            <div style={{ marginTop: '12px', display: 'grid', gap: '10px' }}>
              {FAQS.map((faq) => (
                <details
                  key={faq.question}
                  style={{
                    border: '1px solid rgba(212,175,55,0.14)',
                    borderRadius: '14px',
                    padding: '12px 13px',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <summary
                    style={{
                      cursor: 'pointer',
                      color: 'var(--off-white)',
                      fontFamily: 'var(--font-jost)',
                      fontWeight: 500,
                      listStyle: 'none',
                    }}
                  >
                    {faq.question}
                  </summary>
                  <p style={{ margin: '9px 0 0', color: 'var(--text-muted)', lineHeight: 1.7 }}>{faq.answer}</p>
                </details>
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
              alignContent: 'space-between',
              gap: '14px',
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
                Talk to support
              </h3>
              <p style={{ marginTop: '8px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Include your email, device/browser, and what you expected versus what happened.
              </p>
              <div style={{ marginTop: '14px', display: 'grid', gap: '8px' }}>
                <a
                  href="mailto:support@kujuana.com"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--gold-champagne)',
                  }}
                >
                  <MessageSquare size={16} />
                  support@kujuana.com
                </a>
                <Link href="/contact" style={{ textDecoration: 'none', color: 'var(--gold-champagne)' }}>
                  Open Contact Us
                </Link>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '9px', flexWrap: 'wrap' }}>
              <Link
                href="/contact"
                className="btn btn-gold"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Contact Support
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/safety"
                className="btn btn-outline"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Safety Tips
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
