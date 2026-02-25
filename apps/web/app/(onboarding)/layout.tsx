import { Stepper } from '@/components/onboarding/Stepper';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-2xl py-8 px-4">
        <Stepper totalSteps={7} />
        {children}
      </div>
    </div>
  );
}
