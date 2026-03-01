import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers | Kujuana',
  description: 'Join the Kujuana team',
}

export default function CareersPage() {
  return (
    <main style={{ padding: '120px 24px 80px', maxWidth: '960px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--off-white)', marginBottom: '20px' }}>
        Careers
      </h1>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '14px' }}>
        We are building a premium matchmaking platform for intentional relationships across Africa and the diaspora.
      </p>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
        Interested in product, engineering, community, or operations roles? Reach us at <a href="mailto:careers@kujuana.com" style={{ color: 'var(--gold-champagne)' }}>careers@kujuana.com</a>.
      </p>
    </main>
  )
}
