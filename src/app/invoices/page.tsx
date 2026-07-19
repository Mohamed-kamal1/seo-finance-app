import { createClient } from "@/lib/supabase/server";
import AddInvoiceForm from "@/components/AddInvoiceForm";
import InvoiceStatusSelect from "@/components/InvoiceStatusSelect";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const supabase = createClient();
  const [{ data: invoices }, { data: clients }, { data: currencies }] = await Promise.all([
    supabase.from("invoices").select("*, clients(name)").order("invoice_date", { ascending: false }).limit(300),
    supabase.from("clients").select("id,name").order("name"),
    supabase.from("currencies").select("code").order("code"),
  ]);

  const totalDue = (invoices ?? []).reduce((s: number, i: any) => s + Number(i.current_due || 0), 0);

  return (
    <div className="p-8 max-w-7xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Invoices</h1>
          <p className="text-sm text-muted mt-1">
            {(invoices ?? []).length} invoices — {money(totalDue)} outstanding across shown invoices
          </p>
        </div>
        <AddInvoiceForm clients={clients ?? []} currencies={currencies ?? []} />
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium text-right">Collected</th>
              <th className="px-4 py-3 font-medium text-right">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(invoices ?? []).map((inv: any) => (
              <tr key={inv.id} className="ledger-row">
                <td className="px-4 py-2.5 text-muted">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                <td className="px-4 py-2.5 text-white">{inv.clients?.name || "—"}</td>
                <td className="px-4 py-2.5 text-muted">{inv.service || "—"}</td>
                <td className="px-4 py-2.5 text-right font-mono-num">{money(inv.total_amount, inv.currency_code || "EGP")}</td>
                <td className="px-4 py-2.5 text-right font-mono-num text-accent">{money(inv.collections, inv.currency_code || "EGP")}</td>
                <td className="px-4 py-2.5 text-right font-mono-num text-danger">{money(inv.current_due, inv.currency_code || "EGP")}</td>
                <td className="px-4 py-2.5">
                  <InvoiceStatusSelect id={inv.id} status={inv.collection_status} />
                </td>
              </tr>
            ))}
            {!invoices?.length && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted text-sm">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
