import { SubscriptionTier, TIER_CONFIG } from '@kujuana/shared';
import Link from 'next/link';

const tiers = [SubscriptionTier.Standard, SubscriptionTier.Priority, SubscriptionTier.VIP];

export function PricingTable() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {tiers.map((tier) => {
        const config = TIER_CONFIG[tier];
        return (
          <article key={tier} className="rounded-lg border p-6">
            <h3 className="text-xl font-semibold">{config.label}</h3>
            <p className="mt-3 text-3xl font-bold">KES {config.price.KES}</p>
            <p className="text-sm text-muted-foreground">or USD {config.price.USD}</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Credits per cycle: {config.creditsPerCycle}</li>
              <li>Matching cadence: {config.matchingCadence}</li>
              <li>Private photo access: {config.privatePhotoAccess ? 'Yes' : 'No'}</li>
              <li>Matchmaker access: {config.matchmakerAccess ? 'Yes' : 'No'}</li>
            </ul>
            <Link
              href="/register"
              className="mt-6 inline-flex w-full items-center justify-center rounded bg-primary px-4 py-2 text-primary-foreground"
            >
              Choose {config.label}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
