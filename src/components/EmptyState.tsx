interface EmptyStateProps {
    icon?: "data" | "search" | "money" | "file";
    title: string;
    description?: string;
    action?: React.ReactNode;
}

const ICONS: Record<string, JSX.Element> = {
    data: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8CA0C4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    ),
    search: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8CA0C4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    money: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8CA0C4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
        </svg>
    ),
    file: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8CA0C4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
    ),
};

export default function EmptyState({ icon = "data", title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-12 px-6">
            <div className="w-16 h-16 rounded-full bg-[rgba(140,160,196,0.06)] border border-line flex items-center justify-center mb-4">
                {ICONS[icon]}
            </div>
            <h3 className="text-sm text-white font-medium mb-1">{title}</h3>
            {description && <p className="text-xs text-muted max-w-[260px] leading-relaxed mb-4">{description}</p>}
            {action && <div>{action}</div>}
        </div>
    );
}

