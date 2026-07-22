"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastData {
    id: string;
    message: string;
    type: ToastType;
}

const ICONS: Record<ToastType, JSX.Element> = {
    success: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3ED6A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    error: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F0654F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    info: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B8DEF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    ),
};

const BORDER_COLORS: Record<ToastType, string> = {
    success: "border-accent",
    error: "border-danger",
    info: "border-[#5B8DEF]",
};

export default function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const showTimer = setTimeout(() => setVisible(true), 10);
        const dismissTimer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
        }, 4000);
        return () => {
            clearTimeout(showTimer);
            clearTimeout(dismissTimer);
        };
    }, [toast.id, onDismiss]);

    return (
        <div
            role="alert"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${BORDER_COLORS[toast.type]} bg-panel shadow-card transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
        >
            <span className="shrink-0">{ICONS[toast.type]}</span>
            <span className="text-sm text-white flex-1">{toast.message}</span>
            <button
                onClick={() => {
                    setVisible(false);
                    setTimeout(() => onDismiss(toast.id), 300);
                }}
                className="text-muted hover:text-white transition-colors"
                aria-label="Dismiss notification"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );
}

