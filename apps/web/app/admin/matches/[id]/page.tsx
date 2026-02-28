import Link from "next/link";
import { cookies } from "next/headers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getApiBase as resolveApiBase } from "@/lib/api-base";

type MatchDetail = {
  id: string;
  tier: "standard" | "priority" | "vip";
  status: "pending" | "review" | "introduced" | "accepted" | "declined";
  score: number;
  createdAt: string;
  updatedAt: string;
  userA: { id: string; fullName: string; email?: string };
  userB: { id: string; fullName: string; email?: string };
  breakdown?: Record<string, unknown> | null;
  notes?: string | null;
};

function getApiBase() {
  return resolveApiBase();
}

async function fetchMatch(id: string): Promise<MatchDetail | null> {
  const base = getApiBase();
  if (!base) return null;

  const token =
    cookies().get("access_token")?.value ||
    cookies().get("kujuana_access")?.value ||
    "";

  const res = await fetch(`${base}/admin/matches/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json = (await res.json()) as any;
  const data = json?.data ?? json;

  return {
    id: String(data?.id ?? data?._id ?? id),
    tier: (data?.tier ?? "vip") as MatchDetail["tier"],
    status: (data?.status ?? "pending") as MatchDetail["status"],
    score: Number(data?.score ?? data?.compatibilityScore ?? 0),
    createdAt: String(data?.createdAt ?? new Date().toISOString()),
    updatedAt: String(data?.updatedAt ?? data?.createdAt ?? new Date().toISOString()),
    userA: {
      id: String(data?.userA?.id ?? data?.users?.[0]?.id ?? data?.users?.[0] ?? ""),
      fullName: String(data?.userA?.fullName ?? data?.users?.[0]?.fullName ?? "User A"),
      email: data?.userA?.email ?? data?.users?.[0]?.email,
    },
    userB: {
      id: String(data?.userB?.id ?? data?.users?.[1]?.id ?? data?.users?.[1] ?? ""),
      fullName: String(data?.userB?.fullName ?? data?.users?.[1]?.fullName ?? "User B"),
      email: data?.userB?.email ?? data?.users?.[1]?.email,
    },
    breakdown: data?.breakdown ?? null,
    notes: data?.notes ?? null,
  };
}

function TierBadge({ tier }: { tier: MatchDetail["tier"] }) {
  const cls =
    tier === "vip"
      ? "border-[#E8D27C]/40 bg-[#D4AF37]/15 text-[#F5E6B3]"
      : tier === "priority"
        ? "border-white/25 bg-white/10 text-white/85"
        : "border-white/15 bg-white/5 text-white/75";
  return (
    <Badge variant="outline" className={cls}>
      {tier.toUpperCase()}
    </Badge>
  );
}

function StatusBadge({ status }: { status: MatchDetail["status"] }) {
  const cls =
    status === "accepted"
      ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
      : status === "declined"
        ? "border-rose-300/30 bg-rose-300/10 text-rose-100"
        : status === "introduced"
          ? "border-sky-300/30 bg-sky-300/10 text-sky-100"
          : status === "review"
            ? "border-[#E8D27C]/30 bg-[#E8D27C]/10 text-[#F5E6B3]"
            : "border-white/20 bg-white/10 text-white/80";
  return (
    <Badge variant="outline" className={cls}>
      {status.toUpperCase()}
    </Badge>
  );
}

export default async function AdminMatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const match = await fetchMatch(params.id);

  if (!match) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur">
        <div className="text-xl font-semibold">Match not found</div>
        <div className="mt-2 text-sm text-white/60">
          Verify the match ID and API configuration.
        </div>
        <div className="mt-4">
          <Link href="/admin/queue">
            <Button className="bg-[#D4AF37] text-[#18021F] hover:bg-[#E8D27C]">
              Back to Queue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight">
              Match Review
            </div>
            <div className="mt-1 text-sm text-white/60">
              Carefully review and introduce with a premium note.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TierBadge tier={match.tier} />
            <StatusBadge status={match.status} />
            <Badge
              variant="outline"
              className="border-[#E8D27C]/30 bg-[#D4AF37]/15 text-[#F5E6B3]"
            >
              {Math.round(match.score)}%
            </Badge>
          </div>
        </div>

        <Separator className="my-4 bg-white/10" />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#F5E6B3]">
                Candidate A
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-white/80">
              <div className="font-medium text-white/90">{match.userA.fullName}</div>
              {match.userA.email ? (
                <div className="text-white/60">{match.userA.email}</div>
              ) : null}
              <div className="pt-2">
                <Link
                  href={`/admin/members/${encodeURIComponent(match.userA.id)}`}
                  className="inline-flex items-center rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/15"
                >
                  View profile →
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#F5E6B3]">
                Candidate B
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-white/80">
              <div className="font-medium text-white/90">{match.userB.fullName}</div>
              {match.userB.email ? (
                <div className="text-white/60">{match.userB.email}</div>
              ) : null}
              <div className="pt-2">
                <Link
                  href={`/admin/members/${encodeURIComponent(match.userB.id)}`}
                  className="inline-flex items-center rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/15"
                >
                  View profile →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base text-[#F5E6B3]">
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                <pre className="max-h-[420px] overflow-auto text-xs text-white/75">
                  {JSON.stringify(match.breakdown ?? {}, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base text-[#F5E6B3]">
                Introduction Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                defaultValue={match.notes ?? ""}
                placeholder="Write a warm, premium introduction note (visible to both users)..."
                className="min-h-[180px] border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  className="bg-[#D4AF37] text-[#18021F] hover:bg-[#E8D27C]"
                  type="button"
                >
                  Save Note (Wire to API)
                </Button>
                <Button
                  variant="secondary"
                  className="border border-white/10 bg-white/10 text-white hover:bg-white/15"
                  type="button"
                >
                  Introduce Match (Wire to API)
                </Button>
                <Link href="/admin/queue">
                  <Button
                    variant="secondary"
                    className="border border-white/10 bg-white/10 text-white hover:bg-white/15"
                  >
                    Back to Queue
                  </Button>
                </Link>
              </div>

              <div className="text-xs text-white/50">
                Production note: post to `POST /admin/matches/:id/introduce` and
                store note server-side; never expose VIP sensitive fields in
                client logs.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 text-xs text-white/50">
          Created: {new Date(match.createdAt).toLocaleString()} • Updated:{" "}
          {new Date(match.updatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
