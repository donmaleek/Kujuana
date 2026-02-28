// kujuana/apps/web/components/billing/PaymentStatus.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";

type Status = "pending" | "completed" | "failed" | "cancelled";

export function PaymentStatus({
  reference,
  pollMs = 3000,
  maxSeconds = 90,
  onDone,
}: {
  reference: string;
  pollMs?: number;
  maxSeconds?: number;
  onDone?: (final: Status) => void;
}) {
  const [status, setStatus] = useState<Status>("pending");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let alive = true;
    let t: any;

    const tick = async () => {
      try {
        const res = await apiClient.get<{ status: Status }>(`/payments/${reference}/status`);
        if (!alive) return;

        setStatus(res.status);
        if (res.status !== "pending") {
          onDone?.(res.status);
          return;
        }
      } catch {
        // keep polling; network hiccups happen
      }

      t = setTimeout(() => {
        if (!alive) return;
        setSeconds((s) => s + Math.round(pollMs / 1000));
        tick();
      }, pollMs);
    };

    tick();

    return () => {
      alive = false;
      if (t) clearTimeout(t);
    };
  }, [reference, pollMs, onDone]);

  useEffect(() => {
    if (seconds >= maxSeconds && status === "pending") {
      setStatus("failed");
      onDone?.("failed");
    }
  }, [seconds, maxSeconds, status, onDone]);

  const badgeVariant =
    status === "completed" ? "gold" : status === "pending" ? "muted" : "default";

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-white/60">Payment Reference</div>
          <div className="text-sm font-semibold text-[#F5E6B3] break-all">{reference}</div>
        </div>

        <div className="text-right">
          <Badge variant={badgeVariant as any}>
            {status.toUpperCase()}
          </Badge>
          {status === "pending" ? (
            <div className="mt-1 text-xs text-white/60">Waiting… {seconds}s</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}