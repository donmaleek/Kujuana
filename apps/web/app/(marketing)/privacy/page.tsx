import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Kujuana',
  description: 'Kujuana Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <main style={{ padding: '120px 24px 80px', maxWidth: '960px', margin: '0 auto' }}>
      <h1
        style={{
          fontFamily: 'var(--font-cormorant, serif)',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: 'var(--off-white)',
          marginBottom: '20px',
        }}
      >
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '14px' }}>
        Kujuana collects account, profile, and usage data required to deliver matchmaking,
        security, billing, and support services.
      </p>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '14px' }}>
        We do not sell personal data. Information is processed for platform operations, fraud
        prevention, legal compliance, and service improvements.
      </p>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
        You can request account updates or deletion through support channels. Continued use means
        you accept this policy and future updates.
      </p>
    </main>
  )
}
