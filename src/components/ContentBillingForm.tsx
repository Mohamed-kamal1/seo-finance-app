"use client";

import { useMemo, useState } from "react";

type ContentDetail = { id: string; words: number; price: number; currency_code: string };
type Client = { id: string; website: string | null; name: string };

export default function ContentBillingForm({
  action,
  clients,
  contentDetails,
}: {
  action: (formData: FormData) => void | Promise<void>;
  clients: Client[];
  contentDetails: ContentDetail[];
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const selected = contentDetails.filter((item) => quantities[item.id]);
  const currencyCodes = new Set(selected.map((item) => item.currency_code));
  const mixedCurrencies = currencyCodes.size > 1;
  const total = useMemo(() => selected.reduce((sum, item) => sum + Number(item.price) * quantities[item.id], 0), [selected, quantities]);
  const currency = selected[0]?.currency_code;

  function toggle(id: string, checked: boolean) {
    setQuantities((current) => ({ ...current, [id]: checked ? (current[id] || 1) : 0 }));
  }

  return (
    <form action={action} className="card p-5 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div>
          <label className="block text-xs text-muted mb-1.5">Website name</label>
          <select name="client_id" required className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
            <option value="">Select website</option>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.website || client.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Order date</label>
          <input name="period" type="date" required className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Paid amount</label>
          <input name="paid_amount" type="number" min="0" max={total || undefined} step="0.01" defaultValue={0} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
        </div>
      </div>

      <div className="mb-5">
        <div className="text-xs text-muted mb-2">Order details</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {contentDetails.map((item) => {
            const selectedItem = Boolean(quantities[item.id]);
            return (
              <label key={item.id} className={`flex items-center gap-3 border rounded-md px-3 py-2.5 cursor-pointer ${selectedItem ? "border-accent bg-[rgba(62,214,166,0.06)]" : "border-line bg-panel2"}`}>
                <input name="content_detail_ids" type="checkbox" value={item.id} checked={selectedItem} onChange={(event) => toggle(item.id, event.target.checked)} className="accent-accent" />
                <span className="flex-1 text-sm text-white">{item.words} words <span className="text-muted">— {item.price} {item.currency_code}</span></span>
                <input name={`quantity_${item.id}`} type="number" min="1" value={quantities[item.id] || 1} disabled={!selectedItem} onChange={(event) => setQuantities((current) => ({ ...current, [item.id]: Math.max(1, Number(event.target.value) || 1) }))} className="w-16 bg-panel border border-line rounded-md px-2 py-1 text-sm text-white" aria-label={`Quantity for ${item.words} words`} />
              </label>
            );
          })}
          {!contentDetails.length && <div className="text-sm text-muted">Create Content Details first, then they will appear here.</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div className="sm:col-span-2">
          <label className="block text-xs text-muted mb-1.5">Note</label>
          <input name="notes" placeholder="Optional note" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
        </div>
        <div className="card p-3 border-accent/40">
          <div className="text-xs text-muted">Calculated value</div>
          <div className="font-mono-num text-lg text-accent">{total.toFixed(2)} {currency || ""}</div>
        </div>
      </div>

      {mixedCurrencies && <div className="text-xs text-danger mt-3">Choose content items with the same currency to create one billing record.</div>}
      <button type="submit" disabled={!selected.length || mixedCurrencies} className="mt-5 bg-accent disabled:opacity-40 disabled:cursor-not-allowed text-ink text-sm font-medium rounded-md px-4 py-2">Save content billing</button>
    </form>
  );
}
