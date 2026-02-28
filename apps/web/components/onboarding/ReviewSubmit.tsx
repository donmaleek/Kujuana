// kujuana/apps/web/app/components/onboarding/ReviewSubmit.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function ReviewSubmit({
  summary,
  planLabel,
  onBack,
  onSubmit,
}: {
  summary: Array<{ label: string; value: string }>;
  planLabel: string;
  onBack?: () => void;
  onSubmit: () => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await onSubmit();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Review & Submit</span>
          <Badge variant="gold">{planLabel}</Badge>
        </CardTitle>
        <CardDescription>
          Make sure this represents you well. Your matches will be built from this.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {summary.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4">
              <div className="text-sm text-white/60">{row.label}</div>
              <div className="text-sm font-semibold text-[#F5E6B3] text-right">{row.value}</div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={onBack} type="button">
            Back
          </Button>
          <Button variant="gold" loading={loading} onClick={submit} type="button">
            Finish & Activate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}