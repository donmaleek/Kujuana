// kujuana/apps/web/components/ui/button.tsx
"use client";

import * as React from "react";
import { cn } from "./utils";

export type ButtonVariant =
  | "default"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive"
  | "gold";

export type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D27C]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18021F] " +
  "disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-[#4A1663] text-white shadow-sm hover:bg-[#3B0F4F] hover:shadow-md",
  secondary:
    "bg-[#2A0838] text-white/90 hover:text-white hover:bg-[#18021F]",
  ghost: "bg-transparent text-white/90 hover:bg-white/5 hover:text-white",
  outline:
    "bg-transparent border border-[#E8D27C]/30 text-[#F5E6B3] hover:border-[#E8D27C]/60 hover:bg-[#E8D27C]/10",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400/50",
  gold:
    "text-[#18021F] shadow-md " +
    "bg-[linear-gradient(135deg,#E8D27C,#D4AF37,#C9A227)] " +
    "hover:brightness-105 hover:shadow-lg",
};

const sizes: Record<ButtonSize, string> = {
  default: "h-11 px-5",
  sm: "h-9 px-4 rounded-xl",
  lg: "h-12 px-6 text-base",
  icon: "h-11 w-11 px-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
        aria-busy={loading ? "true" : "false"}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
            <span>Loading</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";