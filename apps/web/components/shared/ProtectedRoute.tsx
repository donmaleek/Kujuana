// kujuana/apps/web/components/shared/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/lib/auth";

export function ProtectedRoute({
  children,
  requireProfileComplete,
}: {
  children: React.ReactNode;
  requireProfileComplete?: boolean;
}) {
  const router = useRouter();
  const { user, loading } = useMe();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (requireProfileComplete && !user.profileCompleted) {
      router.replace("/step/1-plan");
    }
  }, [user, loading, requireProfileComplete, router]);

  if (loading) return null;
  if (!user) return null;
  if (requireProfileComplete && !user.profileCompleted) return null;

  return <>{children}</>;
}
