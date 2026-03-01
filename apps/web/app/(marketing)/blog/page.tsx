import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpenText, Clock3, HeartHandshake, Newspaper, ShieldCheck, Sparkles, UserCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog | Kujuana',
  description: 'Comprehensive relationship insights, compatibility guides, and product stories from Kujuana',
}

const FEATURED_STORY = {
  title: 'Intentional Dating Framework: Build Better Relationships in 6 Weeks',
  category: 'Editorial Feature',
  readTime: '11 min read',
  author: 'Kujuana Editorial Team',
  date: 'March 2026',
  summary:
    'A complete, practical system for profile clarity, first-date safety, and values-based compatibility so your dating journey feels focused and calm.',
  takeaways: [
    'How to define your non-negotiables without becoming rigid.',
    'How to write a bio that attracts aligned people, not noise.',
    'How to run first dates with emotional safety and confident boundaries.',
  ],
}

const CATEGORIES = [
  { label: 'All Articles', count: 24 },
  { label: 'Dating Psychology', count: 8 },
  { label: 'Compatibility', count: 6 },
  { label: 'Profile Strategy', count: 5 },
  { label: 'Safety & Trust', count: 5 },
] as const

const ARTICLES = [
  {
    title: 'The 5 Signals That Predict Long-Term Compatibility Early',
    category: 'Compatibility',
    readTime: '7 min read',
    author: 'Amani K.',
    excerpt:
      'Move beyond chemistry and identify clear behavioral cues that indicate shared long-term direction.',
  },
  {
    title: 'How To Write a Premium Bio That Attracts Intentional Matches',
    category: 'Profile Strategy',
    readTime: '6 min read',
    author: 'Kujuana Team',
    excerpt:
      'A practical template for writing a bio and relationship vision that feels authentic and attracts quality intros.',
  },
  {
    title: 'First-Date Safety Standard: A Calm Checklist That Actually Works',
    category: 'Safety & Trust',
    readTime: '5 min read',
    author: 'Trust & Safety',
    excerpt:
      'Use this checklist before and during every first date to protect your boundaries while staying present.',
  },
  {
    title: 'Stop Over-Texting: Build Momentum With Better Conversation Rhythm',
    category: 'Dating Psychology',
    readTime: '4 min read',
    author: 'Editorial Desk',
    excerpt:
      'Why pacing matters and how to communicate with confidence without creating pressure or burnout.',
  },
  {
    title: 'When Values Clash: How to Exit Respectfully and Early',
    category: 'Dating Psychology',
    readTime: '8 min read',
    author: 'Amani K.',
    excerpt:
      'End misaligned situations with clarity and kindness, while protecting your energy and self-respect.',
  },
  {
    title: 'From Chat to Date: A Better Transition Script',
    category: 'Profile Strategy',
    readTime: '5 min read',
    author: 'Kujuana Team',
    excerpt:
      'A simple script for moving from in-app conversation to a first date without awkwardness or mixed signals.',
  },
] as const

const PLAYBOOKS = [
  {
    title: 'Intentional Dating 101',
    body: 'Define standards, goals, and boundaries before you accept new introductions.',
  },
  {
    title: 'Profile Upgrade Sprint',
    body: 'Improve your photos, bio, and vision statement for stronger first impressions.',
  },
  {
    title: 'Safety & Confidence Protocol',
    body: 'Use practical guardrails that support both emotional and physical safety.',
  },
] as const

export default function BlogPage() {
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

          <div style={{ position: 'relative', display: 'grid', gap: '15px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Newspaper size={16} color="var(--gold-champagne)" />
              <span
                style={{
                  fontSize: '0.74rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,230,179,0.90)',
                }}
              >
                Kujuana Journal
              </span>
            </div>

            <h1
              style={{
                margin: 0,
                color: 'var(--off-white)',
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
                lineHeight: 1.02,
              }}
            >
              Comprehensive dating insights for intentional relationships
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
              Expert playbooks, real-world guidance, and premium match quality strategy to help you date with clarity,
              safety, and long-term purpose.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
              <Pill icon={<BookOpenText size={13} />} label="Editorial Guides" />
              <Pill icon={<HeartHandshake size={13} />} label="Intentional Dating" />
              <Pill icon={<ShieldCheck size={13} />} label="Safety Standards" />
            </div>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '14px',
          }}
        >
          <article
            style={{
              border: '1px solid rgba(212,175,55,0.18)',
              borderRadius: '22px',
              background: 'rgba(14,10,22,0.76)',
              padding: '20px',
              display: 'grid',
              gap: '10px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                color: 'var(--gold-champagne)',
                fontSize: '0.76rem',
                textTransform: 'uppercase',
                letterSpacing: '0.11em',
              }}
            >
              <Sparkles size={14} />
              {FEATURED_STORY.category}
            </span>

            <h2
              style={{
                margin: 0,
                color: 'var(--off-white)',
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: 'clamp(1.8rem, 3.6vw, 2.6rem)',
                lineHeight: 1.06,
              }}
            >
              {FEATURED_STORY.title}
            </h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: 'rgba(237,224,196,0.84)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <Clock3 size={14} />
                {FEATURED_STORY.readTime}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <UserCircle2 size={14} />
                {FEATURED_STORY.author}
              </span>
              <span style={{ fontSize: '0.85rem' }}>{FEATURED_STORY.date}</span>
            </div>

            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.7 }}>{FEATURED_STORY.summary}</p>

            <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '6px', color: 'rgba(237,224,196,0.88)' }}>
              {FEATURED_STORY.takeaways.map((takeaway) => (
                <li key={takeaway} style={{ lineHeight: 1.55, fontSize: '0.92rem' }}>
                  {takeaway}
                </li>
              ))}
            </ul>
          </article>

          <aside
            style={{
              border: '1px solid rgba(212,175,55,0.18)',
              borderRadius: '22px',
              background: 'rgba(14,10,22,0.76)',
              padding: '20px',
              display: 'grid',
              gap: '13px',
            }}
          >
            <h3
              style={{
                margin: 0,
                color: 'var(--off-white)',
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: '1.9rem',
              }}
            >
              Browse by category
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.65 }}>
              Find practical guidance for each stage of your intentional dating journey.
            </p>
            <div style={{ display: 'grid', gap: '8px' }}>
              {CATEGORIES.map((category) => (
                <div
                  key={category.label}
                  style={{
                    border: '1px solid rgba(212,175,55,0.14)',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '10px 11px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'rgba(237,224,196,0.88)',
                    fontSize: '0.92rem',
                  }}
                >
                  <span>{category.label}</span>
                  <span style={{ color: 'var(--gold-champagne)', fontSize: '0.8rem' }}>{category.count}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section>
          <h3
            style={{
              margin: '0 0 12px',
              color: 'var(--off-white)',
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: '2rem',
            }}
          >
            Latest Articles
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
            {ARTICLES.map((article) => (
              <article
                key={article.title}
                style={{
                  border: '1px solid rgba(212,175,55,0.16)',
                  borderRadius: '20px',
                  background: 'linear-gradient(165deg, rgba(32,10,43,0.82), rgba(14,10,22,0.88))',
                  padding: '16px',
                  display: 'grid',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    color: 'var(--gold-champagne)',
                    fontSize: '0.74rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.09em',
                  }}
                >
                  {article.category}
                </span>
                <h4
                  style={{
                    margin: 0,
                    color: 'var(--off-white)',
                    fontFamily: 'var(--font-cormorant, serif)',
                    fontSize: '1.45rem',
                    lineHeight: 1.1,
                  }}
                >
                  {article.title}
                </h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.65, fontSize: '0.92rem' }}>{article.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', color: 'rgba(237,224,196,0.82)', fontSize: '0.82rem' }}>
                  <span>{article.author}</span>
                  <span>{article.readTime}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          <div
            style={{
              border: '1px solid rgba(212,175,55,0.18)',
              borderRadius: '22px',
              background: 'rgba(14,10,22,0.76)',
              padding: '20px',
            }}
          >
            <h3
              style={{
                margin: 0,
                color: 'var(--off-white)',
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: '1.9rem',
              }}
            >
              Curated Playbooks
            </h3>
            <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
              {PLAYBOOKS.map((item, index) => (
                <div
                  key={item.title}
                  style={{
                    border: '1px solid rgba(212,175,55,0.14)',
                    borderRadius: '12px',
                    padding: '10px 11px',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: 'var(--gold-champagne)',
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Playbook {index + 1}
                  </p>
                  <p style={{ margin: '5px 0 0', color: 'var(--off-white)', fontFamily: 'var(--font-jost)', fontWeight: 500 }}>{item.title}</p>
                  <p style={{ margin: '5px 0 0', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              border: '1px solid rgba(212,175,55,0.18)',
              borderRadius: '22px',
              background: 'rgba(14,10,22,0.76)',
              padding: '20px',
              display: 'grid',
              gap: '12px',
              alignContent: 'space-between',
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  color: 'var(--off-white)',
                  fontFamily: 'var(--font-cormorant, serif)',
                  fontSize: '1.9rem',
                }}
              >
                Need personalized guidance?
              </h3>
              <p style={{ marginTop: '8px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Explore Help Centre, Safety Tips, and Contact channels for direct support on account, profile, and trust.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <Link
                href="/help"
                className="btn btn-gold"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
              >
                Help Centre
                <ArrowRight size={14} />
              </Link>
              <Link href="/safety" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                Safety Tips
              </Link>
              <Link href="/contact" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function Pill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div
      style={{
        border: '1px solid rgba(212,175,55,0.22)',
        borderRadius: '999px',
        background: 'rgba(16,10,24,0.44)',
        padding: '8px 13px',
        color: 'var(--gold-champagne)',
        fontSize: '0.78rem',
        letterSpacing: '0.06em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {icon}
      {label}
    </div>
  )
}
