import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import AddInvoiceForm from "@/components/AddInvoiceForm";
import InvoiceFilters from "@/components/InvoiceFilters";
import InvoicesTable from "./InvoicesTable";
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

  const data = (invoices ?? []).map((inv: any) => ({ ...inv, client_name: inv.clients?.name || "" }));

  return <div className="p-4 sm:p-8">
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl text-white">Invoices</h1>
        <p className="text-sm text-muted mt-1">{invoices?.length ?? 0} invoices — {money(totalDue)} EGP equivalent outstanding across shown invoices</p>
      </div>
      <AddInvoiceForm clients={clients ?? []} currencies={currencies ?? []} />
    </header>
    <Suspense fallback={<div className="card p-4 mb-5"><div className="h-8 w-full bg-[rgba(140,160,196,0.06)] rounded shimmer" /></div>}>
      <InvoiceFilters
        clients={clients ?? []}
        currencies={currencies ?? []}
        initialClient={searchParams.client || ""}
        initialStatus={searchParams.status || ""}
        initialCurrency={searchParams.currency || ""}
      />
    </Suspense>
    <InvoicesTable data={data} clients={clients ?? []} currencies={currencies ?? []} />
  </div>;
}
