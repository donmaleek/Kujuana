'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useId } from 'react'

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const mobileNavId = useId()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Trap scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = [
    { href: '/pricing', label: 'Pricing' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/#about', label: 'About' },
  ]

  // Active only for real routes (not hash anchors)
  const isActive = (href: string) =>
    !href.includes('#') && pathname === href

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        background: scrolled
          ? 'rgba(24, 2, 31, 0.92)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(212, 175, 55, 0.12)' : 'none',
        boxShadow: scrolled ? '0 4px 40px rgba(24, 2, 31, 0.4)' : 'none',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '80px',
        }}
      >
        {/* ── Logo ─────────────────────────────────────── */}
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
          aria-label="Kujuana — home"
        >
          <Image
            src="/brand/logo.png"
            alt="Kujuana logo"
            width={36}
            height={36}
            priority
            style={{ width: '36px', height: '36px', objectFit: 'contain' }}
          />

          <span
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: '1.55rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              background: 'var(--grad-gold)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textTransform: 'uppercase',
            }}
          >
            Kujuana
          </span>
        </Link>

        {/* ── Desktop Nav ──────────────────────────────── */}
        <nav
          className="hide-mobile"
          aria-label="Main navigation"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: 'var(--font-jost), sans-serif',
                fontSize: '0.78rem',
                fontWeight: 400,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: isActive(href) ? 'var(--gold-champagne)' : 'var(--text-muted)',
                textDecoration: 'none',
                padding: '8px 18px',
                transition: 'color 0.3s',
              }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLElement).style.color = 'var(--gold-champagne)')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLElement).style.color = isActive(href)
                  ? 'var(--gold-champagne)'
                  : 'var(--text-muted)')
              }
            >
              {label}
            </Link>
          ))}

          <div
            aria-hidden="true"
            style={{
              width: '1px',
              height: '20px',
              background: 'rgba(212,175,55,0.2)',
              margin: '0 8px',
            }}
          />

          <Link href="/login" className="btn btn-ghost" style={{ padding: '10px 20px' }}>
            Sign In
          </Link>
          <Link href="/register" className="btn btn-gold" style={{ padding: '11px 28px' }}>
            Begin Journey
          </Link>
        </nav>

        {/* ── Mobile Hamburger ─────────────────────────── */}
        {/*
          NOTE: visibility is controlled by globals.css (.show-mobile / .hide-mobile).
          No inline display style here so CSS can govern responsiveness correctly.
        */}
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="show-mobile"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls={mobileNavId}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--gold-champagne)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {menuOpen ? (
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ) : (
              <>
                <rect x="3" y="6"    width="18" height="1.5" fill="currentColor" />
                <rect x="7" y="11.25" width="14" height="1.5" fill="currentColor" />
                <rect x="3" y="16.5" width="18" height="1.5" fill="currentColor" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* ── Mobile Menu ──────────────────────────────── */}
      {menuOpen && (
        <div
          id={mobileNavId}
          role="navigation"
          aria-label="Mobile navigation"
          style={{
            background: 'rgba(24, 2, 31, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(212, 175, 55, 0.12)',
            padding: '24px 0 32px',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <div
            className="container"
            style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: 'var(--font-jost), sans-serif',
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: isActive(href) ? 'var(--gold-champagne)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(212,175,55,0.08)',
                  display: 'block',
                }}
              >
                {label}
              </Link>
            ))}

            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <Link
                href="/login"
                className="btn btn-outline"
                style={{ textAlign: 'center', width: '100%' }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-gold"
                style={{ textAlign: 'center', width: '100%' }}
              >
                Begin Your Journey
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  const year = new Date().getFullYear()

  const footerLinks: Record<string, { label: string; href: string }[]> = {
    Platform: [
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Download App', href: '/#app' },
    ],
    Company: [
      { label: 'About Us', href: '/#about' },
      { label: 'Our Story', href: '/#story' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
    ],
    Support: [
      { label: 'Help Centre', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Safety Tips', href: '/safety' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  }

  const socials = ['Instagram', 'Twitter', 'LinkedIn'] as const

  return (
    <footer
      style={{
        background: 'var(--purple-deepest)',
        borderTop: '1px solid rgba(212, 175, 55, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative top border */}
      <div
        aria-hidden="true"
        style={{
          height: '2px',
          background:
            'linear-gradient(90deg, transparent, var(--gold-primary), var(--gold-champagne), var(--gold-primary), transparent)',
        }}
      />

      {/* Background orb */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(74,22,99,0.3) 0%, transparent 70%)',
          left: '-200px',
          bottom: '-200px',
          pointerEvents: 'none',
        }}
      />

      <div className="container">
        {/* Top grid section — columns defined in globals.css .footer-grid */}
        <div className="footer-grid">
          {/* Brand column */}
          <div>
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}
              aria-label="Kujuana — home"
            >
              <Image
                src="/brand/logo.png"
                alt="Kujuana logo"
                width={42}
                height={42}
                style={{ width: '42px', height: '42px', objectFit: 'contain' }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: '1.8rem',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  background: 'var(--grad-gold)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textTransform: 'uppercase',
                }}
              >
                Kujuana
              </span>
            </Link>

            <p
              style={{
                fontSize: '0.88rem',
                lineHeight: 1.8,
                color: 'var(--text-muted)',
                marginBottom: '28px',
                maxWidth: '240px',
              }}
            >
              Premium curated matchmaking for Kenya and the global diaspora.
              Dating with intention.
            </p>

            {/* Social links */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {socials.map((s) => (
                <a
                  key={s}
                  href={`https://${s.toLowerCase()}.com/kujuana`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Kujuana on ${s}`}
                  style={{
                    width: '38px',
                    height: '38px',
                    border: '1px solid rgba(212,175,55,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.72rem',
                    letterSpacing: '0.05em',
                    fontFamily: 'var(--font-jost)',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--gold-primary)'
                    el.style.color = 'var(--gold-champagne)'
                    el.style.background = 'rgba(212,175,55,0.08)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'rgba(212,175,55,0.2)'
                    el.style.color = 'var(--text-muted)'
                    el.style.background = 'transparent'
                  }}
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p
                style={{
                  fontFamily: 'var(--font-jost)',
                  fontSize: '0.68rem',
                  fontWeight: 500,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--gold-champagne)',
                  marginBottom: '20px',
                }}
              >
                {title}
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      style={{
                        fontSize: '0.86rem',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        transition: 'color 0.3s',
                      }}
                      onMouseEnter={e =>
                        ((e.currentTarget as HTMLElement).style.color =
                          'var(--gold-champagne)')
                      }
                      onMouseLeave={e =>
                        ((e.currentTarget as HTMLElement).style.color =
                          'var(--text-muted)')
                      }
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(212, 175, 55, 0.1)',
            padding: '24px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p
            style={{
              fontSize: '0.78rem',
              color: 'rgba(196, 168, 130, 0.5)',
              fontFamily: 'var(--font-jost)',
            }}
          >
            © {year} Kujuana Ltd. All rights reserved. Built with ❤️ in Nairobi,
            Kenya.
          </p>
          <p
            style={{
              fontSize: '0.72rem',
              color: 'rgba(196, 168, 130, 0.4)',
              fontFamily: 'var(--font-jost)',
              letterSpacing: '0.1em',
            }}
          >
            kujuana — <em>to know each other</em>
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────
   MARKETING LAYOUT
───────────────────────────────────────────── */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>{children}</main>
      <Footer />
    </>
  )
}
