// ─────────────────────────────────────────────────────────────────────
// ADMIN QUEUE (CLIENT)
// Path: kujuana/apps/web/app/(admin)/queue/queueClient.tsx
// ─────────────────────────────────────────────────────────────────────

"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"

type QueueItem = {
  id: string
  kind: "vip" | "priority"
  createdAt: string
  requestedByUserId: string
  requestedByName: string
  requestedByEmail?: string
  status: "pending" | "in_review" | "processing" | "done" | "failed"
  notes?: string
  matchId?: string
}

function formatAgo(iso: string) {
  const d = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - d)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[rgba(232,210,124,0.18)] bg-[rgba(232,210,124,0.08)] px-2.5 py-1 text-[11px] tracking-[0.22em] uppercase text-[#F5E6B3]">
      {children}
    </span>
  )
}

function KindPill({ kind }: { kind: "vip" | "priority" }) {
  const cls =
    kind === "vip"
      ? "border-[rgba(212,175,55,0.22)] bg-[rgba(212,175,55,0.10)] text-[#E8D27C]"
      : "border-[rgba(245,230,179,0.18)] bg-[rgba(42,8,56,0.55)] text-[rgba(245,230,179,0.80)]"
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] tracking-[0.22em] uppercase ${cls}`}>
      {kind}
    </span>
  )
}

export default function QueueClient({
  initialItems,
  apiBase,
}: {
  initialItems: QueueItem[]
  apiBase: string
}) {
  const [items, setItems] = useState<QueueItem[]>(initialItems)
  const [tab, setTab] = useState<"all" | "vip" | "priority">("all")
  const [q, setQ] = useState("")
  const [isPending, startTransition] = useTransition()
  const [flash, setFlash] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items
      .filter((i) => (tab === "all" ? true : i.kind === tab))
      .filter((i) => {
        if (!needle) return true
        return (
          i.requestedByName.toLowerCase().includes(needle) ||
          (i.requestedByEmail || "").toLowerCase().includes(needle) ||
          i.id.toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }, [items, tab, q])

  async function refresh() {
    startTransition(async () => {
      setFlash(null)
      const res = await fetch(`${apiBase}/admin/queue`, { credentials: "include" })
      if (!res.ok) {
        setFlash("Could not refresh queue.")
        return
      }
      const data = await res.json()
      setItems(Array.isArray(data.items) ? data.items : [])
      setFlash("Queue refreshed.")
      setTimeout(() => setFlash(null), 1400)
    })
  }

  async function markInReview(id: string) {
    startTransition(async () => {
      setFlash(null)
      const res = await fetch(`${apiBase}/admin/queue/${id}/review`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) {
        setFlash("Failed to update item.")
        return
      }
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: "in_review" } : p)))
      setFlash("Marked in review.")
      setTimeout(() => setFlash(null), 1400)
    })
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-[rgba(212,175,55,0.14)] bg-[rgba(42,8,56,0.35)] p-6">
        <div className="text-xs tracking-[0.28em] uppercase text-[rgba(245,230,179,0.65)]">
          Admin
        </div>
        <h1 className="mt-2 font-serif text-3xl font-medium text-[rgba(255,255,255,0.92)]">
          Queue
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[rgba(245,230,179,0.62)]">
          VIP curation and Priority requests in one place. Move fast, keep privacy tight, and write clean
          introductions.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={refresh}
            className="rounded-xl border border-[rgba(212,175,55,0.22)] bg-[linear-gradient(135deg,#E8D27C,#D4AF37,#C9A227)] px-4 py-2 text-sm font-medium text-[#18021F] shadow-[0_10px_30px_rgba(212,175,55,0.18)] transition hover:translate-y-[-1px] disabled:opacity-70"
            disabled={isPending}
          >
            {isPending ? "Refreshing…" : "Refresh"}
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-[rgba(232,210,124,0.16)] bg-[rgba(24,2,31,0.45)] px-3 py-2">
            <span className="text-xs tracking-[0.20em] uppercase text-[rgba(245,230,179,0.70)]">
              View
            </span>
            <button
              className={`rounded-lg px-3 py-1 text-xs tracking-[0.18em] uppercase ${
                tab === "all"
                  ? "bg-[rgba(232,210,124,0.12)] text-[#F5E6B3]"
                  : "text-[rgba(245,230,179,0.70)] hover:text-[#F5E6B3]"
              }`}
              onClick={() => setTab("all")}
            >
              All
            </button>
            <button
              className={`rounded-lg px-3 py-1 text-xs tracking-[0.18em] uppercase ${
                tab === "vip"
                  ? "bg-[rgba(212,175,55,0.12)] text-[#E8D27C]"
                  : "text-[rgba(245,230,179,0.70)] hover:text-[#F5E6B3]"
              }`}
              onClick={() => setTab("vip")}
            >
              VIP
            </button>
            <button
              className={`rounded-lg px-3 py-1 text-xs tracking-[0.18em] uppercase ${
                tab === "priority"
                  ? "bg-[rgba(245,230,179,0.10)] text-[#F5E6B3]"
                  : "text-[rgba(245,230,179,0.70)] hover:text-[#F5E6B3]"
              }`}
              onClick={() => setTab("priority")}
            >
              Priority
            </button>
          </div>

          <div className="ml-auto flex w-full items-center gap-3 md:w-auto">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, id…"
              className="w-full rounded-xl border border-[rgba(232,210,124,0.16)] bg-[rgba(24,2,31,0.45)] px-4 py-2 text-sm text-[rgba(255,255,255,0.88)] placeholder:text-[rgba(245,230,179,0.45)] outline-none focus:border-[rgba(232,210,124,0.28)] md:w-[320px]"
            />
          </div>
        </div>

        {flash ? (
          <div className="mt-4 rounded-xl border border-[rgba(212,175,55,0.12)] bg-[rgba(212,175,55,0.08)] px-4 py-3 text-sm text-[#F5E6B3]">
            {flash}
          </div>
        ) : null}
      </header>

      <section className="rounded-2xl border border-[rgba(212,175,55,0.14)] bg-[rgba(24,2,31,0.55)] p-2 shadow-[0_0_0_1px_rgba(212,175,55,0.08),0_18px_60px_rgba(0,0,0,0.28)]">
        <div className="grid grid-cols-1 gap-2">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-[rgba(212,175,55,0.10)] bg-[rgba(42,8,56,0.35)] p-8 text-center">
              <div className="font-serif text-xl text-[rgba(255,255,255,0.90)]">No items</div>
              <div className="mt-2 text-sm text-[rgba(245,230,179,0.62)]">
                When users request Priority matches or VIP curation is generated, you’ll see it here.
              </div>
            </div>
          ) : (
            filtered.map((i) => (
              <div
                key={i.id}
                className="rounded-xl border border-[rgba(212,175,55,0.10)] bg-[rgba(42,8,56,0.35)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <KindPill kind={i.kind} />
                      <Badge>{i.status.replace("_", " ")}</Badge>
                      <span className="text-xs text-[rgba(245,230,179,0.60)]">
                        {formatAgo(i.createdAt)}
                      </span>
                    </div>

                    <div className="mt-2 truncate text-sm text-[rgba(255,255,255,0.92)]">
                      {i.requestedByName}{" "}
                      <span className="text-[rgba(245,230,179,0.60)]">
                        · {i.requestedByEmail || "no email"}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-[rgba(245,230,179,0.62)]">
                      <span className="opacity-70">ID:</span>
                      <span className="font-mono text-[rgba(255,255,255,0.70)]">{i.id}</span>
                      <span className="opacity-70">User:</span>
                      <span className="font-mono text-[rgba(255,255,255,0.70)]">
                        {i.requestedByUserId}
                      </span>
                    </div>

                    {i.notes ? (
                      <div className="mt-3 rounded-xl border border-[rgba(232,210,124,0.12)] bg-[rgba(24,2,31,0.35)] p-3 text-sm leading-7 text-[rgba(245,230,179,0.70)]">
                        {i.notes}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/members/${i.requestedByUserId}`}
                      className="rounded-xl border border-[rgba(232,210,124,0.16)] bg-[rgba(24,2,31,0.45)] px-3 py-2 text-sm text-[rgba(245,230,179,0.80)] transition hover:border-[rgba(232,210,124,0.26)]"
                    >
                      View member
                    </Link>

                    {i.matchId ? (
                      <Link
                        href={`/admin/matches/${i.matchId}`}
                        className="rounded-xl border border-[rgba(212,175,55,0.18)] bg-[rgba(212,175,55,0.08)] px-3 py-2 text-sm text-[#E8D27C] transition hover:border-[rgba(212,175,55,0.28)]"
                      >
                        Open match
                      </Link>
                    ) : null}

                    {i.status === "pending" ? (
                      <button
                        onClick={() => markInReview(i.id)}
                        className="rounded-xl border border-[rgba(212,175,55,0.22)] bg-[linear-gradient(135deg,#E8D27C,#D4AF37,#C9A227)] px-3 py-2 text-sm font-medium text-[#18021F] shadow-[0_10px_30px_rgba(212,175,55,0.16)] transition hover:translate-y-[-1px] disabled:opacity-70"
                        disabled={isPending}
                      >
                        Mark in review
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}