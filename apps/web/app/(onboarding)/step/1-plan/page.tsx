import { PlanCards } from '@/components/onboarding/PlanCards';

export default function PlanSelectionPage() {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-2">Choose your plan</h2>
      <p className="text-muted-foreground mb-8">Select the membership that's right for you.</p>
      <PlanCards />
    </div>
  );
}
