import { createClient } from "@/lib/supabase/server";
import { createContentBilling, updateContentBillingPayment } from "./actions";
import { money } from "@/lib/format";
import ContentBillingForm from "@/components/ContentBillingForm";

export const dynamic = "force-dynamic";

export default async function ContentBillingPage() {
  const supabase = createClient();
  const [{ data: rows }, { data: clients }, { data: contentDetails }] = await Promise.all([
    supabase.from("content_billing").select("*, clients(name, website)").order("created_at", { ascending: false }).limit(300),
    supabase.from("clients").select("id,name,website").order("website"),
    supabase.from("content_details").select("id,words,price,currency_code").order("words"),
  ]);

  const totalOwed = (rows ?? []).reduce((sum: number, row: any) => sum + Number(row.balance || 0), 0);

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-white">Content Billing</h1>
        <p className="text-sm text-muted mt-1">Content orders by website — {money(totalOwed)} owed across {(rows ?? []).length} records</p>
      </header>

      <ContentBillingForm action={createContentBilling} clients={clients ?? []} contentDetails={contentDetails ?? []} />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
              <th className="px-4 py-3 font-medium">Website</th>
              <th className="px-4 py-3 font-medium">Order details</th>
              <th className="px-4 py-3 font-medium text-right">Required</th>
              <th className="px-4 py-3 font-medium text-right">Paid</th>
              <th className="px-4 py-3 font-medium text-right">Balance</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row: any) => (
              <tr key={row.id} className="ledger-row">
                <td className="px-4 py-2.5 text-white">{row.clients?.website || row.clients?.name || row.client_name_raw || "—"}</td>
                <td className="px-4 py-2.5 text-muted max-w-xs" title={row.notes || undefined}>{row.details || "—"}{row.notes ? ` · ${row.notes}` : ""}</td>
                <td className="px-4 py-2.5 text-right font-mono-num">{money(row.required_amount, row.currency_code || "EGP")}</td>
                <td className="px-4 py-2.5 text-right">
                  <form id={`payment-${row.id}`} action={updateContentBillingPayment} />
                  <input form={`payment-${row.id}`} type="hidden" name="id" value={row.id} />
                  <input form={`payment-${row.id}`} name="paid_amount" type="number" min="0" max={Number(row.required_amount || 0)} step="0.01" required defaultValue={row.paid_amount} className="w-24 bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-accent text-right font-mono-num" />
                </td>
                <td className="px-4 py-2.5 text-right font-mono-num text-danger">{money(row.balance, row.currency_code || "EGP")}</td>
                <td className="px-4 py-2.5 text-right"><button form={`payment-${row.id}`} type="submit" className="text-xs text-accent hover:text-white transition-colors">Save paid</button></td>
              </tr>
            ))}
            {!rows?.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted text-sm">No content billing records yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
