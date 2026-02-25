'use client';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await apiClient.post('/auth/forgot-password', { email });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-center">If that email exists, a reset link has been sent.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
        />
        <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded">
          Send reset link
        </button>
      </form>
    </div>
  );
}
