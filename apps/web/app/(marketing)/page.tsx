import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold text-center mb-4">Welcome to Kujuana</h1>
      <p className="text-xl text-muted-foreground text-center max-w-2xl mb-8">
        A confidential, premium matchmaking service for the East African Muslim community.
      </p>
      <div className="flex gap-4">
        <Link
          href="/register"
          className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90"
        >
          Get Started
        </Link>
        <Link href="/pricing" className="border px-8 py-3 rounded-lg font-semibold hover:bg-muted">
          View Plans
        </Link>
      </div>
    </div>
  );
}
