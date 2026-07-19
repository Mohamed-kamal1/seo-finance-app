import { createClient } from "@/lib/supabase/server";
import AddTransactionForm from "@/components/AddTransactionForm";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const supabase = createClient();
  const [{ data: transactions }, { data: treasuries }, { data: coa }] = await Promise.all([
    supabase.from("transactions").select("*, treasury_accounts(name)").order("actual_date", { ascending: false }).limit(300),
    supabase.from("treasury_accounts").select("id,name").order("name"),
    supabase.from("chart_of_accounts").select("category").order("category"),
  ]);

  return (
    <div className="p-8 max-w-7xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Ledger</h1>
          <p className="text-sm text-muted mt-1">Most recent 300 entries. Full history lives in Supabase.</p>
        </div>
        <AddTransactionForm treasuries={treasuries ?? []} categories={coa ?? []} />
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Treasury</th>
              <th className="px-4 py-3 font-medium">IS Category</th>
              <th className="px-4 py-3 font-medium text-right">Debit</th>
              <th className="px-4 py-3 font-medium text-right">Credit</th>
            </tr>
          </thead>
          <tbody>
            {(transactions ?? []).map((t: any) => (
              <tr key={t.id} className="ledger-row">
                <td className="px-4 py-2.5 text-muted whitespace-nowrap">{new Date(t.actual_date).toLocaleDateString()}</td>
                <td className="px-4 py-2.5 text-white max-w-xs truncate">{t.description || "—"}</td>
                <td className="px-4 py-2.5 text-muted">{t.treasury_accounts?.name || "—"}</td>
                <td className="px-4 py-2.5 text-muted">{t.classification_is || "—"}</td>
                <td className="px-4 py-2.5 text-right font-mono-num text-accent">{t.debit ? money(t.debit) : ""}</td>
                <td className="px-4 py-2.5 text-right font-mono-num text-danger">{t.credit ? money(t.credit) : ""}</td>
              </tr>
            ))}
            {!transactions?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted text-sm">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
