'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await apiClient.post('/auth/reset-password', {
      token,
      password: form.get('password'),
    });
    router.replace('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold">New Password</h1>
        <input name="password" type="password" placeholder="New password" className="w-full border rounded p-2" />
        <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded">
          Reset Password
        </button>
      </form>
    </div>
  );
}
