import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] text-[#e7edf7] px-6">
      <div className="max-w-lg w-full rounded-xl border border-[#233252] bg-[#111a2c] p-6 shadow-lg text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-[#8aa0c7]">404</p>
        <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm text-[#9fb0cf]">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <div className="mt-6">
          <Link href="/" className="inline-flex rounded-lg bg-[#3ed6a6] px-4 py-2 text-sm font-medium text-[#0b1220] hover:opacity-90">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

