"use client";

import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-[#0b1220] text-[#e7edf7]">
      <div className="max-w-lg w-full rounded-xl border border-[#233252] bg-[#111a2c] p-6 shadow-lg">
        <p className="text-xs uppercase tracking-[0.25em] text-[#8aa0c7]">Something went wrong</p>
        <h1 className="mt-3 text-2xl font-semibold">We couldn’t load this page.</h1>
        <p className="mt-3 text-sm text-[#9fb0cf]">
          An unexpected error occurred while rendering the app. You can retry or go back to the dashboard.
        </p>
        {error.digest ? <p className="mt-4 text-xs text-[#6f83a7]">Error ID: {error.digest}</p> : null}
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

