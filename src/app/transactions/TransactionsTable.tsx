"use client";

import DataTable from "@/components/DataTable";
import EditTransactionForm from "@/components/EditTransactionForm";
import { money } from "@/lib/format";

export default function TransactionsTable({ data, treasuries, classifications }: { data: any[]; treasuries: { id: string; name: string }[]; classifications: { name: string }[] }) {
    const columns = [
        {
            key: "_date",
            label: "Date",
            sortable: true,
            render: (row: any) => <span className="text-muted whitespace-nowrap">{row._date}</span>,
        },
        {
            key: "description",
            label: "Description",
            sortable: true,
            render: (row: any) => <span className="text-white max-w-xs truncate block">{row.description || "-"}</span>,
        },
        {
            key: "notes",
            label: "Note",
            render: (row: any) => <span className="text-muted max-w-xs truncate block">{row.notes || "-"}</span>,
        },
        {
            key: "_treasury",
            label: "Treasury",
            render: (row: any) => <span className="text-muted">{row._treasury}</span>,
        },
        {
            key: "classification_is",
            label: "IS Category",
            render: (row: any) => <span className="text-muted">{row.classification_is || "-"}</span>,
        },
        {
            key: "debit",
            label: "Debit",
            sortable: true,
            align: "right" as const,
            render: (row: any) => (
                <span className="font-mono-num text-accent">{row.debit ? money(row.debit) : ""}</span>
            ),
        },
        {
            key: "credit",
            label: "Credit",
            sortable: true,
            align: "right" as const,
            render: (row: any) => (
                <span className="font-mono-num text-danger">{row.credit ? money(row.credit) : ""}</span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            align: "right" as const,
            render: (row: any) => (
                <EditTransactionForm row={row} treasuries={treasuries} classifications={classifications} />
            ),
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            searchFields={["description", "notes", "_treasury", "classification_is"]}
            searchPlaceholder="Search transactions\u2026"
            emptyMessage="No transactions yet."
            keyExtractor={(row: any) => row.id}
            exportFilename="seo-house-transactions"
            exportColumns={[
                { key: "_date", label: "Date" },
                { key: "description", label: "Description" },
                { key: "notes", label: "Note" },
                { key: "_treasury", label: "Treasury" },
                { key: "classification_is", label: "IS Category" },
                { key: "debit", label: "Debit" },
                { key: "credit", label: "Credit" },
            ]}
        />
    );
}

