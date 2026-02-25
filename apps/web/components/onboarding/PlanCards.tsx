import Link from 'next/link';
import { SubscriptionTier, TIER_CONFIG } from '@kujuana/shared';

const tiers = [SubscriptionTier.Standard, SubscriptionTier.Priority, SubscriptionTier.VIP];

export function PlanCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tiers.map((tier) => {
        const config = TIER_CONFIG[tier];
        return (
          <div key={tier} className="rounded-lg border p-4">
            <h3 className="text-lg font-semibold">{config.label}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {config.matchingCadence} matching, {config.creditsPerCycle} credits/cycle
            </p>
            <p className="mt-3 text-xl font-bold">KES {config.price.KES}</p>
            <Link
              href="/onboarding/step/2-basic-details"
              className="mt-4 inline-block rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              Select {config.label}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
