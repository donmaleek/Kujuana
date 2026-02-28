// ─────────────────────────────────────────────────────────────────────
// ONBOARDING COMPLETE PAGE (LUXURY)
// Path: kujuana/apps/web/app/(onboarding)/complete/page.tsx
// ─────────────────────────────────────────────────────────────────────

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function CompletePage() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--grad-hero)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Background effects */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            `repeating-linear-gradient(-45deg, rgba(212,175,55,0.02) 0px, rgba(212,175,55,0.02) 1px, transparent 1px, transparent 72px)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating orbs */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(74,22,99,0.30) 0%, transparent 70%)',
          top: '-110px',
          right: '-110px',
          animation: 'float 10s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(74,22,99,0.25) 0%, transparent 70%)',
          bottom: '-90px',
          left: '-90px',
          animation: 'float 14s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }}
      />

      {/* Art Deco top/bottom lines */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '160px',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, var(--gold-primary), transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '160px',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, var(--gold-primary), transparent)',
        }}
      />

      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          position: 'relative',
          zIndex: 1,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.9s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            marginBottom: '36px',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Image
            src="/brand/logo.png"
            alt="Kujuana logo"
            width={60}
            height={60}
            priority
            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
          />
          <div
            style={{
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: '1.6rem',
              fontWeight: 500,
              letterSpacing: '0.14em',
              background: 'var(--grad-gold)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textTransform: 'uppercase',
              display: 'inline-block',
            }}
          >
            Kujuana
          </div>
        </div>

        {/* Success medallion */}
        <div
          style={{
            width: '100px',
            height: '100px',
            border: '1.5px solid rgba(212,175,55,0.4)',
            background: 'rgba(212,175,55,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 36px',
            position: 'relative',
            animation: 'goldPulse 3s ease-in-out infinite',
            boxShadow: '0 0 0 1px rgba(212,175,55,0.08), 0 18px 60px rgba(0,0,0,0.35)',
          }}
        >
          {/* Outer decorative corners */}
          {[['0', '0'], ['0', 'auto'], ['auto', '0'], ['auto', 'auto']].map(([t, r], i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '12px',
                height: '12px',
                top: t === '0' ? '-1px' : 'auto',
                bottom: t === 'auto' ? '-1px' : 'auto',
                left: r === '0' ? '-1px' : 'auto',
                right: r === 'auto' ? '-1px' : 'auto',
                borderTop: t === '0' ? '2px solid var(--gold-primary)' : 'none',
                borderBottom: t === 'auto' ? '2px solid var(--gold-primary)' : 'none',
                borderLeft: r === '0' ? '2px solid var(--gold-primary)' : 'none',
                borderRight: r === 'auto' ? '2px solid var(--gold-primary)' : 'none',
              }}
            />
          ))}

          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path
              d="M8 22l9 9 19-19"
              stroke="url(#goldCheck)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="goldCheck" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E8D27C" />
                <stop offset="100%" stopColor="#C9A227" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            fontFamily: 'var(--font-jost, ui-sans-serif)',
            fontSize: '0.64rem',
            fontWeight: 500,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--gold-champagne)',
            marginBottom: '16px',
          }}
        >
          Profile Complete
        </div>

        {/* Main heading */}
        <h1
          style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: 'clamp(2.6rem, 5vw, 4rem)',
            fontWeight: 300,
            color: 'var(--off-white)',
            lineHeight: 1.1,
            marginBottom: '8px',
          }}
        >
          Your journey
        </h1>
        <h1
          className="shimmer-text"
          style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: 'clamp(2.6rem, 5vw, 4rem)',
            fontWeight: 500,
            fontStyle: 'italic',
            lineHeight: 1.1,
            marginBottom: '32px',
            background: 'var(--grad-gold)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          begins now.
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-jost, ui-sans-serif)',
            fontSize: '1rem',
            color: 'var(--text-muted, rgba(255,255,255,0.68))',
            lineHeight: 1.85,
            marginBottom: '40px',
          }}
        >
          Your profile has been submitted and is now in the matching queue. You’ll receive your first match notification by email within 24 hours.
        </p>

        {/* What happens next */}
        <div
          style={{
            background: 'rgba(42,8,56,0.60)',
            border: '1px solid rgba(212,175,55,0.12)',
            padding: '28px 32px',
            marginBottom: '36px',
            textAlign: 'left',
            boxShadow: '0 18px 60px rgba(0,0,0,0.30)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-jost, ui-sans-serif)',
              fontSize: '0.68rem',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--gold-champagne)',
              marginBottom: '18px',
            }}
          >
            What happens next
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { time: 'Today', event: 'Profile activated and enters matching queue' },
              { time: 'Within 24h', event: 'First match processed and email sent' },
              { time: 'Ongoing', event: 'New matches delivered based on your tier' },
            ].map(({ time, event }) => (
              <div key={time} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-jost, ui-sans-serif)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.08em',
                    color: 'var(--gold-primary)',
                    minWidth: '80px',
                    flexShrink: 0,
                    paddingTop: '1px',
                  }}
                >
                  {time}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-jost, ui-sans-serif)',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted, rgba(255,255,255,0.68))',
                    lineHeight: 1.5,
                  }}
                >
                  {event}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link
            href="/dashboard"
            className="btn btn-gold"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px 40px',
              borderRadius: '14px',
              border: '1px solid rgba(212,175,55,0.25)',
              background: 'rgba(212,175,55,0.12)',
              color: 'rgba(245,230,179,0.95)',
              textDecoration: 'none',
              boxShadow: '0 18px 60px rgba(0,0,0,0.35)',
            }}
          >
            Go to Your Dashboard
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <Link
            href="/subscription"
            className="btn btn-outline"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '14px 40px',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(0,0,0,0.10)',
              color: 'rgba(255,255,255,0.80)',
              textDecoration: 'none',
            }}
          >
            View My Subscription
          </Link>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: '1rem',
            fontStyle: 'italic',
            color: 'rgba(196,168,130,0.42)',
            marginTop: '36px',
            lineHeight: 1.6,
          }}
        >
          “kujuana — to know each other”
        </p>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(14px); }
          100% { transform: translateY(0px); }
        }

        @keyframes goldPulse {
          0%   { box-shadow: 0 0 0 1px rgba(212,175,55,0.08), 0 18px 60px rgba(0,0,0,0.35); }
          50%  { box-shadow: 0 0 0 1px rgba(212,175,55,0.14), 0 0 44px rgba(212,175,55,0.14), 0 18px 60px rgba(0,0,0,0.35); }
          100% { box-shadow: 0 0 0 1px rgba(212,175,55,0.08), 0 18px 60px rgba(0,0,0,0.35); }
        }

        .shimmer-text {
          position: relative;
        }
        .shimmer-text:after {
          content: '';
          position: absolute;
          inset: -6px -10px;
          background: linear-gradient(90deg, transparent, rgba(245,230,179,0.20), transparent);
          transform: translateX(-120%);
          animation: shimmer 2.8s ease-in-out infinite;
          pointer-events: none;
          mix-blend-mode: screen;
        }
        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          55% { transform: translateX(120%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </div>
  )
}
