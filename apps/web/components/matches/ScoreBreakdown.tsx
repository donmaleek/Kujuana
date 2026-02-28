// kujuana/apps/web/components/matches/ScoreBreakdown.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export type ScoreBreakdownData = {
  total: number; // 0..100
  goals: number; // 0..30
  values: number; // 0..25
  lifestyle: number; // 0..20
  preferences: number; // 0..15
  readiness: number; // 0..10
  vipBonus?: number; // 0..5
};

function Row({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70">{label}</span>
        <span className="font-semibold text-[#F5E6B3]">
          {value.toFixed(1)} / {max}
        </span>
      </div>
      <Progress value={pct} />
    </div>
  );
}

export function ScoreBreakdown({ data }: { data: ScoreBreakdownData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compatibility Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Row label="Relationship Goals" value={data.goals} max={30} />
        <Row label="Values Alignment" value={data.values} max={25} />
        <Row label="Lifestyle Overlap" value={data.lifestyle} max={20} />
        <Row label="Preferences Fit" value={data.preferences} max={15} />
        <Row label="Emotional Readiness" value={data.readiness} max={10} />
        {typeof data.vipBonus === "number" ? (
          <Row label="VIP Bonus" value={data.vipBonus} max={5} />
        ) : null}

        <div className="pt-2 text-sm text-white/70">
          Total Score:{" "}
          <span className="font-extrabold text-[#E8D27C]">{Math.round(data.total)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}