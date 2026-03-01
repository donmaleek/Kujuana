import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileText, Scale, ShieldAlert, UserCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Kujuana',
  description: 'Comprehensive Terms of Service governing use of Kujuana products and services',
}

const LAST_UPDATED = 'March 1, 2026'

type TermsSection = {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

const HIGHLIGHTS = [
  {
    title: 'Respect and safety are mandatory',
    body: 'Harassment, fraud, abuse, impersonation, and coercive behavior are prohibited.',
    icon: ShieldAlert,
  },
  {
    title: 'Members must provide accurate details',
    body: 'You are responsible for truthful account data and lawful use of the platform.',
    icon: UserCheck,
  },
  {
    title: 'Clear subscription and billing rules',
    body: 'Paid services, renewals, and cancellations follow disclosed checkout terms.',
    icon: Scale,
  },
] as const

const SECTIONS: TermsSection[] = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    paragraphs: [
      'These Terms of Service (“Terms”) govern your access to and use of Kujuana websites, mobile applications, and related services (collectively, the “Services”).',
      'By creating an account, browsing, or using the Services, you agree to these Terms and our Privacy Policy and Cookie Policy.',
    ],
  },
  {
    id: 'eligibility',
    title: '2. Eligibility and Account Registration',
    paragraphs: ['To use Kujuana, you must be legally eligible to use dating services in your jurisdiction and able to form a binding agreement.'],
    bullets: [
      'You must provide accurate, current, and complete registration information.',
      'You are responsible for maintaining account security, including password confidentiality.',
      'You are responsible for activity occurring under your account unless you report unauthorized access promptly.',
    ],
  },
  {
    id: 'service-purpose',
    title: '3. Purpose of the Service',
    paragraphs: [
      'Kujuana is designed for intentional relationship discovery and compatibility-driven introductions.',
      'We do not guarantee relationship outcomes, compatibility certainty, or uninterrupted platform availability.',
    ],
  },
  {
    id: 'member-conduct',
    title: '4. Member Conduct Standards',
    paragraphs: ['You agree to engage respectfully and lawfully. The following conduct is prohibited:'],
    bullets: [
      'Harassment, hate speech, threats, intimidation, discrimination, or sexual coercion.',
      'Impersonation, identity fraud, catfishing, or misrepresentation of personal details.',
      'Spam, scams, phishing, social engineering, or requests for money and financial credentials.',
      'Uploading unlawful, infringing, defamatory, or sexually exploitative content.',
      'Attempting to bypass safety systems, account restrictions, or security controls.',
    ],
  },
  {
    id: 'content',
    title: '5. Content and Licensing',
    paragraphs: [
      'You retain ownership of content you submit (such as photos, bio text, and profile prompts). You grant Kujuana a limited license to host, process, and display your content as necessary to operate and improve the Services.',
      'You represent that you have the rights required to submit content and that your content does not violate any law or third-party rights.',
    ],
  },
  {
    id: 'moderation',
    title: '6. Moderation, Enforcement, and Account Actions',
    paragraphs: [
      'Kujuana may investigate policy violations, suspend features, remove content, or terminate accounts when safety, trust, legal compliance, or platform integrity requires action.',
      'Where appropriate, we may request identity or account verification information before restoring access.',
    ],
  },
  {
    id: 'subscriptions',
    title: '7. Subscriptions, Billing, and Renewals',
    paragraphs: ['Some features require paid plans, credits, or add-ons. By purchasing, you agree to applicable pricing and billing terms displayed at checkout.'],
    bullets: [
      'Recurring subscriptions renew automatically unless canceled before the renewal date.',
      'You authorize billing via your selected payment method through our payment partners.',
      'Pricing, plan structure, and feature availability may change with notice where required by law.',
      'Taxes, currency handling, and payment provider terms may apply based on your location.',
    ],
  },
  {
    id: 'cancellation',
    title: '8. Cancellation and Refunds',
    paragraphs: [
      'You may cancel renewal at any time through account settings or payment platform controls. Cancellation typically applies to future billing cycles.',
      'Refund eligibility, if any, depends on applicable law, platform billing channel, and the specific plan terms shown at purchase time.',
    ],
  },
  {
    id: 'ip',
    title: '9. Intellectual Property',
    paragraphs: [
      'Kujuana brand assets, software, design, and service content are protected by intellectual property law and remain the property of Kujuana or its licensors.',
      'Except where explicitly permitted, you may not reproduce, distribute, reverse engineer, or create derivative works from the Services.',
    ],
  },
  {
    id: 'disclaimer',
    title: '10. Service Disclaimer',
    paragraphs: [
      'To the extent permitted by law, Services are provided on an “as is” and “as available” basis. We disclaim warranties of uninterrupted operation, error-free performance, or guaranteed outcomes.',
      'You are solely responsible for your interactions with other members and your decisions on or off the platform.',
    ],
  },
  {
    id: 'liability',
    title: '11. Limitation of Liability',
    paragraphs: [
      'To the maximum extent permitted by law, Kujuana and its affiliates are not liable for indirect, incidental, consequential, special, or punitive damages arising from use of the Services.',
      'Where liability cannot be excluded, it is limited to the amount paid by you to Kujuana for paid Services in the twelve months preceding the claim, unless a different limit is required by law.',
    ],
  },
  {
    id: 'indemnity',
    title: '12. Indemnification',
    paragraphs: [
      'You agree to defend and indemnify Kujuana against claims, liabilities, losses, and costs arising from your misuse of the Services, violation of these Terms, or infringement of rights.',
    ],
  },
  {
    id: 'termination',
    title: '13. Termination',
    paragraphs: [
      'You may stop using the Services at any time. We may suspend or terminate access for safety, policy, or legal reasons.',
      'Sections that by nature should survive termination (including legal rights, limitations, and dispute provisions) remain in effect.',
    ],
  },
  {
    id: 'changes',
    title: '14. Changes to Terms',
    paragraphs: [
      'We may update these Terms periodically. Material updates may be communicated via in-product notices, email, or account notifications.',
      'Continued use of Services after the effective date of updated Terms constitutes acceptance of the revised Terms.',
    ],
  },
  {
    id: 'contact',
    title: '15. Contact Information',
    paragraphs: [
      'For Terms questions, legal requests, or dispute notices, contact support@kujuana.com with the subject line “Terms Inquiry”.',
    ],
  },
]

export default function TermsPage() {
  return (
    <main style={{ padding: '112px 20px 84px' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'grid', gap: '22px' }}>
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '28px',
            border: '1px solid rgba(212,175,55,0.22)',
            background:
              'radial-gradient(125% 155% at 0% 0%, rgba(212,175,55,0.14) 0%, rgba(74,22,99,0.70) 44%, rgba(13,10,20,0.94) 100%)',
            padding: '30px clamp(20px, 4vw, 38px)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '230px',
              height: '230px',
              borderRadius: '999px',
              right: '-60px',
              top: '-75px',
              background: 'radial-gradient(circle, rgba(212,175,55,0.22), transparent 72%)',
            }}
          />

          <div style={{ position: 'relative', display: 'grid', gap: '14px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} color="var(--gold-champagne)" />
              <span
                style={{
                  fontSize: '0.74rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,230,179,0.90)',
                }}
              >
                Legal Terms and Platform Rules
              </span>
            </div>

            <h1
              style={{
                margin: 0,
                color: 'var(--off-white)',
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: 'clamp(2.4rem, 5vw, 4.1rem)',
                lineHeight: 1.02,
              }}
            >
              Terms of Service
            </h1>

            <p
              style={{
                margin: 0,
                color: 'rgba(237,224,196,0.84)',
                lineHeight: 1.75,
                maxWidth: '780px',
                fontSize: '1.02rem',
              }}
            >
              These Terms define how Kujuana Services may be used, the standards expected of members, and key billing,
              account, and legal provisions.
            </p>

            <p style={{ margin: 0, color: 'var(--gold-champagne)', fontSize: '0.84rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon
            return (
              <article
                key={item.title}
                style={{
                  border: '1px solid rgba(212,175,55,0.16)',
                  borderRadius: '20px',
                  background: 'linear-gradient(165deg, rgba(32,10,43,0.82), rgba(14,10,22,0.88))',
                  padding: '16px',
                  display: 'grid',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '999px',
                    border: '1px solid rgba(212,175,55,0.28)',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(212,175,55,0.12)',
                  }}
                >
                  <Icon size={17} color="var(--gold-champagne)" />
                </div>
                <h2
                  style={{
                    margin: 0,
                    color: 'var(--off-white)',
                    fontFamily: 'var(--font-cormorant, serif)',
                    fontSize: '1.5rem',
                    lineHeight: 1.05,
                  }}
                >
                  {item.title}
                </h2>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.62 }}>{item.body}</p>
              </article>
            )
          })}
        </section>

        <section
          style={{
            border: '1px solid rgba(212,175,55,0.18)',
            borderRadius: '22px',
            background: 'rgba(14,10,22,0.76)',
            padding: '20px',
            display: 'grid',
            gap: '14px',
          }}
        >
          {SECTIONS.map((section) => (
            <article key={section.id} id={section.id} style={{ display: 'grid', gap: '7px' }}>
              <h2
                style={{
                  margin: 0,
                  color: 'var(--off-white)',
                  fontFamily: 'var(--font-cormorant, serif)',
                  fontSize: '1.85rem',
                }}
              >
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.72 }}>
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '6px', color: 'rgba(237,224,196,0.9)' }}>
                  {section.bullets.map((bullet) => (
                    <li key={bullet} style={{ lineHeight: 1.6 }}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </section>

        <section
          style={{
            border: '1px solid rgba(212,175,55,0.18)',
            borderRadius: '22px',
            background: 'rgba(14,10,22,0.76)',
            padding: '20px',
            display: 'grid',
            gap: '12px',
          }}
        >
          <h3
            style={{
              margin: 0,
              color: 'var(--off-white)',
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: '2rem',
            }}
          >
            Need legal clarification?
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            For account-level concerns, billing questions, or policy interpretation, contact Kujuana support.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href="/contact"
              className="btn btn-gold"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
            >
              Contact Support
              <ArrowRight size={14} />
            </Link>
            <Link href="/privacy" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link href="/cookies" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              Cookie Policy
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
