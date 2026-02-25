'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@kujuana/shared';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = { email: form.get('email'), password: form.get('password') };
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      setError('Invalid email or password format');
      return;
    }
    try {
      const res = await apiClient.post<{ accessToken: string; userId: string }>(
        '/auth/login',
        parsed.data,
      );
      setAuth(res.accessToken, res.userId);
      router.replace('/matches');
    } catch {
      setError('Invalid credentials');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold">Sign In</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input name="email" type="email" placeholder="Email" className="w-full border rounded p-2" />
        <input name="password" type="password" placeholder="Password" className="w-full border rounded p-2" />
        <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded">
          Sign In
        </button>
        <p className="text-sm text-center">
          No account?{' '}
          <Link href="/register" className="underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
