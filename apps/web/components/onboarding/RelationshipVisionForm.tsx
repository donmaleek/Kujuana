// kujuana/apps/web/app/components/onboarding/RelationshipVisionForm.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const schema = z.object({
  relationshipGoal: z.enum(["marriage", "serious", "intentional_dating"], {
    required_error: "Choose a goal.",
  }),
  lifeVision: z.string().min(20, "Write at least 20 characters."),
  idealPartnerDescription: z.string().min(20, "Write at least 20 characters."),
});

export type VisionData = z.infer<typeof schema>;

export function RelationshipVisionForm({
  initial,
  onBack,
  onNext,
}: {
  initial?: Partial<VisionData>;
  onBack?: () => void;
  onNext: (data: VisionData) => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [form, setForm] = useState<VisionData>(() => ({
    relationshipGoal: (initial?.relationshipGoal as any) ?? "intentional_dating",
    lifeVision: initial?.lifeVision ?? "",
    idealPartnerDescription: initial?.idealPartnerDescription ?? "",
  }));

  const submit = async () => {
    setErr({});
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0]?.toString() ?? "form";
        e[k] = i.message;
      });
      setErr(e);
      return;
    }
    setLoading(true);
    try {
      await onNext(parsed.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-5">
        <div>
          <Label>Relationship Goal</Label>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {[
              { k: "intentional_dating", t: "Intentional Dating" },
              { k: "serious", t: "Serious Relationship" },
              { k: "marriage", t: "Marriage" },
            ].map((o) => {
              const active = form.relationshipGoal === (o.k as any);
              return (
                <button
                  key={o.k}
                  type="button"
                  onClick={() => setForm((s) => ({ ...s, relationshipGoal: o.k as any }))}
                  className={
                    "h-11 rounded-2xl border text-sm font-semibold transition " +
                    (active
                      ? "border-[#E8D27C]/60 bg-[#E8D27C]/15 text-[#E8D27C]"
                      : "border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/5")
                  }
                >
                  {o.t}
                </button>
              );
            })}
          </div>
          {err.relationshipGoal ? <p className="mt-1 text-xs text-red-300">{err.relationshipGoal}</p> : null}
        </div>

        <div>
          <Label htmlFor="lifeVision">Your Life Vision</Label>
          <Textarea
            id="lifeVision"
            value={form.lifeVision}
            onChange={(e) => setForm((s) => ({ ...s, lifeVision: e.target.value }))}
            placeholder="What kind of life are you building?"
          />
          {err.lifeVision ? <p className="mt-1 text-xs text-red-300">{err.lifeVision}</p> : null}
        </div>

        <div>
          <Label htmlFor="idealPartnerDescription">Ideal Partner</Label>
          <Textarea
            id="idealPartnerDescription"
            value={form.idealPartnerDescription}
            onChange={(e) => setForm((s) => ({ ...s, idealPartnerDescription: e.target.value }))}
            placeholder="Describe the kind of person you want to build with."
          />
          {err.idealPartnerDescription ? (
            <p className="mt-1 text-xs text-red-300">{err.idealPartnerDescription}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={onBack} type="button">
            Back
          </Button>
          <Button variant="gold" loading={loading} onClick={submit} type="button">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}