import Link from "next/link";
import { cookies } from "next/headers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { getApiBase as resolveApiBase } from "@/lib/api-base";

type QueueItem = {
  id: string;
  tier: "priority" | "vip";
  status: "pending" | "review" | "introduced";
  createdAt: string;
  requesterName: string;
  candidateName: string;
  score: number; // 0-100
  waitHours: number;
};

function getApiBase() {
  return resolveApiBase();
}

async function fetchQueue(): Promise<QueueItem[]> {
  const base = getApiBase();
  if (!base) return [];

  const token =
    cookies().get("access_token")?.value ||
    cookies().get("kujuana_access")?.value ||
    "";

  const res = await fetch(`${base}/admin/queue`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const json = (await res.json()) as any;
  const rows: any[] = json?.data ?? json ?? [];

  return rows.map((r) => ({
    id: String(r?.id ?? r?._id ?? ""),
    tier: (r?.tier ?? "vip") as QueueItem["tier"],
    status: (r?.status ?? "pending") as QueueItem["status"],
    createdAt: String(r?.createdAt ?? new Date().toISOString()),
    requesterName: String(r?.requesterName ?? r?.requester?.fullName ?? "—"),
    candidateName: String(r?.candidateName ?? r?.candidate?.fullName ?? "—"),
    score: Number(r?.score ?? r?.compatibilityScore ?? 0),
    waitHours: Number(r?.waitHours ?? 0),
  }));
}

function TierBadge({ tier }: { tier: QueueItem["tier"] }) {
  const base =
    tier === "vip"
      ? "border-[#E8D27C]/40 bg-[#D4AF37]/15 text-[#F5E6B3]"
      : "border-white/20 bg-white/10 text-white/85";
  return (
    <Badge variant="outline" className={base}>
      {tier.toUpperCase()}
    </Badge>
  );
}

function StatusBadge({ status }: { status: QueueItem["status"] }) {
  const cls =
    status === "introduced"
      ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
      : status === "review"
        ? "border-[#E8D27C]/30 bg-[#E8D27C]/10 text-[#F5E6B3]"
        : "border-white/20 bg-white/10 text-white/80";
  return (
    <Badge variant="outline" className={cls}>
      {status.toUpperCase()}
    </Badge>
  );
}

export default async function AdminQueuePage() {
  const items = await fetchQueue();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight">Queue</div>
            <div className="mt-1 text-sm text-white/60">
              VIP introductions and Priority match requests waiting for action.
            </div>
          </div>

          <Badge
            variant="outline"
            className="border-[#E8D27C]/30 bg-[#D4AF37]/15 text-[#F5E6B3]"
          >
            {items.length} ITEMS
          </Badge>
        </div>

        <Separator className="my-4 bg-white/10" />

        <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-[#F5E6B3]">
              Pending Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/70">Tier</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-white/70">Requester</TableHead>
                    <TableHead className="text-white/70">Candidate</TableHead>
                    <TableHead className="text-white/70">Score</TableHead>
                    <TableHead className="text-white/70">Wait</TableHead>
                    <TableHead className="text-white/70">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow className="border-white/10">
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-sm text-white/60"
                      >
                        No queue items found. (If this looks wrong, verify your
                        API base URL and admin auth token.)
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((it) => (
                      <TableRow key={it.id} className="border-white/10">
                        <TableCell>
                          <TierBadge tier={it.tier} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={it.status} />
                        </TableCell>
                        <TableCell className="text-white/85">
                          {it.requesterName}
                        </TableCell>
                        <TableCell className="text-white/85">
                          {it.candidateName}
                        </TableCell>
                        <TableCell className="text-[#F5E6B3]">
                          {Math.round(it.score)}%
                        </TableCell>
                        <TableCell className="text-white/70">
                          {it.waitHours.toFixed(1)}h
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/matches/${encodeURIComponent(it.id)}`}
                            className="inline-flex items-center rounded-lg border border-[#E8D27C]/25 bg-[#D4AF37]/15 px-3 py-1.5 text-xs font-medium text-[#F5E6B3] transition hover:border-[#E8D27C]/40 hover:bg-[#D4AF37]/25"
                          >
                            Open →
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-3 text-xs text-white/50">
              Tip: VIP users pay for confidence — keep waiting time low.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
