import { cookies } from "next/headers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getApiBase as resolveApiBase } from "@/lib/api-base";

type AdminStats = {
  ok: boolean;
  generatedAt: string;
  membersTotal: number;
  activeMembers: number;
  matchesTotal: number;
  matchesPending: number;
  vipMembers: number;
  priorityCreditsOutstanding: number;
  revenueMonthKES: number;
  revenueMonthUSD: number;
};

function getApiBase() {
  return resolveApiBase();
}

async function fetchAdminStats(): Promise<AdminStats> {
  const base = getApiBase();
  if (!base) {
    return {
      ok: false,
      generatedAt: new Date().toISOString(),
      membersTotal: 0,
      activeMembers: 0,
      matchesTotal: 0,
      matchesPending: 0,
      vipMembers: 0,
      priorityCreditsOutstanding: 0,
      revenueMonthKES: 0,
      revenueMonthUSD: 0,
    };
  }

  const token =
    cookies().get("access_token")?.value ||
    cookies().get("kujuana_access")?.value ||
    "";

  const res = await fetch(`${base}/admin/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      ok: false,
      generatedAt: new Date().toISOString(),
      membersTotal: 0,
      activeMembers: 0,
      matchesTotal: 0,
      matchesPending: 0,
      vipMembers: 0,
      priorityCreditsOutstanding: 0,
      revenueMonthKES: 0,
      revenueMonthUSD: 0,
    };
  }

  const json = (await res.json()) as any;
  // Accept either { data: ... } or direct payload
  const data = json?.data ?? json;

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    membersTotal: Number(data?.membersTotal ?? 0),
    activeMembers: Number(data?.activeMembers ?? 0),
    matchesTotal: Number(data?.matchesTotal ?? 0),
    matchesPending: Number(data?.matchesPending ?? 0),
    vipMembers: Number(data?.vipMembers ?? 0),
    priorityCreditsOutstanding: Number(data?.priorityCreditsOutstanding ?? 0),
    revenueMonthKES: Number(data?.revenueMonthKES ?? 0),
    revenueMonthUSD: Number(data?.revenueMonthUSD ?? 0),
  };
}

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white/80">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight text-[#F5E6B3]">
          {value}
        </div>
        {hint ? <div className="mt-1 text-xs text-white/60">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const stats = await fetchAdminStats();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight">
              Admin Dashboard
            </div>
            <div className="mt-1 text-sm text-white/60">
              High-level platform overview — members, matches, revenue.
            </div>
          </div>

          <Badge
            variant="outline"
            className="border-[#E8D27C]/30 bg-[#D4AF37]/15 text-[#F5E6B3]"
          >
            {stats.ok ? "LIVE" : "API NOT CONFIGURED"}
          </Badge>
        </div>

        <Separator className="my-4 bg-white/10" />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Members (Total)"
            value={stats.membersTotal.toLocaleString()}
            hint="All registered profiles"
          />
          <StatCard
            title="Active Members"
            value={stats.activeMembers.toLocaleString()}
            hint="Currently active / match-eligible"
          />
          <StatCard
            title="Matches (Total)"
            value={stats.matchesTotal.toLocaleString()}
            hint="All match records"
          />
          <StatCard
            title="Pending Introductions"
            value={stats.matchesPending.toLocaleString()}
            hint="Awaiting review / introduce"
          />
          <StatCard
            title="VIP Members"
            value={stats.vipMembers.toLocaleString()}
            hint="Current VIP tier users"
          />
          <StatCard
            title="Priority Credits Outstanding"
            value={stats.priorityCreditsOutstanding.toLocaleString()}
            hint="Credits available across users"
          />
          <StatCard
            title="Revenue (Month • KES)"
            value={`KES ${stats.revenueMonthKES.toLocaleString()}`}
            hint="Gross month-to-date"
          />
          <StatCard
            title="Revenue (Month • USD)"
            value={`$ ${stats.revenueMonthUSD.toLocaleString()}`}
            hint="Gross month-to-date"
          />
        </div>

        <div className="mt-4 text-xs text-white/50">
          Generated: {new Date(stats.generatedAt).toLocaleString()}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base text-[#F5E6B3]">
              Operational Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white/75">
            <div>
              • Keep queue clean: introduce quickly for VIP users (premium trust).
            </div>
            <div>
              • Track pending matches: long waits reduce perceived quality.
            </div>
            <div>
              • Audit activity weekly: enforce privacy, reduce internal risk.
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base text-[#F5E6B3]">
              Luxury Brand Standard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white/75">
            <div>• No random matches. Every introduction is intentional.</div>
            <div>• Notes must sound warm, confident, and premium.</div>
            <div>• Privacy is non-negotiable — photos remain private.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
