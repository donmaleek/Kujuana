// ─────────────────────────────────────────────────────────────────────
// ADMIN MEMBERS (CLIENT)
// Path: kujuana/apps/web/app/(admin)/members/membersClient.tsx
// ─────────────────────────────────────────────────────────────────────

"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type MemberRow = {
  id: string
  fullName: string
  email: string
  tier: "standard" | "priority" | "vip"
  isActive: boolean
  profileCompleteness: number
  createdAt: string
  lastSeenAt?: string
}

function TierPill({ tier }: { tier: MemberRow["tier"] }) {
  const cls =
    tier === "vip"
      ? "border-[rgba(212,175,55,0.22)] bg-[rgba(212,175,55,0.10)] text-[#E8D27C]"
      : tier === "priority"
        ? "border-[rgba(232,210,124,0.18)] bg-[rgba(232,210,124,0.08)] text-[#F5E6B3]"
        : "border-[rgba(245,230,179,0.14)] bg-[rgba(42,8,56,0.55)] text-[rgba(245,230,179,0.78)]"
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] tracking-[0.22em] uppercase ${cls}`}>
      {tier}
    </span>
  )
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex h-2.5 w-2.5 rounded-full ${
        active ? "bg-[#E8D27C]" : "bg-[rgba(255,255,255,0.22)]"
      } shadow-[0_0_18px_rgba(212,175,55,0.22)]`}
    />
  )
}

function fmtDate(iso?: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("en-KE", { year: "numeric", month: "short", day: "2-digit" })
}

export default function MembersClient({
  apiBase,
  initial,
  initialQuery,
}: {
  apiBase: string
  initial: { items: MemberRow[]; nextCursor?: string }
  initialQuery: { q: string; tier: string; cursor: string }
}) {
  const router = useRouter()
  const [q, setQ] = useState(initialQuery.q)
  const [tier, setTier] = useState(initialQuery.tier || "all")
  const [items] = useState<MemberRow[]>(initial.items)
  const [nextCursor] = useState<string | undefined>(initial.nextCursor)
  const [isPending, startTransition] = useTransition()

  const summary = useMemo(() => {
    const total = items.length
    const vip = items.filter((x) => x.tier === "vip").length
    const priority = items.filter((x) => x.tier === "priority").length
    const active = items.filter((x) => x.isActive).length
    return { total, vip, priority, active }
  }, [items])

  function apply() {
    startTransition(() => {
      const params = new URLSearchParams()
      if (q.trim()) params.set("q", q.trim())
      if (tier !== "all") params.set("tier", tier)
      router.push(`/admin/members?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-[rgba(212,175,55,0.14)] bg-[rgba(42,8,56,0.35)] p-6">
        <div className="text-xs tracking-[0.28em] uppercase text-[rgba(245,230,179,0.65)]">
          Directory
        </div>
        <h1 className="mt-2 font-serif text-3xl font-medium text-[rgba(255,255,255,0.92)]">
          Members
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[rgba(245,230,179,0.62)]">
          Search and review profiles. VIP data access is audited—open only what you need.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-[rgba(212,175,55,0.12)] bg-[rgba(24,2,31,0.45)] px-3 py-1 text-xs text-[rgba(245,230,179,0.70)]">
            Total: <span className="text-[#F5E6B3]">{summary.total}</span>
          </span>
          <span className="rounded-full border border-[rgba(212,175,55,0.12)] bg-[rgba(24,2,31,0.45)] px-3 py-1 text-xs text-[rgba(245,230,179,0.70)]">
            Active: <span className="text-[#F5E6B3]">{summary.active}</span>
          </span>
          <span className="rounded-full border border-[rgba(212,175,55,0.12)] bg-[rgba(24,2,31,0.45)] px-3 py-1 text-xs text-[rgba(245,230,179,0.70)]">
            VIP: <span className="text-[#E8D27C]">{summary.vip}</span>
          </span>
          <span className="rounded-full border border-[rgba(212,175,55,0.12)] bg-[rgba(24,2,31,0.45)] px-3 py-1 text-xs text-[rgba(245,230,179,0.70)]">
            Priority: <span className="text-[#F5E6B3]">{summary.priority}</span>
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, id…"
            className="w-full rounded-xl border border-[rgba(232,210,124,0.16)] bg-[rgba(24,2,31,0.45)] px-4 py-2 text-sm text-[rgba(255,255,255,0.88)] placeholder:text-[rgba(245,230,179,0.45)] outline-none focus:border-[rgba(232,210,124,0.28)] md:w-[420px]"
          />

          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="w-full rounded-xl border border-[rgba(232,210,124,0.16)] bg-[rgba(24,2,31,0.45)] px-4 py-2 text-sm text-[rgba(245,230,179,0.82)] outline-none focus:border-[rgba(232,210,124,0.28)] md:w-[220px]"
          >
            <option value="all">All tiers</option>
            <option value="standard">Standard</option>
            <option value="priority">Priority</option>
            <option value="vip">VIP</option>
          </select>

          <button
            onClick={apply}
            disabled={isPending}
            className="rounded-xl border border-[rgba(212,175,55,0.22)] bg-[linear-gradient(135deg,#E8D27C,#D4AF37,#C9A227)] px-4 py-2 text-sm font-medium text-[#18021F] shadow-[0_10px_30px_rgba(212,175,55,0.18)] transition hover:translate-y-[-1px] disabled:opacity-70 md:ml-auto"
          >
            {isPending ? "Applying…" : "Apply"}
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-[rgba(212,175,55,0.14)] bg-[rgba(24,2,31,0.55)] p-2 shadow-[0_0_0_1px_rgba(212,175,55,0.08),0_18px_60px_rgba(0,0,0,0.28)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs tracking-[0.22em] uppercase text-[rgba(245,230,179,0.60)]">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Completeness</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Last seen</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr
                  key={m.id}
                  className="border-t border-[rgba(212,175,55,0.08)] text-sm text-[rgba(255,255,255,0.88)]"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium">{m.fullName}</div>
                    <div className="text-xs text-[rgba(245,230,179,0.60)]">{m.email}</div>
                    <div className="mt-1 font-mono text-xs text-[rgba(245,230,179,0.50)]">
                      {m.id}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <TierPill tier={m.tier} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-[rgba(255,255,255,0.10)]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(135deg,#E8D27C,#D4AF37,#C9A227)]"
                          style={{ width: `${Math.max(0, Math.min(100, m.profileCompleteness))}%` }}
                        />
                      </div>
                      <span className="text-xs text-[rgba(245,230,179,0.70)]">
                        {m.profileCompleteness}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <StatusDot active={m.isActive} />
                      <span className="text-xs text-[rgba(245,230,179,0.70)]">
                        {m.isActive ? "active" : "inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-[rgba(245,230,179,0.70)]">
                    {fmtDate(m.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-xs text-[rgba(245,230,179,0.70)]">
                    {fmtDate(m.lastSeenAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/members/${m.id}`}
                      className="rounded-xl border border-[rgba(232,210,124,0.16)] bg-[rgba(42,8,56,0.35)] px-3 py-2 text-sm text-[rgba(245,230,179,0.85)] transition hover:border-[rgba(232,210,124,0.26)]"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {nextCursor ? (
          <div className="flex items-center justify-end px-4 py-4">
            <Link
              href={`/admin/members?${new URLSearchParams({
                q: q.trim(),
                tier: tier === "all" ? "" : tier,
                cursor: nextCursor,
              }).toString()}`}
              className="rounded-xl border border-[rgba(212,175,55,0.18)] bg-[rgba(212,175,55,0.08)] px-4 py-2 text-sm text-[#E8D27C] transition hover:border-[rgba(212,175,55,0.28)]"
            >
              Next page →
            </Link>
          </div>
        ) : null}
      </section>

      <div className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(42,8,56,0.30)] p-4 text-xs text-[rgba(245,230,179,0.60)]">
        If a member is VIP, sensitive fields may be encrypted. Access only when relevant to match quality
        and introduction safety.
      </div>
    </div>
  )
}