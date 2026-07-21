"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function InvoiceFilters({ clients, currencies }: { clients: { id: string; name: string }[]; currencies: { code: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/invoices${params.size ? `?${params}` : ""}`);
  };
  return <div className="card p-4 mb-5 flex flex-wrap gap-3 items-end">
    <div><label className="block text-xs text-muted mb-1.5">Client</label><select value={searchParams.get("client") || ""} onChange={(event) => update("client", event.target.value)} className="bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white"><option value="">All clients</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></div>
    <div><label className="block text-xs text-muted mb-1.5">Status</label><select value={searchParams.get("status") || ""} onChange={(event) => update("status", event.target.value)} className="bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white"><option value="">All statuses</option><option value="Pending">Pending</option><option value="Partial">Partial</option><option value="Paid">Paid</option></select></div>
    <div><label className="block text-xs text-muted mb-1.5">Currency</label><select value={searchParams.get("currency") || ""} onChange={(event) => update("currency", event.target.value)} className="bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white"><option value="">All currencies</option>{currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.code}</option>)}</select></div>
    {searchParams.size > 0 && <button type="button" onClick={() => router.push("/invoices")} className="text-sm text-muted hover:text-white px-2 py-2">Clear filters</button>}
  </div>;
}
