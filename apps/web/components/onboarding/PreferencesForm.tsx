// kujuana/apps/web/app/components/onboarding/PreferencesForm.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  preferredGender: z.enum(["male", "female"], { required_error: "Select preference." }),
  ageMin: z.number().int().min(18).max(80),
  ageMax: z.number().int().min(18).max(80),
  preferredCountry: z.string().min(2),
  dealBreakers: z.array(z.string()).optional(),
});

export type PreferencesData = z.infer<typeof schema>;

const commonDealBreakers = [
  "Dishonesty",
  "Unfaithfulness",
  "Substance abuse",
  "No emotional maturity",
  "No purpose/vision",
  "Disrespect",
];

export function PreferencesForm({
  initial,
  onBack,
  onNext,
}: {
  initial?: Partial<PreferencesData>;
  onBack?: () => void;
  onNext: (data: PreferencesData) => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [form, setForm] = useState<PreferencesData>(() => ({
    preferredGender: (initial?.preferredGender as any) ?? "female",
    ageMin: Number(initial?.ageMin ?? 23),
    ageMax: Number(initial?.ageMax ?? 35),
    preferredCountry: initial?.preferredCountry ?? "Kenya",
    dealBreakers: initial?.dealBreakers ?? [],
  }));

  const toggle = (d: string) => {
    setForm((s) => {
      const exists = s.dealBreakers?.includes(d);
      return { ...s, dealBreakers: exists ? s.dealBreakers?.filter((x) => x !== d) : [...(s.dealBreakers ?? []), d] };
    });
  };

  const submit = async () => {
    setErr({});
    if (form.ageMin > form.ageMax) {
      setErr({ ageMax: "Max age must be greater than min age." });
      return;
    }

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
          <Label>Preferred Gender</Label>
          <div className="mt-2 flex gap-2">
            {(["male", "female"] as const).map((g) => {
              const active = form.preferredGender === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm((s) => ({ ...s, preferredGender: g }))}
                  className={
                    "h-11 flex-1 rounded-2xl border text-sm font-semibold transition " +
                    (active
                      ? "border-[#E8D27C]/60 bg-[#E8D27C]/15 text-[#E8D27C]"
                      : "border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/5")
                  }
                >
                  {g === "male" ? "Male" : "Female"}
                </button>
              );
            })}
          </div>
          {err.preferredGender ? <p className="mt-1 text-xs text-red-300">{err.preferredGender}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="ageMin">Age Min</Label>
            <Input
              id="ageMin"
              type="number"
              value={form.ageMin}
              onChange={(e) => setForm((s) => ({ ...s, ageMin: Number(e.target.value) }))}
            />
            {err.ageMin ? <p className="mt-1 text-xs text-red-300">{err.ageMin}</p> : null}
          </div>
          <div>
            <Label htmlFor="ageMax">Age Max</Label>
            <Input
              id="ageMax"
              type="number"
              value={form.ageMax}
              onChange={(e) => setForm((s) => ({ ...s, ageMax: Number(e.target.value) }))}
            />
            {err.ageMax ? <p className="mt-1 text-xs text-red-300">{err.ageMax}</p> : null}
          </div>
        </div>

        <div>
          <Label htmlFor="preferredCountry">Preferred Country</Label>
          <Input
            id="preferredCountry"
            value={form.preferredCountry}
            onChange={(e) => setForm((s) => ({ ...s, preferredCountry: e.target.value }))}
            placeholder="Kenya"
          />
          {err.preferredCountry ? <p className="mt-1 text-xs text-red-300">{err.preferredCountry}</p> : null}
        </div>

        <div>
          <Label>Deal-breakers (Optional)</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {commonDealBreakers.map((d) => {
              const active = form.dealBreakers?.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggle(d)}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition " +
                    (active
                      ? "border-[#E8D27C]/60 bg-[#E8D27C]/15 text-[#E8D27C]"
                      : "border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/5")
                  }
                >
                  {d}
                </button>
              );
            })}
          </div>
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