import Link from "next/link";
import { cookies } from "next/headers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getApiBase as resolveApiBase } from "@/lib/api-base";

type MemberDetail = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  tier: "standard" | "priority" | "vip";
  credits: number;
  profileCompleteness: number;
  isActive: boolean;
  createdAt: string;
  // Optional expanded
  profile?: Record<string, unknown> | null;
};

function getApiBase() {
  return resolveApiBase();
}

async function fetchMember(id: string): Promise<MemberDetail | null> {
  const base = getApiBase();
  if (!base) return null;

  const token =
    cookies().get("access_token")?.value ||
    cookies().get("kujuana_access")?.value ||
    "";

  const res = await fetch(`${base}/admin/members/${encodeURIComponent(id)}`, {
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
    fullName: String(data?.fullName ?? data?.name ?? "—"),
    email: String(data?.email ?? "—"),
    phone: data?.phone ?? null,
    tier: (data?.tier ?? "standard") as MemberDetail["tier"],
    credits: Number(data?.credits ?? 0),
    profileCompleteness: Number(data?.profileCompleteness ?? 0),
    isActive: Boolean(data?.isActive ?? true),
    createdAt: String(data?.createdAt ?? new Date().toISOString()),
    profile: data?.profile ?? null,
  };
}

function TierBadge({ tier }: { tier: MemberDetail["tier"] }) {
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

export default async function AdminMemberDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const member = await fetchMember(params.id);

  if (!member) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur">
        <div className="text-xl font-semibold">Member not found</div>
        <div className="mt-2 text-sm text-white/60">
          Verify the member ID and API configuration.
        </div>
        <div className="mt-4">
          <Link href="/admin/members">
            <Button className="bg-[#D4AF37] text-[#18021F] hover:bg-[#E8D27C]">
              Back to Members
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
              {member.fullName}
            </div>
            <div className="mt-1 text-sm text-white/60">{member.email}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TierBadge tier={member.tier} />
            <Badge
              variant="outline"
              className={
                member.isActive
                  ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                  : "border-white/20 bg-white/10 text-white/70"
              }
            >
              {member.isActive ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </div>
        </div>

        <Separator className="my-4 bg-white/10" />

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/80">Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-[#F5E6B3]">
                {member.credits.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-white/60">
                Priority credits available
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/80">
                Profile Completeness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-[#F5E6B3]">
                {Math.round(member.profileCompleteness)}%
              </div>
              <div className="mt-1 text-xs text-white/60">
                Onboarding completion score
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/80">Joined</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-[#F5E6B3]">
                {new Date(member.createdAt).toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-white/60">
                Account created time
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/members">
            <Button
              variant="secondary"
              className="border border-white/10 bg-white/10 text-white hover:bg-white/15"
            >
              Back
            </Button>
          </Link>

          <Link href={`/admin/queue`}>
            <Button
              variant="secondary"
              className="border border-white/10 bg-white/10 text-white hover:bg-white/15"
            >
              Go to Queue
            </Button>
          </Link>

          <Button className="bg-[#D4AF37] text-[#18021F] hover:bg-[#E8D27C]">
            Admin Action (Wire to API)
          </Button>
        </div>
      </div>

      <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base text-[#F5E6B3]">
            Profile Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-white/10 bg-black/10 p-4">
            <pre className="max-h-[520px] overflow-auto text-xs text-white/75">
              {JSON.stringify(member.profile ?? {}, null, 2)}
            </pre>
          </div>

          <div className="mt-2 text-xs text-white/50">
            Tip: hide or mask extremely sensitive fields here if your API returns
            them. VIP encryption should remain server-side.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
