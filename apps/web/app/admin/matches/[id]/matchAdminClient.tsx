// ─────────────────────────────────────────────────────────────────────
// ADMIN MATCH DETAIL (CLIENT)
// Path: kujuana/apps/web/app/(admin)/matches/[id]/matchAdminClient.tsx
// ─────────────────────────────────────────────────────────────────────

"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"

type MatchAdminView = {
  id: string
  status: string
  score: number
  createdAt: string
  users: Array<{
    userId: string
    fullName: string
    email: string
    tier: "standard" | "priority" | "vip"
  }>
  breakdown?: Record<string, unknown>
  photos?: Record<string, string[]>
  existingNote?: string
}

function fmt(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("en-KE", { year: "numeric", month: "short", day: "2-digit" })
}

function ScoreRing({ score }: { score: number }) {
  const s = Math.max(0, Math.min(100, score))
  const deg = Math.round((s / 100) * 360)
  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(212,175,55,0.18)] bg-[rgba(24,2,31,0.55)]"
      style={{
        backgroundImage: `conic-gradient(rgba(232,210,124,0.95) ${deg}deg, rgba(255,255,255,0.10) 0deg)`,
      }}
    >
      <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[rgba(24,2,31,0.92)] text-sm font-semibold text-[#F5E6B3]">
        {Math.round(s)}
      </div>
    </div>
  )
}

export default function MatchAdminClient({
  apiBase,
  match,
}: {
  apiBase: string
  match: MatchAdminView
}) {
  const [note, setNote] = useState(match.existingNote || "")
  const [flash, setFlash] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [a, b] = match.users
  const safeUsers = match.users || []

  const suggested = useMemo(() => {
    const names = safeUsers.map((u) => u.fullName).filter(Boolean)
    const n = names.length === 2 ? `${names[0]} & ${names[1]}` : "this match"
    return `I reviewed your profiles and I believe you may align well on values and long-term direction. I’m introducing you intentionally—take your time, be kind, and communicate clearly.`
      .trim()
      .slice(0, 600)
      .concat(``)
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^/, "")
      .replace(/$/, "")
      .replace("this match", n)
  }, [safeUsers])

  async function saveNote() {
    startTransition(async () => {
      setFlash(null)
      const res = await fetch(`${apiBase}/admin/matches/${match.id}/note`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ note }),
      })
      if (!res.ok) {
        setFlash("Failed to save note.")
        return
      }
      setFlash("Note saved.")
      setTimeout(() => setFlash(null), 1400)
    })
  }

  async function introduce() {
    startTransition(async () => {
      setFlash(null)
      const res = await fetch(`${apiBase}/admin/matches/${match.id}/introduce`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ note }),
      })
      if (!res.ok) {
        setFlash("Introduce failed. Check match status or permissions.")
        return
      }
      setFlash("Introduction sent.")
      setTimeout(() => setFlash(null), 1800)
    })
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-[rgba(212,175,55,0.14)] bg-[rgba(42,8,56,0.35)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs tracking-[0.28em] uppercase text-[rgba(245,230,179,0.65)]">
              Match
            </div>
            <h1 className="mt-2 font-mono text-lg text-[rgba(255,255,255,0.92)]">{match.id}</h1>
            <div className="mt-2 text-sm text-[rgba(245,230,179,0.62)]">
              Status: <span className="text-[#F5E6B3]">{match.status}</span> · Created{" "}
              {fmt(match.createdAt)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ScoreRing score={match.score} />
            <Link
              href="/admin/queue"
              className="rounded-xl border border-[rgba(232,210,124,0.16)] bg-[rgba(24,2,31,0.45)] px-4 py-2 text-sm text-[rgba(245,230,179,0.80)] transition hover:border-[rgba(232,210,124,0.26)]"
            >
              Back to queue
            </Link>
          </div>
        </div>

        {flash ? (
          <div className="mt-4 rounded-xl border border-[rgba(212,175,55,0.12)] bg-[rgba(212,175,55,0.08)] px-4 py-3 text-sm text-[#F5E6B3]">
            {flash}
          </div>
        ) : null}
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[a, b].filter(Boolean).map((u) => (
          <div
            key={u!.userId}
            className="rounded-2xl border border-[rgba(212,175,55,0.14)] bg-[rgba(24,2,31,0.55)] p-6 shadow-[0_0_0_1px_rgba(212,175,55,0.08),0_18px_60px_rgba(0,0,0,0.28)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-serif text-xl text-[rgba(255,255,255,0.92)]">
                  {u!.fullName}
                </div>
                <div className="truncate text-sm text-[rgba(245,230,179,0.62)]">{u!.email}</div>
              </div>
              <span className="inline-flex items-center rounded-full border border-[rgba(232,210,124,0.18)] bg-[rgba(232,210,124,0.08)] px-3 py-1 text-[11px] tracking-[0.22em] uppercase text-[#F5E6B3]">
                {u!.tier}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/admin/members/${u!.userId}`}
                className="rounded-xl border border-[rgba(232,210,124,0.16)] bg-[rgba(42,8,56,0.35)] px-3 py-2 text-sm text-[rgba(245,230,179,0.85)] transition hover:border-[rgba(232,210,124,0.26)]"
              >
                Open member →
              </Link>
            </div>

            <div className="mt-4 rounded-xl border border-[rgba(212,175,55,0.10)] bg-[rgba(42,8,56,0.35)] p-4">
              <div className="text-xs tracking-[0.22em] uppercase text-[rgba(245,230,179,0.60)]">
                Photos
              </div>
              <div className="mt-3 text-sm text-[rgba(245,230,179,0.62)]">
                Photos are private. If your backend returns signed URLs to admin, they can be displayed
                here. Otherwise, keep it masked.
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(match.photos?.[u!.userId] || []).slice(0, 3).map((url, idx) => (
                  // If you allow admin signed URLs, show them. Otherwise remove this block.
                  <img
                    key={idx}
                    src={url}
                    alt="Private"
                    className="h-24 w-full rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[rgba(212,175,55,0.14)] bg-[rgba(24,2,31,0.55)] p-6">
          <div className="text-xs tracking-[0.28em] uppercase text-[rgba(245,230,179,0.65)]">
            Score breakdown
          </div>
          <div className="mt-4 rounded-xl border border-[rgba(232,210,124,0.12)] bg-[rgba(42,8,56,0.35)] p-4">
            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-[rgba(245,230,179,0.72)]">
              {JSON.stringify(match.breakdown || {}, null, 2)}
            </pre>
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(212,175,55,0.14)] bg-[rgba(24,2,31,0.55)] p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs tracking-[0.28em] uppercase text-[rgba(245,230,179,0.65)]">
              Introduction note
            </div>
            <button
              type="button"
              onClick={() => setNote(suggested)}
              className="text-xs text-[rgba(232,210,124,0.85)] hover:text-[#F5E6B3]"
              disabled={isPending}
            >
              Use suggested
            </button>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a short, warm, specific intro…"
            className="mt-4 h-[220px] w-full resize-none rounded-xl border border-[rgba(232,210,124,0.16)] bg-[rgba(42,8,56,0.35)] p-4 text-sm leading-7 text-[rgba(255,255,255,0.88)] placeholder:text-[rgba(245,230,179,0.45)] outline-none focus:border-[rgba(232,210,124,0.28)]"
          />

          <div className="mt-3 text-xs text-[rgba(245,230,179,0.55)]">
            Keep it clean: no sensitive details. No promises. Just alignment and respectful next steps.
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={saveNote}
              disabled={isPending}
              className="rounded-xl border border-[rgba(232,210,124,0.18)] bg-[rgba(24,2,31,0.45)] px-4 py-2 text-sm text-[rgba(245,230,179,0.82)] transition hover:border-[rgba(232,210,124,0.26)] disabled:opacity-70"
            >
              {isPending ? "Saving…" : "Save note"}
            </button>
            <button
              onClick={introduce}
              disabled={isPending || note.trim().length < 10}
              className="rounded-xl border border-[rgba(212,175,55,0.22)] bg-[linear-gradient(135deg,#E8D27C,#D4AF37,#C9A227)] px-4 py-2 text-sm font-medium text-[#18021F] shadow-[0_10px_30px_rgba(212,175,55,0.18)] transition hover:translate-y-[-1px] disabled:opacity-70"
            >
              {isPending ? "Sending…" : "Introduce both users"}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}