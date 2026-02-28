// kujuana/apps/web/components/ui/tabs.tsx
"use client";

import * as React from "react";
import { cn } from "./utils";

type TabsCtx = { value: string; setValue: (v: string) => void };
const Ctx = React.createContext<TabsCtx | null>(null);

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
}: {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
}) {
  const [value, setValueState] = React.useState(defaultValue);
  const isControlled = typeof controlledValue === "string";
  const actualValue = isControlled ? controlledValue : value;

  const setValue = (v: string) => {
    if (!isControlled) setValueState(v);
    onValueChange?.(v);
  };

  return <Ctx.Provider value={{ value: actualValue, setValue }}>{children}</Ctx.Provider>;
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex rounded-2xl border border-white/10 bg-white/[0.03] p-1",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs");
  const active = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={cn(
        "px-4 py-2 text-sm font-semibold rounded-xl transition",
        active
          ? "bg-[linear-gradient(135deg,#E8D27C,#D4AF37,#C9A227)] text-[#18021F]"
          : "text-white/70 hover:text-white hover:bg-white/5",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("TabsContent must be used within Tabs");
  if (ctx.value !== value) return null;

  return <div className={cn("mt-4", className)}>{children}</div>;
}