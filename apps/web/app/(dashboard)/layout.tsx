import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex">
        <aside className="w-64 border-r bg-card p-4 hidden md:block">
          <nav className="space-y-2">
            <a href="/matches" className="block px-3 py-2 rounded hover:bg-muted">Matches</a>
            <a href="/profile" className="block px-3 py-2 rounded hover:bg-muted">Profile</a>
            <a href="/subscription" className="block px-3 py-2 rounded hover:bg-muted">Subscription</a>
            <a href="/settings" className="block px-3 py-2 rounded hover:bg-muted">Settings</a>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
