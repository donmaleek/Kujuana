import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Database, Lock, ShieldCheck, UserCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Kujuana',
  description: 'Comprehensive Privacy Policy for Kujuana members, visitors, and applicants',
}

const LAST_UPDATED = 'March 1, 2026'

type PolicySection = {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

const HIGHLIGHTS = [
  {
    title: 'We do not sell personal data',
    body: 'Your profile, usage, and account information is used to deliver and protect Kujuana services.',
    icon: ShieldCheck,
  },
  {
    title: 'You control your profile visibility',
    body: 'You can update key privacy and account settings from your profile and support channels.',
    icon: UserCheck,
  },
  {
    title: 'Security and fraud controls',
    body: 'We monitor abuse, suspicious activity, and access patterns to protect members and the platform.',
    icon: Lock,
  },
] as const

const SECTIONS: PolicySection[] = [
  {
    id: 'scope',
    title: '1. Scope and Application',
    paragraphs: [
      'This Privacy Policy applies to Kujuana websites, mobile applications, and related services (collectively, the “Services”). It describes how we collect, use, disclose, and safeguard personal information.',
      'By creating an account, accessing our Services, or contacting us, you acknowledge this Privacy Policy and consent to data processing as described here, subject to applicable law.',
    ],
  },
  {
    id: 'data-we-collect',
    title: '2. Information We Collect',
    paragraphs: ['We collect information you provide directly, information generated through your use of the Services, and limited information from trusted third parties.'],
    bullets: [
      'Account data: name, email address, phone (if provided), authentication credentials, account status, and verification details.',
      'Profile data: photos, bio, values, relationship vision, preferences, age range, location/city-level data, and onboarding responses.',
      'Usage data: app activity, device/browser information, feature interactions, session logs, and diagnostic events.',
      'Support data: messages, attachments, incident reports, safety complaints, and related moderation context.',
      'Billing data: subscription tier, invoice metadata, payment status, and transaction references provided by payment processors.',
    ],
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Information',
    paragraphs: ['We use personal information to operate, improve, and secure the Services, including:'],
    bullets: [
      'Creating and managing member accounts, profiles, sessions, and authentication.',
      'Providing matchmaking, compatibility analysis, and profile relevance features.',
      'Delivering customer support, resolving technical issues, and handling member requests.',
      'Detecting abuse, fraud, scams, harassment, and Terms of Service violations.',
      'Managing subscriptions, billing operations, renewal workflows, and payment reconciliation.',
      'Improving user experience, feature quality, and platform reliability through analytics.',
      'Complying with legal obligations, law enforcement requests, and dispute processes where required.',
    ],
  },
  {
    id: 'legal-bases',
    title: '4. Legal Bases (Where Applicable)',
    paragraphs: [
      'Depending on your jurisdiction, we rely on one or more legal bases: contract performance (to provide Services), legitimate interests (safety, fraud prevention, product improvement), consent (where required), and compliance with legal obligations.',
      'You may withdraw consent where consent is the legal basis, subject to legal and operational limitations.',
    ],
  },
  {
    id: 'sharing',
    title: '5. How We Share Information',
    paragraphs: ['We share information only when necessary for service delivery, safety, or legal compliance.'],
    bullets: [
      'Service providers: infrastructure, analytics, communications, support tooling, and payment processing partners.',
      'Other members: profile information you choose to publish or share through the Services.',
      'Safety and legal compliance: when required for abuse response, legal process, or public safety.',
      'Business transactions: in connection with mergers, financing, acquisition, or asset sale, with appropriate safeguards.',
    ],
  },
  {
    id: 'retention',
    title: '6. Data Retention',
    paragraphs: [
      'We retain personal information only for as long as needed for legitimate business and legal purposes, including account continuity, safety investigations, billing records, and legal obligations.',
      'Retention periods vary by data type and context. When data is no longer required, we delete, anonymize, or de-identify it in accordance with internal controls and applicable law.',
    ],
  },
  {
    id: 'rights',
    title: '7. Your Privacy Rights and Choices',
    paragraphs: ['Depending on location and law, you may have rights to access, correct, delete, restrict, object, or export your personal information.'],
    bullets: [
      'Access and correction: request a copy of your data or correction of inaccurate information.',
      'Deletion: request account/data deletion, subject to legal and safety retention obligations.',
      'Marketing controls: manage promotional communications through settings and unsubscribe controls.',
      'Profile controls: update visibility, profile details, and preference settings from account screens.',
      'Cookie controls: see Cookie Policy for browser/device options.',
    ],
  },
  {
    id: 'security',
    title: '8. Security Practices',
    paragraphs: [
      'Kujuana uses technical and organizational safeguards designed to protect personal information from unauthorized access, misuse, loss, alteration, or disclosure.',
      'No system is perfectly secure. Members should maintain strong passwords, protect account credentials, and report suspicious account activity immediately.',
    ],
  },
  {
    id: 'children',
    title: '9. Age Requirements',
    paragraphs: [
      'Kujuana is intended only for adults legally permitted to use dating services in their jurisdiction. We do not knowingly collect personal information from minors.',
      'If we become aware that a minor account exists, we may remove the account and associated information as required by law.',
    ],
  },
  {
    id: 'international',
    title: '10. International Processing',
    paragraphs: [
      'Information may be processed in countries where Kujuana or service providers operate. Where required, we apply contractual and organizational safeguards for cross-border transfers.',
    ],
  },
  {
    id: 'changes',
    title: '11. Policy Updates',
    paragraphs: [
      'We may update this Privacy Policy periodically. Material updates may be communicated through the Services, email, or account notifications.',
      'Your continued use of the Services after an effective date reflects acknowledgment of the updated Privacy Policy.',
    ],
  },
  {
    id: 'contact',
    title: '12. Contact Us',
    paragraphs: [
      'For privacy requests, concerns, or rights inquiries, contact us at support@kujuana.com with the subject line “Privacy Request”.',
      'Please include your account email, request details, and any relevant context to help us process your request quickly.',
    ],
  },
]

export default function PrivacyPage() {
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
              <Database size={16} color="var(--gold-champagne)" />
              <span
                style={{
                  fontSize: '0.74rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,230,179,0.90)',
                }}
              >
                Privacy and Data Protection
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
              Privacy Policy
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
              Kujuana is privacy-first by design. This policy explains what we collect, why we collect it, how we use
              it, and how you can exercise control over your information.
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
            Need policy support?
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            If you need help understanding this policy or submitting a privacy request, contact our team directly.
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
            <Link href="/help" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              Help Centre
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
