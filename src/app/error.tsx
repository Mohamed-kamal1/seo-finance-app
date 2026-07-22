"use client";

import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Log details for debugging (only in dev mode)
  if (process.env.NODE_ENV === "development") {
    console.error("Page error caught by error.tsx:", {
      message: error.message,
      digest: error.digest,
      name: error.name,
      stack: error.stack,
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-[#0b1220] text-[#e7edf7]">
      <div className="max-w-lg w-full rounded-xl border border-[#233252] bg-[#111a2c] p-6 shadow-lg">
        <p className="text-xs uppercase tracking-[0.25em] text-[#8aa0c7]">Something went wrong</p>
        <h1 className="mt-3 text-xl font-display text-white">We couldn&apos;t load this page.</h1>
        <p className="mt-3 text-sm text-[#9fb0cf]">
          An unexpected error occurred while rendering the app. You can retry or go back to the dashboard.
        </p>
        {error.digest ? <p className="mt-4 text-xs text-[#6f83a7]">Error ID: {error.digest}</p> : null}
        {process.env.NODE_ENV === "development" && error.message ? (
          <div className="mt-3 p-3 rounded-md bg-[rgba(240,101,79,0.08)] border border-danger/30">
            <p className="text-xs text-danger font-mono break-words">{error.message}</p>
          </div>
        ) : null}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-[#3ed6a6] px-4 py-2 text-sm font-medium text-[#0b1220] hover:opacity-90"
          >
            Try again
          </button>
          <Link href="/" className="rounded-lg border border-[#233252] px-4 py-2 text-sm text-[#e7edf7] hover:bg-[#162238]">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

