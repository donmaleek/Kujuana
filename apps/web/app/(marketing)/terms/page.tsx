import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Kujuana',
  description: 'Kujuana Terms of Service',
}

export default function TermsPage() {
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
        Terms of Service
      </h1>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '14px' }}>
        By using Kujuana, you agree to provide accurate information, respect other members, and
        use the platform only for lawful and genuine relationship purposes.
      </p>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '14px' }}>
        You are responsible for the security of your account credentials and for activity under
        your account. Kujuana may suspend accounts that violate safety, privacy, or conduct rules.
      </p>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
        Paid subscriptions and add-ons follow the pricing and billing terms displayed at checkout.
        Continued use of the service after updates means you accept the revised terms.
      </p>
    </main>
  )
}
