import Link from "next/link";
import { cookies } from "next/headers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiBase as resolveApiBase } from "@/lib/api-base";

type MemberRow = {
  id: string;
  fullName: string;
  email: string;
  tier: "standard" | "priority" | "vip";
  isActive: boolean;
  profileCompleteness: number;
  createdAt: string;
};

function getApiBase() {
  return resolveApiBase();
}

async function fetchMembers(): Promise<MemberRow[]> {
  const base = getApiBase();
  if (!base) return [];

  const token =
    cookies().get("access_token")?.value ||
    cookies().get("kujuana_access")?.value ||
    "";

  const res = await fetch(`${base}/admin/members`, {
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
    fullName: String(r?.fullName ?? r?.name ?? "—"),
    email: String(r?.email ?? "—"),
    tier: (r?.tier ?? "standard") as MemberRow["tier"],
    isActive: Boolean(r?.isActive ?? true),
    profileCompleteness: Number(r?.profileCompleteness ?? r?.completeness ?? 0),
    createdAt: String(r?.createdAt ?? new Date().toISOString()),
  }));
}

function TierBadge({ tier }: { tier: MemberRow["tier"] }) {
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

export default async function AdminMembersPage() {
  const members = await fetchMembers();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight">Members</div>
            <div className="mt-1 text-sm text-white/60">
              Search, inspect, and manage member profiles.
            </div>
          </div>

          <Badge
            variant="outline"
            className="border-[#E8D27C]/30 bg-[#D4AF37]/15 text-[#F5E6B3]"
          >
            {members.length} MEMBERS
          </Badge>
        </div>

        <Separator className="my-4 bg-white/10" />

        {/* Search input is client-side in most apps; here we render a static field for UI consistency */}
        <div className="mb-4">
          <Input
            placeholder="Search by name or email (wire this to query params for server filtering)"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
          />
          <div className="mt-1 text-xs text-white/50">
            Production note: implement server-side filtering via
            `/admin/members?query=...` and pass through here.
          </div>
        </div>

        <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-[#F5E6B3]">
              Member List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/70">Name</TableHead>
                    <TableHead className="text-white/70">Email</TableHead>
                    <TableHead className="text-white/70">Tier</TableHead>
                    <TableHead className="text-white/70">Active</TableHead>
                    <TableHead className="text-white/70">Completeness</TableHead>
                    <TableHead className="text-white/70">Joined</TableHead>
                    <TableHead className="text-white/70">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow className="border-white/10">
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-sm text-white/60"
                      >
                        No members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((m) => (
                      <TableRow key={m.id} className="border-white/10">
                        <TableCell className="text-white/90">
                          {m.fullName}
                        </TableCell>
                        <TableCell className="text-white/70">{m.email}</TableCell>
                        <TableCell>
                          <TierBadge tier={m.tier} />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              m.isActive
                                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                                : "border-white/20 bg-white/10 text-white/70"
                            }
                          >
                            {m.isActive ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#F5E6B3]">
                          {Math.round(m.profileCompleteness)}%
                        </TableCell>
                        <TableCell className="text-white/70">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/members/${encodeURIComponent(m.id)}`}
                            className="inline-flex items-center rounded-lg border border-[#E8D27C]/25 bg-[#D4AF37]/15 px-3 py-1.5 text-xs font-medium text-[#F5E6B3] transition hover:border-[#E8D27C]/40 hover:bg-[#D4AF37]/25"
                          >
                            View →
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
