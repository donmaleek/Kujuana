// kujuana/apps/web/app/(auth)/_shared.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ─── AuthCard ────────────────────────────────────────────────────────────────
export function AuthCard({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--grad-hero)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Art Deco diagonal lines */}
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
      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(212,175,55,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      {/* Orbs */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(74,22,99,0.4) 0%, transparent 70%)',
          top: '-200px',
          right: '-200px',
          animation: 'float 12s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(74,22,99,0.3) 0%, transparent 70%)',
          bottom: '-100px',
          left: '-100px',
          animation: 'float 15s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }}
      />

      {/* Back to home */}
      <Link
        href="/"
        style={{
          position: 'absolute',
          top: '20px',
          left: '24px',
          zIndex: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-jost, sans-serif)',
          fontSize: '0.8rem',
          color: 'rgba(196,168,130,0.6)',
          textDecoration: 'none',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-champagne)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(196,168,130,0.6)')}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Home
      </Link>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background:
            'linear-gradient(145deg, rgba(74,22,99,0.4) 0%, rgba(24,2,31,0.95) 100%)',
          border: '1px solid rgba(212,175,55,0.2)',
          boxShadow:
            '0 30px 80px rgba(24,2,31,0.7), 0 0 60px rgba(212,175,55,0.06)',
          backdropFilter: 'blur(20px)',
          padding: 'clamp(40px, 6vw, 64px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Gold top bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'var(--grad-gold)',
          }}
        />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <Image
              src="/brand/logo.png"
              alt="Kujuana logo"
              width={56}
              height={56}
              priority
              style={{ width: '56px', height: '56px', objectFit: 'contain' }}
            />
            <div
              style={{
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: '1.8rem',
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
          </Link>

          <h1
            style={{
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: 'clamp(1.7rem, 3vw, 2.1rem)',
              fontWeight: 400,
              color: 'var(--off-white)',
              marginTop: '20px',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--text-muted)',
                marginTop: '10px',
                fontFamily: 'var(--font-jost)',
                lineHeight: 1.7,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(16px); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

// ─── InputField ───────────────────────────────────────────────────────────────
export type InputFieldProps = {
  label: string
  type?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string
  hint?: string
  required?: boolean
  autoComplete?: string
}

export function InputField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  hint,
  required,
  autoComplete,
}: InputFieldProps) {
  const [focused, setFocused] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPass ? 'text' : 'password') : type

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        htmlFor={name}
        style={{
          fontFamily: 'var(--font-jost, sans-serif)',
          fontSize: '0.7rem',
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: error
            ? '#e88080'
            : focused
            ? 'var(--gold-champagne)'
            : 'var(--text-muted)',
          transition: 'color 0.3s',
        }}
      >
        {label}
        {required && (
          <span style={{ color: 'var(--gold-primary)', marginLeft: '4px' }}>
            *
          </span>
        )}
      </label>

      <div style={{ position: 'relative' }}>
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            background: 'rgba(24, 2, 31, 0.6)',
            border: `1px solid ${
              error
                ? 'rgba(232,128,128,0.5)'
                : focused
                ? 'rgba(212,175,55,0.6)'
                : 'rgba(212,175,55,0.15)'
            }`,
            color: 'var(--text-body)',
            padding: isPassword ? '14px 48px 14px 18px' : '14px 18px',
            fontSize: '0.92rem',
            fontFamily: 'var(--font-jost, sans-serif)',
            fontWeight: 300,
            letterSpacing: '0.02em',
            outline: 'none',
            transition: 'all 0.3s',
            boxShadow:
              focused && !error
                ? '0 0 0 3px rgba(212,175,55,0.08), inset 0 1px 3px rgba(0,0,0,0.3)'
                : 'inset 0 1px 3px rgba(0,0,0,0.3)',
            borderRadius: 0,
            boxSizing: 'border-box',
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

      {error && (
        <p
          style={{
            fontSize: '0.76rem',
            color: '#e88080',
            fontFamily: 'var(--font-jost)',
            letterSpacing: '0.02em',
          }}
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p
          style={{
            fontSize: '0.74rem',
            color: 'rgba(196,168,130,0.5)',
            fontFamily: 'var(--font-jost)',
            lineHeight: 1.5,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  )
}

// ─── FormError ────────────────────────────────────────────────────────────────
export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div
      style={{
        background: 'rgba(232,128,128,0.08)',
        border: '1px solid rgba(232,128,128,0.25)',
        padding: '14px 18px',
        marginBottom: '24px',
        fontFamily: 'var(--font-jost)',
        fontSize: '0.84rem',
        color: '#e88080',
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  )
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
export function StyledCheckbox({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          cursor: 'pointer',
        }}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={Boolean(error)}
          style={{
            width: '18px',
            height: '18px',
            margin: '1px 0 0',
            flexShrink: 0,
            cursor: 'pointer',
            accentColor: '#D4AF37',
          }}
        />
        <span
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-jost)',
            lineHeight: 1.6,
          }}
        >
          {children}
        </span>
      </label>
      {error && (
        <p
          style={{
            fontSize: '0.74rem',
            color: '#e88080',
            marginTop: '6px',
            fontFamily: 'var(--font-jost)',
            marginLeft: '30px',
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
