import { cookies } from "next/headers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiBase as resolveApiBase } from "@/lib/api-base";

type AuditRow = {
  id: string;
  actor: string;
  action: string;
  target?: string | null;
  ip?: string | null;
  createdAt: string;
};

function getApiBase() {
  return resolveApiBase();
}

async function fetchAudit(): Promise<AuditRow[]> {
  const base = getApiBase();
  if (!base) return [];

  const token =
    cookies().get("access_token")?.value ||
    cookies().get("kujuana_access")?.value ||
    "";

  const res = await fetch(`${base}/admin/audit`, {
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
    actor: String(r?.actor ?? r?.user ?? "—"),
    action: String(r?.action ?? "—"),
    target: r?.target ? String(r.target) : null,
    ip: r?.ip ? String(r.ip) : null,
    createdAt: String(r?.createdAt ?? new Date().toISOString()),
  }));
}

export default async function AdminAuditPage() {
  const rows = await fetchAudit();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight">
              Audit Logs
            </div>
            <div className="mt-1 text-sm text-white/60">
              Accountability & security for admin actions.
            </div>
          </div>

          <Badge
            variant="outline"
            className="border-[#E8D27C]/30 bg-[#D4AF37]/15 text-[#F5E6B3]"
          >
            {rows.length} EVENTS
          </Badge>
        </div>

        <Separator className="my-4 bg-white/10" />

        <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-[#F5E6B3]">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/70">Actor</TableHead>
                    <TableHead className="text-white/70">Action</TableHead>
                    <TableHead className="text-white/70">Target</TableHead>
                    <TableHead className="text-white/70">IP</TableHead>
                    <TableHead className="text-white/70">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow className="border-white/10">
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-white/60"
                      >
                        No audit events found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r) => (
                      <TableRow key={r.id} className="border-white/10">
                        <TableCell className="text-white/85">
                          {r.actor}
                        </TableCell>
                        <TableCell className="text-[#F5E6B3]">
                          {r.action}
                        </TableCell>
                        <TableCell className="text-white/70">
                          {r.target ?? "—"}
                        </TableCell>
                        <TableCell className="text-white/70">
                          {r.ip ?? "—"}
                        </TableCell>
                        <TableCell className="text-white/70">
                          {new Date(r.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-3 text-xs text-white/50">
              Best practice: log all introductions, member profile views, role
              changes, and exports. Mask sensitive values.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
