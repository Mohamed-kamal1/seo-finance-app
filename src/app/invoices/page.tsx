import { createClient } from "@/lib/supabase/server";
import AddInvoiceForm from "@/components/AddInvoiceForm";
import InvoiceFilters from "@/components/InvoiceFilters";
import { updateInvoiceCollections } from "./actions";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InvoicesPage({ searchParams }: { searchParams: { client?: string; status?: string; currency?: string } }) {
  const supabase = createClient();
  let invoiceQuery: any = supabase.from("invoices").select("*, clients(name)").order("invoice_date", { ascending: false }).limit(300);
  if (searchParams.client) invoiceQuery = invoiceQuery.eq("client_id", searchParams.client);
  if (searchParams.status) invoiceQuery = invoiceQuery.eq("collection_status", searchParams.status);
  if (searchParams.currency) invoiceQuery = invoiceQuery.eq("currency_code", searchParams.currency);
  const [{ data: invoices }, { data: clients }, { data: currencies }] = await Promise.all([
    invoiceQuery,
    supabase.from("clients").select("id,name").order("name"),
    supabase.from("currencies").select("code,rate_to_base").order("code"),
  ]);
  const rateByCurrency = new Map((currencies ?? []).map((currency: any) => [currency.code, Number(currency.rate_to_base) || 1]));
  const totalDue = (invoices ?? []).reduce((sum: number, invoice: any) => sum + Number(invoice.current_due || 0) * (rateByCurrency.get(invoice.currency_code) || 1), 0);

  return <div className="p-8 max-w-7xl">
    <header className="mb-6 flex items-center justify-between"><div><h1 className="font-display text-2xl text-white">Invoices</h1><p className="text-sm text-muted mt-1">{(invoices ?? []).length} invoices — {money(totalDue)} EGP equivalent outstanding across shown invoices</p></div><AddInvoiceForm clients={clients ?? []} currencies={currencies ?? []} /></header>
    <InvoiceFilters clients={clients ?? []} currencies={currencies ?? []} />
    <div className="card overflow-hidden"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line"><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Client</th><th className="px-4 py-3 font-medium">Service</th><th className="px-4 py-3 font-medium text-right">Total</th><th className="px-4 py-3 font-medium text-right">Collected</th><th className="px-4 py-3 font-medium text-right">Due</th><th className="px-4 py-3 font-medium">Status</th></tr></thead><tbody>
      {(invoices ?? []).map((inv: any) => <tr key={inv.id} className="ledger-row"><td className="px-4 py-2.5 text-muted">{new Date(inv.invoice_date).toLocaleDateString()}</td><td className="px-4 py-2.5 text-white">{inv.clients?.name || "—"}</td><td className="px-4 py-2.5 text-muted">{inv.service || "—"}</td><td className="px-4 py-2.5 text-right font-mono-num">{money(inv.total_amount, inv.currency_code || "EGP")}</td><td className="px-4 py-2.5 text-right"><form action={updateInvoiceCollections} className="flex justify-end gap-2"><input type="hidden" name="id" value={inv.id} /><input name="collections" type="number" min="0" max={Number(inv.total_amount || 0)} step="0.01" defaultValue={inv.collections} className="w-24 bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-accent text-right font-mono-num" /><button type="submit" className="text-xs text-accent hover:text-white">Save</button></form></td><td className="px-4 py-2.5 text-right font-mono-num text-danger">{money(inv.current_due, inv.currency_code || "EGP")}</td><td className={`px-4 py-2.5 font-medium ${inv.collection_status === "Paid" ? "text-accent" : inv.collection_status === "Partial" ? "text-accent2" : "text-danger"}`}>{inv.collection_status}</td></tr>)}
      {!invoices?.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted text-sm">No invoices yet.</td></tr>}
    </tbody></table></div>
  </div>;
}
