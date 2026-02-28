// kujuana/apps/web/components/ui/input.tsx
"use client";

import * as React from "react";
import { cn } from "./utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-11 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white " +
            "placeholder:text-white/40 outline-none transition " +
            "focus:border-[#E8D27C]/40 focus:ring-2 focus:ring-[#E8D27C]/20",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";