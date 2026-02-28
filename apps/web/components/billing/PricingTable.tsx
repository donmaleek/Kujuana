// kujuana/apps/web/components/billing/PricingTable.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type PricingChoice =
  | { kind: "priority_single"; label: string; priceKes: number; credits: number }
  | { kind: "priority_5"; label: string; priceKes: number; credits: number }
  | { kind: "priority_10"; label: string; priceKes: number; credits: number }
  | { kind: "vip_monthly"; label: string; priceKes: number; credits?: number };

const choices: PricingChoice[] = [
  { kind: "priority_single", label: "Priority • 1 Match", priceKes: 500, credits: 1 },
  { kind: "priority_5", label: "Priority • 5 Pack", priceKes: 2000, credits: 5 },
  { kind: "priority_10", label: "Priority • 10 Pack", priceKes: 3500, credits: 10 },
  { kind: "vip_monthly", label: "VIP • Monthly", priceKes: 10000 },
];

export function PricingTable({
  onSelect,
}: {
  onSelect: (choice: PricingChoice) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {choices.map((c) => (
        <Card key={c.kind} className={c.kind === "vip_monthly" ? "border-[#E8D27C]/25" : undefined}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{c.label}</span>
              {c.kind === "vip_monthly" ? <Badge variant="gold">Curated</Badge> : <Badge variant="muted">Instant</Badge>}
            </CardTitle>
            <CardDescription>
              {c.kind === "vip_monthly"
                ? "Human matchmaker review, premium add-ons, deeper privacy controls."
                : "Instant dispatch, highest queue priority, pay-per-match credits."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-extrabold text-[#F5E6B3]">
              KES {c.priceKes.toLocaleString()}
            </div>
            {"credits" in c ? (
              <div className="mt-2 text-sm text-white/70">
                Credits: <span className="font-semibold text-white">{c.credits}</span>
              </div>
            ) : (
              <div className="mt-2 text-sm text-white/70">Unlimited curated introductions</div>
            )}

            <Button className="mt-5 w-full" variant={c.kind === "vip_monthly" ? "gold" : "outline"} onClick={() => onSelect(c)}>
              Choose
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}