"use client";

import DataTable from "@/components/DataTable";
import EditInvoiceForm from "@/components/EditInvoiceForm";
import { updateInvoiceCollections } from "./actions";
import { money } from "@/lib/format";

export default function InvoicesTable({ data, clients, currencies }: { data: any[]; clients: { id: string; name: string }[]; currencies: { code: string }[] }) {
    const columns = [
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
            render: (row: any) => <span className="text-white">{row.clients?.name || "—"}</span>,
        },
        {
            key: "service",
            label: "Service",
            render: (row: any) => <span className="text-muted">{row.service || "—"}</span>,
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
        <DataTable
            data={data}
            columns={columns}
            searchFields={["client_name", "service", "collection_status"]}
            searchPlaceholder="Search invoices…"
            emptyMessage="No invoices yet."
            keyExtractor={(row: any) => row.id}
        />
    );
}

