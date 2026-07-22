"use client";

import { useState, useMemo, useCallback } from "react";
import { exportToCSV } from "@/lib/export";

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    align?: "left" | "right" | "center";
    render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchFields?: (keyof T & string)[];
    searchPlaceholder?: string;
    emptyMessage?: string;
    keyExtractor: (row: T) => string | number;
    /** Optional filename prefix for CSV export. If provided, an export button is shown. */
    exportFilename?: string;
    /** Optional columns for CSV export (defaults to displayed columns, minus virtual/action cols). */
    exportColumns?: { key: string; label: string }[];
}

export default function DataTable<T extends Record<string, any>>({
    data,
    columns,
    searchFields = [],
    searchPlaceholder = "Search\u2026",
    emptyMessage = "No data found.",
    keyExtractor,
    exportFilename,
    exportColumns,
}: DataTableProps<T>) {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const handleSort = useCallback(
        (key: string) => {
            if (sortKey === key) {
                setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
            } else {
                setSortKey(key);
                setSortDir("asc");
            }
        },
        [sortKey]
    );

    const filtered = useMemo(() => {
        let items = data;

        // Search filter
        if (search && searchFields.length) {
            const q = search.toLowerCase();
            items = items.filter((row) =>
                searchFields.some((field) => {
                    const val = row[field];
                    return val != null && String(val).toLowerCase().includes(q);
                })
            );
        }

        // Sort
        if (sortKey) {
            items = [...items].sort((a, b) => {
                const aVal = a[sortKey];
                const bVal = b[sortKey];
                if (aVal == null) return 1;
                if (bVal == null) return -1;
                if (typeof aVal === "number" && typeof bVal === "number") {
                    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
                }
                const cmp = String(aVal).localeCompare(String(bVal));
                return sortDir === "asc" ? cmp : -cmp;
            });
        }

        return items;
    }, [data, search, searchFields, sortKey, sortDir]);

    return (
        <div>
            {/* Search bar + Export */}
            <div className="mb-4 flex items-center gap-3">
                {searchFields.length > 0 && (
                    <div className="relative max-w-xs flex-1">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            aria-label={searchPlaceholder}
                            className="w-full bg-panel2 border border-line rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                                aria-label="Clear search"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
                {exportFilename && (
                    <button
                        onClick={() => {
                            const cols = exportColumns ?? columns.filter((c) => c.key !== "actions").map((c) => ({ key: c.key, label: c.label }));
                            exportToCSV(filtered, cols, exportFilename);
                        }}
                        className="border border-line text-muted hover:text-white hover:border-accent rounded-md px-3 py-2 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
                        title={`Export ${filtered.length} rows to CSV`}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export CSV
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-sm" role="grid">
                        <thead>
                            <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={`px-4 py-3 font-medium ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                                            } ${col.sortable ? "cursor-pointer hover:text-white transition-colors select-none" : ""}`}
                                        onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                        aria-sort={
                                            sortKey === col.key
                                                ? sortDir === "asc"
                                                    ? "ascending"
                                                    : "descending"
                                                : undefined
                                        }
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            {col.label}
                                            {col.sortable && sortKey === col.key && (
                                                <svg
                                                    width="10"
                                                    height="10"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="shrink-0"
                                                >
                                                    {sortDir === "asc" ? (
                                                        <polyline points="18 15 12 9 6 15" />
                                                    ) : (
                                                        <polyline points="6 9 12 15 18 9" />
                                                    )}
                                                </svg>
                                            )}
                                            {col.sortable && sortKey !== col.key && (
                                                <svg
                                                    width="10"
                                                    height="10"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="shrink-0 opacity-30"
                                                >
                                                    <line x1="12" y1="5" x2="12" y2="19" />
                                                    <polyline points="19 12 12 19 5 12" />
                                                </svg>
                                            )}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? (
                                filtered.map((row) => (
                                    <tr key={keyExtractor(row)} className="ledger-row">
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className={`px-4 py-2.5 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""
                                                    }`}
                                            >
                                                {col.render(row)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-10 text-center text-muted text-sm">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Results count */}
            {search && (
                <div className="mt-2 text-xs text-muted">
                    {filtered.length} of {data.length} results
                </div>
            )}
        </div>
    );
}

