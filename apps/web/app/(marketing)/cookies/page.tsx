import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Cookie, LockKeyhole, Settings2, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy | Kujuana',
  description: 'Comprehensive Cookie Policy for Kujuana websites and applications',
}

const LAST_UPDATED = 'March 1, 2026'

type CookieSection = {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

const COOKIE_TYPES = [
  {
    title: 'Strictly Necessary',
    purpose: 'Required for core platform operations, authentication, security, and session integrity.',
    examples: ['Session identifiers', 'Login state', 'Security/fraud flags', 'Load balancing tokens'],
    retention: 'Session to 12 months, depending on function and risk controls.',
  },
  {
    title: 'Functional',
    purpose: 'Remembers preferences and settings to improve usability and continuity.',
    examples: ['Language/display preferences', 'Consent preferences', 'Feature state memory'],
    retention: 'Up to 12 months or until manually cleared.',
  },
  {
    title: 'Analytics and Performance',
    purpose: 'Helps us understand usage, diagnose errors, and improve reliability and experience.',
    examples: ['Page/screen interactions', 'Performance metrics', 'Crash and diagnostics events'],
    retention: 'Varies by provider and configuration, commonly 1 to 24 months.',
  },
] as const

const SECTIONS: CookieSection[] = [
  {
    id: 'what-are-cookies',
    title: '1. What Are Cookies and Similar Technologies?',
    paragraphs: [
      'Cookies are small text files placed on your browser or device when you visit a site. Kujuana may also use local storage, SDK storage, and similar technologies for app/session continuity and service optimization.',
      'These technologies help us recognize your device, maintain secure sessions, and tailor core functionality.',
    ],
  },
  {
    id: 'why-we-use',
    title: '2. Why Kujuana Uses Cookies',
    paragraphs: ['We use cookies and related technologies to:'],
    bullets: [
      'Authenticate members and maintain signed-in sessions securely.',
      'Protect accounts from abuse, suspicious access, and fraud.',
      'Remember preferences and optimize experience across visits.',
      'Measure feature performance and improve platform reliability.',
      'Support legal and compliance requirements, including consent controls.',
    ],
  },
  {
    id: 'third-party',
    title: '3. Third-Party Technologies',
    paragraphs: [
      'Some cookies or identifiers may be set by trusted service providers supporting hosting, security, analytics, support workflows, and payments.',
      'These providers process data under contractual restrictions and are expected to use appropriate safeguards consistent with applicable law.',
    ],
  },
  {
    id: 'managing',
    title: '4. Managing Cookie Preferences',
    paragraphs: [
      'You can manage cookies through browser settings, device controls, and consent banners where available. Blocking or deleting essential cookies may affect sign-in and critical app functionality.',
    ],
    bullets: [
      'Browser controls: block, clear, or restrict cookies by site.',
      'Device settings: manage tracking and app-level storage permissions.',
      'In-product controls: use consent/policy settings where offered.',
    ],
  },
  {
    id: 'signals',
    title: '5. Do Not Track and Similar Signals',
    paragraphs: [
      'Because browser and platform tracking signals are not uniformly implemented, Kujuana may not respond to all “Do Not Track” or equivalent signals in a standardized way.',
      'We continue to evaluate evolving privacy standards and may update this approach as frameworks mature.',
    ],
  },
  {
    id: 'updates',
    title: '6. Updates to This Cookie Policy',
    paragraphs: [
      'We may update this Cookie Policy periodically to reflect legal, technical, and product changes. The “Last updated” date indicates the current version.',
      'For material changes, we may provide additional notice through the Services.',
    ],
  },
  {
    id: 'contact',
    title: '7. Contact Us',
    paragraphs: [
      'For cookie or tracking questions, contact support@kujuana.com with the subject line “Cookie Policy Inquiry”.',
    ],
  },
]

export default function CookiesPage() {
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
              'radial-gradient(125% 155% at 0% 0%, rgba(212,175,55,0.14) 0%, rgba(74,22,99,0.70) 44%, rgba(13,10,20,0.94) 100%)',
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

          <div style={{ position: 'relative', display: 'grid', gap: '14px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Cookie size={16} color="var(--gold-champagne)" />
              <span
                style={{
                  fontSize: '0.74rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,230,179,0.90)',
                }}
              >
                Cookies and Tracking Technologies
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
              Cookie Policy
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
              This policy explains the cookie and storage technologies Kujuana uses, why we use them, and how you can
              manage your preferences.
            </p>

            <p style={{ margin: 0, color: 'var(--gold-champagne)', fontSize: '0.84rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {COOKIE_TYPES.map((cookieType) => (
            <article
              key={cookieType.title}
              style={{
                border: '1px solid rgba(212,175,55,0.16)',
                borderRadius: '20px',
                background: 'linear-gradient(165deg, rgba(32,10,43,0.82), rgba(14,10,22,0.88))',
                padding: '16px',
                display: 'grid',
                gap: '8px',
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
                <LockKeyhole size={17} color="var(--gold-champagne)" />
              </div>
              <h2
                style={{
                  margin: 0,
                  color: 'var(--off-white)',
                  fontFamily: 'var(--font-cormorant, serif)',
                  fontSize: '1.45rem',
                  lineHeight: 1.06,
                }}
              >
                {cookieType.title}
              </h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.62, fontSize: '0.92rem' }}>{cookieType.purpose}</p>
              <p style={{ margin: 0, color: 'rgba(237,224,196,0.92)', fontSize: '0.9rem' }}>
                <strong>Examples:</strong> {cookieType.examples.join(', ')}
              </p>
              <p style={{ margin: 0, color: 'var(--gold-champagne)', fontSize: '0.84rem' }}>
                <strong>Retention:</strong> {cookieType.retention}
              </p>
            </article>
          ))}
        </section>

        <section
          style={{
            border: '1px solid rgba(212,175,55,0.18)',
            borderRadius: '22px',
            background: 'rgba(14,10,22,0.76)',
            padding: '20px',
            display: 'grid',
            gap: '14px',
          }}
        >
          {SECTIONS.map((section) => (
            <article key={section.id} id={section.id} style={{ display: 'grid', gap: '7px' }}>
              <h2
                style={{
                  margin: 0,
                  color: 'var(--off-white)',
                  fontFamily: 'var(--font-cormorant, serif)',
                  fontSize: '1.85rem',
                }}
              >
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.72 }}>
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '6px', color: 'rgba(237,224,196,0.9)' }}>
                  {section.bullets.map((bullet) => (
                    <li key={bullet} style={{ lineHeight: 1.6 }}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
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
          <h3
            style={{
              margin: 0,
              color: 'var(--off-white)',
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: '2rem',
            }}
          >
            More legal resources
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Review related legal pages for complete details on personal data processing and service rules.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href="/privacy"
              className="btn btn-gold"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
            >
              Privacy Policy
              <ArrowRight size={14} />
            </Link>
            <Link href="/terms" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              Terms of Service
            </Link>
            <Link href="/contact" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              Contact Support
            </Link>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold-champagne)' }}>
            <Settings2 size={15} />
            <ShieldCheck size={15} />
            <span style={{ fontSize: '0.84rem' }}>You can also manage preferences via browser and device settings.</span>
          </div>
        </section>
      </div>
    </main>
  )
}
