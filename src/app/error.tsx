"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card p-8 max-w-md text-center">
        <p className="text-brand-gold font-semibold mb-2">Something went wrong</p>
        <p className="text-sm text-white/60 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="bg-brand-gold text-brand-navy font-medium rounded-lg px-4 py-2 text-sm"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
