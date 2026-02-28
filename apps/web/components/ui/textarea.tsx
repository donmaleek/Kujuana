// kujuana/apps/web/components/ui/textarea.tsx
"use client";

import * as React from "react";
import { cn } from "./utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white " +
            "placeholder:text-white/40 outline-none transition " +
            "focus:border-[#E8D27C]/40 focus:ring-2 focus:ring-[#E8D27C]/20",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";