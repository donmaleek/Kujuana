// kujuana/apps/web/lib/auth.ts
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

export type MeUser = {
  id: string;
  email: string;
  fullName: string;
  tier: "standard" | "priority" | "vip";
  credits: number;
  profileCompleted: boolean;
};

export function useMe() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // Expected API: GET /auth/me -> user payload
        const me = await apiClient.get<MeUser>("/auth/me");
        if (!alive) return;
        setUser(me);
      } catch {
        if (!alive) return;
        setUser(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { user, loading };
}