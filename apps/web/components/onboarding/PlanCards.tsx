// kujuana/apps/web/app/components/onboarding/PlanCards.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";

export type PlanTier = "standard" | "priority" | "vip";

export function PlanCards({
  value,
  onChange,
  className,
}: {
  value: PlanTier | null;
  onChange: (tier: PlanTier) => void;
  className?: string;
}) {
  const plans: {
    tier: PlanTier;
    title: string;
    price: string;
    desc: string;
    bullets: string[];
    highlight?: boolean;
  }[] = [
    {
      tier: "standard",
      title: "Standard",
      price: "Free",
      desc: "Slow nightly matching. Perfect to start intentionally.",
      bullets: ["Nightly batch matching", "Up to 3 active matches", "Basic filters"],
    },
    {
      tier: "priority",
      title: "Priority",
      price: "KES 500 / match",
      desc: "Instant matching when you need speed + clarity.",
      bullets: ["Instant processing", "Pay-per-match credits", "High priority queue"],
      highlight: true,
    },
    {
      tier: "vip",
      title: "VIP",
      price: "KES 10,000 / month",
      desc: "Curated introductions with a human matchmaker.",
      bullets: ["Matchmaker review", "Unlimited curated matches", "VIP add-ons unlocked"],
    },
  ];

  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {plans.map((p) => {
        const selected = value === p.tier;

        return (
          <Card
            key={p.tier}
            className={cn(
              "relative overflow-hidden",
              selected && "border-[#E8D27C]/50 shadow-[0_0_60px_rgba(232,210,124,0.08)]"
            )}
          >
            {p.highlight ? (
              <div className="absolute right-4 top-4">
                <Badge variant="gold">Most Chosen</Badge>
              </div>
            ) : null}

            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{p.title}</span>
                {selected ? <Badge variant="gold">Selected</Badge> : <Badge variant="muted">Choose</Badge>}
              </CardTitle>
              <CardDescription>{p.desc}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-extrabold text-[#F5E6B3]">{p.price}</div>

              <ul className="mt-4 space-y-2 text-sm text-white/70">
                {p.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#E8D27C]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-5 w-full"
                variant={selected ? "gold" : "outline"}
                onClick={() => onChange(p.tier)}
              >
                {selected ? "Selected" : "Select Plan"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}