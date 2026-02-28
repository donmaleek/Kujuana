// kujuana/apps/web/components/shared/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

export function Navbar() {
  const pathname = usePathname();

  const nav = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#18021F]/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/logo.png"
            alt="Kujuana logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <div className="leading-tight">
            <div className="text-sm font-extrabold text-[#F5E6B3] tracking-wide">Kujuana</div>
            <div className="text-xs text-white/60">Dating with Intention</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {nav.map((n) => {
            const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition",
                  active ? "text-[#E8D27C] bg-[#E8D27C]/10" : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="gold" size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
