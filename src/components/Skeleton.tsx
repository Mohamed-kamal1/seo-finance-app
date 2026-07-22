export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="h-3 w-24 bg-[rgba(140,160,196,0.08)] rounded shimmer mb-3" />
      <div className="h-7 w-32 bg-[rgba(140,160,196,0.08)] rounded shimmer" />
      <div className="h-3 w-20 bg-[rgba(140,160,196,0.08)] rounded shimmer mt-2" />
    </div>
  );
}

export function LineSkeleton({ width = "100%", height = 12 }: { width?: string; height?: number }) {
  return (
    <div
      className="bg-[rgba(140,160,196,0.08)] rounded shimmer"
      style={{ width, height }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-4 rounded bg-[rgba(140,160,196,0.08)] shimmer" />
        <div className="h-3 w-28 bg-[rgba(140,160,196,0.08)] rounded shimmer" />
      </div>
      <div className="h-8 w-36 bg-[rgba(140,160,196,0.08)] rounded shimmer" />
      <div className="h-3 w-24 bg-[rgba(140,160,196,0.08)] rounded shimmer mt-2" />
    </div>
  );
}

