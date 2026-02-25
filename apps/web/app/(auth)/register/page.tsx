'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerSchema } from '@kujuana/shared';
import { apiClient } from '@/lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      fullName: form.get('fullName'),
      email: form.get('email'),
      phone: form.get('phone'),
      password: form.get('password'),
    };
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      setError(Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? 'Invalid input');
      return;
    }
    try {
      await apiClient.post('/auth/register', parsed.data);
      router.replace('/verify-email');
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold">Create Account</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input name="fullName" placeholder="Full Name" className="w-full border rounded p-2" />
        <input name="email" type="email" placeholder="Email" className="w-full border rounded p-2" />
        <input name="phone" placeholder="Phone (+254...)" className="w-full border rounded p-2" />
        <input name="password" type="password" placeholder="Password" className="w-full border rounded p-2" />
        <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded">
          Create Account
        </button>
        <p className="text-sm text-center">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
