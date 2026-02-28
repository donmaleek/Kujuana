// kujuana/apps/web/components/ui/label.tsx
import * as React from "react";
import { cn } from "./utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-white/80 leading-none",
        className
      )}
      {...props}
    />
  );
}