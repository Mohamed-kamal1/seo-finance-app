"use client";

import { useState } from "react";
import DataTable from "@/components/DataTable";
import EditInvoiceForm from "@/components/EditInvoiceForm";
import { updateInvoiceCollections, bulkUpdateInvoiceStatus } from "./actions";
import { money } from "@/lib/format";
import { useToast } from "@/components/ToastProvider";

export default function InvoicesTable({ data, clients, currencies }: { data: any[]; clients: { id: string; name: string }[]; currencies: { code: string }[] }) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkStatus, setBulkStatus] = useState<string>("Paid");
    const { addToast } = useToast();

    async function handleBulkUpdate(status: string) {
        if (selectedIds.size === 0) return;
        const fd = new FormData();
        fd.set("ids", [...selectedIds].join(","));
        fd.set("status", status);
        try {
            await bulkUpdateInvoiceStatus(fd);
            addToast(`Updated ${selectedIds.size} invoices to "${status}"`, "success");
            setSelectedIds(new Set());
        } catch {
            addToast("Failed to bulk update invoices", "error");
        }
    }

    const columns = [
        {
            key: "_select",
            label: "",
            render: (row: any) => (
                <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={(e) => {
                        e.stopPropagation();
                        const next = new Set(selectedIds);
                        if (next.has(row.id)) {
                            next.delete(row.id);
                        } else {
                            next.add(row.id);
                        }
                        setSelectedIds(next);
                    }}
                    className="accent-accent cursor-pointer"
                    aria-label={`Select invoice ${row.id.slice(0, 8)}`}
                />
            ),
        },
        {
            key: "invoice_date",
            label: "Date",
            sortable: true,
            render: (row: any) => <span className="text-muted">{new Date(row.invoice_date).toLocaleDateString()}</span>,
        },
        {
            key: "client_name",
            label: "Client",
            sortable: true,
            render: (row: any) => <span className="text-white">{row.clients?.name || "\u2014"}</span>,
        },
        {
            key: "service",
            label: "Service",
            render: (row: any) => <span className="text-muted">{row.service || "\u2014"}</span>,
        },
        {
            key: "total_amount",
            label: "Total",
            sortable: true,
            align: "right" as const,
            render: (row: any) => (
                <span className="font-mono-num">{money(row.total_amount, row.currency_code || "EGP")}</span>
            ),
        },
        {
            key: "collections",
            label: "Collected",
            align: "right" as const,
            render: (row: any) => (
                <form action={updateInvoiceCollections} className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <input type="hidden" name="id" value={row.id} />
                    <input
                        name="collections"
                        type="number"
                        min="0"
                        max={Number(row.total_amount || 0)}
                        step="0.01"
                        defaultValue={row.collections}
                        className="w-24 bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-accent text-right font-mono-num"
                    />
                    <button type="submit" className="text-xs text-accent hover:text-white">Save</button>
                </form>
            ),
        },
        {
            key: "current_due",
            label: "Due",
            sortable: true,
            align: "right" as const,
            render: (row: any) => (
                <span className="font-mono-num text-danger">{money(row.current_due, row.currency_code || "EGP")}</span>
            ),
        },
        {
            key: "collection_status",
            label: "Status",
            sortable: true,
            render: (row: any) => {
                const colorMap: Record<string, string> = {
                    Paid: "text-accent",
                    Partial: "text-accent2",
                    Pending: "text-danger",
                };
                return <span className={`font-medium ${colorMap[row.collection_status] || "text-muted"}`}>{row.collection_status}</span>;
            },
        },
        {
            key: "actions",
            label: "Actions",
            align: "right" as const,
            render: (row: any) => (
                <EditInvoiceForm invoice={row} clients={clients} currencies={currencies} />
            ),
        },
    ];

    return (
        <div>
            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
                <div className="mb-4 flex items-center gap-3 p-3 bg-accent-dim border border-accent/30 rounded-lg">
                    <span className="text-xs text-white font-medium">{selectedIds.size} selected</span>
                    <select
                        value={bulkStatus}
                        onChange={(e) => setBulkStatus(e.target.value)}
                        className="bg-panel2 border border-line rounded-md px-2 py-1 text-xs text-white"
                    >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Partial">Partial</option>
                    </select>
                    <button
                        onClick={() => handleBulkUpdate(bulkStatus)}
                        className="bg-accent text-ink text-xs font-medium rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity"
                    >
                        Mark as {bulkStatus}
                    </button>
                    <button
                        onClick={() => setSelectedIds(new Set())}
                        className="text-xs text-muted hover:text-white transition-colors ml-auto"
                    >
                        Clear selection
                    </button>
                </div>
            )}

            <DataTable
                data={data}
                columns={columns}
                searchFields={["client_name", "service", "collection_status"]}
                searchPlaceholder="Search invoices\u2026"
                emptyMessage="No invoices yet."
                keyExtractor={(row: any) => row.id}
                exportFilename="seo-house-invoices"
                exportColumns={[
                    { key: "invoice_date", label: "Date" },
                    { key: "client_name", label: "Client" },
                    { key: "service", label: "Service" },
                    { key: "total_amount", label: "Total" },
                    { key: "collections", label: "Collected" },
                    { key: "current_due", label: "Due" },
                    { key: "collection_status", label: "Status" },
                ]}
            />
        </div>
    );
}
