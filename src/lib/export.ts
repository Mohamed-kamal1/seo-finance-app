// Client-side CSV export utility
// Generates a CSV from an array of objects and triggers a download.

export function exportToCSV<T extends Record<string, any>>(
    data: T[],
    columns: { key: string; label: string }[],
    filename: string
) {
    if (!data.length) return;

    // Build CSV header row
    const header = columns.map((c) => `"${c.label}"`).join(",");

    // Build data rows
    const rows = data.map((row) =>
        columns
            .map((col) => {
                const val = row[col.key];
                if (val == null) return "";
                const str = String(val);
                // Escape quotes and wrap in quotes if contains comma or newline
                return str.includes(",") || str.includes("\n") || str.includes('"')
                    ? `"${str.replace(/"/g, '""')}"`
                    : str;
            })
            .join(",")
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename.replace(/[^a-zA-Z0-9_-]/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Format number for CSV (no currency symbols, just raw number)
 */
export function csvMoney(value: number | null | undefined): string {
    return (value ?? 0).toFixed(2);
}

/**
 * Format date for CSV
 */
export function csvDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "";
    try {
        return new Date(dateStr).toISOString().slice(0, 10);
    } catch {
        return dateStr;
    }
}

