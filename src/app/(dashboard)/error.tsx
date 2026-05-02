"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24">
      <div className="text-5xl mb-6">⚠️</div>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
        Something went wrong
      </h2>
      <p className="text-slate-600 text-center mb-8 max-w-sm">
        An unexpected error occurred. Please try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="h-11 px-6 rounded-lg bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
