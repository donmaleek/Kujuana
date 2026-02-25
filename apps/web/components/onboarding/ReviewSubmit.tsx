'use client';

import { useRouter } from 'next/navigation';

export function ReviewSubmit() {
  const router = useRouter();

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">
        Final review placeholder. Wire this button to `/api/v1/onboarding/submit` after saving all steps.
      </p>
      <button
        type="button"
        className="rounded bg-primary px-4 py-2 text-primary-foreground"
        onClick={() => router.push('/onboarding/complete')}
      >
        Submit Profile
      </button>
    </div>
  );
}
