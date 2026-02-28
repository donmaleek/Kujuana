// kujuana/apps/web/app/components/onboarding/BackgroundForm.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const schema = z.object({
  occupation: z.string().min(2, "Occupation required."),
  education: z.string().min(2, "Education required."),
  lifestyle: z.array(z.string()).min(1, "Select at least 1 lifestyle tag."),
  about: z.string().min(20, "Write at least 20 characters."),
});

export type BackgroundDetails = z.infer<typeof schema>;

const lifestyleTags = [
  "Fitness",
  "Faith",
  "Travel",
  "Entrepreneurship",
  "Family-oriented",
  "Quiet life",
  "Social life",
  "Music & arts",
  "Tech",
  "Outdoors",
];

export function BackgroundForm({
  initial,
  onBack,
  onNext,
}: {
  initial?: Partial<BackgroundDetails>;
  onBack?: () => void;
  onNext: (data: BackgroundDetails) => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [form, setForm] = useState<BackgroundDetails>(() => ({
    occupation: initial?.occupation ?? "",
    education: initial?.education ?? "",
    lifestyle: initial?.lifestyle ?? [],
    about: initial?.about ?? "",
  }));

  const toggle = (tag: string) => {
    setForm((s) => {
      const exists = s.lifestyle.includes(tag);
      return {
        ...s,
        lifestyle: exists ? s.lifestyle.filter((t) => t !== tag) : [...s.lifestyle, tag],
      };
    });
  };

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
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={form.occupation}
              onChange={(e) => setForm((s) => ({ ...s, occupation: e.target.value }))}
              placeholder="e.g. Software Engineer"
            />
            {err.occupation ? <p className="mt-1 text-xs text-red-300">{err.occupation}</p> : null}
          </div>

          <div>
            <Label htmlFor="education">Education</Label>
            <Input
              id="education"
              value={form.education}
              onChange={(e) => setForm((s) => ({ ...s, education: e.target.value }))}
              placeholder="e.g. University"
            />
            {err.education ? <p className="mt-1 text-xs text-red-300">{err.education}</p> : null}
          </div>
        </div>

        <div>
          <Label>Lifestyle</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {lifestyleTags.map((tag) => {
              const active = form.lifestyle.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(tag)}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition " +
                    (active
                      ? "border-[#E8D27C]/60 bg-[#E8D27C]/15 text-[#E8D27C]"
                      : "border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/5")
                  }
                >
                  {tag}
                </button>
              );
            })}
          </div>
          {err.lifestyle ? <p className="mt-1 text-xs text-red-300">{err.lifestyle}</p> : null}
        </div>

        <div>
          <Label htmlFor="about">About You</Label>
          <Textarea
            id="about"
            value={form.about}
            onChange={(e) => setForm((s) => ({ ...s, about: e.target.value }))}
            placeholder="A short, honest snapshot of who you are..."
          />
          {err.about ? <p className="mt-1 text-xs text-red-300">{err.about}</p> : null}
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