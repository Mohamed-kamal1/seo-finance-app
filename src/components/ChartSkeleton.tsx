export default function ChartSkeleton({ height = 280 }: { height?: number }) {
    return (
        <div
            className="card p-5 flex items-center justify-center"
            style={{ height }}
        >
            <div className="flex flex-col items-center gap-3">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#233252" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <div className="w-32 h-3 bg-[rgba(140,160,196,0.06)] rounded shimmer" />
            </div>
        </div>
    );
}

