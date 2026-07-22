import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import AddInvoiceForm from "@/components/AddInvoiceForm";
import InvoiceFilters from "@/components/InvoiceFilters";
import InvoicesTable from "./InvoicesTable";
import { money } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

export default async function InvoicesPage({ searchParams }: { searchParams: { client?: string; status?: string; currency?: string; offset?: string } }) {
  const supabase = createClient();
  const offset = Math.max(0, Number(searchParams.offset) || 0);

  let countQuery: any = supabase.from("invoices").select("*", { count: "exact", head: true });
  let invoiceQuery: any = supabase
    .from("invoices")
    .select("*, clients(name)", { count: "estimated", head: false })
    .order("invoice_date", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (searchParams.client) { invoiceQuery = invoiceQuery.eq("client_id", searchParams.client); countQuery = countQuery.eq("client_id", searchParams.client); }
  if (searchParams.status) { invoiceQuery = invoiceQuery.eq("collection_status", searchParams.status); countQuery = countQuery.eq("collection_status", searchParams.status); }
  if (searchParams.currency) { invoiceQuery = invoiceQuery.eq("currency_code", searchParams.currency); countQuery = countQuery.eq("currency_code", searchParams.currency); }

  const [{ data: invoices }, { count }, { data: clients }, { data: currencies }] = await Promise.all([
    invoiceQuery,
    countQuery,
    supabase.from("clients").select("id,name").order("name"),
    supabase.from("currencies").select("code,rate_to_base").order("code"),
  ]);

  const rateByCurrency = new Map((currencies ?? []).map((currency: any) => [currency.code, Number(currency.rate_to_base) || 1]));
  const totalDue = (invoices ?? []).reduce((sum: number, invoice: any) => sum + Number(invoice.current_due || 0) * (rateByCurrency.get(invoice.currency_code) || 1), 0);

  const data = (invoices ?? []).map((inv: any) => ({ ...inv, client_name: inv.clients?.name || "" }));

  const hasMore = offset + PAGE_SIZE < (count ?? 0);
  const showing = Math.min(offset + PAGE_SIZE, count ?? 0);

  return <div className="p-4 sm:p-8">
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl text-white">Invoices</h1>
        <p className="text-sm text-muted mt-1">
          {count ?? 0} invoices
          {count ? <> &middot; showing {offset + 1}&ndash;{showing}</> : ""}
          {totalDue > 0 ? <span> &middot; {money(totalDue)} EGP outstanding</span> : ""}
        </p>
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

    {/* Pagination */}
    <div className="flex items-center justify-between mt-4">
      <div className="text-xs text-muted">
        {offset > 0 ? (
          <Link
            href={`/invoices?offset=${Math.max(0, offset - PAGE_SIZE)}`}
            className="border border-line text-muted hover:text-white hover:border-accent rounded-md px-3 py-2 text-xs font-medium transition-colors"
          >
            &larr; Previous {PAGE_SIZE}
          </Link>
        ) : <span />}
      </div>
      {hasMore && (
        <Link
          href={`/invoices?offset=${offset + PAGE_SIZE}`}
          className="border border-accent/30 text-accent hover:bg-accent-dim hover:border-accent rounded-md px-4 py-2 text-xs font-medium transition-colors"
        >
          Show next {Math.min(PAGE_SIZE, (count ?? 0) - offset - PAGE_SIZE)} entries &rarr;
        </Link>
      )}
    </div>
  </div>;
}
