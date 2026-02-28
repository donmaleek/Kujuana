// kujuana/apps/web/components/onboarding/Stepper.tsx
"use client";

import { cn } from "@/components/ui/utils";
import { Progress } from "@/components/ui/progress";

export type OnboardingStepKey =
  | "plan"
  | "basic"
  | "background"
  | "photos"
  | "vision"
  | "preferences"
  | "review";

const steps: { key: OnboardingStepKey; label: string }[] = [
  { key: "plan", label: "Plan" },
  { key: "basic", label: "Basic" },
  { key: "background", label: "Background" },
  { key: "photos", label: "Photos" },
  { key: "vision", label: "Vision" },
  { key: "preferences", label: "Preferences" },
  { key: "review", label: "Review" },
];

export function Stepper({
  current,
  className,
}: {
  current: OnboardingStepKey;
  className?: string;
}) {
  const idx = Math.max(0, steps.findIndex((s) => s.key === current));
  const progress = Math.round(((idx + 1) / steps.length) * 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, i) => {
          const done = i < idx;
          const active = i === idx;

          return (
            <div key={s.key} className="flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold",
                    done
                      ? "border-[#E8D27C]/60 bg-[#E8D27C]/15 text-[#E8D27C]"
                      : active
                      ? "border-[#E8D27C]/50 bg-white/[0.03] text-[#F5E6B3]"
                      : "border-white/10 bg-white/[0.02] text-white/50"
                  )}
                  aria-hidden="true"
                >
                  {i + 1}
                </div>
                <div
                  className={cn(
                    "text-xs font-semibold tracking-wide hidden sm:block",
                    done
                      ? "text-[#E8D27C]"
                      : active
                      ? "text-[#F5E6B3]"
                      : "text-white/55"
                  )}
                >
                  {s.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <Progress value={progress} />
        <div className="mt-2 text-xs text-white/60">
          Step {idx + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
}