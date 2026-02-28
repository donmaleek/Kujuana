import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Kujuana Admin • Luxury Matchmaker Portal",
  description: "Admin and Matchmaker portal for Kujuana — Dating with Intention.",
};

type Role = "admin" | "manager" | "matchmaker" | "user";

function getRoleFromCookies(): Role | null {
  // Expected: your auth layer sets a role cookie.
  // Example cookie keys you might already use: kujuana_role, role, user_role
  const jar = cookies();
  const role =
    jar.get("kujuana_role")?.value ||
    jar.get("role")?.value ||
    jar.get("user_role")?.value;

  if (role === "admin" || role === "manager" || role === "matchmaker" || role === "user") return role;
  return null;
}

function requireAdminAccess() {
  const role = getRoleFromCookies();
  if (!role) redirect("/login");
  if (role !== "admin" && role !== "manager" && role !== "matchmaker") redirect("/dashboard");
  return role;
}

function NavItem({
  href,
  title,
  hint,
}: {
  href: string;
  title: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-[#E8D27C]/20 bg-white/5 px-4 py-3 text-sm text-white/90 shadow-sm backdrop-blur transition hover:border-[#E8D27C]/40 hover:bg-white/10"
    >
      <div className="min-w-0">
        <div className="font-medium tracking-wide">{title}</div>
        {hint ? (
          <div className="mt-0.5 line-clamp-1 text-xs text-[#F5E6B3]/80">
            {hint}
          </div>
        ) : null}
      </div>
      <span className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/15 text-[#E8D27C] transition group-hover:bg-[#D4AF37]/25">
        →
      </span>
    </Link>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = requireAdminAccess();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#3B0F4F,#2A0838)] text-white">
      {/* Subtle luxury glow */}
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute left-[-20%] top-[-30%] h-[520px] w-[520px] rounded-full bg-[#D4AF37]/20 blur-[90px]" />
        <div className="absolute right-[-15%] top-[10%] h-[540px] w-[540px] rounded-full bg-[#E8D27C]/18 blur-[100px]" />
        <div className="absolute bottom-[-30%] left-[20%] h-[620px] w-[620px] rounded-full bg-[#C9A227]/14 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-6">
        {/* Sidebar */}
        <aside className="hidden w-[280px] shrink-0 md:block">
          <div className="sticky top-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <Link href="/admin/dashboard" className="group">
                <div className="text-lg font-semibold tracking-wide">
                  Kujuana <span className="text-[#E8D27C]">Admin</span>
                </div>
                <div className="text-xs text-white/60">
                  Luxury matchmaker portal
                </div>
              </Link>

              <Badge
                className="border-[#E8D27C]/30 bg-[#D4AF37]/15 text-[#F5E6B3]"
                variant="outline"
              >
                {role.toUpperCase()}
              </Badge>
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-2">
              <NavItem
                href="/admin/dashboard"
                title="Dashboard"
                hint="Stats, revenue, system health"
              />
              <NavItem
                href="/admin/queue"
                title="Queue"
                hint="VIP & Priority pending introductions"
              />
              <NavItem
                href="/admin/members"
                title="Members"
                hint="Search and inspect profiles"
              />
              <NavItem
                href="/admin/audit"
                title="Audit"
                hint="Security logs & admin activity"
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-2">
              <Link href="/dashboard" className="block">
                <Button
                  variant="secondary"
                  className="w-full border border-white/10 bg-white/10 text-white hover:bg-white/15"
                >
                  Back to User Dashboard
                </Button>
              </Link>

              <form action="/api/v1/auth/logout" method="POST">
                <Button
                  type="submit"
                  className="w-full bg-[#D4AF37] text-[#18021F] hover:bg-[#E8D27C]"
                >
                  Logout
                </Button>
              </form>

              <div className="pt-2 text-center text-xs text-white/50">
                © {new Date().getFullYear()} Kujuana
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Top bar (mobile + breadcrumbs feel) */}
          <header className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur md:hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold tracking-wide">
                  Kujuana <span className="text-[#E8D27C]">Admin</span>
                </div>
                <div className="text-xs text-white/60">
                  Luxury matchmaker portal
                </div>
              </div>
              <Badge
                className="border-[#E8D27C]/30 bg-[#D4AF37]/15 text-[#F5E6B3]"
                variant="outline"
              >
                {role.toUpperCase()}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/admin/dashboard">
                <Button
                  variant="secondary"
                  className="w-full border border-white/10 bg-white/10 text-white hover:bg-white/15"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/admin/queue">
                <Button
                  variant="secondary"
                  className="w-full border border-white/10 bg-white/10 text-white hover:bg-white/15"
                >
                  Queue
                </Button>
              </Link>
              <Link href="/admin/members">
                <Button
                  variant="secondary"
                  className="w-full border border-white/10 bg-white/10 text-white hover:bg-white/15"
                >
                  Members
                </Button>
              </Link>
              <Link href="/admin/audit">
                <Button
                  variant="secondary"
                  className="w-full border border-white/10 bg-white/10 text-white hover:bg-white/15"
                >
                  Audit
                </Button>
              </Link>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
