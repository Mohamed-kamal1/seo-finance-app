"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    wide?: boolean;
}

export default function Modal({ open, onClose, title, children, wide }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    // Focus trap: focus first focusable element
    useEffect(() => {
        if (!open || !contentRef.current) return;
        const focusable = contentRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
    }, [open]);

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose();
            }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal content */}
            <div
                ref={contentRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`relative z-10 w-full ${wide ? "max-w-3xl" : "max-w-lg"} bg-panel border border-line rounded-xl shadow-card animate-slide-in`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-line">
                    <h2 className="text-base text-white font-display">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-white transition-colors p-1 rounded-md hover:bg-[rgba(255,255,255,0.06)]"
                        aria-label="Close dialog"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

