// kujuana/apps/web/components/ui/dialog.tsx
"use client";

import * as React from "react";
import { cn } from "./utils";

type DialogCtx = { open: boolean; setOpen: (v: boolean) => void };
const Ctx = React.createContext<DialogCtx | null>(null);

export function Dialog({
  open: controlledOpen,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const [open, setOpenState] = React.useState(false);
  const isControlled = typeof controlledOpen === "boolean";
  const actualOpen = isControlled ? controlledOpen : open;

  const setOpen = (v: boolean) => {
    if (!isControlled) setOpenState(v);
    onOpenChange?.(v);
  };

  return <Ctx.Provider value={{ open: actualOpen, setOpen }}>{children}</Ctx.Provider>;
}

export function DialogTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("DialogTrigger must be used within Dialog");

  const child = React.Children.only(children) as React.ReactElement<any>;
  const props = {
    onClick: (e: any) => {
      child.props?.onClick?.(e);
      ctx.setOpen(true);
    },
  };

  if (asChild) return React.cloneElement(child, props);
  return <button type="button" {...props}>{children}</button>;
}

export function DialogContent({
  children,
  className,
  title,
  description,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("DialogContent must be used within Dialog");
  if (!ctx.open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => ctx.setOpen(false)}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            "w-full max-w-lg rounded-2xl border border-[#E8D27C]/20 bg-[#18021F]/95 backdrop-blur " +
              "shadow-[0_0_60px_rgba(232,210,124,0.08)]",
            className
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-6 pb-3">
            {title ? (
              <h2 className="text-lg font-semibold text-[#F5E6B3]">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-white/70">{description}</p>
            ) : null}
          </div>
          <div className="p-6 pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function DialogClose({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("DialogClose must be used within Dialog");

  const child = React.Children.only(children) as React.ReactElement<any>;
  const props = {
    onClick: (e: any) => {
      child.props?.onClick?.(e);
      ctx.setOpen(false);
    },
  };

  if (asChild) return React.cloneElement(child, props);
  return <button type="button" {...props}>{children}</button>;
}