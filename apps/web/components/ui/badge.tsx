// kujuana/apps/web/components/ui/badge.tsx
import * as React from "react";
import { cn } from "./utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "gold" | "muted" | "outline";
}) {
  const styles =
    variant === "gold"
      ? "bg-[#E8D27C]/15 text-[#E8D27C] border-[#E8D27C]/30"
      : variant === "outline"
      ? "bg-transparent text-white/85 border-white/25"
      : variant === "muted"
      ? "bg-white/5 text-white/70 border-white/10"
      : "bg-[#4A1663]/50 text-white border-white/10";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
        styles,
        className
      )}
      {...props}
    />
  );
}
