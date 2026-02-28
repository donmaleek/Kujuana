// kujuana/apps/web/app/components/onboarding/BasicDetailsForm.tsx
"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  gender: z.enum(["male", "female"], { required_error: "Choose a gender." }),
  birthYear: z
    .number()
    .int()
    .min(1940, "Year looks too old.")
    .max(new Date().getFullYear() - 18, "You must be 18+."),
  country: z.string().min(2, "Enter your country."),
  city: z.string().min(2, "Enter your city."),
});

export type BasicDetails = z.infer<typeof schema>;

export function BasicDetailsForm({
  initial,
  onBack,
  onNext,
}: {
  initial?: Partial<BasicDetails>;
  onBack?: () => void;
  onNext: (data: BasicDetails) => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});

  const [form, setForm] = useState<BasicDetails>(() => ({
    fullName: initial?.fullName ?? "",
    gender: (initial?.gender as any) ?? "male",
    birthYear: Number(initial?.birthYear ?? 1998),
    country: initial?.country ?? "Kenya",
    city: initial?.city ?? "",
  }));

  const age = useMemo(() => new Date().getFullYear() - Number(form.birthYear || 0), [form.birthYear]);

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
    <Card className="overflow-hidden">
      <CardContent className="space-y-5">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={form.fullName}
            onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
            placeholder="Your real name"
          />
          {err.fullName ? <p className="mt-1 text-xs text-red-300">{err.fullName}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Gender</Label>
            <div className="mt-2 flex gap-2">
              {(["male", "female"] as const).map((g) => {
                const active = form.gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm((s) => ({ ...s, gender: g }))}
                    className={cn(
                      "h-11 flex-1 rounded-2xl border text-sm font-semibold transition",
                      active
                        ? "border-[#E8D27C]/60 bg-[#E8D27C]/15 text-[#E8D27C]"
                        : "border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {g === "male" ? "Male" : "Female"}
                  </button>
                );
              })}
            </div>
            {err.gender ? <p className="mt-1 text-xs text-red-300">{err.gender}</p> : null}
          </div>

          <div>
            <Label htmlFor="birthYear">Birth Year</Label>
            <Input
              id="birthYear"
              type="number"
              value={form.birthYear}
              onChange={(e) => setForm((s) => ({ ...s, birthYear: Number(e.target.value) }))}
              placeholder="e.g. 1998"
            />
            <p className="mt-1 text-xs text-white/60">Age: {Number.isFinite(age) ? age : "-"}</p>
            {err.birthYear ? <p className="mt-1 text-xs text-red-300">{err.birthYear}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={form.country}
              onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))}
              placeholder="Kenya"
            />
            {err.country ? <p className="mt-1 text-xs text-red-300">{err.country}</p> : null}
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
              placeholder="Nairobi"
            />
            {err.city ? <p className="mt-1 text-xs text-red-300">{err.city}</p> : null}
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