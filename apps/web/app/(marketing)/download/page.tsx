'use client'

import type { Metadata } from 'next'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// Set this env var in production to point to your hosted APK file
// e.g. NEXT_PUBLIC_APK_URL=https://kujuana.com/downloads/kujuana.apk
const APK_URL =
  process.env.NEXT_PUBLIC_APK_URL || 'https://kujuana.com/downloads/kujuana.apk'

const S = {
  display: 'var(--font-cormorant), Georgia, serif',
  body: 'var(--font-jost), system-ui, sans-serif',
  gold: {
    background: 'var(--grad-gold)',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
    backgroundClip: 'text' as const,
  } as React.CSSProperties,
}

const ANDROID_STEPS = [
  {
    step: '1',
    title: 'Download the APK',
    desc: 'Tap the button above to download Kujuana.apk to your Android device.',
  },
  {
    step: '2',
    title: 'Allow unknown sources',
    desc: 'Go to Settings → Security (or Apps) → Install unknown apps → allow your browser or Files app to install.',
  },
  {
    step: '3',
    title: 'Open the downloaded file',
    desc: 'Tap the downloaded APK in your notification bar or Files app and follow the install prompt.',
  },
  {
    step: '4',
    title: 'Launch Kujuana',
    desc: 'Open the app, log in with your Kujuana account, and start matching.',
  },
]

export default function DownloadPage() {
  const [platform, setPlatform] = useState<'android' | 'ios' | 'other'>('other')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (/android/.test(ua)) setPlatform('android')
    else if (/iphone|ipad|ipod/.test(ua)) setPlatform('ios')
  }, [])

  function handleCopyLink() {
    navigator.clipboard.writeText(APK_URL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // QR code via api.qrserver.com — no library needed, pure img tag
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(APK_URL)}&bgcolor=18021F&color=E8D27C&margin=12`

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="grain"
        style={{
          background: 'var(--grad-hero)',
          padding: 'clamp(80px, 10vw, 130px) 0 clamp(60px, 8vw, 100px)',
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
            background: 'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.07) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow animate-fade-up">Mobile App</span>

          <h1
            className="animate-fade-up delay-2"
            style={{
              fontFamily: S.display,
              fontSize: 'clamp(2.6rem, 6vw, 5rem)',
              fontWeight: 300,
              lineHeight: 1.1,
              color: 'var(--off-white)',
              marginBottom: '8px',
              marginTop: '20px',
            }}
          >
            Kujuana on your
          </h1>
          <h1
            className="animate-fade-up delay-3 shimmer-text"
            style={{
              fontFamily: S.display,
              fontSize: 'clamp(2.6rem, 6vw, 5rem)',
              fontWeight: 500,
              fontStyle: 'italic',
              lineHeight: 1.1,
              marginBottom: '36px',
            }}
          >
            phone
          </h1>

          <p
            className="animate-fade-up delay-4"
            style={{
              fontSize: '1rem',
              color: 'var(--text-muted)',
              maxWidth: '440px',
              margin: '0 auto 48px',
              lineHeight: 1.85,
              fontFamily: S.body,
            }}
          >
            Download the Kujuana app for Android. Browse your matches, respond to introductions, and manage your membership — all from your phone.
          </p>

          {/* Platform-aware CTA */}
          {platform === 'ios' ? (
            <div
              style={{
                display: 'inline-block',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '14px',
                padding: '20px 32px',
                background: 'rgba(212,175,55,0.06)',
                fontFamily: S.body,
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                maxWidth: '360px',
              }}
            >
              <span style={{ color: 'var(--gold-champagne)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                iOS coming soon
              </span>
              The iOS version is in review. Join the web app now while you wait.
              <br />
              <Link href="/register" style={{ color: 'var(--gold-primary)', textDecoration: 'underline', marginTop: '12px', display: 'inline-block' }}>
                Use web app →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <a
                href={APK_URL}
                download="kujuana.apk"
                className="btn btn-gold"
                style={{ padding: '18px 52px', fontSize: '1.05rem', minWidth: '240px', textAlign: 'center' }}
              >
                ↓ Download for Android
              </a>

              <p style={{ fontFamily: S.body, fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Android 8.0+ · Free download · {/* approx size, update when built */}~30 MB
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── QR + Copy Link ── */}
      <section
        style={{
          background: 'var(--purple-dark)',
          padding: 'clamp(60px, 8vw, 100px) 0',
          borderTop: '1px solid rgba(212,175,55,0.08)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '40px',
            alignItems: 'center',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          {/* QR code */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '16px',
                borderRadius: '18px',
                border: '1px solid rgba(212,175,55,0.25)',
                background: '#18021F',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc}
                alt="QR code to download Kujuana APK"
                width={200}
                height={200}
                style={{ borderRadius: '8px', display: 'block' }}
              />
            </div>
            <p
              style={{
                fontFamily: S.body,
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                marginTop: '14px',
              }}
            >
              Scan with your Android camera to download
            </p>
          </div>

          {/* Share / copy link */}
          <div>
            <span
              style={{
                fontFamily: S.body,
                fontSize: '0.66rem',
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--gold-champagne)',
                display: 'block',
                marginBottom: '14px',
              }}
            >
              Share the link
            </span>

            <p
              style={{
                fontFamily: S.display,
                fontSize: '1.4rem',
                fontWeight: 300,
                color: 'var(--off-white)',
                lineHeight: 1.4,
                marginBottom: '24px',
              }}
            >
              Send the download link to your phone or share it with someone.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(212,175,55,0.18)',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '12px',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  fontFamily: S.body,
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {APK_URL}
              </span>
            </div>

            <button
              onClick={handleCopyLink}
              className="btn btn-outline"
              style={{ fontSize: '0.84rem' }}
            >
              {copied ? '✓ Copied!' : 'Copy download link'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Install steps ── */}
      <section
        style={{
          background: 'var(--purple-royal)',
          padding: 'clamp(60px, 8vw, 100px) 0',
          borderTop: '1px solid rgba(212,175,55,0.08)',
          borderBottom: '1px solid rgba(212,175,55,0.08)',
        }}
        aria-labelledby="install-heading"
      >
        <div className="container" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="eyebrow">Install Guide</span>
            <h2
              id="install-heading"
              className="display-md"
              style={{ color: 'var(--off-white)', marginTop: '16px' }}
            >
              Four steps to install
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {ANDROID_STEPS.map((s) => (
              <div
                key={s.step}
                className="card-luxury"
                style={{ padding: '28px 32px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '1px solid rgba(212,175,55,0.35)',
                    background: 'rgba(212,175,55,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: S.display,
                    fontSize: '1.1rem',
                    color: 'var(--gold-champagne)',
                  }}
                >
                  {s.step}
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: S.body,
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: 'var(--off-white)',
                      marginBottom: '6px',
                    }}
                  >
                    {s.title}
                  </p>
                  <p style={{ fontFamily: S.body, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p
            style={{
              textAlign: 'center',
              marginTop: '28px',
              fontFamily: S.body,
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}
          >
            "Install unknown apps" is a standard Android feature. Kujuana is safe and open to inspection.
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="grain"
        style={{
          background: 'var(--purple-deepest)',
          padding: 'clamp(80px, 10vw, 120px) 0',
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
            background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2
            style={{
              fontFamily: S.display,
              fontSize: 'clamp(2rem, 5vw, 3.8rem)',
              fontWeight: 300,
              color: 'var(--off-white)',
              marginBottom: '32px',
              lineHeight: 1.2,
            }}
          >
            Don't have an account yet?
          </h2>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-gold" style={{ minWidth: '200px', padding: '16px 44px' }}>
              Create Your Profile
            </Link>
            <a
              href={APK_URL}
              download="kujuana.apk"
              className="btn btn-outline"
            >
              ↓ Download APK
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
