import { createClient } from "@/lib/supabase/server";
import { createContentBilling } from "./actions";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ContentBillingPage() {
  const supabase = createClient();
  const [{ data: rows }, { data: clients }, { data: currencies }] = await Promise.all([
    supabase.from("content_billing").select("*, clients(name)").order("created_at", { ascending: false }).limit(300),
    supabase.from("clients").select("id,name").order("name"),
    supabase.from("currencies").select("code").order("code"),
  ]);

  const totalOwed = (rows ?? []).reduce((s: number, r: any) => s + Number(r.balance || 0), 0);

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-white">Content Billing</h1>
        <p className="text-sm text-muted mt-1">
          Per-word / per-article content orders — {money(totalOwed)} owed across {(rows ?? []).length} records
        </p>
      </header>

      <form action={createContentBilling} className="card p-5 mb-8 grid grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-muted mb-1.5">Client</label>
          <select name="client_id" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
            <option value="">Unmatched / freeform</option>
            {(clients ?? []).map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Client name (if not listed)</label>
          <input name="client_name_raw" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-muted mb-1.5">Order details</label>
          <input name="details" placeholder="e.g. 3 articles / 1000 words" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Required</label>
          <input name="required_amount" type="number" step="0.01" defaultValue={0} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Paid</label>
          <input name="paid_amount" type="number" step="0.01" defaultValue={0} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Currency</label>
          <select name="currency_code" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
            {(currencies ?? []).map((c: any) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Period</label>
          <input name="period" type="date" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
        </div>
        <div className="col-span-4">
          <button type="submit" className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2">
            Save record
          </button>
        </div>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Details</th>
              <th className="px-4 py-3 font-medium text-right">Required</th>
              <th className="px-4 py-3 font-medium text-right">Paid</th>
              <th className="px-4 py-3 font-medium text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r: any) => (
              <tr key={r.id} className="ledger-row">
                <td className="px-4 py-2.5 text-white">{r.clients?.name || r.client_name_raw || "—"}</td>
                <td className="px-4 py-2.5 text-muted max-w-xs truncate">{r.details || "—"}</td>
                <td className="px-4 py-2.5 text-right font-mono-num">{money(r.required_amount, r.currency_code || "EGP")}</td>
                <td className="px-4 py-2.5 text-right font-mono-num text-accent">{money(r.paid_amount, r.currency_code || "EGP")}</td>
                <td className="px-4 py-2.5 text-right font-mono-num text-danger">{money(r.balance, r.currency_code || "EGP")}</td>
              </tr>
            ))}
            {!rows?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted text-sm">
                  No content billing records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
