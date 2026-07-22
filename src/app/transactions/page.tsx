import { createClient } from "@/lib/supabase/server";
import AddTransactionForm from "@/components/AddTransactionForm";
import TransactionsTable from "./TransactionsTable";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const supabase = createClient();
  const [{ data: transactions }, { data: treasuries }, { data: classifications }] = await Promise.all([
    supabase.from("transactions").select("*, treasury_accounts(name)").order("actual_date", { ascending: false }).limit(300),
    supabase.from("treasury_accounts").select("id,name").order("name"),
    supabase.from("classifications").select("name").order("name"),
  ]);

  const data = (transactions ?? []).map((t: any) => ({
    ...t,
    _date: new Date(t.actual_date).toLocaleDateString(),
    _treasury: t.treasury_accounts?.name || "-",
  }));

  return (
    <div className="p-4 sm:p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Ledger</h1>
          <p className="text-sm text-muted mt-1">Most recent 300 entries. Full history lives in Supabase.</p>
        </div>
        <AddTransactionForm treasuries={treasuries ?? []} classifications={classifications ?? []} />
      </header>

      <TransactionsTable data={data} treasuries={treasuries ?? []} classifications={classifications ?? []} />
    </div>
  );
}
