export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-line border-t-accent animate-spin" />
        </div>
        <div className="text-sm text-muted">Loading…</div>
      </div>
    </div>
  );
}

