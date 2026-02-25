import { PricingTable } from '@/components/billing/PricingTable';

export default function PricingPage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>
      <PricingTable />
    </div>
  );
}
