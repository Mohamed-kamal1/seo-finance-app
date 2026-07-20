import { createClient } from "@/lib/supabase/server";
import AddTransactionForm from "@/components/AddTransactionForm";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const supabase = createClient();
  const [{ data: transactions }, { data: treasuries }, { data: classifications }] = await Promise.all([
    supabase.from("transactions").select("*, treasury_accounts(name)").order("actual_date", { ascending: false }).limit(300),
    supabase.from("treasury_accounts").select("id,name").order("name"),
    supabase.from("classifications").select("name").order("name"),
  ]);

  return (
    <div className="p-8 max-w-7xl">
      <header className="mb-6 flex items-center justify-between">
        <div><h1 className="font-display text-2xl text-white">Ledger</h1><p className="text-sm text-muted mt-1">Most recent 300 entries. Full history lives in Supabase.</p></div>
        <AddTransactionForm treasuries={treasuries ?? []} classifications={classifications ?? []} />
      </header>

      <div className="card overflow-hidden"><table className="w-full text-sm">
        <thead><tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line"><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium">Note</th><th className="px-4 py-3 font-medium">Treasury</th><th className="px-4 py-3 font-medium">IS Category</th><th className="px-4 py-3 font-medium text-right">Debit</th><th className="px-4 py-3 font-medium text-right">Credit</th></tr></thead>
        <tbody>
          {(transactions ?? []).map((transaction: any) => <tr key={transaction.id} className="ledger-row">
            <td className="px-4 py-2.5 text-muted whitespace-nowrap">{new Date(transaction.actual_date).toLocaleDateString()}</td>
            <td className="px-4 py-2.5 text-white max-w-xs truncate">{transaction.description || "-"}</td>
            <td className="px-4 py-2.5 text-muted max-w-xs truncate">{transaction.notes || "-"}</td>
            <td className="px-4 py-2.5 text-muted">{transaction.treasury_accounts?.name || "-"}</td>
            <td className="px-4 py-2.5 text-muted">{transaction.classification_is || "-"}</td>
            <td className="px-4 py-2.5 text-right font-mono-num text-accent">{transaction.debit ? money(transaction.debit) : ""}</td>
            <td className="px-4 py-2.5 text-right font-mono-num text-danger">{transaction.credit ? money(transaction.credit) : ""}</td>
          </tr>)}
          {!transactions?.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted text-sm">No transactions yet.</td></tr>}
        </tbody>
      </table></div>
    </div>
  );
}
