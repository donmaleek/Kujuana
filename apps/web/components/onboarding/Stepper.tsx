'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

export function Stepper({ totalSteps }: { totalSteps: number }) {
  const pathname = usePathname();
  const currentStep = useMemo(() => {
    const match = pathname.match(/\/step\/(\d+)-/);
    if (!match) return 1;
    return Math.min(totalSteps, Math.max(1, Number(match[1])));
  }, [pathname, totalSteps]);

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Step {currentStep}</span>
        <span>{totalSteps} total</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
