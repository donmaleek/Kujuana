// ─────────────────────────────────────────────────────────────────────
// ADMIN AUDIT LOG (CLIENT)
// Path: kujuana/apps/web/app/(admin)/audit/auditClient.tsx
// ─────────────────────────────────────────────────────────────────────

"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type AuditRow = {
  id: string
  action: string
  actorId?: string
  actorEmail?: string
  targetUserId?: string
  targetEmail?: string
  meta?: Record<string, unknown>
  createdAt: string
  ip?: string
}

function fmt(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AuditClient({
  apiBase,
  initial,
  initialQuery,
}: {
  apiBase: string
  initial: { items: AuditRow[]; nextCursor?: string }
  initialQuery: { q: string; action: string; cursor: string }
}) {
  const router = useRouter()
  const [q, setQ] = useState(initialQuery.q)
  const [action, setAction] = useState(initialQuery.action)
  const [isPending, startTransition] = useTransition()

  function apply() {
    startTransition(() => {
      const params = new URLSearchParams()
      if (q.trim()) params.set("q", q.trim())
      if (action.trim()) params.set("action", action.trim())
      router.push(`/admin/audit?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-[rgba(212,175,55,0.14)] bg-[rgba(42,8,56,0.35)] p-6">
        <div className="text-xs tracking-[0.28em] uppercase text-[rgba(245,230,179,0.65)]">
          Compliance
        </div>
        <h1 className="mt-2 font-serif text-3xl font-medium text-[rgba(255,255,255,0.92)]">
          Audit Log
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[rgba(245,230,179,0.62)]">
          Every sensitive access and admin action is recorded. Search by actor email, target email, user
          id, or action name.
        </p>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search actor/target/email/id…"
            className="w-full rounded-xl border border-[rgba(232,210,124,0.16)] bg-[rgba(24,2,31,0.45)] px-4 py-2 text-sm text-[rgba(255,255,255,0.88)] placeholder:text-[rgba(245,230,179,0.45)] outline-none focus:border-[rgba(232,210,124,0.28)] md:w-[420px]"
          />
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Action filter (optional)…"
            className="w-full rounded-xl border border-[rgba(232,210,124,0.16)] bg-[rgba(24,2,31,0.45)] px-4 py-2 text-sm text-[rgba(255,255,255,0.88)] placeholder:text-[rgba(245,230,179,0.45)] outline-none focus:border-[rgba(232,210,124,0.28)] md:w-[320px]"
          />
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
          <table className="w-full min-w-[1100px] border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs tracking-[0.22em] uppercase text-[rgba(245,230,179,0.60)]">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Meta</th>
              </tr>
            </thead>
            <tbody>
              {initial.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-[rgba(245,230,179,0.62)]">
                    No audit records returned.
                  </td>
                </tr>
              ) : (
                initial.items.map((a) => (
                  <tr key={a.id} className="border-t border-[rgba(212,175,55,0.08)]">
                    <td className="px-4 py-4 text-xs text-[rgba(245,230,179,0.70)]">{fmt(a.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-[rgba(255,255,255,0.90)]">{a.action}</div>
                      <div className="mt-1 font-mono text-xs text-[rgba(245,230,179,0.45)]">{a.id}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[rgba(245,230,179,0.70)]">
                      <div>{a.actorEmail || "—"}</div>
                      {a.actorId ? (
                        <div className="mt-1 font-mono text-xs text-[rgba(245,230,179,0.45)]">{a.actorId}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-sm text-[rgba(245,230,179,0.70)]">
                      {a.targetUserId ? (
                        <Link
                          href={`/admin/members/${a.targetUserId}`}
                          className="text-[rgba(232,210,124,0.85)] hover:text-[#F5E6B3]"
                        >
                          {a.targetEmail || a.targetUserId} →
                        </Link>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-[rgba(245,230,179,0.60)]">{a.ip || "—"}</td>
                    <td className="px-4 py-4">
                      <details className="rounded-xl border border-[rgba(232,210,124,0.12)] bg-[rgba(42,8,56,0.35)] px-3 py-2">
                        <summary className="cursor-pointer text-xs text-[rgba(245,230,179,0.70)]">
                          View
                        </summary>
                        <pre className="mt-2 max-h-[260px] overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-[rgba(245,230,179,0.72)]">
                          {JSON.stringify(a.meta || {}, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {initial.nextCursor ? (
          <div className="flex items-center justify-end px-4 py-4">
            <Link
              href={`/admin/audit?${new URLSearchParams({
                q: q.trim(),
                action: action.trim(),
                cursor: initial.nextCursor,
              }).toString()}`}
              className="rounded-xl border border-[rgba(212,175,55,0.18)] bg-[rgba(212,175,55,0.08)] px-4 py-2 text-sm text-[#E8D27C] transition hover:border-[rgba(212,175,55,0.28)]"
            >
              Next page →
            </Link>
          </div>
        ) : null}
      </section>

      <div className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(42,8,56,0.30)] p-4 text-xs text-[rgba(245,230,179,0.60)]">
        Export and compliance tooling can be wired to your infra/scripts/export-audit.ts. Keep retention
        policy aligned with your legal guidance.
      </div>
    </div>
  )
}