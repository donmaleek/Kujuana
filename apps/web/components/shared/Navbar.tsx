import Link from 'next/link';

export function Navbar() {
  return (
    <header className="border-b bg-background/90 backdrop-blur">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold">
          Kujuana
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="hover:underline">
            Pricing
          </Link>
          <Link href="/login" className="hover:underline">
            Login
          </Link>
          <Link href="/register" className="rounded bg-primary px-3 py-1.5 text-primary-foreground">
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
