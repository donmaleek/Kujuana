// kujuana/apps/web/app/(marketing)/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import type React from 'react'

export const metadata: Metadata = {
  title: 'Kujuana — Dating with Intention',
  description:
    'Premium curated matchmaking for Kenya and the global diaspora. Where compatibility meets intention.',
  metadataBase: new URL('https://kujuana.com'),
  openGraph: {
    title: 'Kujuana — Dating with Intention',
    description:
      'Premium curated matchmaking for Kenya and the global diaspora. Where compatibility meets intention.',
    url: 'https://kujuana.com',
    siteName: 'Kujuana',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kujuana — Dating with Intention',
    description:
      'Premium curated matchmaking for Kenya and the global diaspora. Where compatibility meets intention.',
  },
}

/* ─────────────────────────────────────────────────────────────────────
   SHARED STYLE CONSTANTS (luxury purple + gold palette)
──────────────────────────────────────────────────────────────────────── */
const S = {
  displayFont: 'var(--font-cormorant), Georgia, serif',
  bodyFont: 'var(--font-jost), system-ui, sans-serif',

  heading: {
    fontFamily: 'var(--font-cormorant), Georgia, serif',
    fontWeight: 400,
  } as React.CSSProperties,

  eyebrow: {
    fontFamily: 'var(--font-jost), system-ui, sans-serif',
    fontSize: '0.72rem',
    fontWeight: 500 as const,
    letterSpacing: '0.28em',
    textTransform: 'uppercase' as const,
    color: 'var(--gold-champagne)',
  } as React.CSSProperties,

  textMuted: {
    fontFamily: 'var(--font-jost), system-ui, sans-serif',
    color: 'var(--text-muted)',
    lineHeight: 1.8,
  } as React.CSSProperties,

  goldGradText: {
    background: 'var(--grad-gold)',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
    backgroundClip: 'text' as const,
  } as React.CSSProperties,

  checkIcon: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      style={{ marginTop: '2px', flexShrink: 0 }}
    >
      <circle cx="7" cy="7" r="6" stroke="#D4AF37" />
      <path d="M4 7l2 2 4-4" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
} as const

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          ...S.goldGradText,
          fontFamily: S.displayFont,
          fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
          fontWeight: 300,
          lineHeight: 1,
          marginBottom: '8px',
        }}
      >
        {value}
      </div>
      <div style={{ ...S.eyebrow, fontSize: '0.7rem' }}>{label}</div>
    </div>
  )
}

function OrnamentDivider() {
  return (
    <div
      className="divider-gold"
      aria-hidden="true"
      style={{ justifyContent: 'center', margin: '20px auto', maxWidth: '300px' }}
    >
      <span className="ornament">◆</span>
    </div>
  )
}

function ProcessStep({
  num,
  title,
  desc,
  delayClass,
}: {
  num: string
  title: string
  desc: string
  delayClass: string
}) {
  return (
    <div
      className={`animate-fade-up ${delayClass}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}
    >
      <div
        aria-hidden="true"
        style={{
          fontFamily: S.displayFont,
          fontSize: '5rem',
          fontWeight: 300,
          color: 'rgba(212,175,55,0.12)',
          lineHeight: 1,
          position: 'absolute',
          top: '-20px',
          left: '-10px',
          userSelect: 'none',
        }}
      >
        {num}
      </div>

      <div style={{ paddingTop: '36px' }}>
        <h3
          style={{
            fontFamily: S.displayFont,
            fontSize: '1.55rem',
            fontWeight: 500,
            color: 'var(--gold-champagne)',
            marginBottom: '10px',
          }}
        >
          {title}
        </h3>
        <p style={{ ...S.textMuted, fontSize: '0.9rem' }}>{desc}</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div
      className="card-luxury"
      style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: '18px' }}
    >
      <div style={{ fontSize: '2.2rem', lineHeight: 1 }} aria-hidden="true">
        {icon}
      </div>
      <h3
        style={{
          fontFamily: S.displayFont,
          fontSize: '1.4rem',
          fontWeight: 500,
          color: 'var(--gold-champagne)',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h3>
      <p style={{ ...S.textMuted, fontSize: '0.88rem' }}>{desc}</p>
    </div>
  )
}

function TestimonialCard({
  quote,
  name,
  location,
  tier,
}: {
  quote: string
  name: string
  location: string
  tier: string
}) {
  return (
    <figure
      className="card-luxury"
      style={{
        padding: '40px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        margin: 0,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          fontFamily: S.displayFont,
          fontSize: '5rem',
          lineHeight: 0.7,
          color: 'rgba(212,175,55,0.2)',
          fontStyle: 'italic',
          marginBottom: '4px',
        }}
      >
        "
      </div>

      <blockquote
        style={{
          fontFamily: S.displayFont,
          fontSize: '1.2rem',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.7,
          color: 'var(--text-body)',
          flex: 1,
          margin: 0,
          padding: 0,
          border: 'none',
        }}
      >
        {quote}
      </blockquote>

      <figcaption
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(212,175,55,0.1)',
          paddingTop: '20px',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: S.bodyFont,
              fontSize: '0.88rem',
              fontWeight: 500,
              color: 'var(--gold-champagne)',
            }}
          >
            {name}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {location}
          </div>
        </div>
        <span className="badge">{tier}</span>
      </figcaption>
    </figure>
  )
}

function TierFeatureItem({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <li
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        fontSize: '0.86rem',
        color: muted ? 'var(--text-muted)' : 'var(--text-body)',
      }}
    >
      {S.checkIcon}
      {label}
    </li>
  )
}

export default function LandingPage() {
  return (
    <>
      {/* HERO */}
      <section
        className="grain"
        style={{
          minHeight: '100vh',
          background: 'var(--grad-hero)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: '80px',
        }}
      >
        {/* Background orbs */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 65%)',
            top: '-200px',
            right: '-200px',
            animation: 'float 10s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74,22,99,0.5) 0%, transparent 70%)',
            bottom: '-100px',
            left: '-150px',
            animation: 'float 14s ease-in-out infinite reverse',
            pointerEvents: 'none',
          }}
        />

        {/* Art Deco lines */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              rgba(212,175,55,0.02) 0px,
              rgba(212,175,55,0.02) 1px,
              transparent 1px,
              transparent 80px
            )`,
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              textAlign: 'center',
              paddingTop: 'clamp(40px, 8vw, 100px)',
            }}
          >
            <div
              className="animate-fade-up delay-1"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}
            >
              <span className="deco-line" style={{ width: '32px' }} aria-hidden="true" />
              <span className="eyebrow">Nairobi · Kenya · Global Diaspora</span>
              <span className="deco-line" style={{ width: '32px' }} aria-hidden="true" />
            </div>

            <h1
              className="animate-fade-up delay-2"
              style={{
                fontFamily: S.displayFont,
                fontSize: 'clamp(3.4rem, 8.5vw, 7.5rem)',
                fontWeight: 300,
                lineHeight: 1.06,
                letterSpacing: '-0.02em',
                marginBottom: '12px',
                color: 'var(--off-white)',
              }}
            >
              Dating with
            </h1>
            <h1
              className="animate-fade-up delay-3 shimmer-text"
              style={{
                fontFamily: S.displayFont,
                fontSize: 'clamp(3.4rem, 8.5vw, 7.5rem)',
                fontWeight: 500,
                lineHeight: 1.06,
                letterSpacing: '-0.02em',
                marginBottom: '40px',
                fontStyle: 'italic',
              }}
            >
              Intention.
            </h1>

            <p
              className="animate-fade-up delay-4"
              style={{
                ...S.textMuted,
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                fontWeight: 300,
                maxWidth: '560px',
                margin: '0 auto 52px',
              }}
            >
              A premium matchmaking platform where compatibility is algorithmically scored and human matchmakers curate every VIP introduction. No swiping. No games. Just meaningful connections.
            </p>

            <div
              className="animate-fade-up delay-5"
              style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link href="/register" className="btn btn-gold" style={{ minWidth: '200px', padding: '16px 40px' }}>
                Begin Your Journey
              </Link>
              <Link href="/pricing" className="btn btn-outline" style={{ minWidth: '160px' }}>
                Explore Plans
              </Link>
            </div>

            <div
              className="animate-fade-in delay-6"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                marginTop: '56px',
                flexWrap: 'wrap',
              }}
            >
              {(['Private & Confidential', 'M-Pesa Supported', 'Kenya & Diaspora'] as const).map((item, i) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: S.bodyFont,
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.06em',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="6" stroke="#D4AF37" strokeOpacity="0.6" />
                    <path d="M4 7l2 2 4-4" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {item}
                  {i < 2 && (
                    <span aria-hidden="true" style={{ marginLeft: '16px', color: 'rgba(212,175,55,0.2)' }}>
                      |
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(0deg, var(--purple-dark) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
      </section>

      {/* STATS */}
      <section
        aria-label="Platform statistics"
        style={{
          background: 'var(--purple-dark)',
          borderTop: '1px solid rgba(212,175,55,0.1)',
          borderBottom: '1px solid rgba(212,175,55,0.1)',
          padding: '64px 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(74,22,99,0.3) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '48px',
              alignItems: 'center',
            }}
          >
            <StatCard value="3,200+" label="Active Members" />
            <div aria-hidden="true" style={{ width: '1px', height: '60px', background: 'rgba(212,175,55,0.15)', margin: '0 auto' }} />
            <StatCard value="89%" label="Compatibility Accuracy" />
            <div aria-hidden="true" style={{ width: '1px', height: '60px', background: 'rgba(212,175,55,0.15)', margin: '0 auto' }} />
            <StatCard value="480+" label="Introductions Made" />
            <div aria-hidden="true" style={{ width: '1px', height: '60px', background: 'rgba(212,175,55,0.15)', margin: '0 auto' }} />
            <StatCard value="14" label="Countries Served" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section" style={{ background: 'var(--grad-purple)' }} aria-labelledby="how-it-works-heading">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span className="eyebrow animate-fade-up">The Process</span>
            <OrnamentDivider />
            <h2
              id="how-it-works-heading"
              className="animate-fade-up delay-2 display-lg"
              style={{ color: 'var(--off-white)', marginBottom: '16px' }}
            >
              A curated experience,
              <br />
              <em style={{ color: 'var(--gold-champagne)' }}>from first step to introduction</em>
            </h2>
            <p style={{ ...S.textMuted, fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
              Our process removes the noise and focuses on what matters — genuine compatibility and intentional connection.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '48px 64px' }}>
            <ProcessStep
              num="01"
              title="Create Your Profile"
              desc="Complete our six-step onboarding. Share your background, lifestyle, relationship vision, and what you're genuinely looking for. Depth, not just photos."
              delayClass="delay-1"
            />
            <ProcessStep
              num="02"
              title="Choose Your Tier"
              desc="Select Standard for our nightly matching cycle, Priority for instant one-match processing, or VIP for a dedicated matchmaker and curated introductions."
              delayClass="delay-2"
            />
            <ProcessStep
              num="03"
              title="Compatibility Engine"
              desc="Our algorithm scores 30+ dimensions — relationship goals, values, lifestyle, preferences, and emotional readiness — to surface genuine matches."
              delayClass="delay-3"
            />
            <ProcessStep
              num="04"
              title="Meaningful Introduction"
              desc="VIP members receive a personalised introduction note crafted by your matchmaker. For all tiers, every introduction is purposeful and private."
              delayClass="delay-4"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grain section" style={{ background: 'var(--grad-purple-rich)', position: 'relative', overflow: 'hidden' }} aria-labelledby="features-heading">
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '-80px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: S.displayFont,
            fontSize: '60vw',
            fontWeight: 300,
            color: 'rgba(212,175,55,0.02)',
            lineHeight: 1,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          K
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <span className="eyebrow animate-fade-up">Why Kujuana</span>
            <OrnamentDivider />
            <h2 id="features-heading" className="display-lg animate-fade-up delay-2" style={{ color: 'var(--off-white)' }}>
              Built for those who take
              <br />
              <em style={{ color: 'var(--gold-champagne)' }}>love seriously</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <FeatureCard
              icon="🔒"
              title="Absolute Privacy"
              desc="All photos are stored in private Cloudinary vaults with time-expiring signed URLs. Your sensitive information is encrypted with AES-256-GCM — visible only to you and your matchmaker."
            />
            <FeatureCard
              icon="🧠"
              title="Intelligent Scoring"
              desc="Our compatibility engine weighs relationship goals, partner values, lifestyle alignment, preferences, and emotional readiness into a precise score."
            />
            <FeatureCard
              icon="💳"
              title="Kenya-First Payments"
              desc="Pay with M-Pesa STK Push. Global members can use Pesapal or Flutterwave. Smooth payment, instant access."
            />
            <FeatureCard
              icon="👑"
              title="Human Matchmakers"
              desc="VIP members get dedicated matchmaker attention. Every introduction is reviewed by a real person who understands your story."
            />
            <FeatureCard
              icon="🌍"
              title="Kenya & Diaspora"
              desc="Whether you're in Nairobi, London, Toronto, or Dubai — Kujuana serves the global Kenyan community with premium search for VIP members."
            />
            <FeatureCard
              icon="⚡"
              title="Priority Processing"
              desc="Priority members get instant match processing — no waiting for the nightly batch. Your credit is used the moment you request."
            />
          </div>
        </div>
      </section>

      {/* TIERS */}
      <section className="section" style={{ background: 'var(--purple-dark)' }} aria-labelledby="tiers-heading">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <span className="eyebrow animate-fade-up">Membership Tiers</span>
            <OrnamentDivider />
            <h2 id="tiers-heading" className="display-lg animate-fade-up delay-2" style={{ color: 'var(--off-white)', marginBottom: '16px' }}>
              Choose your level of
              <br />
              <em style={{ color: 'var(--gold-champagne)' }}>intentionality</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'start' }}>
            {/* Standard */}
            <div className="card-luxury" style={{ padding: '44px 36px' }}>
              <div className="badge" style={{ marginBottom: '24px' }}>
                Standard
              </div>
              <div style={{ fontFamily: S.displayFont, fontSize: '2.6rem', color: 'var(--off-white)', fontWeight: 300, marginBottom: '8px' }}>
                Free
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.7 }}>
                Begin your intentional dating journey with our nightly curated batch matching.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
                {['Nightly batch matching', 'Up to 3 active matches', 'Compatibility scoring', 'Email notifications'].map(item => (
                  <TierFeatureItem key={item} label={item} muted />
                ))}
              </ul>
              <Link href="/register" className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>
                Get Started Free
              </Link>
            </div>

            {/* Priority */}
            <div
              className="card-luxury"
              style={{
                padding: '44px 36px',
                borderColor: 'rgba(212,175,55,0.35)',
                background: 'linear-gradient(145deg, rgba(92,34,120,0.5) 0%, rgba(42,8,56,0.9) 100%)',
              }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div className="badge">Priority</div>
                <div
                  className="badge"
                  style={{
                    borderColor: 'rgba(212,175,55,0.5)',
                    color: 'var(--gold-primary)',
                    background: 'rgba(212,175,55,0.12)',
                  }}
                >
                  Most Popular
                </div>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <span style={{ ...S.goldGradText, fontFamily: S.displayFont, fontSize: '2.6rem', fontWeight: 300 }}>KES 500</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '8px' }}>/ match</span>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.7 }}>
                Instant match processing. Credits available in bundles. No waiting.
              </p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
                {['Instant match processing', 'Pay per match (bundles available)', 'Highest queue priority', 'M-Pesa STK Push'].map(item => (
                  <TierFeatureItem key={item} label={item} />
                ))}
              </ul>

              <Link href="/register?plan=priority" className="btn btn-gold" style={{ width: '100%', textAlign: 'center' }}>
                Buy Credits
              </Link>
            </div>

            {/* VIP */}
            <div
              className="card-luxury"
              style={{
                padding: '44px 36px',
                background: 'linear-gradient(145deg, rgba(42,8,56,0.95) 0%, rgba(24,2,31,1) 100%)',
                borderColor: 'rgba(212,175,55,0.2)',
                position: 'relative',
              }}
            >
              <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--grad-gold)' }} />
              <div className="badge" style={{ marginBottom: '24px', borderColor: 'rgba(212,175,55,0.5)', color: 'var(--gold-champagne)' }}>
                ✦ VIP
              </div>

              <div style={{ marginBottom: '8px' }}>
                <span style={{ ...S.goldGradText, fontFamily: S.displayFont, fontSize: '2.6rem', fontWeight: 300 }}>KES 10,000</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '8px' }}>/ month</span>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.7 }}>
                Dedicated matchmaker, curated introductions, premium filters, and private handling of sensitive details.
              </p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
                {['Dedicated human matchmaker', 'Unlimited curated matches', 'Personal introduction notes', 'International search', 'Confidential field access'].map(item => (
                  <TierFeatureItem key={item} label={item} />
                ))}
              </ul>

              <Link
                href="/register?plan=vip"
                className="btn btn-outline"
                style={{ width: '100%', textAlign: 'center', borderColor: 'rgba(212,175,55,0.5)' }}
              >
                Apply for VIP
              </Link>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link
              href="/pricing"
              style={{
                fontFamily: S.bodyFont,
                fontSize: '0.82rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--gold-primary)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(212,175,55,0.3)',
                paddingBottom: '2px',
              }}
            >
              View detailed comparison →
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="grain section" style={{ background: 'var(--grad-purple-rich)' }} aria-labelledby="testimonials-heading">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <span className="eyebrow animate-fade-up">Voices</span>
            <OrnamentDivider />
            <h2 id="testimonials-heading" className="display-lg animate-fade-up delay-2" style={{ color: 'var(--off-white)' }}>
              Intentions turned into
              <br />
              <em style={{ color: 'var(--gold-champagne)' }}>real connections</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <TestimonialCard
              quote="I was sceptical — but within three months of joining VIP, my matchmaker introduced me to someone who genuinely understood my values. We’re now engaged."
              name="Amara W."
              location="Nairobi, Kenya"
              tier="VIP"
            />
            <TestimonialCard
              quote="Priority credits gave me control. No waiting weeks — I got a match the same evening I loaded my M-Pesa. The compatibility score was eerily accurate."
              name="David K."
              location="London, UK"
              tier="Priority"
            />
            <TestimonialCard
              quote="What I love is the privacy. My photos were never accessible publicly. The whole experience felt dignified — the way this should be."
              name="Zainab M."
              location="Dubai, UAE"
              tier="VIP"
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="grain"
        style={{
          background: 'var(--purple-deepest)',
          padding: 'clamp(100px, 14vw, 180px) 0',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}
        aria-labelledby="cta-heading"
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.07) 0%, rgba(74,22,99,0.2) 40%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow">Begin Now</span>
          <div className="divider-gold" aria-hidden="true" style={{ justifyContent: 'center', margin: '24px auto', maxWidth: '200px' }}>
            <span className="ornament" style={{ fontSize: '1.5em' }}>
              ◆
            </span>
          </div>

          <h2
            id="cta-heading"
            style={{
              fontFamily: S.displayFont,
              fontSize: 'clamp(3rem, 7vw, 6rem)',
              fontWeight: 300,
              color: 'var(--off-white)',
              lineHeight: 1.1,
              marginBottom: '8px',
            }}
          >
            Your story starts
          </h2>
          <h2
            className="shimmer-text"
            style={{
              fontFamily: S.displayFont,
              fontSize: 'clamp(3rem, 7vw, 6rem)',
              fontWeight: 500,
              fontStyle: 'italic',
              lineHeight: 1.1,
              marginBottom: '44px',
            }}
          >
            with intention.
          </h2>

          <p style={{ ...S.textMuted, fontSize: '1rem', maxWidth: '460px', margin: '0 auto 52px' }}>
            Join intentional singles who chose a premium matchmaking experience over swipe culture.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/register"
              className="btn btn-gold"
              style={{ minWidth: '220px', padding: '18px 48px', fontSize: '0.84rem', animation: 'goldPulse 3s ease-in-out infinite' }}
            >
              Create Your Profile
            </Link>
            <Link href="/pricing" className="btn btn-outline" style={{ minWidth: '160px' }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}