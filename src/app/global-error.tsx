"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b1220] text-[#e7edf7]">
        <div className="min-h-screen flex items-center justify-center px-6 py-16">
          <div className="max-w-lg w-full rounded-xl border border-[#233252] bg-[#111a2c] p-6 shadow-lg">
            <p className="text-xs uppercase tracking-[0.25em] text-[#8aa0c7]">Application error</p>
            <h1 className="mt-3 text-2xl font-semibold">The app hit a fatal error.</h1>
            <p className="mt-3 text-sm text-[#9fb0cf]">
              Please retry. If the issue persists, refresh the page or return to the home screen.
            </p>
            {error.digest ? <p className="mt-4 text-xs text-[#6f83a7]">Error ID: {error.digest}</p> : null}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg bg-[#3ed6a6] px-4 py-2 text-sm font-medium text-[#0b1220] hover:opacity-90"
              >
                Retry
              </button>
              <Link href="/" className="rounded-lg border border-[#233252] px-4 py-2 text-sm text-[#e7edf7] hover:bg-[#162238]">
                Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

