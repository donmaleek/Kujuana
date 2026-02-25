'use client';

import { useState } from 'react';

export function PhotosUploader() {
  const [message, setMessage] = useState('No upload yet');

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">
        Connect this component to `/api/v1/upload/sign` and `/api/v1/upload/confirm`.
      </p>
      <button
        type="button"
        className="rounded bg-primary px-4 py-2 text-primary-foreground"
        onClick={() => setMessage('Upload flow placeholder ready')}
      >
        Simulate Upload
      </button>
      <p className="text-sm">{message}</p>
    </div>
  );
}
