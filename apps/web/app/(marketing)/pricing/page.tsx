import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing — Kujuana',
  description:
    "Compare Kujuana's Standard, Priority, and VIP matchmaking plans. From free nightly matching to fully curated VIP introductions.",
}

/* ─────────────────────────────────────────────────────────────────────
   SHARED STYLE CONSTANTS
──────────────────────────────────────────────────────────────────────── */
const S = {
  displayFont: 'var(--font-cormorant), Georgia, serif',
  bodyFont: 'var(--font-jost), system-ui, sans-serif',

  goldGradText: {
    background: 'var(--grad-gold)',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
    backgroundClip: 'text' as const,
  } as React.CSSProperties,
} as const

/* ─────────────────────────────────────────────────────────────────────
   TYPES
──────────────────────────────────────────────────────────────────────── */
type CellValue = string | boolean

type FeatureRow = {
  category: string
  features: {
    label: string
    standard: CellValue
    priority: CellValue
    vip: CellValue
    highlight?: boolean
  }[]
}

/* ─────────────────────────────────────────────────────────────────────
   DATA
──────────────────────────────────────────────────────────────────────── */
const TIERS = [
  {
    id: 'standard',
    name: 'Standard',
    tagline: 'Begin with intention',
    price: 'Free',
    priceSub: 'Always',
    colorStyle: 'rgba(212,175,55,0.4)',
    cta: 'Get Started',
    ctaHref: '/register',
    ctaStyle: 'outline' as const,
    popular: false,
  },
  {
    id: 'priority',
    name: 'Priority',
    tagline: 'Move faster, match smarter',
    price: 'KES 500',
    priceSub: 'per match · bundles available',
    colorStyle: 'var(--gold-primary)',
    cta: 'Buy Credits',
    ctaHref: '/register?plan=priority',
    ctaStyle: 'gold' as const,
    popular: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    tagline: 'The full Kujuana experience',
    price: 'KES 10,000',
    priceSub: 'per month',
    colorStyle: 'var(--gold-champagne)',
    cta: 'Apply for VIP',
    ctaHref: '/register?plan=vip',
    ctaStyle: 'outline' as const,
    popular: false,
  },
] as const

const CREDIT_BUNDLES = [
  { credits: 1, price: 'KES 500', savings: null, tag: null },
  { credits: 5, price: 'KES 2,000', savings: 'Save KES 500', tag: 'Popular' },
  { credits: 10, price: 'KES 3,500', savings: 'Save KES 1,500', tag: 'Best Value' },
] as const

const FEATURE_ROWS: FeatureRow[] = [
  {
    category: 'Matching',
    features: [
      {
        label: 'Match processing',
        standard: 'Nightly batch (02:00 EAT)',
        priority: 'Instant — highest priority',
        vip: 'Instant + human curated',
        highlight: true,
      },
      {
        label: 'Concurrent active matches',
        standard: 'Up to 3',
        priority: 'Unlimited',
        vip: 'Unlimited',
      },
      {
        label: 'Monthly introductions',
        standard: 'Algorithm-determined',
        priority: 'Per credit purchased',
        vip: 'Unlimited',
      },
      { label: 'Compatibility scoring', standard: true, priority: true, vip: true },
      { label: 'Score breakdown visible', standard: true, priority: true, vip: true },
      { label: 'Non-negotiable filtering', standard: true, priority: true, vip: true },
    ],
  },
  {
    category: 'Matchmaking',
    features: [
      {
        label: 'Human matchmaker review',
        standard: false,
        priority: false,
        vip: true,
        highlight: true,
      },
      { label: 'Personal introduction note', standard: false, priority: false, vip: true },
      { label: 'VIP curation queue', standard: false, priority: false, vip: true },
      { label: 'Matchmaker shortlist', standard: false, priority: false, vip: true },
    ],
  },
  {
    category: 'Filtering & Search',
    features: [
      {
        label: 'Age range filtering',
        standard: 'Standard range',
        priority: 'Extended range',
        vip: 'Strict ±1 year',
      },
      {
        label: 'Country preference',
        standard: 'Basic',
        priority: 'Advanced',
        vip: 'Hyper-local targeting',
      },
      {
        label: 'International search',
        standard: false,
        priority: false,
        vip: true,
        highlight: true,
      },
      {
        label: 'Religious filtering',
        standard: 'Basic',
        priority: 'Basic',
        vip: 'Faith-specific (encrypted)',
      },
      {
        label: 'Personality archetype matching',
        standard: false,
        priority: false,
        vip: true,
      },
      { label: 'Income bracket preference', standard: false, priority: false, vip: true },
    ],
  },
  {
    category: 'Privacy & Security',
    features: [
      { label: 'Private photo vault', standard: true, priority: true, vip: true },
      {
        label: 'Time-expiring signed photo URLs',
        standard: true,
        priority: true,
        vip: true,
      },
      {
        label: 'AES-256-GCM field encryption',
        standard: false,
        priority: false,
        vip: true,
        highlight: true,
      },
      { label: 'Confidential field access', standard: false, priority: false, vip: true },
      { label: 'Profile audit log', standard: false, priority: false, vip: true },
    ],
  },
  {
    category: 'Payments & Billing',
    features: [
      { label: 'M-Pesa STK Push', standard: '—', priority: true, vip: true },
      { label: 'Card (Pesapal / Flutterwave)', standard: '—', priority: true, vip: true },
      { label: 'Payment receipt by email', standard: '—', priority: true, vip: true },
      { label: 'Auto-renewal', standard: '—', priority: false, vip: true },
    ],
  },
  {
    category: 'Notifications',
    features: [
      { label: 'Email notifications', standard: true, priority: true, vip: true },
      { label: 'Push notifications (mobile)', standard: true, priority: true, vip: true },
      {
        label: 'Priority matchmaker updates',
        standard: false,
        priority: false,
        vip: true,
      },
    ],
  },
]

const VIP_ADDONS = [
  { key: 'location_filtering', label: 'Hyper-local targeting', desc: 'Specific city/region focus' },
  { key: 'strict_age_filtering', label: 'Strict age filtering', desc: 'Exact ±1 year enforcement' },
  {
    key: 'personality_preference',
    label: 'Personality archetypes',
    desc: 'Deep personality matching',
  },
  {
    key: 'international_search',
    label: 'International search',
    desc: 'Match outside your country',
  },
  {
    key: 'religious_filtering',
    label: 'Faith-specific filtering',
    desc: 'Encrypted religious preference',
  },
  {
    key: 'confidential_details',
    label: 'Confidential details',
    desc: 'Health & sensitive info (AES encrypted)',
  },
  { key: 'income_bracket', label: 'Income compatibility', desc: 'Income range matching' },
  {
    key: 'race_preference',
    label: 'Race/ethnicity preference',
    desc: 'Encrypted, matchmaker-handled',
  },
  {
    key: 'highly_specific_criteria',
    label: 'Highly specific criteria',
    desc: 'Custom — matchmaker handled',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Can I upgrade my plan at any time?',
    a: 'Yes. You can upgrade from Standard to Priority credits or to VIP at any point. Priority credits stack and never expire. VIP activates immediately upon payment confirmation.',
  },
  {
    q: 'How are photos kept private?',
    a: "All photos are stored in a private Cloudinary folder — never on a public CDN. When a match is introduced, you receive a time-expiring signed URL (1-hour validity) to view their photos. Photos are never publicly accessible.",
  },
  {
    q: 'What payment methods are accepted?',
    a: 'M-Pesa STK Push (Kenya), Pesapal (card payments, Kenya), and Flutterwave (international card payments). All transactions are secured with HMAC-verified webhooks and idempotency keys to prevent duplicate charges.',
  },
  {
    q: 'How does the compatibility algorithm work?',
    a: 'Our engine scores five dimensions: Relationship Goals (30%), Partner Values (25%), Lifestyle (20%), Preferences (15%), and Emotional Readiness (10%). Non-negotiable deal-breakers are filtered before any score is computed.',
  },
  {
    q: 'Who are the matchmakers?',
    a: 'Kujuana matchmakers are trained professionals who review VIP candidate shortlists, write personal introduction notes, and manage the VIP introduction queue. They have access to full profiles including encrypted VIP fields.',
  },
  {
    q: 'Is my data safe?',
    a: 'VIP sensitive fields (health status, income bracket, certain preferences) are encrypted at the application layer using AES-256-GCM before being written to the database. Even our database records cannot be read without the application key.',
  },
]

/* ─────────────────────────────────────────────────────────────────────
   HELPER COMPONENTS
──────────────────────────────────────────────────────────────────────── */
function OrnamentDivider({ maxWidth = '300px' }: { maxWidth?: string }) {
  return (
    <div
      className="divider-gold"
      aria-hidden="true"
      style={{ justifyContent: 'center', margin: '20px auto', maxWidth }}
    >
      <span className="ornament">◆</span>
    </div>
  )
}

function FeatureValue({ value }: { value: CellValue }) {
  if (value === true) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-label="Included">
        <circle cx="9" cy="9" r="8" stroke="#D4AF37" strokeOpacity="0.6" />
        <path
          d="M5.5 9l2.5 2.5 4.5-4.5"
          stroke="#D4AF37"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (value === false) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-label="Not included">
        <circle cx="9" cy="9" r="8" stroke="rgba(196,168,130,0.2)" />
        <path
          d="M6.5 11.5l5-5M11.5 11.5l-5-5"
          stroke="rgba(196,168,130,0.3)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (value === '—') {
    return <span style={{ color: 'rgba(196,168,130,0.3)', fontSize: '1.1em' }}>—</span>
  }
  return (
    <span
      style={{
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        lineHeight: 1.4,
        fontFamily: S.bodyFont,
      }}
    >
      {value as string}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   PAGE COMPONENT
──────────────────────────────────────────────────────────────────────── */
export default function PricingPage() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="grain"
        style={{
          background: 'var(--grad-hero)',
          padding: 'clamp(80px, 10vw, 130px) 0 clamp(70px, 9vw, 110px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.07) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow animate-fade-up">Investment</span>
          <OrnamentDivider maxWidth="300px" />

          <h1
            className="animate-fade-up delay-2"
            style={{
              fontFamily: S.displayFont,
              fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)',
              fontWeight: 300,
              lineHeight: 1.1,
              color: 'var(--off-white)',
              marginBottom: '8px',
            }}
          >
            Choose your level of
          </h1>
          <h1
            className="animate-fade-up delay-3 shimmer-text"
            style={{
              fontFamily: S.displayFont,
              fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)',
              fontWeight: 500,
              fontStyle: 'italic',
              lineHeight: 1.1,
              marginBottom: '36px',
            }}
          >
            intentionality
          </h1>

          <p
            className="animate-fade-up delay-4"
            style={{
              fontSize: '1rem',
              color: 'var(--text-muted)',
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: 1.85,
            }}
          >
            Three tiers designed around how seriously you take this journey. Every tier
            includes private photo storage and compatibility scoring.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TIER CARDS
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: 'var(--purple-dark)',
          padding: '0 0 clamp(80px, 10vw, 130px)',
          position: 'relative',
        }}
        aria-labelledby="tier-cards-heading"
      >
        <h2 id="tier-cards-heading" className="visually-hidden" style={{ position: 'absolute', clip: 'rect(0,0,0,0)' }}>
          Membership tiers
        </h2>
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: '20px',
            marginTop: '-40px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {TIERS.map(tier => (
            <div
              key={tier.id}
              className="card-luxury animate-fade-up"
              style={{
                padding: '48px 40px',
                borderColor: tier.popular ? 'rgba(212,175,55,0.45)' : undefined,
                background: tier.popular
                  ? 'linear-gradient(145deg, rgba(92,34,120,0.5) 0%, rgba(42,8,56,0.95) 100%)'
                  : tier.id === 'vip'
                  ? 'linear-gradient(145deg, rgba(42,8,56,0.98) 0%, rgba(24,2,31,1) 100%)'
                  : undefined,
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div
                  aria-label="Most popular plan"
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--grad-gold)',
                    color: 'var(--purple-deepest)',
                    padding: '4px 18px',
                    fontSize: '0.66rem',
                    fontFamily: S.bodyFont,
                    fontWeight: 600,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Most Popular
                </div>
              )}

              {/* VIP top accent */}
              {tier.id === 'vip' && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'var(--grad-gold)',
                  }}
                />
              )}

              {/* Tier label */}
              <div
                style={{
                  fontFamily: S.bodyFont,
                  fontSize: '0.68rem',
                  fontWeight: 500,
                  letterSpacing: '0.26em',
                  textTransform: 'uppercase',
                  color: tier.colorStyle,
                  marginBottom: '18px',
                }}
              >
                {tier.id === 'vip' ? '✦ VIP' : tier.name}
              </div>

              {/* Tagline */}
              <p
                style={{
                  fontFamily: S.displayFont,
                  fontSize: '1.25rem',
                  fontStyle: 'italic',
                  color: 'var(--text-muted)',
                  marginBottom: '28px',
                  lineHeight: 1.4,
                }}
              >
                {tier.tagline}
              </p>

              {/* Price */}
              <div style={{ marginBottom: '4px' }}>
                <span
                  style={{
                    fontFamily: S.displayFont,
                    fontSize: 'clamp(2.2rem, 4vw, 3rem)',
                    fontWeight: 300,
                    ...(tier.id === 'standard'
                      ? { color: 'var(--off-white)' }
                      : S.goldGradText),
                    lineHeight: 1,
                  }}
                >
                  {tier.price}
                </span>
              </div>
              <p
                style={{
                  fontFamily: S.bodyFont,
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)',
                  marginBottom: '36px',
                  letterSpacing: '0.04em',
                }}
              >
                {tier.priceSub}
              </p>

              {/* CTA */}
              {tier.ctaStyle === 'gold' ? (
                <Link
                  href={tier.ctaHref}
                  className="btn btn-gold"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  {tier.cta}
                </Link>
              ) : (
                <Link
                  href={tier.ctaHref}
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    borderColor:
                      tier.id === 'vip' ? 'rgba(212,175,55,0.45)' : undefined,
                  }}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PRIORITY CREDIT BUNDLES
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: 'var(--purple-royal)',
          padding: 'clamp(70px, 8vw, 110px) 0',
          borderTop: '1px solid rgba(212,175,55,0.08)',
          borderBottom: '1px solid rgba(212,175,55,0.08)',
        }}
        aria-labelledby="bundles-heading"
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="eyebrow">Priority Credits</span>
            <OrnamentDivider maxWidth="240px" />
            <h2
              id="bundles-heading"
              className="display-md"
              style={{ color: 'var(--off-white)', marginBottom: '12px' }}
            >
              Credit bundles —{' '}
              <em style={{ color: 'var(--gold-champagne)' }}>more matches, better value</em>
            </h2>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                maxWidth: '440px',
                margin: '0 auto',
              }}
            >
              Credits are atomic — deducted when your priority match job is dispatched,
              not when the match is returned.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            {CREDIT_BUNDLES.map(bundle => (
              <div
                key={bundle.credits}
                className="card-luxury"
                style={{
                  padding: '36px 32px',
                  textAlign: 'center',
                  borderColor:
                    bundle.tag === 'Best Value' ? 'rgba(212,175,55,0.4)' : undefined,
                  position: 'relative',
                }}
              >
                {bundle.tag && (
                  <div
                    aria-label={`Bundle tag: ${bundle.tag}`}
                    style={{
                      position: 'absolute',
                      top: '-13px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background:
                        bundle.tag === 'Best Value'
                          ? 'var(--grad-gold)'
                          : 'rgba(212,175,55,0.15)',
                      border:
                        bundle.tag === 'Best Value'
                          ? 'none'
                          : '1px solid rgba(212,175,55,0.3)',
                      color:
                        bundle.tag === 'Best Value'
                          ? 'var(--purple-deepest)'
                          : 'var(--gold-champagne)',
                      padding: '4px 14px',
                      fontSize: '0.64rem',
                      fontFamily: S.bodyFont,
                      fontWeight: 600,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {bundle.tag}
                  </div>
                )}

                <div
                  style={{
                    ...S.goldGradText,
                    fontFamily: S.displayFont,
                    fontSize: '3.5rem',
                    fontWeight: 300,
                    lineHeight: 1,
                    marginBottom: '4px',
                  }}
                >
                  {bundle.credits}
                </div>
                <div
                  style={{
                    fontFamily: S.bodyFont,
                    fontSize: '0.7rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: '20px',
                  }}
                >
                  {bundle.credits === 1 ? 'Credit' : 'Credits'}
                </div>

                <div
                  style={{
                    fontFamily: S.displayFont,
                    fontSize: '1.8rem',
                    color: 'var(--off-white)',
                    fontWeight: 400,
                    marginBottom: '6px',
                  }}
                >
                  {bundle.price}
                </div>
                {bundle.savings && (
                  <div style={{ fontSize: '0.76rem', color: 'var(--gold-champagne)' }}>
                    {bundle.savings}
                  </div>
                )}
              </div>
            ))}
          </div>

          <p
            style={{
              textAlign: 'center',
              marginTop: '32px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              fontFamily: S.bodyFont,
            }}
          >
            M-Pesa STK Push · Pesapal · Flutterwave · Credits never expire
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FULL COMPARISON TABLE
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="section"
        style={{ background: 'var(--grad-purple)' }}
        aria-labelledby="comparison-heading"
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="eyebrow">Full Comparison</span>
            <OrnamentDivider maxWidth="280px" />
            <h2
              id="comparison-heading"
              className="display-md"
              style={{ color: 'var(--off-white)' }}
            >
              Everything,{' '}
              <em style={{ color: 'var(--gold-champagne)' }}>side by side</em>
            </h2>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table
              style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}
              aria-label="Feature comparison across tiers"
            >
              <thead>
                <tr>
                  <th
                    scope="col"
                    style={{
                      width: '38%',
                      textAlign: 'left',
                      padding: '0 0 24px',
                      fontFamily: S.bodyFont,
                      fontSize: '0.7rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      fontWeight: 400,
                    }}
                  >
                    Feature
                  </th>
                  {TIERS.map(tier => (
                    <th
                      key={tier.id}
                      scope="col"
                      style={{
                        width: '20.67%',
                        textAlign: 'center',
                        padding: '0 16px 24px',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: S.bodyFont,
                          fontSize: '0.68rem',
                          letterSpacing: '0.22em',
                          textTransform: 'uppercase',
                          color: tier.popular ? 'var(--gold-primary)' : 'var(--text-muted)',
                          fontWeight: tier.popular ? 500 : 400,
                        }}
                      >
                        {tier.id === 'vip' ? '✦ VIP' : tier.name}
                      </div>
                      {tier.popular && (
                        <div
                          style={{
                            marginTop: '6px',
                            fontSize: '0.62rem',
                            fontFamily: S.bodyFont,
                            color: 'var(--gold-champagne)',
                            letterSpacing: '0.1em',
                          }}
                        >
                          Most Popular
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* ── React.Fragment with key fixes the missing-key warning ── */}
                {FEATURE_ROWS.map(section => (
                  <React.Fragment key={section.category}>
                    {/* Category header row */}
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          padding: '28px 0 12px',
                          borderBottom: '1px solid rgba(212,175,55,0.15)',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: S.bodyFont,
                            fontSize: '0.66rem',
                            fontWeight: 500,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--gold-champagne)',
                          }}
                        >
                          {section.category}
                        </span>
                      </td>
                    </tr>

                    {/* Feature rows */}
                    {section.features.map(feat => (
                      <tr
                        key={feat.label}
                        style={{
                          background: feat.highlight
                            ? 'rgba(212,175,55,0.03)'
                            : 'transparent',
                        }}
                      >
                        <td
                          style={{
                            padding: '14px 0',
                            borderBottom: '1px solid rgba(212,175,55,0.06)',
                            fontSize: '0.86rem',
                            color: feat.highlight ? 'var(--text-body)' : 'var(--text-muted)',
                            fontFamily: S.bodyFont,
                            fontWeight: feat.highlight ? 400 : 300,
                          }}
                        >
                          {feat.label}
                          {feat.highlight && (
                            <span
                              aria-hidden="true"
                              style={{
                                marginLeft: '8px',
                                fontSize: '0.62rem',
                                letterSpacing: '0.14em',
                                color: 'var(--gold-primary)',
                                textTransform: 'uppercase',
                              }}
                            >
                              ✦
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: '14px 16px',
                            textAlign: 'center',
                            borderBottom: '1px solid rgba(212,175,55,0.06)',
                          }}
                        >
                          <FeatureValue value={feat.standard} />
                        </td>
                        <td
                          style={{
                            padding: '14px 16px',
                            textAlign: 'center',
                            borderBottom: '1px solid rgba(212,175,55,0.06)',
                            background: 'rgba(212,175,55,0.02)',
                          }}
                        >
                          <FeatureValue value={feat.priority} />
                        </td>
                        <td
                          style={{
                            padding: '14px 16px',
                            textAlign: 'center',
                            borderBottom: '1px solid rgba(212,175,55,0.06)',
                          }}
                        >
                          <FeatureValue value={feat.vip} />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          VIP ADD-ONS
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="grain section"
        style={{
          background: 'var(--grad-purple-rich)',
          position: 'relative',
          overflow: 'hidden',
        }}
        aria-labelledby="addons-heading"
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="eyebrow">VIP Exclusive</span>
            <OrnamentDivider maxWidth="260px" />
            <h2
              id="addons-heading"
              className="display-md"
              style={{ color: 'var(--off-white)', marginBottom: '14px' }}
            >
              Every add-on,{' '}
              <em style={{ color: 'var(--gold-champagne)' }}>fully unlocked</em>
            </h2>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                maxWidth: '460px',
                margin: '0 auto',
                lineHeight: 1.8,
              }}
            >
              VIP membership includes all nine premium add-ons. No upselling, no
              surprises.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {VIP_ADDONS.map(addon => (
              <div
                key={addon.key}
                className="card-luxury"
                style={{
                  padding: '28px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '4px',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="7" cy="7" r="6" stroke="#D4AF37" />
                    <path
                      d="M4 7l2 2 4-4"
                      stroke="#D4AF37"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontFamily: S.bodyFont,
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      color: 'var(--gold-champagne)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {addon.label}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                    paddingLeft: '24px',
                  }}
                >
                  {addon.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="section"
        style={{ background: 'var(--purple-dark)' }}
        aria-labelledby="faq-heading"
      >
        <div className="container" style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="eyebrow">Questions</span>
            <OrnamentDivider maxWidth="240px" />
            <h2
              id="faq-heading"
              className="display-md"
              style={{ color: 'var(--off-white)' }}
            >
              Frequently asked
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {FAQ_ITEMS.map(({ q, a }, i) => (
              <details
                key={i}
                style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}
              >
                <summary
                  style={{
                    padding: '24px 0',
                    fontFamily: S.displayFont,
                    fontSize: '1.2rem',
                    fontWeight: 500,
                    color: 'var(--off-white)',
                    /*
                      cursor and list-style set in globals.css under
                      `details summary { cursor: pointer; }`
                      and `details summary::-webkit-details-marker { display: none; }`
                    */
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  {q}
                  {/*
                    The .faq-toggle class in globals.css applies:
                    - transition: transform 0.3s ...
                    - And `details[open] summary .faq-toggle { transform: rotate(45deg) }`
                    so it animates + → × when the details opens.
                  */}
                  <span className="faq-toggle" aria-hidden="true">+</span>
                </summary>
                <p
                  style={{
                    padding: '0 0 24px',
                    fontSize: '0.9rem',
                    lineHeight: 1.85,
                    color: 'var(--text-muted)',
                    fontFamily: S.bodyFont,
                  }}
                >
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="grain"
        style={{
          background: 'var(--purple-deepest)',
          padding: 'clamp(90px, 12vw, 150px) 0',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
        aria-labelledby="pricing-cta-heading"
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            top: '40px',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, var(--gold-primary), transparent)',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2
            id="pricing-cta-heading"
            style={{
              fontFamily: S.displayFont,
              fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)',
              fontWeight: 300,
              color: 'var(--off-white)',
              lineHeight: 1.15,
              marginBottom: '8px',
            }}
          >
            Ready to date with
          </h2>
          <h2
            className="shimmer-text"
            style={{
              fontFamily: S.displayFont,
              fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)',
              fontWeight: 500,
              fontStyle: 'italic',
              lineHeight: 1.15,
              marginBottom: '40px',
            }}
          >
            intention?
          </h2>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-muted)',
              maxWidth: '420px',
              margin: '0 auto 48px',
              lineHeight: 1.85,
              fontFamily: S.bodyFont,
            }}
          >
            Create your profile in minutes. M-Pesa-native billing. Your story, on your
            terms.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/register"
              className="btn btn-gold"
              style={{ minWidth: '200px', padding: '16px 44px' }}
            >
              Create Your Profile
            </Link>
            <Link href="/register?plan=vip" className="btn btn-outline">
              Apply for VIP
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}