// kujuana/apps/web/components/matches/MatchCard.tsx
"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";

export type MatchSummary = {
  id: string;
  fullName: string;
  age: number;
  city: string;
  country: string;
  score: number; // 0..100
  status: "pending" | "accepted" | "declined" | "expired";
  tier?: "standard" | "priority" | "vip";
};

export function MatchCard({ match }: { match: MatchSummary }) {
  const scoreTone =
    match.score >= 85 ? "gold" : match.score >= 70 ? "default" : "muted";

  return (
    <Link href={`/matches/${match.id}`} className="block">
      <Card className={cn("hover:bg-white/[0.04] transition-colors")}>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="truncate text-base font-semibold text-[#F5E6B3]">
                {match.fullName}
              </div>
              <Badge variant="muted">{match.age}</Badge>
              {match.tier ? <Badge variant="gold">{match.tier.toUpperCase()}</Badge> : null}
            </div>
            <div className="mt-1 text-sm text-white/60 truncate">
              {match.city}, {match.country} • Status:{" "}
              <span className="text-white/80 font-semibold">{match.status}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={scoreTone as any}>
              {Math.round(match.score)}%
            </Badge>
            <div className="h-9 w-9 rounded-full border border-[#E8D27C]/20 bg-[#E8D27C]/10 flex items-center justify-center text-[#E8D27C] font-black">
              →
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
