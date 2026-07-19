"use client";

import { updateInvoiceStatus } from "@/app/invoices/actions";

const COLORS: Record<string, string> = {
  Paid: "text-accent",
  Partial: "text-accent2",
  Pending: "text-danger",
};

export default function InvoiceStatusSelect({ id, status }: { id: string; status: string }) {
  return (
    <select
      defaultValue={status}
      onChange={(e) => updateInvoiceStatus(id, e.target.value)}
      className={`bg-transparent text-xs border border-line rounded-full px-2 py-1 ${COLORS[status] || "text-muted"}`}
    >
      <option>Pending</option>
      <option>Partial</option>
      <option>Paid</option>
    </select>
  );
}
