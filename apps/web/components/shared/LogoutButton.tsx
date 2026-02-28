"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";

type LogoutButtonProps = {
  redirectTo?: string;
  label?: string;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
};

export function LogoutButton({
  redirectTo = "/",
  label = "Logout",
  className,
  variant = "gold",
  size = "default",
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      router.replace(redirectTo);
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleLogout}
      loading={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {label}
    </Button>
  );
}
