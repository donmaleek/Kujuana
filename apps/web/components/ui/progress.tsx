// kujuana/apps/web/components/ui/progress.tsx
import * as React from "react";
import { cn } from "./utils";

export function Progress({
  value,
  className,
}: {
  value: number; // 0..100
  className?: string;
}) {
  const v = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-white/10",
        className
      )}
      aria-label="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
    >
      <div
        className="h-full rounded-full bg-[linear-gradient(135deg,#E8D27C,#D4AF37,#C9A227)] transition-all"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}