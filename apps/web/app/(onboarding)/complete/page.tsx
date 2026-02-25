import Link from 'next/link';

export default function OnboardingCompletePage() {
  return (
    <div className="py-16 text-center">
      <h2 className="text-3xl font-bold mb-4">You're all set! 🎉</h2>
      <p className="text-muted-foreground mb-8">
        Your profile has been submitted. Our team will review it and you'll be notified when your
        first matches are ready.
      </p>
      <Link href="/matches" className="bg-primary text-primary-foreground px-8 py-3 rounded-lg">
        Go to Dashboard
      </Link>
    </div>
  );
}
