import { createClient } from "@/lib/supabase/server";
import { money, monthLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = createClient();
  const [{ data: isRows }, { data: cfRows }] = await Promise.all([
    supabase.from("v_income_statement").select("*").order("month"),
    supabase.from("v_cash_flow").select("*").order("month"),
  ]);

  const months = Array.from(new Set((isRows ?? []).map((r: any) => r.month))).sort();
  const categories = Array.from(new Set((isRows ?? []).map((r: any) => r.category))).sort();

  function valueFor(month: string, category: string) {
    const row = (isRows ?? []).find((r: any) => r.month === month && r.category === category);
    return row ? Number(row.net) : 0;
  }

  const cfMonths = Array.from(new Set((cfRows ?? []).map((r: any) => r.month))).sort();
  const cfCategories = Array.from(new Set((cfRows ?? []).map((r: any) => r.category))).sort();

  function cfValueFor(month: string, category: string) {
    const row = (cfRows ?? []).find((r: any) => r.month === month && r.category === category);
    return row ? Number(row.net) : 0;
  }

  return (
    <div className="p-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="font-display text-2xl text-white">Reports</h1>
        <p className="text-sm text-muted mt-1">Generated live from the transaction ledger — no manual reconciliation needed.</p>
      </header>

      <section className="mb-10">
        <h2 className="text-sm text-white mb-3">Income Statement (net by category, per month)</h2>
        <div className="card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
                <th className="px-4 py-3 font-medium sticky left-0 bg-panel">Category</th>
                {months.map((m: any) => (
                  <th key={m} className="px-4 py-3 font-medium text-right whitespace-nowrap">
                    {monthLabel(m)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat} className="ledger-row">
                  <td className="px-4 py-2.5 text-white sticky left-0 bg-panel">{cat}</td>
                  {months.map((m: any) => {
                    const v = valueFor(m, cat);
                    return (
                      <td key={m} className={`px-4 py-2.5 text-right font-mono-num whitespace-nowrap ${v >= 0 ? "text-accent" : "text-danger"}`}>
                        {money(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {!categories.length && (
                <tr>
                  <td colSpan={months.length + 1 || 1} className="px-4 py-10 text-center text-muted text-sm">
                    No classified transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm text-white mb-3">Cash Flow (net by category, per month)</h2>
        <div className="card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
                <th className="px-4 py-3 font-medium sticky left-0 bg-panel">Category</th>
                {cfMonths.map((m: any) => (
                  <th key={m} className="px-4 py-3 font-medium text-right whitespace-nowrap">
                    {monthLabel(m)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cfCategories.map((cat) => (
                <tr key={cat} className="ledger-row">
                  <td className="px-4 py-2.5 text-white sticky left-0 bg-panel">{cat}</td>
                  {cfMonths.map((m: any) => {
                    const v = cfValueFor(m, cat);
                    return (
                      <td key={m} className={`px-4 py-2.5 text-right font-mono-num whitespace-nowrap ${v >= 0 ? "text-accent" : "text-danger"}`}>
                        {money(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {!cfCategories.length && (
                <tr>
                  <td colSpan={cfMonths.length + 1 || 1} className="px-4 py-10 text-center text-muted text-sm">
                    No classified transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
