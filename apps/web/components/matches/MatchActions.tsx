// kujuana/apps/web/components/matches/MatchActions.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

export function MatchActions({
  matchId,
  status,
  onChanged,
}: {
  matchId: string;
  status: "pending" | "accepted" | "declined" | "expired";
  onChanged?: () => void;
}) {
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  const act = async (action: "accept" | "decline") => {
    setLoading(action);
    try {
      await apiClient.patch(`/matches/${matchId}/respond`, { action });
      onChanged?.();
    } finally {
      setLoading(null);
    }
  };

  const disabled = status !== "pending";

  return (
    <div className="flex gap-3">
      <Button
        variant="gold"
        loading={loading === "accept"}
        disabled={disabled}
        onClick={() => act("accept")}
      >
        Accept
      </Button>
      <Button
        variant="outline"
        loading={loading === "decline"}
        disabled={disabled}
        onClick={() => act("decline")}
      >
        Decline
      </Button>
    </div>
  );
}