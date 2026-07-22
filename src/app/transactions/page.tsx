import { createClient } from "@/lib/supabase/server";
import AddTransactionForm from "@/components/AddTransactionForm";
import TransactionsTable from "./TransactionsTable";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

export default async function TransactionsPage({ searchParams }: { searchParams: { offset?: string } }) {
  const supabase = createClient();
  const offset = Math.max(0, Number(searchParams.offset) || 0);

  // Fetch one extra to know if there are more
  const [{ data: transactions }, { data: treasuries }, { data: classifications }, { count }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, treasury_accounts(name)", { count: "estimated", head: false })
      .order("actual_date", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1),
    supabase.from("treasury_accounts").select("id,name").order("name"),
    supabase.from("classifications").select("name").order("name"),
    supabase.from("transactions").select("*", { count: "exact", head: true }),
  ]);

  const data = (transactions ?? []).map((t: any) => ({
    ...t,
    _date: new Date(t.actual_date).toLocaleDateString(),
    _treasury: t.treasury_accounts?.name || "-",
  }));

  const hasMore = offset + PAGE_SIZE < (count ?? 0);
  const showing = Math.min(offset + PAGE_SIZE, count ?? 0);

  return (
    <div className="p-4 sm:p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Ledger</h1>
          <p className="text-sm text-muted mt-1">
            {count ?? 0} total entries
            {count ? <> &middot; showing {offset + 1}&ndash;{showing}</> : ""}
          </p>
        </div>
        <AddTransactionForm treasuries={treasuries ?? []} classifications={classifications ?? []} />
      </header>

      <TransactionsTable data={data} treasuries={treasuries ?? []} classifications={classifications ?? []} />

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-muted">
          {offset > 0 ? (
            <Link
              href={`/transactions?offset=${Math.max(0, offset - PAGE_SIZE)}`}
              className="border border-line text-muted hover:text-white hover:border-accent rounded-md px-3 py-2 text-xs font-medium transition-colors"
            >
              &larr; Previous {PAGE_SIZE}
            </Link>
          ) : <span />}
        </div>
        {hasMore && (
          <Link
            href={`/transactions?offset=${offset + PAGE_SIZE}`}
            className="border border-accent/30 text-accent hover:bg-accent-dim hover:border-accent rounded-md px-4 py-2 text-xs font-medium transition-colors"
          >
            Show next {Math.min(PAGE_SIZE, (count ?? 0) - offset - PAGE_SIZE)} entries &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
