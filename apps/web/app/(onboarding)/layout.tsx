// kujuana/apps/web/app/(onboarding)/layout.tsx
import Link from 'next/link'
import Image from 'next/image'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--grad-hero)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            rgba(212,175,55,0.02) 0px,
            rgba(212,175,55,0.02) 1px,
            transparent 1px,
            transparent 72px
          )`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(212,175,55,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '28px 18px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '18px',
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Image
              src="/brand/logo.png"
              alt="Kujuana logo"
              width={38}
              height={38}
              priority
              style={{ width: '38px', height: '38px', objectFit: 'contain' }}
            />
            <div
              style={{
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: '1.4rem',
                fontWeight: 500,
                letterSpacing: '0.14em',
                background: 'var(--grad-gold)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textTransform: 'uppercase',
              }}
            >
              Kujuana
            </div>
          </Link>

          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-jost)',
              fontSize: '0.78rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(196,168,130,0.55)',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(212,175,55,0.15)',
              paddingBottom: '2px',
            }}
          >
            Exit
          </Link>
        </div>

        <div
          style={{
            background:
              'linear-gradient(145deg, rgba(74,22,99,0.35) 0%, rgba(24,2,31,0.92) 100%)',
            border: '1px solid rgba(212,175,55,0.18)',
            boxShadow:
              '0 30px 80px rgba(24,2,31,0.65), 0 0 60px rgba(212,175,55,0.05)',
            backdropFilter: 'blur(18px)',
            padding: 'clamp(22px, 4vw, 34px)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
