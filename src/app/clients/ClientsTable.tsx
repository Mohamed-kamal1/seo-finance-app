"use client";

import DataTable from "@/components/DataTable";
import { money } from "@/lib/format";
import Link from "next/link";

export default function ClientsTable({ data }: { data: any[] }) {
    const columns = [
        {
            key: "name",
            label: "Client",
            sortable: true,
            render: (row: any) => (
                <div>
                    <Link href={`/clients/${row.id}`} className="text-white hover:text-accent">
                        {row.name}
                    </Link>
                    {row.website && <div className="text-xs text-muted">{row.website}</div>}
                </div>
            ),
        },
        {
            key: "country",
            label: "Country",
            sortable: true,
            render: (row: any) => <span className="text-muted">{row.country || "—"}</span>,
        },
        {
            key: "payment_duration",
            label: "Billing",
            render: (row: any) => <span className="text-muted">{row.payment_duration || "—"}</span>,
        },
        {
            key: "feeTotal",
            label: "Monthly fees",
            sortable: true,
            align: "right" as const,
            render: (row: any) => (
                <span className="font-mono-num">{money(row.feeTotal, row.currency_code || "EGP")}</span>
            ),
        },
        {
            key: "current_due",
            label: "Current due",
            sortable: true,
            align: "right" as const,
            render: (row: any) => (
                <span className="font-mono-num text-danger">
                    {row.current_due ? money(row.current_due, row.currency_code || "EGP") : "—"}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (row: any) => (
                <span
                    className={`text-xs px-2 py-1 rounded-full ${row.status?.toLowerCase() === "active"
                            ? "bg-[rgba(62,214,166,0.12)] text-accent"
                            : "bg-[rgba(240,101,79,0.12)] text-danger"
                        }`}
                >
                    {row.status}
                </span>
            ),
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            searchFields={["name", "website", "country"]}
            searchPlaceholder="Search by name, website, or country…"
            emptyMessage="No clients yet. Run the migration script or add one above."
            keyExtractor={(row: any) => row.id}
        />
    );
}

